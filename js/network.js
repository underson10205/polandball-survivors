// WebRTC P2P Multi-Player Co-op Networking Layer (Up to 3 Players: Host 1P + Guest 2P & 3P)
// Uses PeerJS Star Topology + Google STUN + BroadcastChannel local same-browser fallback
window.PBNetwork = (() => {
  const PEER_PREFIX = 'pbsurv26-';
  const MAX_GUESTS = 2; // Supports 2P and 3P simultaneous co-op!
  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  let peer = null;
  let hostConn = null; // Guest -> Host DataConnection
  const guestConns = new Map(); // Host -> Map<pid (1|2), { conn, bcClientId, pingMs, open }>
  let bc = null; // BroadcastChannel fallback for local same-browser testing
  let role = null; // 'host' | 'guest' | null
  let myPid = 0; // 0 = 1P(Host), 1 = 2P, 2 = 3P
  let roomCode = '';
  let connected = false;
  let pingMs = 0;
  let pingTimer = null;
  let bcClientId = '';
  let pendingJoinResolve = null;
  let pendingJoinReject = null;

  const handlers = {
    status: () => {},
    connected: () => {},
    disconnected: () => {},
    message: () => {},
    error: () => {}
  };

  function on(event, fn) {
    handlers[event] = fn || (() => {});
  }

  function genRoomCode() {
    return String(1000 + Math.floor(Math.random() * 9000));
  }

  function genClientId() {
    return 'c_' + Math.random().toString(36).slice(2, 10);
  }

  function getConnectedPids() {
    if (role === 'host') {
      const pids = [];
      for (const [pid, entry] of guestConns.entries()) {
        if (entry.open) pids.push(pid);
      }
      return pids.sort((a, b) => a - b);
    }
    return connected ? [0] : [];
  }

  function findFreeGuestPid() {
    for (let pid = 1; pid <= MAX_GUESTS; pid++) {
      if (!guestConns.has(pid)) return pid;
    }
    return null;
  }

  function updateHostStatus() {
    const pids = getConnectedPids();
    if (pids.length === 0) {
      handlers.status(`ルーム ${roomCode} 待機中 — 2P・3Pの参加を待っています（最大3人）`, false);
      return;
    }
    const labels = pids.map(pid => {
      const entry = guestConns.get(pid);
      const ms = entry?.pingMs ? `${entry.pingMs}ms` : 'OK';
      return `${pid + 1}P(${ms})`;
    }).join(' / ');
    handlers.status(`接続中 [${pids.length + 1}/3人]: ${labels}`, true);
  }

  function cleanup() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (hostConn) {
      try { hostConn.close(); } catch {}
      hostConn = null;
    }
    for (const entry of guestConns.values()) {
      if (entry.conn) {
        try { entry.conn.close(); } catch {}
      }
    }
    guestConns.clear();
    if (peer) {
      try { peer.destroy(); } catch {}
      peer = null;
    }
    if (bc) {
      try { bc.close(); } catch {}
      bc = null;
    }
    connected = false;
    role = null;
    myPid = 0;
    roomCode = '';
    pingMs = 0;
    bcClientId = '';
    pendingJoinResolve = null;
    pendingJoinReject = null;
  }

  function startPing() {
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      if (role === 'host') {
        for (const [pid, entry] of guestConns.entries()) {
          if (entry.open) send('__ping', { t: Date.now() }, pid);
        }
      } else if (role === 'guest' && connected) {
        send('__ping', { t: Date.now() });
      }
    }, 2200);
  }

  function handleIncoming(data, fromPid) {
    if (!data || typeof data !== 'object') return;
    if (data.type === '__ping') {
      if (role === 'host') send('__pong', { t: data.payload?.t || Date.now() }, fromPid);
      else send('__pong', { t: data.payload?.t || Date.now() });
      return;
    }
    if (data.type === '__pong') {
      const rtt = data.payload?.t ? Math.max(1, Math.round((Date.now() - data.payload.t) / 2)) : 1;
      if (role === 'host') {
        const entry = guestConns.get(fromPid);
        if (entry) entry.pingMs = rtt;
        updateHostStatus();
      } else {
        pingMs = rtt;
        handlers.status(`${myPid + 1}Pとして接続中 (${pingMs}ms)`, true);
      }
      return;
    }
    if (role === 'guest' && data.type === '__assign') {
      myPid = data.payload?.pid || 1;
      connected = true;
      handlers.status(`${myPid + 1}Pとしてルーム ${roomCode} に接続しました！`, true);
      startPing();
      if (pendingJoinResolve) {
        const r = pendingJoinResolve;
        pendingJoinResolve = null;
        pendingJoinReject = null;
        r(myPid);
      }
      handlers.connected(myPid);
      return;
    }
    if (role === 'guest' && data.type === '__full') {
      const msg = 'ルームが満員（最大3人）です';
      handlers.status(msg, false);
      if (pendingJoinReject) {
        const rej = pendingJoinReject;
        pendingJoinResolve = null;
        pendingJoinReject = null;
        rej(new Error(msg));
      }
      cleanup();
      return;
    }
    handlers.message(data.type, data.payload, fromPid);
  }

  function bindHostGuestConn(dataConn, pid) {
    const entry = { conn: dataConn, bcClientId: null, pingMs: 0, open: false };
    guestConns.set(pid, entry);

    dataConn.on('open', () => {
      entry.open = true;
      connected = true;
      try { dataConn.send({ type: '__assign', payload: { pid } }); } catch {}
      startPing();
      updateHostStatus();
      handlers.connected(pid);
    });

    dataConn.on('data', (data) => handleIncoming(data, pid));

    dataConn.on('close', () => {
      const wasOpen = entry.open;
      guestConns.delete(pid);
      connected = getConnectedPids().length > 0;
      if (!connected && pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      updateHostStatus();
      if (wasOpen) {
        handlers.disconnected(pid);
      }
    });

    dataConn.on('error', (err) => {
      handlers.error(`${pid + 1}P通信エラー: ` + (err?.message || err));
    });
  }

  function bindGuestConn(dataConn) {
    hostConn = dataConn;
    dataConn.on('data', (data) => handleIncoming(data, 0));
    dataConn.on('close', () => {
      const wasConnected = connected;
      connected = false;
      if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
      if (wasConnected) {
        handlers.status('ホストとの接続が切れました', false);
        handlers.disconnected(0);
      }
    });
    dataConn.on('error', (err) => {
      handlers.error('通信エラー: ' + (err?.message || err));
    });
  }

  function setupBroadcastFallback(code, asRole) {
    if (typeof BroadcastChannel === 'undefined') return false;
    bc = new BroadcastChannel(PEER_PREFIX + code);
    bc.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg || msg.from === asRole) return;

      if (asRole === 'host') {
        if (msg.type === '__hello' && msg.clientId) {
          // Check if client already assigned
          let pid = null;
          for (const [k, v] of guestConns.entries()) {
            if (v.bcClientId === msg.clientId) { pid = k; break; }
          }
          if (pid === null) pid = findFreeGuestPid();
          if (pid === null) {
            bc.postMessage({ from: 'host', toClientId: msg.clientId, type: '__full' });
            return;
          }
          guestConns.set(pid, { conn: null, bcClientId: msg.clientId, pingMs: 0, open: true });
          connected = true;
          bc.postMessage({ from: 'host', toClientId: msg.clientId, type: '__welcome', payload: { pid } });
          updateHostStatus();
          handlers.connected(pid);
          return;
        }
        if (msg.type === '__bye' && msg.fromPid) {
          const existed = guestConns.has(msg.fromPid);
          guestConns.delete(msg.fromPid);
          connected = getConnectedPids().length > 0;
          updateHostStatus();
          if (existed) handlers.disconnected(msg.fromPid);
          return;
        }
        if (msg.fromPid && guestConns.has(msg.fromPid)) {
          handleIncoming(msg, msg.fromPid);
        }
      } else {
        if (msg.toClientId && msg.toClientId !== bcClientId) return;
        if (typeof msg.toPid === 'number' && msg.toPid !== myPid) return;
        if (msg.type === '__full') {
          handleIncoming({ type: '__full' }, 0);
          return;
        }
        if (msg.type === '__welcome') {
          handleIncoming({ type: '__assign', payload: { pid: msg.payload?.pid || 1 } }, 0);
          return;
        }
        if (msg.type === '__bye') {
          if (connected) {
            connected = false;
            handlers.status('ホストとの接続が切れました', false);
            handlers.disconnected(0);
          }
          return;
        }
        handleIncoming(msg, 0);
      }
    };
    if (asRole === 'guest') {
      bc.postMessage({ from: 'guest', clientId: bcClientId, type: '__hello' });
    }
    return true;
  }

  function hostRoom(customCode = null) {
    cleanup();
    role = 'host';
    myPid = 0;
    roomCode = customCode || genRoomCode();
    handlers.status('ルームを作成中…', false);

    // Also open BroadcastChannel in background for zero-latency same-browser multi-tab testing
    setupBroadcastFallback(roomCode, 'host');

    if (typeof window.Peer === 'undefined') {
      handlers.status(`ルーム ${roomCode} 待機中（同一ブラウザテストモード・最大3人）`, false);
      return Promise.resolve(roomCode);
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const peerId = PEER_PREFIX + roomCode;
      try {
        peer = new window.Peer(peerId, {
          debug: 0,
          config: { iceServers: ICE_SERVERS }
        });
      } catch (e) {
        handlers.status(`ルーム ${roomCode} 待機中（オフライン/ローカル）`, false);
        resolve(roomCode);
        return;
      }

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          handlers.status(`ルーム ${roomCode} 待機中（P2Pサーバー応答待ち・ローカル可）`, false);
          resolve(roomCode);
        }
      }, 6500);

      peer.on('open', () => {
        clearTimeout(timeout);
        if (!settled) {
          settled = true;
          updateHostStatus();
          resolve(roomCode);
        }
      });

      peer.on('connection', (incomingConn) => {
        const freePid = findFreeGuestPid();
        if (freePid === null) {
          incomingConn.on('open', () => {
            try { incomingConn.send({ type: '__full' }); } catch {}
            setTimeout(() => { try { incomingConn.close(); } catch {} }, 160);
          });
          return;
        }
        bindHostGuestConn(incomingConn, freePid);
      });

      peer.on('error', (err) => {
        clearTimeout(timeout);
        if (err && err.type === 'unavailable-id' && !settled) {
          settled = true;
          hostRoom(genRoomCode()).then(resolve).catch(reject);
          return;
        }
        if (!settled) {
          settled = true;
          handlers.status(`ルーム ${roomCode}（オフライン待機）`, false);
          resolve(roomCode);
        } else {
          handlers.error('P2P通信エラー: ' + (err?.type || err?.message || 'unknown'));
        }
      });
    });
  }

  function joinRoom(code) {
    cleanup();
    role = 'guest';
    myPid = 1;
    bcClientId = genClientId();
    roomCode = String(code || '').replace(/[^0-9A-Za-z]/g, '').slice(0, 8);
    if (!roomCode) {
      return Promise.reject(new Error('ルームコードを入力してください'));
    }
    handlers.status(`ルーム ${roomCode} に接続中…`, false);

    return new Promise((resolve, reject) => {
      let settled = false;
      pendingJoinResolve = (pid) => {
        if (!settled) { settled = true; clearTimeout(timeout); resolve(pid); }
      };
      pendingJoinReject = (err) => {
        if (!settled) { settled = true; clearTimeout(timeout); reject(err); }
      };

      const timeout = setTimeout(() => {
        if (!settled && !connected) {
          settled = true;
          pendingJoinResolve = null;
          pendingJoinReject = null;
          handlers.status('接続がタイムアウトしました。コードを確認してください', false);
          reject(new Error('ルームが見つからないか、接続がタイムアウトしました'));
        }
      }, 10500);

      // Probe BroadcastChannel in case Host is on another tab of the same browser
      setupBroadcastFallback(roomCode, 'guest');

      if (typeof window.Peer === 'undefined') {
        return;
      }

      try {
        peer = new window.Peer(undefined, {
          debug: 0,
          config: { iceServers: ICE_SERVERS }
        });
      } catch (e) {
        return;
      }

      peer.on('open', () => {
        if (connected) return; // Already connected via BroadcastChannel!
        const targetId = PEER_PREFIX + roomCode;
        const dataConn = peer.connect(targetId, { reliable: true });
        bindGuestConn(dataConn);
      });

      peer.on('error', (err) => {
        if (connected) return;
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          pendingJoinResolve = null;
          pendingJoinReject = null;
          const msg = err?.type === 'peer-unavailable'
            ? `ルーム「${roomCode}」が見つかりません。コードを確認してください。`
            : `接続エラー (${err?.type || err?.message || 'unknown'})`;
          handlers.status(msg, false);
          reject(new Error(msg));
        }
      });
    });
  }

  function send(type, payload = {}, targetPid = null) {
    if (!connected) return;
    const msg = { type, payload };
    if (role === 'host') {
      if (targetPid !== null && targetPid !== undefined) {
        const entry = guestConns.get(targetPid);
        if (!entry || !entry.open) return;
        if (entry.conn && entry.conn.open) {
          try { entry.conn.send(msg); } catch {}
        } else if (bc && entry.bcClientId) {
          try { bc.postMessage({ from: 'host', toPid: targetPid, ...msg }); } catch {}
        }
      } else {
        for (const [pid, entry] of guestConns.entries()) {
          if (!entry.open) continue;
          if (entry.conn && entry.conn.open) {
            try { entry.conn.send(msg); } catch {}
          } else if (bc && entry.bcClientId) {
            try { bc.postMessage({ from: 'host', toPid: pid, ...msg }); } catch {}
          }
        }
      }
    } else if (role === 'guest') {
      if (hostConn && hostConn.open) {
        try { hostConn.send(msg); } catch {}
      } else if (bc) {
        try { bc.postMessage({ from: 'guest', fromPid: myPid, ...msg }); } catch {}
      }
    }
  }

  function disconnect() {
    if (bc && connected) {
      try {
        bc.postMessage(role === 'host'
          ? { from: 'host', type: '__bye' }
          : { from: 'guest', fromPid: myPid, type: '__bye' });
      } catch {}
    }
    cleanup();
  }

  return {
    on,
    hostRoom,
    joinRoom,
    send,
    disconnect,
    getRole: () => role,
    getMyPid: () => myPid,
    getRoomCode: () => roomCode,
    isConnected: () => connected,
    getConnectedPids,
    getGuestCount: () => getConnectedPids().length,
    getPing: () => pingMs
  };
})();
