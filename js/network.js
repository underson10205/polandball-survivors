// WebRTC P2P Co-op Networking Layer (PeerJS + STUN + BroadcastChannel fallback)
window.PBNetwork = (() => {
  const PEER_PREFIX = 'pbsurv26-';
  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  let peer = null;
  let conn = null;
  let bc = null; // BroadcastChannel fallback for local same-browser testing
  let role = null; // 'host' | 'guest' | null
  let roomCode = '';
  let connected = false;
  let pingMs = 0;
  let pingTimer = null;
  let usingLocalChannel = false;

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

  function cleanup() {
    if (pingTimer) {
      clearInterval(pingTimer);
      pingTimer = null;
    }
    if (conn) {
      try { conn.close(); } catch {}
      conn = null;
    }
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
    roomCode = '';
    pingMs = 0;
    usingLocalChannel = false;
  }

  function startPing() {
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      if (connected) send('__ping', { t: Date.now() });
    }, 2000);
  }

  function handleIncoming(data) {
    if (!data || typeof data !== 'object') return;
    if (data.type === '__ping') {
      send('__pong', { t: data.payload?.t || Date.now() });
      return;
    }
    if (data.type === '__pong') {
      if (data.payload?.t) {
        pingMs = Math.max(1, Math.round((Date.now() - data.payload.t) / 2));
        handlers.status(`接続中 (${pingMs}ms)`, true);
      }
      return;
    }
    handlers.message(data.type, data.payload);
  }

  function bindDataConn(dataConn) {
    conn = dataConn;
    conn.on('open', () => {
      connected = true;
      handlers.status('2Pと接続しました！', true);
      startPing();
      handlers.connected();
    });
    conn.on('data', handleIncoming);
    conn.on('close', () => {
      const wasConnected = connected;
      connected = false;
      if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
      if (wasConnected) {
        handlers.status('接続が切れました', false);
        handlers.disconnected();
      }
    });
    conn.on('error', (err) => {
      handlers.error('通信エラー: ' + (err?.message || err));
    });
  }

  function setupBroadcastFallback(code, asRole) {
    if (typeof BroadcastChannel === 'undefined') return false;
    usingLocalChannel = true;
    bc = new BroadcastChannel(PEER_PREFIX + code);
    bc.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg || msg.from === asRole) return;
      if (msg.type === '__hello' && asRole === 'host') {
        connected = true;
        bc.postMessage({ from: 'host', type: '__welcome' });
        handlers.status('ローカルタブ接続中 (0ms)', true);
        handlers.connected();
        return;
      }
      if (msg.type === '__welcome' && asRole === 'guest') {
        connected = true;
        handlers.status('ローカルタブ接続中 (0ms)', true);
        handlers.connected();
        return;
      }
      if (msg.type === '__bye') {
        connected = false;
        handlers.disconnected();
        return;
      }
      handleIncoming(msg);
    };
    if (asRole === 'guest') {
      bc.postMessage({ from: 'guest', type: '__hello' });
    }
    return true;
  }

  function hostRoom(customCode = null) {
    cleanup();
    role = 'host';
    roomCode = customCode || genRoomCode();
    handlers.status('ルームを作成中…', false);

    // Always also open BroadcastChannel in background for zero-latency same-browser testing
    setupBroadcastFallback(roomCode, 'host');
    usingLocalChannel = false; // Prefer PeerJS unless BC receives a hello

    if (typeof window.Peer === 'undefined') {
      usingLocalChannel = true;
      handlers.status(`ルーム ${roomCode} 待機中（同一ブラウザテストモード）`, false);
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
        usingLocalChannel = true;
        handlers.status(`ルーム ${roomCode} 待機中（オフライン/ローカル）`, false);
        resolve(roomCode);
        return;
      }

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          usingLocalChannel = true;
          handlers.status(`ルーム ${roomCode} 待機中（P2Pサーバー応答待ち・ローカル可）`, false);
          resolve(roomCode);
        }
      }, 6500);

      peer.on('open', () => {
        clearTimeout(timeout);
        if (!settled) {
          settled = true;
          handlers.status(`ルーム ${roomCode} 待機中 — 2Pの参加を待っています`, false);
          resolve(roomCode);
        }
      });

      peer.on('connection', (incomingConn) => {
        if (conn && connected) {
          incomingConn.close();
          return;
        }
        usingLocalChannel = false;
        bindDataConn(incomingConn);
      });

      peer.on('error', (err) => {
        clearTimeout(timeout);
        if (err && err.type === 'unavailable-id' && !settled) {
          settled = true;
          // Retry with a new code
          hostRoom(genRoomCode()).then(resolve).catch(reject);
          return;
        }
        if (!settled) {
          settled = true;
          usingLocalChannel = true;
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
    roomCode = String(code || '').replace(/[^0-9A-Za-z]/g, '').slice(0, 8);
    if (!roomCode) {
      return Promise.reject(new Error('ルームコードを入力してください'));
    }
    handlers.status(`ルーム ${roomCode} に接続中…`, false);

    // Also probe BroadcastChannel in case Host is on another tab of the same browser
    setupBroadcastFallback(roomCode, 'guest');
    usingLocalChannel = false;

    if (typeof window.Peer === 'undefined') {
      usingLocalChannel = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      try {
        peer = new window.Peer(undefined, {
          debug: 0,
          config: { iceServers: ICE_SERVERS }
        });
      } catch (e) {
        usingLocalChannel = true;
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        if (!settled && !connected) {
          settled = true;
          handlers.status('接続がタイムアウトしました。コードを確認してください', false);
          reject(new Error('ルームが見つからないか、接続がタイムアウトしました'));
        }
      }, 10000);

      peer.on('open', () => {
        if (connected) {
          // Already connected via BroadcastChannel!
          clearTimeout(timeout);
          if (!settled) { settled = true; resolve(); }
          return;
        }
        const targetId = PEER_PREFIX + roomCode;
        const dataConn = peer.connect(targetId, { reliable: true });
        bindDataConn(dataConn);
        dataConn.on('open', () => {
          clearTimeout(timeout);
          if (!settled) { settled = true; resolve(); }
        });
      });

      peer.on('error', (err) => {
        if (connected) return; // Connected via local channel
        clearTimeout(timeout);
        if (!settled) {
          settled = true;
          const msg = err?.type === 'peer-unavailable'
            ? `ルーム「${roomCode}」が見つかりません。コードを確認してください。`
            : `接続エラー (${err?.type || err?.message || 'unknown'})`;
          handlers.status(msg, false);
          reject(new Error(msg));
        }
      });
    });
  }

  function send(type, payload = {}) {
    if (!connected) return;
    const msg = { type, payload };
    if (conn && conn.open) {
      try { conn.send(msg); } catch {}
    } else if (bc) {
      try { bc.postMessage({ from: role, ...msg }); } catch {}
    }
  }

  function disconnect() {
    if (bc && connected) {
      try { bc.postMessage({ from: role, type: '__bye' }); } catch {}
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
    getRoomCode: () => roomCode,
    isConnected: () => connected,
    getPing: () => pingMs
  };
})();
