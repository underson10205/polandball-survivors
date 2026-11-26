// Polandball Survivors - Game Data & Balance Definitions
window.PBData = (() => {
  const CHARACTERS = [
    {
      id: 'poland',
      name: 'ポーランド',
      en: 'Poland',
      tagline: '宇宙を目指す永遠のチャレンジャー！',
      lore: '「Polan cannot into space」と言われても諦めない！ラバーカップ片手に宇宙へ挑む。',
      startWeapon: 'plunger',
      unlockCost: 0,
      stats: { maxHp: 110, speed: 195, might: 1.0, cooldown: 1.0, area: 1.0, amount: 0, armor: 0, regen: 0.15, magnet: 85, xpMult: 1.15 },
      passiveDesc: '経験値 +15% / 移動速度 +5%',
      badgeColor: '#dc143c'
    },
    {
      id: 'japan',
      name: '日本',
      en: 'Japan',
      tagline: '目にも止まらぬ居合の達人！',
      lore: 'ハチマキを締めると本気モード。高速の斬撃波で敵ボールを一閃する。',
      startWeapon: 'katana',
      unlockCost: 0,
      stats: { maxHp: 100, speed: 200, might: 1.05, cooldown: 0.88, area: 1.0, amount: 0, armor: 0, regen: 0.1, magnet: 80, xpMult: 1.0 },
      passiveDesc: '攻撃クールダウン -12% / 攻撃力 +5%',
      badgeColor: '#bc002d'
    },
    {
      id: 'usa',
      name: 'アメリカ',
      en: 'USA',
      tagline: '圧倒的火力とサングラスの自由人！',
      lore: 'サングラスは絶対に外さない。弾幕とミサイルで全ての問題を解決する。',
      startWeapon: 'missile',
      unlockCost: 0,
      stats: { maxHp: 120, speed: 185, might: 1.0, cooldown: 1.0, area: 1.05, amount: 1, armor: 0, regen: 0, magnet: 80, xpMult: 1.0 },
      passiveDesc: '全武器の発射数 +1 / 最大HP +20',
      badgeColor: '#1d4ed8'
    },
    {
      id: 'uk',
      name: 'イギリス',
      en: 'UK',
      tagline: '優雅なる紅茶とシルクハットの紳士！',
      lore: 'どんな激戦でもティータイムは欠かさない。広範囲の回転紅茶で敵を寄せ付けない。',
      startWeapon: 'teacup',
      unlockCost: 0,
      stats: { maxHp: 105, speed: 190, might: 1.0, cooldown: 0.96, area: 1.2, amount: 0, armor: 1, regen: 0.1, magnet: 90, xpMult: 1.0 },
      passiveDesc: '攻撃範囲 +20% / アーマー +1',
      badgeColor: '#1e3a8a'
    },
    {
      id: 'france',
      name: 'フランス',
      en: 'France',
      tagline: '硬派なバゲットと不屈の回復力！',
      lore: '焼きたて（ただし超硬い）バゲットを投げまくる芸術家気質のボール。',
      startWeapon: 'baguette',
      unlockCost: 0,
      stats: { maxHp: 125, speed: 192, might: 1.0, cooldown: 1.0, area: 1.0, amount: 0, armor: 0, regen: 0.7, magnet: 85, xpMult: 1.0 },
      passiveDesc: 'HP自然回復 +0.7/秒 / 最大HP +25',
      badgeColor: '#2563eb'
    },
    {
      id: 'germany',
      name: 'ドイツ',
      en: 'Germany',
      tagline: '完璧な効率と重装甲の職人！',
      lore: 'ムダを一切許さない超効率バトル。高速貫通ソーセージで敵陣を撃ち抜く。',
      startWeapon: 'bratwurst',
      unlockCost: 0,
      stats: { maxHp: 130, speed: 186, might: 1.12, cooldown: 0.95, area: 1.0, amount: 0, armor: 2, regen: 0.1, magnet: 80, xpMult: 1.0 },
      passiveDesc: 'アーマー +2 / 攻撃力 +12%',
      badgeColor: '#ca8a04'
    },
    {
      id: 'italy',
      name: 'イタリア',
      en: 'Italy',
      tagline: '情熱のコック帽＆跳弾ピッツァ職人！',
      lore: '陽気なシェフ帽がトレードマーク。画面端で跳ね返る熱々ピッツァで敵軍団を切り裂く！',
      startWeapon: 'pizza',
      unlockCost: 0,
      stats: { maxHp: 112, speed: 206, might: 1.04, cooldown: 0.96, area: 1.15, amount: 0, armor: 0, regen: 0.45, magnet: 90, xpMult: 1.05 },
      passiveDesc: '攻撃範囲 +15% / 移動速度 +8% / HP回復 +0.45/秒',
      badgeColor: '#16a34a'
    },
    {
      id: 'russia',
      name: 'ロシア',
      en: 'Russia',
      tagline: 'ウシャンカ帽の冬将軍・重戦車！',
      lore: '極寒を生き抜く分厚いウシャンカ帽と圧倒的なタフネス。ウォッカの炎で敵を焼き尽くす！',
      startWeapon: 'molotov',
      unlockCost: 0,
      stats: { maxHp: 155, speed: 176, might: 1.15, cooldown: 0.98, area: 1.1, amount: 0, armor: 2, regen: 0.25, magnet: 85, xpMult: 1.0 },
      passiveDesc: '最大HP +55 / 攻撃力 +15% / アーマー +2',
      badgeColor: '#1d4ed8'
    },
    {
      id: 'spain',
      name: 'スペイン',
      en: 'Spain',
      tagline: '情熱の赤いムレータ＆闘牛士の舞！',
      lore: '「¡Olé!」の掛け声とともに戦場を華麗に舞う情熱のボール。弧を描く闘牛サーベルで敵を切り裂く！',
      startWeapon: 'matador',
      unlockCost: 0,
      stats: { maxHp: 118, speed: 204, might: 1.08, cooldown: 0.94, area: 1.08, amount: 0, armor: 1, regen: 0.25, magnet: 90, xpMult: 1.05 },
      passiveDesc: '攻撃力 +8% / 移動速度 +7% / CD -6%',
      badgeColor: '#aa151b'
    },
    {
      id: 'sweden',
      name: 'スウェーデン',
      en: 'Sweden',
      tagline: '北欧雷神ハンマー＆高速連鎖の匠！',
      lore: 'ツノ付き兜を被った北欧の戦士。敵から敵へ連鎖する雷撃ハンマーで群れを一網打尽！',
      startWeapon: 'mjolnir',
      unlockCost: 300,
      stats: { maxHp: 120, speed: 196, might: 1.08, cooldown: 0.86, area: 1.16, amount: 0, armor: 1, regen: 0.2, magnet: 95, xpMult: 1.05 },
      passiveDesc: '攻撃クールダウン -14% / 攻撃範囲 +16%',
      badgeColor: '#0284c7'
    },
    {
      id: 'spqr',
      name: 'ローマ帝国',
      en: 'SPQR',
      tagline: 'すべての道はローマに通ず！',
      lore: '黄金の月桂冠を戴く古の覇者。投槍ピルムの雨で軍団を粉砕する。',
      startWeapon: 'pilum',
      unlockCost: 380,
      stats: { maxHp: 150, speed: 188, might: 1.18, cooldown: 0.96, area: 1.1, amount: 0, armor: 2, regen: 0.2, magnet: 85, xpMult: 1.0 },
      passiveDesc: '最大HP +50 / 攻撃力 +18% / アーマー +2',
      badgeColor: '#991b1b'
    },
    {
      id: 'nepal',
      name: 'ネパール',
      en: 'Nepalrawr',
      tagline: 'ギザギザ三角の野生の咆哮！',
      lore: '丸くない数少ない存在。ヒマラヤの咆哮で敵を吹き飛ばし高速で駆け抜ける！',
      startWeapon: 'roar',
      unlockCost: 500,
      stats: { maxHp: 115, speed: 222, might: 1.12, cooldown: 0.92, area: 1.12, amount: 0, armor: 0, regen: 0.2, magnet: 95, xpMult: 1.05 },
      passiveDesc: '移動速度 +18% / 攻撃範囲 +12%',
      badgeColor: '#be123c'
    },
    {
      id: 'singapore',
      name: 'シンガポール',
      en: 'Tringapore',
      tagline: '鋭角トライアングル＆マーライオン砲！',
      lore: 'ポーランドボール名物の三角形「トラインガポール」！超高圧のマーライオン水流で敵を押し流す！',
      startWeapon: 'merlion',
      unlockCost: 580,
      stats: { maxHp: 102, speed: 226, might: 1.08, cooldown: 0.89, area: 1.05, amount: 0, armor: 0, regen: 0.15, magnet: 115, xpMult: 1.22 },
      passiveDesc: '移動速度 +20% / 経験値 +22% / CD -11%',
      badgeColor: '#e11d48'
    },
    {
      id: 'portugal',
      name: 'ポルトガル',
      en: 'Portugal',
      tagline: '大航海時代を切り拓く不屈の航海王！',
      lore: '七つの海を制した大航海時代の先駆者！キャラベル船の連装大砲と黄金羅針盤で敵の大軍を撃沈する。',
      startWeapon: 'caravel',
      unlockCost: 640,
      stats: { maxHp: 128, speed: 202, might: 1.12, cooldown: 0.92, area: 1.12, amount: 0, armor: 1, regen: 0.3, magnet: 105, xpMult: 1.12 },
      passiveDesc: '攻撃力 +12% / 攻撃範囲 +12% / 経験値 +12%',
      badgeColor: '#047857'
    },
    {
      id: 'israel',
      name: 'イスラエル',
      en: 'Israel Cube',
      tagline: '四次元物理学のハイパーキューブ！',
      lore: '「Jewish Physics」で屈折レーザーを放つ半透明キューブ。圧倒的な吸引力を誇る。',
      startWeapon: 'laser',
      unlockCost: 700,
      stats: { maxHp: 105, speed: 198, might: 1.1, cooldown: 0.9, area: 1.05, amount: 0, armor: 1, regen: 0.15, magnet: 145, xpMult: 1.15 },
      passiveDesc: '回収範囲 +70% / 経験値 +15% / CD -10%',
      badgeColor: '#0284c7'
    },
    {
      id: 'switzerland',
      name: 'スイス',
      en: 'Switzerland',
      tagline: '永世中立・正方形の不沈要塞！',
      lore: '国旗が正方形なため四角い姿で参戦！赤十字の聖なる結界と超回復力でどんな猛攻も耐え抜く。',
      startWeapon: 'med_cross',
      unlockCost: 850,
      stats: { maxHp: 145, speed: 190, might: 1.08, cooldown: 0.94, area: 1.15, amount: 0, armor: 3, regen: 1.6, magnet: 95, xpMult: 1.05 },
      passiveDesc: 'HP自然回復 +1.6/秒 / アーマー +3 / 最大HP +45',
      badgeColor: '#dc2626'
    }
  ];

  const PASSIVES = {
    rocket_fuel: {
      id: 'rocket_fuel',
      name: 'ロケット燃料',
      icon: '⛽',
      maxLevel: 5,
      desc: '移動速度 +10%/Lv（ラバーカップ進化素材）',
      stat: 'speedMult',
      perLevel: 0.10,
      evolves: 'plunger'
    },
    matcha: {
      id: 'matcha',
      name: '特製抹茶ラテ',
      icon: '🍵',
      maxLevel: 5,
      desc: '攻撃クールダウン -8%/Lv（居合カタナ進化素材）',
      stat: 'cooldownMult',
      perLevel: -0.08,
      evolves: 'katana'
    },
    burger: {
      id: 'burger',
      name: 'メガバーガー',
      icon: '🍔',
      maxLevel: 5,
      desc: '最大HP +25/Lv ＆ 取得時回復（ミサイル進化素材）',
      stat: 'maxHpFlat',
      perLevel: 25,
      evolves: 'missile'
    },
    monocle: {
      id: 'monocle',
      name: '黄金モノクル',
      icon: '🧐',
      maxLevel: 5,
      desc: '攻撃範囲 +14%/Lv（ティーカップ進化素材）',
      stat: 'areaMult',
      perLevel: 0.14,
      evolves: 'teacup'
    },
    croissant: {
      id: 'croissant',
      name: '焼きたてクロワッサン',
      icon: '🥐',
      maxLevel: 5,
      desc: 'HP自然回復 +0.5/秒/Lv（バゲット進化素材）',
      stat: 'regenFlat',
      perLevel: 0.5,
      evolves: 'baguette'
    },
    gear: {
      id: 'gear',
      name: 'ドイツ製歯車',
      icon: '⚙️',
      maxLevel: 5,
      desc: '発射数 +1 (Lv.1/3/5) ＆ 攻撃速度 +4%/Lv（ソーセージ進化素材）',
      stat: 'gearBonus',
      perLevel: 1,
      evolves: 'bratwurst'
    },
    shield: {
      id: 'shield',
      name: 'レギオンの盾',
      icon: '🛡️',
      maxLevel: 5,
      desc: 'アーマー +2/Lv（ピルム進化素材）',
      stat: 'armorFlat',
      perLevel: 2,
      evolves: 'pilum'
    },
    compass: {
      id: 'compass',
      name: '磁気コンパス',
      icon: '🧭',
      maxLevel: 5,
      desc: '経験値・コイン回収範囲 +30%/Lv（咆哮進化素材）',
      stat: 'magnetMult',
      perLevel: 0.30,
      evolves: 'roar'
    },
    atlas: {
      id: 'atlas',
      name: '宇宙大図鑑',
      icon: '📘',
      maxLevel: 5,
      desc: '獲得経験値 +15%/Lv（レーザー進化素材）',
      stat: 'xpMult',
      perLevel: 0.15,
      evolves: 'laser'
    },
    curry: {
      id: 'curry',
      name: '激辛スパイス',
      icon: '🌶️',
      maxLevel: 5,
      desc: '全武器の攻撃力 +14%/Lv（火炎瓶進化素材）',
      stat: 'mightMult',
      perLevel: 0.14,
      evolves: 'molotov'
    },
    olive_oil: {
      id: 'olive_oil',
      name: '特選オリーブオイル',
      icon: '🫒',
      maxLevel: 5,
      desc: '弾速 +12%/Lv（ピッツァ進化素材）',
      stat: 'projSpeedMult',
      perLevel: 0.12,
      evolves: 'pizza'
    },
    viking_mead: {
      id: 'viking_mead',
      name: '北欧ミード酒',
      icon: '🍺',
      maxLevel: 5,
      desc: 'クリティカル率 +7%/Lv（雷撃ハンマー進化素材）',
      stat: 'critChance',
      perLevel: 0.07,
      evolves: 'mjolnir'
    },
    chili_crab: {
      id: 'chili_crab',
      name: 'チリクラブ',
      icon: '🦀',
      maxLevel: 5,
      desc: 'ノックバック +22%/Lv（マーライオン進化素材）',
      stat: 'knockbackMult',
      perLevel: 0.22,
      evolves: 'merlion'
    },
    swiss_watch: {
      id: 'swiss_watch',
      name: 'スイス高級時計',
      icon: '⌚',
      maxLevel: 5,
      desc: '武器の持続時間 +15%/Lv（赤十字結界進化素材）',
      stat: 'durationMult',
      perLevel: 0.15,
      evolves: 'med_cross'
    },
    paella: {
      id: 'paella',
      name: '情熱パエリア',
      icon: '🥘',
      maxLevel: 5,
      desc: '攻撃力 +8%/Lv ＆ 移動速度 +5%/Lv（闘牛サーベル進化素材）',
      stat: 'mightAndSpeed',
      perLevel: 1,
      evolves: 'matador'
    },
    nata: {
      id: 'nata',
      name: 'エッグタルト',
      icon: '🥧',
      maxLevel: 5,
      desc: '攻撃範囲 +8%/Lv ＆ HP回復 +0.35/秒/Lv（キャラベル大砲進化素材）',
      stat: 'areaAndRegen',
      perLevel: 1,
      evolves: 'caravel'
    }
  };

  const WEAPONS = {
    plunger: {
      id: 'plunger',
      name: 'ラバーカップ',
      icon: '🪠',
      maxLevel: 5,
      evolvePassive: 'rocket_fuel',
      evolvedName: 'ギャラクシー・プランジャー',
      evolvedIcon: '🌌',
      evolvedDesc: '宇宙ラバーカップが渦を生み出し敵を吸い寄せながら往復粉砕！',
      desc: '最寄りの敵へ投げて戻ってくるブーメラン型ラバーカップ。',
      color: '#ef4444',
      type: 'boomerang',
      base: { damage: 22, cooldown: 1.35, count: 1, speed: 390, area: 1.0, pierce: 99 },
      levelUp: [
        '威力大幅UP ＆ 発射数 +1',
        'クールダウン短縮 ＆ 範囲 +15%',
        '威力大幅UP ＆ 速度UP',
        '【MAX】発射数 +1 ＆ 威力・範囲強化！'
      ]
    },
    katana: {
      id: 'katana',
      name: '居合カタナ',
      icon: '⚔️',
      maxLevel: 5,
      evolvePassive: 'matcha',
      evolvedName: '新幹線ブレード・極',
      evolvedIcon: '🌸',
      evolvedDesc: '高速の桜吹雪クロス斬撃が周囲を切り裂く！',
      desc: '移動方向の前後に鋭い三日月斬撃波を放つ。',
      color: '#f43f5e',
      type: 'slash',
      base: { damage: 26, cooldown: 1.15, count: 1, speed: 0, area: 1.0, pierce: 99 },
      levelUp: [
        '前後同時斬撃（斬撃数 +1）＆ 威力UP',
        '威力大幅UP ＆ 斬撃範囲 +18%',
        'クールダウン短縮 ＆ 斬撃数 +1',
        '【MAX】威力・範囲・速度が大幅強化！'
      ]
    },
    missile: {
      id: 'missile',
      name: 'フリーダム・ミサイル',
      icon: '🚀',
      maxLevel: 5,
      evolvePassive: 'burger',
      evolvedName: 'デモクラシー絨毯爆撃',
      evolvedIcon: '💥',
      evolvedDesc: '着弾時にクラスター小爆弾が連鎖炸裂する自由の嵐！',
      desc: '敵を追尾し、着弾すると周囲を巻き込む爆風を起こす。',
      color: '#2563eb',
      type: 'homing',
      base: { damage: 24, cooldown: 1.65, count: 1, speed: 320, area: 1.0, pierce: 1 },
      levelUp: [
        '爆風範囲UP ＆ 発射数 +1',
        '威力大幅UP ＆ クールダウン短縮',
        '発射数 +1 ＆ 爆風拡大',
        '【MAX】威力・爆風が最大級に強化！'
      ]
    },
    teacup: {
      id: 'teacup',
      name: 'ロイヤル・ティーカップ',
      icon: '☕',
      maxLevel: 5,
      evolvePassive: 'monocle',
      evolvedName: 'アフタヌーン・ストーム',
      evolvedIcon: '🫖',
      evolvedDesc: '黄金ティーポットが常時高速周回し、近づく敵を弾き飛ばす！',
      desc: '熱い紅茶のカップが周囲を周回し、近づく敵を弾き飛ばす。',
      color: '#d97706',
      type: 'orbit',
      base: { damage: 26, cooldown: 3.6, duration: 3.2, count: 3, speed: 4.1, area: 1.0 },
      levelUp: [
        'ティーカップ +1 ＆ 威力UP',
        '回転速度UP ＆ 持続時間延長',
        'ティーカップ +1 ＆ 範囲拡大',
        '【MAX】ティーカップ +1 ＆ 威力大幅強化！'
      ]
    },
    baguette: {
      id: 'baguette',
      name: 'バゲット乱舞',
      icon: '🥖',
      maxLevel: 5,
      evolvePassive: 'croissant',
      evolvedName: 'パリジャン・トルネード',
      evolvedIcon: '🌪️',
      evolvedDesc: '黄金バゲットが超高速螺旋トルネードとなって広範囲の敵を長持続でなぎ倒す！',
      desc: '超硬質バゲットを豪快に放物線投擲！敵の大群を貫通しながら長時間切り裂く。',
      color: '#b45309',
      type: 'arc',
      base: { damage: 34, cooldown: 1.30, count: 2, speed: 380, area: 1.05, pierce: 12, duration: 2.8 },
      levelUp: [
        'バゲット +1 ＆ 貫通力大幅UP',
        '威力大幅UP ＆ クールダウン短縮',
        'バゲット +1 ＆ 攻撃範囲・持続時間拡大',
        '【MAX】威力・持続・貫通力が極限強化！'
      ]
    },
    bratwurst: {
      id: 'bratwurst',
      name: 'ソーセージ連射',
      icon: '🌭',
      maxLevel: 5,
      evolvePassive: 'gear',
      evolvedName: 'アウトバーン・ガトリング',
      evolvedIcon: '⚡',
      evolvedDesc: '高速の黄金レーザーソーセージが一直線に敵の大群を貫く！',
      desc: '最も近い敵へ向かって高速・高貫通の連射弾を撃ち込む。',
      color: '#ea580c',
      type: 'rapid',
      base: { damage: 15, cooldown: 0.72, count: 2, speed: 580, area: 1.0, pierce: 2 },
      levelUp: [
        '発射数 +1 ＆ 威力UP',
        '貫通力 +1 ＆ クールダウン短縮',
        '発射数 +1 ＆ 弾速UP',
        '【MAX】威力・貫通力が大幅強化！'
      ]
    },
    pilum: {
      id: 'pilum',
      name: 'ピルム投槍陣',
      icon: '🔱',
      maxLevel: 5,
      evolvePassive: 'shield',
      evolvedName: 'レギオン大行進',
      evolvedIcon: '🏛️',
      evolvedDesc: '全方位8本黄金投槍リング＆超貫通ファランクス重槍を連続投擲！軍団を粉砕する！',
      desc: '敵を複数貫通する高速ローマ投槍を扇状に放つ。',
      color: '#b91c1c',
      type: 'fan',
      base: { damage: 42, cooldown: 0.95, count: 4, speed: 640, area: 1.2, pierce: 6 },
      levelUp: [
        '槍の本数 +1 ＆ 威力UP（貫通力強化）',
        'クールダウン大幅短縮 ＆ 弾速UP',
        '槍の本数 +1 ＆ 攻撃判定拡大',
        '【MAX】槍の本数 +2 ＆ 威力・貫通力が神話級強化！'
      ]
    },
    roar: {
      id: 'roar',
      name: 'ヒマラヤ咆哮',
      icon: '📢',
      maxLevel: 5,
      evolvePassive: 'compass',
      evolvedName: 'エベレスト・アバランチ',
      evolvedIcon: '❄️',
      evolvedDesc: '極寒の衝撃波が周囲の敵を凍らせながら吹き飛ばす！',
      desc: '自分の周囲に強力な衝撃波を放ち、敵を大きくノックバックさせる。',
      color: '#0ea5e9',
      type: 'nova',
      base: { damage: 20, cooldown: 1.75, count: 1, speed: 0, area: 1.0, knockback: 260 },
      levelUp: [
        '衝撃波範囲 +18% ＆ 威力UP',
        'クールダウン短縮 ＆ ノックバック強化',
        '衝撃波範囲 +18% ＆ 威力大幅UP',
        '【MAX】超広範囲＆大威力ショックウェーブ！'
      ]
    },
    laser: {
      id: 'laser',
      name: 'プリズムレーザー',
      icon: '🔺',
      maxLevel: 5,
      evolvePassive: 'atlas',
      evolvedName: 'サテライト軌道砲',
      evolvedIcon: '🛰️',
      evolvedDesc: '宇宙衛星から極太の軌道レーザーが連続照射され敵を蒸発させる！',
      desc: 'ランダムな敵へ瞬間命中する高威力の屈折ビームを照射する。',
      color: '#06b6d4',
      type: 'lightning',
      base: { damage: 32, cooldown: 1.4, count: 2, area: 1.0 },
      levelUp: [
        '照射本数 +1 ＆ 威力UP',
        'クールダウン短縮 ＆ 範囲拡大',
        '照射本数 +1 ＆ 威力大幅UP',
        '【MAX】照射本数 +1 ＆ 破壊力MAX！'
      ]
    },
    molotov: {
      id: 'molotov',
      name: 'ウォッカ火炎瓶',
      icon: '🔥',
      maxLevel: 5,
      evolvePassive: 'curry',
      evolvedName: 'ウィンター・インフェルノ',
      evolvedIcon: '☄️',
      evolvedDesc: '青い高温の炎エリアが敵を継続的に焼き尽くす！',
      desc: '周囲に火炎瓶を投げ、地面に継続ダメージの炎エリアを作る。',
      color: '#f97316',
      type: 'zone',
      base: { damage: 12, cooldown: 2.3, duration: 3.4, count: 2, area: 1.0 },
      levelUp: [
        '火炎瓶 +1 ＆ 炎エリア拡大',
        '持続時間延長 ＆ 威力UP',
        '火炎瓶 +1 ＆ クールダウン短縮',
        '【MAX】広範囲・高火力の業火エリア！'
      ]
    },
    pizza: {
      id: 'pizza',
      name: 'ピッツァ・カッター',
      icon: '🍕',
      maxLevel: 5,
      evolvePassive: 'olive_oil',
      evolvedName: 'マンマ・ミーア・マルゲリータ',
      evolvedIcon: '🌋',
      evolvedDesc: '高速の業火ピッツァが画面中を跳ね回り敵軍団を焼き切る！',
      desc: '画面の端で跳ね返りながら敵を貫通する回転ピッツァを放つ。',
      color: '#ef4444',
      type: 'bounce',
      base: { damage: 24, cooldown: 1.55, count: 1, speed: 430, area: 1.0, pierce: 99, duration: 2.8 },
      levelUp: [
        'ピッツァ +1 ＆ 威力UP',
        '弾速UP ＆ 持続時間延長',
        'ピッツァ +1 ＆ サイズ拡大',
        '【MAX】威力・反射時間が大幅強化！'
      ]
    },
    mjolnir: {
      id: 'mjolnir',
      name: '北欧雷撃ハンマー',
      icon: '🔨',
      maxLevel: 5,
      evolvePassive: 'viking_mead',
      evolvedName: 'ミョルニル・サンダーストーム',
      evolvedIcon: '⛈️',
      evolvedDesc: '雷神の戦槌が複数の敵へ電撃連鎖し小爆発を引き起こす！',
      desc: '最寄りの敵を打ち抜き、周囲の敵へ次々飛び火する電撃連鎖攻撃。',
      color: '#38bdf8',
      type: 'chain',
      base: { damage: 27, cooldown: 1.38, count: 1, area: 1.0, chains: 3 },
      levelUp: [
        '連鎖数 +1 ＆ 威力UP',
        'クールダウン短縮 ＆ 連鎖範囲拡大',
        '連鎖数 +2 ＆ 威力大幅UP',
        '【MAX】同時発動数 +1 ＆ 大電撃連鎖！'
      ]
    },
    merlion: {
      id: 'merlion',
      name: 'マーライオン水流砲',
      icon: '🌊',
      maxLevel: 5,
      evolvePassive: 'chili_crab',
      evolvedName: 'マリーナベイ大津波',
      evolvedIcon: '🌀',
      evolvedDesc: '高圧のタイダルウェーブが敵の群れを押し流す！',
      desc: '進行方向へ強いノックバック付きの貫通水流波を噴射する。',
      color: '#06b6d4',
      type: 'wave',
      base: { damage: 23, cooldown: 1.28, count: 1, speed: 460, area: 1.0, pierce: 8, knockback: 220 },
      levelUp: [
        '水流波幅 +20% ＆ 威力UP',
        '連続噴射数 +1 ＆ クールダウン短縮',
        'ノックバック強化 ＆ 威力大幅UP',
        '【MAX】極太水流波＆超高威力！'
      ]
    },
    med_cross: {
      id: 'med_cross',
      name: '赤十字ホーリー結界',
      icon: '✚',
      maxLevel: 5,
      evolvePassive: 'swiss_watch',
      evolvedName: '永世中立の絶対結界',
      evolvedIcon: '🛡️',
      evolvedDesc: '黄金赤十字オーラが近づく敵を浄化し、撃破時にHPを吸収する！',
      desc: '自分の周囲に常時展開される結界。触れた敵に継続ダメージ＆押し戻し！',
      color: '#dc2626',
      type: 'aura',
      base: { damage: 11, cooldown: 0.42, count: 1, area: 1.0, knockback: 95 },
      levelUp: [
        '結界範囲 +18% ＆ 威力UP',
        'ダメージ間隔短縮 ＆ 押し戻し強化',
        '結界範囲 +18% ＆ 威力大幅UP',
        '【MAX】超広範囲の鉄壁バリア！'
      ]
    },
    matador: {
      id: 'matador',
      name: '情熱の闘牛サーベル',
      icon: '🌹',
      maxLevel: 5,
      evolvePassive: 'paella',
      evolvedName: 'エル・マタドール・オーレ',
      evolvedIcon: '💃',
      evolvedDesc: '真紅のバラと黄金サーベルが華麗な弧を描いて全方位を舞い切る！',
      desc: '美しい弧を描いてカーブしながら敵を貫通する情熱のサーベル刃を放つ。',
      color: '#e11d48',
      type: 'cross_spin',
      base: { damage: 25, cooldown: 1.32, count: 2, speed: 390, area: 1.0, pierce: 6, duration: 1.55 },
      levelUp: [
        'サーベル +1 ＆ 威力UP',
        'カーブ軌道の範囲拡大 ＆ クールダウン短縮',
        'サーベル +1 ＆ 貫通力UP',
        '【MAX】威力・飛距離・貫通力が大幅強化！'
      ]
    },
    caravel: {
      id: 'caravel',
      name: 'キャラベル連装大砲',
      icon: '💣',
      maxLevel: 5,
      evolvePassive: 'nata',
      evolvedName: '大航海アルマダ砲撃',
      evolvedIcon: '⛵',
      evolvedDesc: '黄金艦隊の全舷側斉射！命中時に大航海スプラッシュ爆風が発生！',
      desc: '左右の両舷へ重砲弾を一斉発射！敵を貫通しながら爆風で吹き飛ばす。',
      color: '#059669',
      type: 'broadside',
      base: { damage: 29, cooldown: 1.48, count: 1, speed: 440, area: 1.0, pierce: 3, knockback: 165 },
      levelUp: [
        '両舷の発射数 +1 ＆ 威力UP',
        '砲弾サイズ・爆風拡大 ＆ 貫通力 +1',
        'クールダウン短縮 ＆ 威力大幅UP',
        '【MAX】両舷の斉射火力＆爆風が最大強化！'
      ]
    }
  };

  const ENEMIES = {
    slime_ball: { id: 'slime_ball', name: 'ミニ・ローグボール', hp: 24, speed: 78, damage: 7, radius: 15, xp: 3, score: 10, desc: '群れで押し寄せる基本の敵ボール。' },
    pirate_ball: { id: 'pirate_ball', name: '海賊ソマリアボール', hp: 48, speed: 102, damage: 10, radius: 17, xp: 5, score: 18, desc: '素早く回り込んでくる眼帯の荒くれ者。' },
    cameroon_ball: { id: 'cameroon_ball', name: 'カメルーンボール', hp: 80, speed: 112, damage: 12, radius: 18, xp: 8, score: 28, desc: '「不屈のライオン」の異名を持つ俊足＆タフな猛攻ボール！' },
    mali_ball: { id: 'mali_ball', name: 'マリボール', hp: 66, speed: 94, damage: 10, radius: 17, xp: 7, score: 26, coinBonus: true, desc: '黄金帝国の末裔！倒すと高確率でゴールドコインを落とすお宝ボール！' },
    viking_ball: { id: 'viking_ball', name: 'バイキングボール', hp: 114, speed: 84, damage: 13, radius: 20, xp: 8, score: 30, desc: 'ツノ付き兜がトレードマークのタフな戦士。' },
    speed_ball: { id: 'speed_ball', name: 'ターボ・レーサーボール', hp: 52, speed: 145, damage: 11, radius: 15, xp: 7, score: 25, desc: '猛スピードで突っ込んでくる危険な弾丸ボール。' },
    kazakh_brick: { id: 'kazakh_brick', name: 'カザフスタン・ブリック', hp: 275, speed: 62, damage: 16, radius: 24, xp: 15, score: 50, desc: 'ずっしり重い長方形の守護壁。ノックバックに強い！' },
    turret_ball: { id: 'turret_ball', name: '砲台ボール', hp: 102, speed: 68, damage: 12, radius: 18, xp: 11, score: 40, shooter: true, desc: '距離を取りながらエネルギー弾を撃ってくる厄介者。' },
    alien_ball: { id: 'alien_ball', name: 'エイリアン6ボール', hp: 165, speed: 110, damage: 15, radius: 18, xp: 13, score: 48, desc: '宇宙空間を漂う謎の緑エイリアン6ボール。' },
    greece_ball: {
      id: 'greece_ball', name: 'ギリシャボール', stageTag: '🌿 Stage 1 固有の敵',
      hp: 74, speed: 92, damage: 11, radius: 18, xp: 7, score: 26,
      desc: 'Stage 1（大草原）に登場！古代ギリシャの赤いトサカ兜を被った堅実な重装歩兵ボール。'
    },
    brazil_ball: {
      id: 'brazil_ball', name: 'ブラジルボール', stageTag: '☁️ Stage 2 固有の敵',
      hp: 88, speed: 124, damage: 13, radius: 18, xp: 9, score: 34,
      desc: 'Stage 2（成層圏）に登場！青空に映える緑と黄色の俊足サンバステップ・ボール！'
    },
    korea_ball: {
      id: 'korea_ball', name: '韓国ボール', stageTag: '🌌 Stage 3 固有の敵',
      hp: 132, speed: 96, damage: 14, radius: 18, xp: 12, score: 44, shooter: true,
      desc: 'Stage 3（宇宙軌道）に登場！衛星アンテナからエネルギー弾を放つハイテク宇宙ボール！'
    },
    saudi_ball: {
      id: 'saudi_ball', name: 'サウジアラビアボール', stageTag: '🏜️ Stage 4 固有の敵',
      hp: 118, speed: 108, damage: 13, radius: 19, xp: 11, score: 40, coinBonus: true,
      desc: 'Stage 4（古代砂漠）に登場！クーフィーヤ頭巾のタフな砂漠ボール。倒すとコインを落としやすい！'
    },
    // === Stage 1 (ヨーロッパ大草原) 追加敵 ===
    swiss_ball: {
      id: 'swiss_ball', name: 'スイス傭兵ボール', stageTag: '🌿 Stage 1 出現',
      hp: 120, speed: 76, damage: 13, radius: 19, xp: 9, score: 32,
      desc: 'Stage 1（大草原）に出現！白十字を掲げる伝統の精鋭傭兵。頑丈な体で前線を塞ぐ！'
    },
    austria_ball: {
      id: 'austria_ball', name: 'オーストリア二重帝国ボール', stageTag: '🌿 Stage 1 出現',
      hp: 95, speed: 72, damage: 12, radius: 18, xp: 10, score: 36, shooter: true,
      desc: 'Stage 1（大草原）に出現！二重眼鏡をかけた名門ハプスブルク貴族。遠距離から弾を放つ！'
    },
    // === Stage 2 (成層圏スカイウェイ) 追加敵 ===
    argentina_ball: {
      id: 'argentina_ball', name: 'アルゼンチンボール', stageTag: '☁️ Stage 2 出現',
      hp: 82, speed: 135, damage: 12, radius: 17, xp: 8, score: 30,
      desc: 'Stage 2（成層圏）に出現！天空の「5月の太陽」を背負い、青空を猛スピードで滑空する！'
    },
    colombia_ball: {
      id: 'colombia_ball', name: 'コロンビアボール', stageTag: '☁️ Stage 2 出現',
      hp: 110, speed: 100, damage: 14, radius: 19, xp: 10, score: 38,
      desc: 'Stage 2（成層圏）に出現！三色旗をまとい高山地帯の強靭な突進を仕掛けてくる！'
    },
    // === Stage 3 (宇宙軌道) 追加敵 ===
    israel_cube: {
      id: 'israel_cube', name: 'ハイパー・イスラエルキューブ', stageTag: '🌌 Stage 3 出現',
      hp: 260, speed: 65, damage: 16, radius: 22, xp: 15, score: 52, isCube: true,
      desc: 'Stage 3（宇宙軌道）に出現！ポーランドボール伝統の4次元立方体（キューブ）！超重量級の宇宙防壁！'
    },
    space_drone: {
      id: 'space_drone', name: 'サイバー・ドローンボール', stageTag: '🌌 Stage 3 出現',
      hp: 70, speed: 152, damage: 13, radius: 15, xp: 11, score: 42,
      desc: 'Stage 3（宇宙軌道）に出現！シアンの単眼センサーでプレイヤーを精密追尾する宇宙迎撃機！'
    },
    // === Stage 4 (黄金の古代砂漠) 追加敵 ===
    turkey_ball: {
      id: 'turkey_ball', name: 'トルコ・フェズ帽ボール', stageTag: '🏜️ Stage 4 出現',
      hp: 105, speed: 112, damage: 14, radius: 18, xp: 10, score: 38,
      desc: 'Stage 4（古代砂漠）に出現！伝統の赤いフェズ帽を被った砂漠の騎兵ボール！'
    },
    egypt_mummy: {
      id: 'egypt_mummy', name: '古代ミイラボール', stageTag: '🏜️ Stage 4 出現',
      hp: 125, speed: 70, damage: 15, radius: 19, xp: 12, score: 45, shooter: true,
      desc: 'Stage 4（古代砂漠）に出現！包帯で巻かれた古代ファラオの従者。怪しい呪術弾を撃ってくる！'
    },
    morocco_ball: {
      id: 'morocco_ball', name: 'モロッコボール', stageTag: '🏜️ Stage 4 出現',
      hp: 92, speed: 120, damage: 12, radius: 18, xp: 9, score: 34,
      desc: 'Stage 4（古代砂漠）に出現！緑の五芒星を宿した砂漠のベルベル戦士。砂煙をあげて高速急接近！'
    },
    // === Stage 5 (深淵のマグマ魔境) 追加敵 ===
    nepal_demon: {
      id: 'nepal_demon', name: 'ネパール魔獣 (Rawr)', stageTag: '🔥 Stage 5 固有の敵',
      hp: 310, speed: 132, damage: 18, radius: 19, xp: 14, score: 54,
      desc: 'Stage 5（マグマ魔境）に出現！ポーランドボール界最恐のギザギザ怪獣。鋭い牙で猛スピード襲撃！'
    },
    ohio_monster: {
      id: 'ohio_monster', name: 'オハイオ怪物 (Ohio Rawr)', stageTag: '🔥 Stage 5 固有の敵',
      hp: 420, speed: 118, damage: 19, radius: 20, xp: 16, score: 62,
      desc: 'Stage 5（マグマ魔境）に出現！ツバメ尾の異形フラグ怪物。高い耐久力と凶暴な突進力を誇る！'
    },
    chile_snake: {
      id: 'chile_snake', name: 'チリ・ロングワーム', stageTag: '🔥 Stage 5 出現',
      hp: 230, speed: 162, damage: 17, radius: 17, xp: 13, score: 50,
      desc: 'Stage 5（マグマ魔境）に出現！異様に細長い超高速チリボール。弾丸のように飛びかかってくる！'
    },
    vatican_mage: {
      id: 'vatican_mage', name: 'バチカン審判魔導ボール', stageTag: '🔥 Stage 5 出現',
      hp: 350, speed: 88, damage: 17, radius: 19, xp: 16, score: 60, shooter: true,
      desc: 'Stage 5（マグマ魔境）に出現！聖冠を戴く高火力シューター。遠距離から灼熱の審判弾を連射！'
    },
    dark_cube: {
      id: 'dark_cube', name: 'ダーク・クォンタムキューブ', stageTag: '🔥 Stage 5 出現',
      hp: 720, speed: 74, damage: 22, radius: 23, xp: 20, score: 75, isCube: true,
      desc: 'Stage 5（マグマ魔境）に出現！黒曜石と紅蓮の異次元立方体。宇宙キューブを遥かに凌ぐ超重装甲！'
    },
    // === Stage 6 (月面基地 — POLAN ON THE MOON!) 追加敵 ===
    moon_rover: {
      id: 'moon_rover', name: '月面探査ローバーボール', stageTag: '🌕 Stage 6 固有の敵',
      hp: 488, speed: 145, damage: 21, radius: 19, xp: 17, score: 68,
      desc: 'Stage 6（月面基地）に出現！6輪駆動とレーザーアンテナを搭載した超高速月面探査機ボール！'
    },
    lunar_rabbit: {
      id: 'lunar_rabbit', name: '月面ウサギ重装兵', stageTag: '🌕 Stage 6 固有の敵',
      hp: 638, speed: 134, damage: 23, radius: 20, xp: 19, score: 76,
      desc: 'Stage 6（月面基地）に出現！月の裏側を守る紅眼のウサギ耳精鋭部隊。高い耐久力と跳躍突進が脅威！'
    },
    astro_soviet: {
      id: 'astro_soviet', name: 'コスモノート・ソ連兵', stageTag: '🌕 Stage 6 出現',
      hp: 575, speed: 98, damage: 22, radius: 20, xp: 20, score: 80, shooter: true,
      desc: 'Stage 6（月面基地）に出現！宇宙服をまとった月面ソ連砲撃兵。高威力の紅星プラズマ弾を連射！'
    },
    meteor_ball: {
      id: 'meteor_ball', name: '流星クレーターボール', stageTag: '🌕 Stage 6 出現',
      hp: 388, speed: 178, damage: 22, radius: 17, xp: 16, score: 65,
      desc: 'Stage 6（月面基地）に出現！蒼白い閃光を纏い猛スピードで衝突してくる超高速隕石ボール！'
    },
    monolith_slab: {
      id: 'monolith_slab', name: '月面モノリス・スラブ', stageTag: '🌕 Stage 6 出現',
      hp: 1200, speed: 80, damage: 27, radius: 24, xp: 26, score: 98, isCube: true,
      desc: 'Stage 6（月面基地）に出現！月面クレーターに眠っていた漆黒の超古代石碑。圧倒的な質量と装甲を誇る！'
    },
    // === Stage 1 (ヨーロッパ大草原) Bosses ===
    boss_viking: {
      id: 'boss_viking', name: '巨大バイキング王', stageTag: '🌿 Stage 1 中ボス(1:30)',
      hp: 6200, speed: 104, damage: 28, radius: 40, xp: 120, score: 600,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'fan5', bulletColor: '#f59e0b', dashCry: '⚔️ 猛突撃！',
      desc: 'Stage 1（1分半）に出現する中ボス。猛突進と5連衝撃弾で襲いかかる！'
    },
    boss_ottoman: {
      id: 'boss_ottoman', name: 'オスマン帝国', stageTag: '🌿 Stage 1 中ボス(3:00)',
      hp: 13200, speed: 108, damage: 31, radius: 43, xp: 190, score: 1050,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'fan7', bulletColor: '#ef4444', dashCry: '🌙 三日月突撃！',
      desc: 'Stage 1（3分）に出現する巨大ターバンの大帝国。7連砲弾と突進で迫る！'
    },
    boss_prussia: {
      id: 'boss_prussia', name: 'プロイセン帝国', stageTag: '🌿 Stage 1 中ボス(4:30)',
      hp: 23000, speed: 116, damage: 35, radius: 45, xp: 270, score: 1550,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'ring10', bulletColor: '#f97316', dashCry: '⚡ 電撃突進！',
      desc: 'Stage 1（4分半）に出現する鉄十字の覇者。全方位弾幕と超高速突進！'
    },
    boss_napoleon: {
      id: 'boss_napoleon', name: 'ナポレオン帝国', stageTag: '🌿 Stage 1 最終ボス(6:00)',
      hp: 54000, speed: 116, damage: 40, radius: 50, xp: 800, score: 5000,
      isBoss: true, isFinalBoss: true, dasher: true, shooter: true, summoner: true,
      bulletColor: '#3b82f6', bulletColorP2: '#ef4444',
      alertCry: 'Vive la France!!', dashCry: '🇫🇷 皇帝突撃！', rageCry: "🔥 VIVE L'EMPEREUR!!",
      summonId: 'viking_ball',
      desc: 'Stage 1最終ボス！二角帽を戴く欧州の覇者。HP半分以下で大陸軍総攻撃モードへ！'
    },

    // === Stage 2 (成層圏スカイウェイ) Bosses ===
    boss_hussar: {
      id: 'boss_hussar', name: '翼騎兵コモンウェルス', stageTag: '☁️ Stage 2 中ボス(1:30)',
      hp: 6600, speed: 124, damage: 29, radius: 41, xp: 130, score: 680,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'fan5', bulletColor: '#f43f5e', dashCry: '🪽 翼騎兵突撃！',
      desc: 'Stage 2（1分半）に出現する白翼の騎士団。超スピードの天空突進を仕掛ける！'
    },
    boss_british_empire: {
      id: 'boss_british_empire', name: '大英帝国', stageTag: '☁️ Stage 2 中ボス(3:00)',
      hp: 14200, speed: 102, damage: 33, radius: 44, xp: 210, score: 1150,
      isBoss: true, isMidBoss: true, shooter: true, summoner: true,
      bulletPattern: 'ring10', bulletColor: '#facc15', summonId: 'pirate_ball',
      desc: 'Stage 2（3分）に出現する太陽の沈まぬ帝国。黄金全方位弾＆海賊護衛を召喚！'
    },
    boss_zepp: {
      id: 'boss_zepp', name: 'ツェッペリン帝国飛行船', stageTag: '☁️ Stage 2 中ボス(4:30)',
      hp: 25000, speed: 106, damage: 36, radius: 46, xp: 290, score: 1650,
      isBoss: true, isMidBoss: true, shooter: true, summoner: true,
      bulletPattern: 'ring12', bulletColor: '#fb923c', summonId: 'speed_ball',
      desc: 'Stage 2（4分半）に出現する巨大硬式飛行船。12方向爆撃＆ターボ護衛を展開！'
    },
    boss_ussr: {
      id: 'boss_ussr', name: 'ソビエト連邦 (USSR)', stageTag: '☁️ Stage 2 最終ボス(6:00)',
      hp: 58000, speed: 114, damage: 42, radius: 52, xp: 850, score: 5400,
      isBoss: true, isFinalBoss: true, dasher: true, shooter: true, summoner: true,
      bulletColor: '#dc2626', bulletColorP2: '#facc15',
      alertCry: 'Вперёд!!', dashCry: '⭐ 紅軍突撃！', rageCry: '🔥 FOR THE MOTHERLAND!!',
      summonId: 'kazakh_brick',
      desc: 'Stage 2最終ボス！巨大なウシャンカ帽の超大国。HP半分以下でカチューシャ螺旋弾幕＆カザフスタン召喚！'
    },

    // === Stage 3 (宇宙軌道) Bosses ===
    boss_nasa: {
      id: 'boss_nasa', name: '暴走ロケットUSA', stageTag: '🌌 Stage 3 中ボス(1:30)',
      hp: 7000, speed: 118, damage: 30, radius: 41, xp: 140, score: 750,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'fan7', bulletColor: '#38bdf8', dashCry: '🚀 FREEDOM BOOST!!',
      desc: 'Stage 3（1分半）に出現する宇宙服USA。両翼ロケット噴射と7連プラズマ弾！'
    },
    boss_ufo: {
      id: 'boss_ufo', name: 'マザーUFOボール', stageTag: '🌌 Stage 3 中ボス(3:00)',
      hp: 15200, speed: 108, damage: 35, radius: 45, xp: 230, score: 1300,
      isBoss: true, isMidBoss: true, shooter: true, summoner: true,
      bulletPattern: 'ring12', bulletColor: '#38bdf8', summonId: 'alien_ball',
      desc: 'Stage 3（3分）に出現する宇宙円盤。全方位プラズマ弾＆エイリアン6ボール召喚！'
    },
    boss_alien_king: {
      id: 'boss_alien_king', name: 'エイリアン6キング', stageTag: '🌌 Stage 3 中ボス(4:30)',
      hp: 27000, speed: 116, damage: 38, radius: 47, xp: 310, score: 1850,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true, summoner: true,
      bulletPattern: 'ring14', bulletColor: '#4ade80', dashCry: '👽 6次元ワープ!!', summonId: 'alien_ball',
      desc: 'Stage 3（4分半）に出現する王冠を戴く6ボール皇帝。14連緑プラズマ＆エイリアン召喚！'
    },
    reichtangle: {
      id: 'reichtangle', name: 'ライヒタングル (REICHTANGLE)', stageTag: '🌌 Stage 3 最終ボス(6:00)',
      hp: 60000, speed: 120, damage: 44, radius: 50, xp: 900, score: 6000,
      isBoss: true, isFinalBoss: true, dasher: true, shooter: true, summoner: true,
      bulletColor: '#ef4444', bulletColorP2: '#dc2626',
      alertCry: 'Guten Tag...', dashCry: 'GUTEN TAG!', rageCry: '🔥 ANSCHLUSS MODE!!',
      summonId: 'cameroon_ball',
      desc: 'Stage 3最恐の最終ボス！HP半分以下で本気モード（螺旋弾幕＆連続突進）へ！'
    },

    // === Stage 4 (黄金の古代砂漠) Bosses ===
    boss_egypt: {
      id: 'boss_egypt', name: 'ファラオ・エジプト', stageTag: '🏜️ Stage 4 中ボス(1:30)',
      hp: 6800, speed: 112, damage: 29, radius: 41, xp: 135, score: 720,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'fan5', bulletColor: '#facc15', dashCry: '🐪 ファラオ突撃！',
      desc: 'Stage 4（1分半）に出現する黄金頭巾の王。砂塵突進と黄金5連弾で攻めてくる！'
    },
    boss_mongol: {
      id: 'boss_mongol', name: 'モンゴル帝国', stageTag: '🏜️ Stage 4 中ボス(3:00)',
      hp: 14600, speed: 126, damage: 34, radius: 44, xp: 220, score: 1200,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'fan7', bulletColor: '#38bdf8', dashCry: '🐎 蒼き狼の突撃！',
      desc: 'Stage 4（3分）に出現する超高速騎馬帝国！素早い突撃と7連矢弾幕が脅威！'
    },
    boss_byzantine: {
      id: 'boss_byzantine', name: 'ビザンツ帝国', stageTag: '🏜️ Stage 4 中ボス(4:30)',
      hp: 26000, speed: 106, damage: 37, radius: 46, xp: 300, score: 1750,
      isBoss: true, isMidBoss: true, shooter: true, summoner: true,
      bulletPattern: 'ring12', bulletColor: '#dc2626', summonId: 'kazakh_brick',
      desc: 'Stage 4（4分半）に出現する高貴なる東ローマ皇帝。紅蓮の12方向弾幕＆重装護衛を展開！'
    },
    boss_pyramid: {
      id: 'boss_pyramid', name: '黄金ギザ・ファラオ王', stageTag: '🏜️ Stage 4 最終ボス(6:00)',
      hp: 59000, speed: 116, damage: 43, radius: 52, xp: 880, score: 5800,
      isBoss: true, isFinalBoss: true, dasher: true, shooter: true, summoner: true,
      bulletColor: '#facc15', bulletColorP2: '#f97316',
      alertCry: 'AWAKEN THE SANDS!!', dashCry: '🏜️ 砂嵐突進！', rageCry: '🔥 PHARAOH CURSE MODE!!',
      summonId: 'mali_ball',
      desc: 'Stage 4最終ボス！そびえ立つ黄金の大ピラミッド王！HP半分以下で黄金砂嵐＆マリ護衛召喚！'
    },

    // === Stage 5 (深淵のマグマ魔境 — INFERNO!) Bosses ===
    boss_sparta: {
      id: 'boss_sparta', name: 'スパルタ狂戦士王', stageTag: '🔥 Stage 5 中ボス(1:30)',
      hp: 8800, speed: 126, damage: 36, radius: 42, xp: 180, score: 950,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'fan7', bulletColor: '#ef4444', dashCry: '🛡️ THIS IS SPARTA!!',
      desc: 'Stage 5（1分半）に出現する伝説の紅蓮戦士王。猛烈な盾突撃と紅蓮7連弾幕で圧殺する！'
    },
    boss_ohio_king: {
      id: 'boss_ohio_king', name: '巨大オハイオ・リヴァイアサン', stageTag: '🔥 Stage 5 中ボス(3:00)',
      hp: 19500, speed: 118, damage: 41, radius: 46, xp: 290, score: 1700,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true, summoner: true,
      bulletPattern: 'ring12', bulletColor: '#f97316', dashCry: '👹 ALWAYS HAS BEEN!!', summonId: 'ohio_monster',
      desc: 'Stage 5（3分）に出現する異形フラグの王！灼熱の12方向弾幕＆オハイオ怪物を続々召喚！'
    },
    boss_rome_emperor: {
      id: 'boss_rome_emperor', name: 'ローマ大帝国・カエサル', stageTag: '🔥 Stage 5 中ボス(4:30)',
      hp: 34000, speed: 122, damage: 45, radius: 48, xp: 390, score: 2400,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true, summoner: true,
      bulletPattern: 'ring14', bulletColor: '#facc15', dashCry: '🏛️ SPQR 総進軍!!', summonId: 'nepal_demon',
      desc: 'Stage 5（4分半）に出現する月桂冠の絶対皇帝。黄金14方向弾幕＆ネパール魔獣を召喚！'
    },
    boss_omega_reich: {
      id: 'boss_omega_reich', name: '終末のオメガ・ライヒ', stageTag: '🔥 Stage 5 最終ボス(6:00)',
      hp: 78000, speed: 128, damage: 52, radius: 54, xp: 1200, score: 9000,
      isBoss: true, isFinalBoss: true, dasher: true, shooter: true, summoner: true,
      bulletColor: '#f97316', bulletColorP2: '#a855f7',
      alertCry: 'OMEGA ANSCHLUSS...', dashCry: '🔥 終末の審判!!', rageCry: '💀 OMEGA APOCALYPSE MODE!!',
      summonId: 'nepal_demon',
      desc: 'Stage 5最難関の最終ボス！宇宙のライヒタングルを超えた灼熱黒曜の終末形態。HP半分以下で紫炎螺旋弾幕＆連続突進！'
    },

    // === Stage 6 (月面基地 — POLAN ON THE MOON!) Bosses ===
    boss_apollo_mech: {
      id: 'boss_apollo_mech', name: 'アポロ11号・重機動USA', stageTag: '🌕 Stage 6 中ボス(1:30)',
      hp: 11500, speed: 132, damage: 42, radius: 44, xp: 230, score: 1250,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true,
      bulletPattern: 'fan7', bulletColor: '#38bdf8', dashCry: '🚀 EAGLE HAS LANDED!!',
      desc: 'Stage 6（1分半）に出現する月面着陸船アーマーUSA。超高速噴射突進＆蒼星7連弾幕！'
    },
    boss_lunar_bunny: {
      id: 'boss_lunar_bunny', name: '月面ウサギ大将軍', stageTag: '🌕 Stage 6 中ボス(3:00)',
      hp: 25500, speed: 130, damage: 47, radius: 47, xp: 360, score: 2200,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true, summoner: true,
      bulletPattern: 'ring14', bulletColor: '#f472b6', dashCry: '🌕 餅つき超重力波!!', summonId: 'lunar_rabbit',
      desc: 'Stage 6（3分）に出現する月の裏側を統べる巨大ウサギ将軍。桜光14方向弾＆ウサギ重装兵を召喚！'
    },
    boss_sputnik_core: {
      id: 'boss_sputnik_core', name: 'スプートニク・衛星要塞', stageTag: '🌕 Stage 6 中ボス(4:30)',
      hp: 44000, speed: 122, damage: 52, radius: 50, xp: 490, score: 3200,
      isBoss: true, isMidBoss: true, dasher: true, shooter: true, summoner: true,
      bulletPattern: 'ring14', bulletColor: '#ef4444', dashCry: '🛰️ BEEP BEEP LASER!!', summonId: 'astro_soviet',
      desc: 'Stage 6（4分半）に出現する巨大銀球の軌道要塞。紅蓮14方向レーザー＆コスモノート兵を展開！'
    },
    boss_luna_reich: {
      id: 'boss_luna_reich', name: '月面皇帝ルナ・ライヒ', stageTag: '🌕 Stage 6 最終ボス(6:00)',
      hp: 105000, speed: 136, damage: 60, radius: 56, xp: 1600, score: 13000,
      isBoss: true, isFinalBoss: true, dasher: true, shooter: true, summoner: true,
      bulletColor: '#38bdf8', bulletColorP2: '#fde047',
      alertCry: 'LUNA ANSCHLUSS...', dashCry: '🌕 月面大崩壊!!', rageCry: '⚡ ECLIPSE APOCALYPSE MODE!!',
      summonId: 'moon_rover',
      desc: 'Stage 6真の最難関・最終ボス！満月光輪を背負う白銀の月面皇帝。HP半分以下で蒼金螺旋弾幕＆超高速連続突進！'
    }
  };

  const ENEMY_QUOTES = {
    // === Stage 1 (ヨーロッパ大草原) ===
    greece_ball: {
      idle: ['借金返せー！', 'ユーロ恵んでくれ！', 'オパッ！踊ろうぜ！', '哲学的に考えて勝つ！'],
      hit: ['債務不履行だー！', '金がないのに！', '痛いオパッ！']
    },
    swiss_ball: {
      idle: ['中立だけど金は取る！', '金庫を開けろ！', '最高級チーズを食らえ！', '永世中立の鉄拳！'],
      hit: ['私の銀行口座が！', '中立侵害だぞ！', '時計が狂う！']
    },
    austria_ball: {
      idle: ['精神分析してやる！', '優雅にワルツを踊れ！', 'ハンガリーはどこだ？', 'ハプスブルクの栄光！'],
      hit: ['不快なコンプレックスだ！', '無礼な球体め！', '診断：異常攻撃性！']
    },
    viking_ball: {
      idle: ['略奪の時間だー！', 'オーディンよ見ておるか！', 'ヴァルハラへ突撃！', '海を渡るぞ！'],
      hit: ['痛いが効かぬ！', '斧が欠けるだろ！', 'ヴァルハラで待つ！']
    },
    slime_ball: {
      idle: ['ぷるぷる！', '踏むなー！', '仲間を呼ぶぞ！'],
      hit: ['つぶれちゃう！', 'ぷにっ！？']
    },
    pirate_ball: {
      idle: ['身代金を寄こせ！', '積み荷を置いていけ！', '海の掟を教えてやる！', 'アイアイサー！'],
      hit: ['船が沈むー！', '山分けはどうなる！']
    },
    mali_ball: {
      idle: ['黄金のおすそ分け〜！', '金塊いっぱいあるよ！', 'インフレ注意報！', 'お金持ち〜！'],
      hit: ['金塊落としちゃった！', '持っていっていいよ〜！']
    },
    boss_viking: {
      idle: ['略奪と宴の始まりだー！', '我が斧の錆にしてくれる！', '海の覇者を見よ！'],
      hit: ['フハハ、小傷だ！', 'オーディンが笑っておるぞ！']
    },
    boss_ottoman: {
      idle: ['オスマンの栄光を見よ！', '三日月の旗のもとに！', 'ケバブの大号令だ！'],
      hit: ['コンスタンティノープルよ！', '無礼な小玉め！']
    },
    boss_prussia: {
      idle: ['規律！訓練！鉄血政策！', '軍隊が国家を持つのだ！', '一糸乱れぬ進軍！'],
      hit: ['規律を乱すな！', '鉄血がたぎる！']
    },
    boss_napoleon: {
      idle: ['我が辞書に不可能はない！', '余の背は低くない！', '皇帝陛下の凱旋だ！'],
      hit: ['ワーテルローの悪夢か！？', '余に触れるな！']
    },

    // === Stage 2 (成層圏スカイウェイ) ===
    brazil_ball: {
      idle: ['フエフエフエ！', 'サンバで踊ろうぜ！', 'サッカーしようぜ！', 'アマゾンの熱気だ！'],
      hit: ['フエッ！？痛い！', 'レッドカードだろ！']
    },
    argentina_ball: {
      idle: ['俺はヨーロッパ人だ！', 'フォークランド返せ！', 'タンゴを食らえ！', '牛肉食っていけ！'],
      hit: ['インフレの悪夢が！', 'ペソが大暴落だー！']
    },
    colombia_ball: {
      idle: ['白い粉じゃない、コーヒーだ！', '極上の一杯を飲め！', '豆を食らえ！', '香り高きアロマ！'],
      hit: ['コーヒーがこぼれる！', '豆が散らばる！']
    },
    cameroon_ball: {
      idle: ['不屈のライオンだ！', 'サバンナを駆け抜けろ！', '太陽が熱いぜ！'],
      hit: ['ライオンは負けん！', 'ガオッ！？']
    },
    speed_ball: {
      idle: ['俺の速さについてこれるか！', 'ブォォン！最高速だ！', 'ブレーキ壊れた！'],
      hit: ['スリップしたー！', 'クラッシュ！？']
    },
    turret_ball: {
      idle: ['照準固定…発射！', '敵性球体を確認！', 'ロックオン完了！'],
      hit: ['装甲損傷！', 'システムエラー！']
    },
    boss_hussar: {
      idle: ['翼騎兵の突撃を見よ！', 'ポーランドの誇りにかけて！', '天空の騎馬軍団！'],
      hit: ['翼は折れぬ！', '大空へ駆ける！']
    },
    boss_british_empire: {
      idle: ['太陽の沈まぬ帝国だ！', '紅茶の時間はお預けだ！', '七つの海を統べる者！'],
      hit: ['ティーカップが割れた！', 'なんたる無礼講！']
    },
    boss_zepp: {
      idle: ['空の覇者は我が飛行船！', '全方位爆撃用意！', '気圧正常、進路良し！'],
      hit: ['気嚢に被弾！', 'ガス圧低下！']
    },
    boss_ussr: {
      idle: ['万国の労働者よ団結せよ！', '同志よ、突撃だー！', '赤旗のもとに集え！'],
      hit: ['母なる大地のために！', '冬将軍を呼べ！']
    },

    // === Stage 3 (宇宙軌道) ===
    korea_ball: {
      idle: ['アイゴーー！', 'K-POP最高！', 'キムチパワーだ！', '整形してやる！'],
      hit: ['アイゴッ！痛い！', 'キムチが落ちた！']
    },
    alien_ball: {
      idle: ['地球人メ…', '未知ノ力ヲ思イ知レ！', '侵略開始ダ！'],
      hit: ['グチャッ！？', '母船ニ連絡ヲ！']
    },
    israel_cube: {
      idle: ['ユダヤ物理学の勝利！', '四角いから強いのだ！', 'シェケルを寄こせ！', '超空間四次元防壁！'],
      hit: ['オイ・ベイ！痛い！', '物理法則が乱れる！']
    },
    space_drone: {
      idle: ['バッテリー残量良好', 'レーザー出力最大！', 'ピピピ…標的捕捉！'],
      hit: ['回路スパーク！', '再起動シマス…']
    },
    kazakh_brick: {
      idle: ['レンガだから硬いぞ！', '宇宙基地があるんだぞ！', 'カザフ草原は広いぞ！'],
      hit: ['ビクともしないぞ！', '角が欠けた！']
    },
    boss_nasa: {
      idle: ['ヒューストン、問題発生！', 'フリーダム・ロケット発射！', '月へ行くぞUSA！'],
      hit: ['ブースター引火！？', 'オーマイガー！']
    },
    boss_ufo: {
      idle: ['キャトルミューティレーション！', '全球体をサンプル回収！', '反重力ビーム照射！'],
      hit: ['シールド低下！', 'ピピピッ！？']
    },
    boss_alien_king: {
      idle: ['全宇宙の球体を征服する！', '銀河の果てまで吹き飛べ！', '我らが宇宙の覇者！'],
      hit: ['不気味な地球人め！', '我が触手が！']
    },
    reichtangle: {
      idle: ['グーテン・ターク…', 'アンシュルス（併合）の時間だ…', 'お前は併合される…'],
      hit: ['四角に死角なし…', '併合続行…']
    },

    // === Stage 4 (黄金の古代砂漠) ===
    saudi_ball: {
      idle: ['石油の匂いがするぜ！', '油田を買収する！', 'ハラールマネーの力だ！', 'ラクダで行くぞ！'],
      hit: ['オイルが漏れる！', 'ハビビ！痛い！']
    },
    turkey_ball: {
      idle: ['ケバブ食え！', 'コンスタンティノープルはイスタンブール！', 'フェズ帽を笑うな！', '伸びるアイスだ！'],
      hit: ['ケバブが焦げる！', '帽子が飛ぶ！']
    },
    egypt_mummy: {
      idle: ['ファラオの呪いじゃ！', '砂に埋もれよ！', 'ピラミッドパワー！', '包帯が解けそうじゃ！'],
      hit: ['包帯が破れた！', '千年眠ってたのに！']
    },
    morocco_ball: {
      idle: ['クスクス食え！', '砂漠の洗礼だ！', 'アトラス山脈の風！'],
      hit: ['砂が目に入った！', 'タジン鍋が割れる！']
    },
    boss_egypt: {
      idle: ['我がピラミッドに平伏せよ！', '砂漠の神の裁きを受けよ！', '古代エジプトの威光！'],
      hit: ['不敬な輩め！', 'スカラベよ防げ！']
    },
    boss_mongol: {
      idle: ['ユーラシアを駆ける大騎兵！', '蒼き狼の血が騒ぐ！', '草原の果てまで征服！'],
      hit: ['馬を休ませよ！', '狼は屈せぬ！']
    },
    boss_byzantine: {
      idle: ['千年帝国の守護壁を見よ！', 'ギリシャの火を放て！', 'ローマの正統なる後継者！'],
      hit: ['三重の城壁が！', 'テオドシウスの壁が！']
    },
    boss_pyramid: {
      idle: ['太陽神ラーの光に焼かれよ！', '余こそが黄金のファラオ！', 'ピラミッド光線発射！'],
      hit: ['神なる余が傷つくとは！', '黄金が剥がれる！']
    },

    // === Stage 5 (深淵のマグマ魔境) ===
    nepal_demon: {
      idle: ['ガオーーッ！', '生贄を寄こせ！', 'ヒマラヤの魔獣だ！', '噛みちぎってやる！'],
      hit: ['グルルッ！？', '牙が痛む！']
    },
    ohio_monster: {
      idle: ['オハイオに逃げ場はない！', 'オハイオでは日常茶飯事！', 'すべてオハイオだ！'],
      hit: ['オハイオ送りだ！', 'ギャオーッ！']
    },
    chile_snake: {
      idle: ['細長すぎて曲がれねぇ！', '海岸線を独占するぜ！', '長〜〜〜い！'],
      hit: ['絡まっちゃった！', '真ん中を叩くな！']
    },
    vatican_mage: {
      idle: ['悔い改めよ！', '破門だ破門！', '聖水を浴びろ！', '神罰の審判弾！'],
      hit: ['主よ哀れみたまえ！', '聖冠がずれた！']
    },
    dark_cube: {
      idle: ['超空間へ消え去れ…', '重力圧縮…', '事象の地平面…'],
      hit: ['黒曜石装甲損傷…', '次元揺らぎ…']
    },
    boss_sparta: {
      idle: ['ここがスパルタだぁぁ！', '盾を並べよ、退くな！', '戦士よ、槍を構えよ！'],
      hit: ['栄光の傷だ！', '血がたぎるぞ！']
    },
    boss_ohio_king: {
      idle: ['すべてはオハイオになるのだ…', '最初からずっとオハイオだった！'],
      hit: ['オハイオの深淵が…！', '貴様もオハイオだ…']
    },
    boss_rome_emperor: {
      idle: ['賽は投げられた！', 'すべての道はローマに通ず！', 'ブルータス、お前もか！'],
      hit: ['カエサルの誇り！', '軍団兵よ盾を固めよ！']
    },
    boss_omega_reich: {
      idle: ['終末の併合が始まる…', 'すべてを無に還すのだ…', 'オメガ・アンシュルス…'],
      hit: ['世界の終わりは近い…', '暗黒の長方形…']
    },

    // === Stage 6 (月面基地) ===
    moon_rover: {
      idle: ['月面探査中ピピピッ', 'サンプル採取完了！', '地球遠いな…', 'レーザー出力点検中！'],
      hit: ['タイヤが外れる！', '通信途絶の危機！']
    },
    lunar_rabbit: {
      idle: ['お餅つきの刑だ！', '月の裏側は立ち入り禁止！', '耳を引っ張るな！', '跳躍突撃用意！'],
      hit: ['お餅が潰れた！', 'ピョンッ！？痛い！']
    },
    astro_soviet: {
      idle: ['月面も同志のものだ！', 'ウォッカが凍った！', '宇宙服の中が痒い！', '紅星プラズマ発射！'],
      hit: ['ヘルメットにヒビが！', '母なる大地よ…！']
    },
    meteor_ball: {
      idle: ['超スピード衝突！', 'クレーターにしてやる！', 'ドカーン！', '隕石アタック！'],
      hit: ['砕けちゃう！', '軌道がずれた！']
    },
    monolith_slab: {
      idle: ['……………', '超古代の知恵…', '動かざること岩の如し！'],
      hit: ['ビクともせん！', '石碑に傷が…']
    },
    boss_apollo_mech: {
      idle: ['人類にとって偉大な一歩だ！', '星条旗を立てるぞ！', 'アポロ機甲システム起動！'],
      hit: ['月面着陸船が！', 'ヒューストン被弾した！']
    },
    boss_lunar_bunny: {
      idle: ['月面重力ウサギ餅つき乱舞！', '月に代わってお仕置きだ！', '特大月餅を食らえ！'],
      hit: ['杵が折れそう！', 'ウサギを舐めるな！']
    },
    boss_sputnik_core: {
      idle: ['人類初の人工衛星を讃えよ！', 'ピピッ…ピピッ…照射！', '軌道衛星プラズマ網！'],
      hit: ['アンテナ曲がった！', 'ビーーー！故障警告！']
    },
    boss_luna_reich: {
      idle: ['月は我が領土…アンシュルス…', '白銀の月面皇帝が命ずる！', '日食の闇に沈め…'],
      hit: ['月の光は消えぬ…', '皇帝の威厳を見よ…']
    }
  };

  const DIFFICULTIES = [
    {
      id: 'easy',
      name: 'イージー',
      icon: '🌱',
      desc: '敵HP -40% / 被ダメ -30% / 回復増・コイン獲得 半減（×0.5）',
      enemyHpMult: 0.60,
      bossHpMult: 0.58,
      enemyDmgMult: 0.70,
      spawnMult: 0.85,
      healBonus: 0.022,
      coinMult: 0.5
    },
    {
      id: 'normal',
      name: 'ノーマル',
      icon: '⚔️',
      desc: '標準バランス！手応えのあるボス戦＆コイン獲得 ×1.0',
      enemyHpMult: 1.0,
      bossHpMult: 1.0,
      enemyDmgMult: 1.0,
      spawnMult: 1.0,
      healBonus: 0,
      coinMult: 1.0
    },
    {
      id: 'hard',
      name: 'ハード',
      icon: '🔥',
      desc: '敵HP +50% / ボスHP +50% / 被ダメ +30% / 湧き増・コイン獲得 1.5倍（×1.5）',
      enemyHpMult: 1.50,
      bossHpMult: 1.50,
      enemyDmgMult: 1.30,
      spawnMult: 1.25,
      healBonus: 0,
      coinMult: 1.5
    }
  ];

  const STAGES = [
    {
      id: 'meadow',
      name: 'ヨーロッパ大草原',
      subtitle: 'Stage 1 — はじまりの地',
      desc: 'のどかな草原と石畳。欧州の歴史的帝国ボスたちに挑もう！',
      bgmName: '♪ かけっこ競争',
      midBosses: ['boss_viking', 'boss_ottoman', 'boss_prussia'],
      finalBoss: 'boss_napoleon',
      duration: 360, // 6 minutes to Final Boss
      bg: '#6ab04c',
      bgAccent: '#5ea142',
      propType: 'meadow',
      difficulty: 1.0,
      coinMult: 1.0,
      badge: '🌿 初級〜中級'
    },
    {
      id: 'sky',
      name: '成層圏スカイウェイ',
      subtitle: 'Stage 2 — 雲の上へ！',
      desc: '青空と雲海の大決戦！翼騎兵・大英帝国・飛行船、そしてソ連が待つ！',
      bgmName: '♪ 楽しく軽快に',
      midBosses: ['boss_hussar', 'boss_british_empire', 'boss_zepp'],
      finalBoss: 'boss_ussr',
      duration: 360,
      bg: '#38bdf8',
      bgAccent: '#0ea5e9',
      propType: 'sky',
      difficulty: 1.35,
      coinMult: 1.35,
      badge: '☁️ 中級〜上級'
    },
    {
      id: 'space',
      name: '宇宙軌道 — INTO SPACE!',
      subtitle: 'Stage 3 — ポーランドの夢',
      desc: 'ついに宇宙へ到達！ロケットUSA・UFO・エイリアン王、最奥にライヒタングル！',
      bgmName: '♪ Warp_Area',
      midBosses: ['boss_nasa', 'boss_ufo', 'boss_alien_king'],
      finalBoss: 'reichtangle',
      duration: 360,
      bg: '#0f172a',
      bgAccent: '#1e293b',
      propType: 'space',
      difficulty: 1.75,
      coinMult: 1.75,
      badge: '🌌 超激戦'
    },
    {
      id: 'desert',
      name: '黄金の古代砂漠',
      subtitle: 'Stage 4 — ピラミッド大決戦',
      desc: '黄金の砂丘とオアシス！エジプト・モンゴル・ビザンツ、最奥に巨大ピラミッド王が待つ！',
      bgmName: '♪ shuffle_shuffle',
      midBosses: ['boss_egypt', 'boss_mongol', 'boss_byzantine'],
      finalBoss: 'boss_pyramid',
      duration: 360,
      bg: '#e5b25d',
      bgAccent: '#d99f43',
      propType: 'desert',
      difficulty: 1.55,
      coinMult: 1.60,
      badge: '🏜️ 上級・黄金ロマン'
    },
    {
      id: 'inferno',
      name: '深淵のマグマ魔境 — INFERNO!',
      subtitle: 'Stage 5 — 宇宙を超えた最難関',
      desc: '宇宙すら凌ぐ灼熱の最終試練！スパルタ・巨大オハイオ・ローマ皇帝、最奥に「終末のオメガ・ライヒ」が降臨！',
      bgmName: '♪ Do-Battle!!',
      midBosses: ['boss_sparta', 'boss_ohio_king', 'boss_rome_emperor'],
      finalBoss: 'boss_omega_reich',
      duration: 360,
      bg: '#2b0f16',
      bgAccent: '#45121d',
      propType: 'inferno',
      difficulty: 2.15,
      spawnMult: 1.22,
      coinMult: 2.25,
      badge: '🔥 極限・最難関'
    },
    {
      id: 'moon',
      name: '月面基地 — POLAN ON THE MOON!',
      subtitle: 'Stage 6 — 伝説の超極限・月面決戦',
      desc: 'マグマ魔境すら超えた人類未踏の月面最終決戦！アポロ機甲USA・月面ウサギ将軍・スプートニク要塞、最奥に「月面皇帝ルナ・ライヒ」が降臨！',
      bgmName: '♪ 作戦会議',
      midBosses: ['boss_apollo_mech', 'boss_lunar_bunny', 'boss_sputnik_core'],
      finalBoss: 'boss_luna_reich',
      duration: 360,
      bg: '#475569',
      bgAccent: '#334155',
      propType: 'moon',
      difficulty: 2.60,
      spawnMult: 1.38,
      coinMult: 2.80,
      badge: '🌕 伝説・超極限'
    }
  ];

  const SHOP_UPGRADES = [
    { id: 'might', name: '攻撃力アップ', icon: '💪', desc: '全武器のダメージ +8%/Lv', maxLevel: 5, baseCost: 80, costStep: 110 },
    { id: 'maxHp', name: '体力強化', icon: '❤️', desc: '最大HP +18/Lv', maxLevel: 5, baseCost: 70, costStep: 95 },
    { id: 'speed', name: '俊足ブーツ', icon: '👟', desc: '移動速度 +6%/Lv', maxLevel: 5, baseCost: 75, costStep: 100 },
    { id: 'cooldown', name: '連射テクニック', icon: '⚡', desc: 'クールダウン -5%/Lv', maxLevel: 5, baseCost: 95, costStep: 130 },
    { id: 'magnet', name: '超強力マグネット', icon: '🧲', desc: '回収範囲 +20%/Lv', maxLevel: 5, baseCost: 65, costStep: 85 },
    { id: 'armor', name: '鋼鉄ボディ', icon: '🛡️', desc: 'アーマー +1/Lv', maxLevel: 5, baseCost: 85, costStep: 115 },
    { id: 'greed', name: 'ゴールドラッシュ', icon: '🪙', desc: '獲得コイン +15%/Lv', maxLevel: 5, baseCost: 110, costStep: 140 },
    { id: 'revive', name: '不屈の魂', icon: '✨', desc: '1プレイ中の自動復活 +1回', maxLevel: 2, baseCost: 300, costStep: 450 }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_play', name: '最初の一歩', desc: '初めてゲームをプレイする', reward: 20, icon: '🎮' },
    { id: 'kills_100', name: 'ボール無双・序', desc: '累計100体の敵ボールを撃破', reward: 30, icon: '💥' },
    { id: 'kills_1000', name: '千人斬りの英雄', desc: '累計1,000体の敵ボールを撃破', reward: 75, icon: '🏆' },
    { id: 'level_15', name: '成長期', desc: '1回のプレイでLv.15に到達', reward: 35, icon: '⭐' },
    { id: 'first_evolve', name: '真の力に目覚めた！', desc: '初めて武器を進化させる', reward: 50, icon: '🌟' },
    { id: 'three_evolves', name: '兵器博覧会', desc: '1回のプレイで3つ以上の武器を進化', reward: 90, icon: '🚀' },
    { id: 'defeat_midboss', name: '中ボス撃破！', desc: '初めて中ボスを倒して宝箱を開く', reward: 35, icon: '🎁' },
    { id: 'defeat_napoleon', name: 'ワーテルローの勝者', desc: 'Stage 1 最終ボス「ナポレオン帝国」を撃破', reward: 90, icon: '🎖️' },
    { id: 'defeat_ussr', name: '成層圏の覇者', desc: 'Stage 2 最終ボス「ソビエト連邦」を撃破', reward: 115, icon: '☁️' },
    { id: 'defeat_reichtangle', name: 'Guten Tag 撃退！', desc: 'Stage 3 最終ボス「ライヒタングル」を撃破', reward: 140, icon: '👑' },
    { id: 'defeat_pyramid', name: 'ピラミッドの覇者', desc: 'Stage 4 最終ボス「黄金ギザ・ファラオ王」を撃破', reward: 130, icon: '🏺' },
    { id: 'defeat_omega_reich', name: '深淵の征服者', desc: 'Stage 5 最終ボス「終末のオメガ・ライヒ」を撃破', reward: 250, icon: '🔥' },
    { id: 'defeat_luna_reich', name: '月面制覇の伝説', desc: 'Stage 6 最終ボス「月面皇帝ルナ・ライヒ」を撃破', reward: 400, icon: '🌕' },
    { id: 'poland_space', name: 'Polan CAN into Space!', desc: 'ポーランドで宇宙軌道ステージをクリア', reward: 180, icon: '🪐' },
    { id: 'coop_play', name: '同盟締結！', desc: '2〜3人協力プレイで出撃する', reward: 40, icon: '🤝' },
    { id: 'coop_revive', name: '友情の蘇生', desc: '協力プレイでパートナーを蘇生させる', reward: 60, icon: '💖' },
    { id: 'unlock_char', name: '新たな仲間', desc: '隠しキャラクターを1体解放する', reward: 35, icon: '🔓' },
    { id: 'first_gacha', name: 'ガチャデビュー！', desc: '初めてコインで装備ガチャを引く', reward: 50, icon: '🎰' }
  ];

  const GEAR_SLOTS = [
    { id: 'head', name: '頭', icon: '🎩' },
    { id: 'body', name: '体', icon: '🦺' },
    { id: 'shield', name: '盾', icon: '🛡️' },
    { id: 'weapon', name: '武器', icon: '⚔️' }
  ];

  const GEAR_RARITIES = {
    common:   { id: 'common',   rank: 1, name: 'コモン',     color: '#475569', bg: '#f1f5f9', border: '#64748b', weight: 54, guaranteeWeight: 0,  pityWeight: 0 },
    uncommon: { id: 'uncommon', rank: 2, name: 'アンコモン', color: '#15803d', bg: '#dcfce7', border: '#16a34a', weight: 30, guaranteeWeight: 0,  pityWeight: 0 },
    rare:     { id: 'rare',     rank: 3, name: 'レア',       color: '#1d4ed8', bg: '#dbeafe', border: '#2563eb', weight: 10, guaranteeWeight: 78, pityWeight: 50 },
    epic:     { id: 'epic',     rank: 4, name: 'エピック',   color: '#7e22ce', bg: '#f3e8ff', border: '#9333ea', weight: 5,  guaranteeWeight: 19, pityWeight: 35 },
    legend:   { id: 'legend',   rank: 5, name: 'レジェンド', color: '#b45309', bg: '#fef3c7', border: '#f59e0b', weight: 1,  guaranteeWeight: 3,  pityWeight: 15 }
  };

  const GACHA_CONFIG = {
    singleCost: 500,
    tenCost: 4500,
    pityLimit: 30
  };

  const GEAR_ITEMS = [
    // === 頭 (head): クールダウン / 経験値 / 回収範囲 / クリティカル / 攻撃範囲 (計11種: 3/2/2/2/2) ===
    {
      id: 'head_common_knit', slot: 'head', rarity: 'common', icon: '🧢',
      name: '旅人のニット帽', desc: '経験値 +6% / 回収範囲 +10%',
      stats: { xpBonus: 0.06, magnetMult: 0.10 }
    },
    {
      id: 'head_common_straw', slot: 'head', rarity: 'common', icon: '👒',
      name: '農夫の麦わら帽子', desc: '移動速度 +4% / 回収範囲 +12%',
      stats: { speedMult: 0.04, magnetMult: 0.12 }
    },
    {
      id: 'head_common_bandana', slot: 'head', rarity: 'common', icon: '🧣',
      name: '冒険者のバンダナ', desc: '会心率 +4% / 経験値 +4%',
      stats: { critBonus: 0.04, xpBonus: 0.04 }
    },
    {
      id: 'head_uncommon_helm', slot: 'head', rarity: 'uncommon', icon: '⛑️',
      name: '鉄の偵察ヘルメット', desc: 'クールダウン -4% / 回収範囲 +18%',
      stats: { cooldownMult: -0.04, magnetMult: 0.18 }
    },
    {
      id: 'head_uncommon_ushanka', slot: 'head', rarity: 'uncommon', icon: '🪆',
      name: '極北のウシャンカ', desc: '最大HP +20 / クールダウン -5%',
      stats: { maxHpFlat: 20, cooldownMult: -0.05 }
    },
    {
      id: 'head_rare_beret', slot: 'head', rarity: 'rare', icon: '🎓',
      name: '賢者のベレー帽', desc: 'クールダウン -7% / 経験値 +14% / 会心率 +4%',
      stats: { cooldownMult: -0.07, xpBonus: 0.14, critBonus: 0.04 }
    },
    {
      id: 'head_rare_sombrero', slot: 'head', rarity: 'rare', icon: '🎺',
      name: '情熱のソンブレロ', desc: '攻撃範囲 +14% / クールダウン -6% / 移動速度 +6%',
      stats: { areaBonus: 0.14, cooldownMult: -0.06, speedMult: 0.06 }
    },
    {
      id: 'head_epic_radar', slot: 'head', rarity: 'epic', icon: '📡',
      name: '宇宙レーダーバイザー', desc: 'クールダウン -11% / 回収範囲 +35% / 会心率 +8%',
      stats: { cooldownMult: -0.11, magnetMult: 0.35, critBonus: 0.08 }
    },
    {
      id: 'head_epic_monocle', slot: 'head', rarity: 'epic', icon: '🧐',
      name: '紳士の知性モノクル', desc: 'クールダウン -13% / 経験値 +22% / 会心率 +7%',
      stats: { cooldownMult: -0.13, xpBonus: 0.22, critBonus: 0.07 }
    },
    {
      id: 'head_legend_crown', slot: 'head', rarity: 'legend', icon: '👑',
      name: 'ポーランド大帝の王冠', desc: 'CD -15% / 経験値 +25% / 回収 +50% / 会心率 +14%',
      stats: { cooldownMult: -0.15, xpBonus: 0.25, magnetMult: 0.50, critBonus: 0.14 }
    },
    {
      id: 'head_legend_astro', slot: 'head', rarity: 'legend', icon: '🪐',
      name: 'コズミック・アストロ兜', desc: 'CD -18% / 攻撃範囲 +18% / 経験値 +20%',
      stats: { cooldownMult: -0.18, areaBonus: 0.18, xpBonus: 0.20 }
    },

    // === 体 (body): 最大HP / 移動速度 / HP自然回復 / アーマー / 復活 (計11種: 3/2/2/2/2) ===
    {
      id: 'body_common_cape', slot: 'body', rarity: 'common', icon: '👕',
      name: 'コットン旅マント', desc: '最大HP +15 / 移動速度 +4%',
      stats: { maxHpFlat: 15, speedMult: 0.04 }
    },
    {
      id: 'body_common_leather', slot: 'body', rarity: 'common', icon: '🦺',
      name: '革の軽装ベスト', desc: '最大HP +18 / アーマー +1',
      stats: { maxHpFlat: 18, armorFlat: 1 }
    },
    {
      id: 'body_common_poncho', slot: 'body', rarity: 'common', icon: '🪡',
      name: '風除けポンチョ', desc: '移動速度 +6% / HP回復 +0.15/秒',
      stats: { speedMult: 0.06, regenFlat: 0.15 }
    },
    {
      id: 'body_uncommon_coat', slot: 'body', rarity: 'uncommon', icon: '🧥',
      name: '防風トレンチコート', desc: '最大HP +28 / 移動速度 +7% / HP回復 +0.2/秒',
      stats: { maxHpFlat: 28, speedMult: 0.07, regenFlat: 0.2 }
    },
    {
      id: 'body_uncommon_chain', slot: 'body', rarity: 'uncommon', icon: '⛓️',
      name: '鉄の鎖かたびら', desc: '最大HP +35 / アーマー +1',
      stats: { maxHpFlat: 35, armorFlat: 1 }
    },
    {
      id: 'body_rare_samurai', slot: 'body', rarity: 'rare', icon: '🥋',
      name: '侍の軽装胴丸', desc: '最大HP +42 / 移動速度 +10% / アーマー +1',
      stats: { maxHpFlat: 42, speedMult: 0.10, armorFlat: 1 }
    },
    {
      id: 'body_rare_hussar', slot: 'body', rarity: 'rare', icon: '🏇',
      name: '有翼重騎兵の胸甲', desc: '最大HP +48 / 移動速度 +12% / HP回復 +0.3/秒',
      stats: { maxHpFlat: 48, speedMult: 0.12, regenFlat: 0.3 }
    },
    {
      id: 'body_epic_titan', slot: 'body', rarity: 'epic', icon: '🦺',
      name: '強化チタン・バトルアーマー', desc: '最大HP +65 / アーマー +2 / HP回復 +0.5/秒 / 速度 +10%',
      stats: { maxHpFlat: 65, armorFlat: 2, regenFlat: 0.5, speedMult: 0.10 }
    },
    {
      id: 'body_epic_nanosuit', slot: 'body', rarity: 'epic', icon: '🧬',
      name: 'ナノ生体パワードスーツ', desc: '最大HP +55 / HP回復 +0.8/秒 / アーマー +2 / 速度 +12%',
      stats: { maxHpFlat: 55, regenFlat: 0.8, armorFlat: 2, speedMult: 0.12 }
    },
    {
      id: 'body_legend_suit', slot: 'body', rarity: 'legend', icon: '🚀',
      name: '宇宙英雄パワードスーツ', desc: '最大HP +100 / 速度 +16% / アーマー +3 / 回復 +1.0/秒',
      stats: { maxHpFlat: 100, speedMult: 0.16, armorFlat: 3, regenFlat: 1.0 }
    },
    {
      id: 'body_legend_wings', slot: 'body', rarity: 'legend', icon: '🪽',
      name: '翼騎兵の聖なる羽鎧', desc: '最大HP +80 / 速度 +24% / 回復 +1.2/秒 / 自動復活 +1回',
      stats: { maxHpFlat: 80, speedMult: 0.24, regenFlat: 1.2, revives: 1 }
    },

    // === 盾 (shield): 遠距離攻撃ダメージカット ＆ 完全無効!! (計11種: 3/2/2/2/2) ===
    {
      id: 'shield_common_wood', slot: 'shield', rarity: 'common', icon: '🪵',
      name: '木の丸盾', desc: '遠距離ダメージ -20% / アーマー +1',
      stats: { rangedCut: 0.20, armorFlat: 1 }
    },
    {
      id: 'shield_common_buckler', slot: 'shield', rarity: 'common', icon: '🫓',
      name: '小さなバックラー', desc: '遠距離ダメージ -25% / 移動速度 +4%',
      stats: { rangedCut: 0.25, speedMult: 0.04 }
    },
    {
      id: 'shield_common_potlid', slot: 'shield', rarity: 'common', icon: '🍳',
      name: '頑丈な中華鍋', desc: '遠距離ダメージ -18% / 最大HP +12 / アーマー +1',
      stats: { rangedCut: 0.18, maxHpFlat: 12, armorFlat: 1 }
    },
    {
      id: 'shield_uncommon_iron', slot: 'shield', rarity: 'uncommon', icon: '🛡️',
      name: '鉄のラウンドシールド', desc: '遠距離ダメージ -35% / アーマー +1 / 最大HP +15',
      stats: { rangedCut: 0.35, armorFlat: 1, maxHpFlat: 15 }
    },
    {
      id: 'shield_uncommon_kite', slot: 'shield', rarity: 'uncommon', icon: '🪁',
      name: '騎士のカイトシールド', desc: '遠距離ダメージ -42% / アーマー +1',
      stats: { rangedCut: 0.42, armorFlat: 1 }
    },
    {
      id: 'shield_rare_scutum', slot: 'shield', rarity: 'rare', icon: '🏛️',
      name: 'ローマ大盾スクトゥム', desc: '遠距離ダメージ -55% / アーマー +2 / 最大HP +25',
      stats: { rangedCut: 0.55, armorFlat: 2, maxHpFlat: 25 }
    },
    {
      id: 'shield_rare_viking', slot: 'shield', rarity: 'rare', icon: '🪓',
      name: 'ヴァイキングの丸盾', desc: '遠距離ダメージ -50% / 攻撃力 +8% / アーマー +1',
      stats: { rangedCut: 0.50, mightMult: 0.08, armorFlat: 1 }
    },
    {
      id: 'shield_epic_prism', slot: 'shield', rarity: 'epic', icon: '💠',
      name: 'プリズム反射バリア', desc: '遠距離ダメージ -78% / アーマー +3 / 最大HP +35',
      stats: { rangedCut: 0.78, armorFlat: 3, maxHpFlat: 35 }
    },
    {
      id: 'shield_epic_force', slot: 'shield', rarity: 'epic', icon: '🌐',
      name: 'フォースフィールド発生器', desc: '遠距離ダメージ -85% / アーマー +2 / 最大HP +40',
      stats: { rangedCut: 0.85, armorFlat: 2, maxHpFlat: 40 }
    },
    {
      id: 'shield_legend_aegis', slot: 'shield', rarity: 'legend', icon: '✨',
      name: 'イージスの絶対神盾', desc: '【遠距離攻撃 完全無効！】アーマー +4 / 最大HP +55',
      stats: { rangedCut: 1.0, armorFlat: 4, maxHpFlat: 55 }
    },
    {
      id: 'shield_legend_mirror', slot: 'shield', rarity: 'legend', icon: '🪞',
      name: 'ミラー・イージス', desc: '【遠距離攻撃 完全無効！】攻撃力 +15% / アーマー +3',
      stats: { rangedCut: 1.0, mightMult: 0.15, armorFlat: 3 }
    },

    // === 武器 (weapon): 攻撃力アップ / 球数（発射数）アップ / 攻撃範囲アップ (計11種: 3/2/2/2/2) ===
    {
      id: 'weapon_common_dagger', slot: 'weapon', rarity: 'common', icon: '🗡️',
      name: '見習いの短剣', desc: '攻撃力 +8%',
      stats: { mightMult: 0.08 }
    },
    {
      id: 'weapon_common_slingshot', slot: 'weapon', rarity: 'common', icon: '🪵',
      name: '冒険者のパチンコ', desc: '攻撃力 +6% / 移動速度 +4%',
      stats: { mightMult: 0.06, speedMult: 0.04 }
    },
    {
      id: 'weapon_common_club', slot: 'weapon', rarity: 'common', icon: '🏏',
      name: '樫の木のこん棒', desc: '攻撃力 +10% / 攻撃範囲 +6%',
      stats: { mightMult: 0.10, areaBonus: 0.06 }
    },
    {
      id: 'weapon_uncommon_axe', slot: 'weapon', rarity: 'uncommon', icon: '🪓',
      name: '戦士の戦斧', desc: '攻撃力 +14% / 攻撃範囲 +8%',
      stats: { mightMult: 0.14, areaBonus: 0.08 }
    },
    {
      id: 'weapon_uncommon_spear', slot: 'weapon', rarity: 'uncommon', icon: '🔱',
      name: '鉄の長槍', desc: '攻撃力 +12% / 攻撃範囲 +12%',
      stats: { mightMult: 0.12, areaBonus: 0.12 }
    },
    {
      id: 'weapon_rare_crossbow', slot: 'weapon', rarity: 'rare', icon: '🏹',
      name: '連射のクロスボウ', desc: '攻撃力 +18% / 発射数（球数）+1',
      stats: { mightMult: 0.18, amountFlat: 1 }
    },
    {
      id: 'weapon_rare_katana', slot: 'weapon', rarity: 'rare', icon: '⚔️',
      name: '名刀・村雨', desc: '攻撃力 +22% / 会心率 +8%',
      stats: { mightMult: 0.22, critBonus: 0.08 }
    },
    {
      id: 'weapon_epic_trident', slot: 'weapon', rarity: 'epic', icon: '🔱',
      name: '黄金トライデント', desc: '攻撃力 +28% / 発射数（球数）+1 / 攻撃範囲 +15%',
      stats: { mightMult: 0.28, amountFlat: 1, areaBonus: 0.15 }
    },
    {
      id: 'weapon_epic_railgun', slot: 'weapon', rarity: 'epic', icon: '⚡',
      name: '電磁レールスナイパー', desc: '攻撃力 +36% / クールダウン -8% / 会心率 +10%',
      stats: { mightMult: 0.36, cooldownMult: -0.08, critBonus: 0.10 }
    },
    {
      id: 'weapon_legend_excalibur', slot: 'weapon', rarity: 'legend', icon: '⚔️',
      name: '伝説の聖剣エクスカリバー', desc: '攻撃力 +45% / 球数 +1 / 会心率 +15% / 範囲 +22%',
      stats: { mightMult: 0.45, amountFlat: 1, critBonus: 0.15, areaBonus: 0.22 }
    },
    {
      id: 'weapon_legend_cannon', slot: 'weapon', rarity: 'legend', icon: '🌟',
      name: '星屑のマルチキャノン', desc: '攻撃力 +32% / 発射数（球数）+2 / クールダウン -10%',
      stats: { mightMult: 0.32, amountFlat: 2, cooldownMult: -0.10 }
    }
  ];

  const EMOTES = [
    { id: 'help', label: '助けろ！', icon: '🆘' },
    { id: 'nice', label: 'ナイス！', icon: '👍' },
    { id: 'gather', label: '集合！', icon: '🤝' },
    { id: 'space', label: '宇宙へ！', icon: '🚀' }
  ];

  const HEAL_ITEMS = [
    {
      tier: 0,
      id: 'pierogi',
      name: 'ピエロギ',
      icon: '🥟',
      heal: 35,
      rarity: 'コモン',
      rarityCol: '#94a3b8',
      weight: 55,
      desc: 'ポーランド伝統のダンプリング。素朴で優しい味わいでHPを35回復する。',
      floatText: '🥟 +35 HP',
      floatCol: '#4ade80'
    },
    {
      tier: 1,
      id: 'pizza',
      name: 'マルゲリータピザ',
      icon: '🍕',
      heal: 65,
      rarity: 'アンコモン',
      rarityCol: '#38bdf8',
      weight: 22,
      desc: '焼きたてアツアツのイタリアンピザ。とろけるチーズでHPを65回復する。',
      floatText: '🍕 +65 HP',
      floatCol: '#22c55e'
    },
    {
      tier: 2,
      id: 'chicken',
      name: 'ローストチキン',
      icon: '🍗',
      heal: 110,
      rarity: 'レア',
      rarityCol: '#a855f7',
      weight: 10,
      desc: '香ばしく焼き上げたごちそうチキン。ジューシーな肉汁でHPを一気に110回復！中ボスからもドロップ。',
      floatText: '🍗 +110 HP!',
      floatCol: '#10b981'
    },
    {
      tier: 3,
      id: 'sachertorte',
      name: '至高のザッハトルテ',
      icon: '🍰',
      heal: 999,
      invuln: 2.5,
      rarity: 'レジェンド',
      rarityCol: '#f59e0b',
      weight: 3,
      desc: 'オーストリア伝統の最高峰チョコレートケーキ。HPを完全全快＋2.5秒間の完全無敵バリアを展開！中ボスからも低確率でドロップ。',
      floatText: '🍰 完全全快＆無敵！',
      floatCol: '#facc15'
    },
    {
      tier: 4,
      id: 'vodka',
      name: '特製ウォッカ',
      icon: '🍾',
      heal: 45,
      speedBoost: 6.0,
      speedBoostMult: 1.35,
      rarity: 'スペシャル',
      rarityCol: '#06b6d4',
      weight: 10,
      desc: '強烈なポーランドスピリッツ！HPを45回復し、さらに6秒間移動速度が+35%急上昇する！',
      floatText: '🍾 +45 HP & 快速！',
      floatCol: '#38bdf8'
    }
  ];

  const PRESENT_CODES = {
    '12345': {
      code: '12345',
      name: 'スペシャルプレゼント',
      coins: 20000,
      description: '20,000ゴールドコイン'
    }
  };

  return {
    CHARACTERS,
    PASSIVES,
    WEAPONS,
    ENEMIES,
    DIFFICULTIES,
    STAGES,
    SHOP_UPGRADES,
    ACHIEVEMENTS,
    GEAR_SLOTS,
    GEAR_RARITIES,
    GACHA_CONFIG,
    GEAR_ITEMS,
    EMOTES,
    HEAL_ITEMS,
    PRESENT_CODES,
    ENEMY_QUOTES
  };
})();
