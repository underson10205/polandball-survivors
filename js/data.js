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
      icon: '🚀',
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
      base: { damage: 17, cooldown: 4.2, duration: 3.1, count: 2, speed: 3.2, area: 1.0 },
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
      evolvedDesc: '焼きたての黄金バゲットが螺旋を描いて敵を切り裂きながら舞う！',
      desc: '硬いバゲットを放物線状に投げ飛ばし、複数の敵を貫通する。',
      color: '#b45309',
      type: 'arc',
      base: { damage: 28, cooldown: 1.5, count: 2, speed: 360, area: 1.0, pierce: 4 },
      levelUp: [
        'バゲット +1 ＆ 貫通力UP',
        '威力大幅UP ＆ クールダウン短縮',
        'バゲット +1 ＆ 範囲拡大',
        '【MAX】威力・貫通力が大幅強化！'
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
      evolvedDesc: '黄金の投槍が全方位へ放射状に降り注ぎ、敵軍団を貫く！',
      desc: '敵を貫通するローマ投槍を扇状に放つ。',
      color: '#b91c1c',
      type: 'fan',
      base: { damage: 23, cooldown: 1.45, count: 3, speed: 500, area: 1.0, pierce: 3 },
      levelUp: [
        '槍の本数 +1 ＆ 威力UP',
        '貫通力 +1 ＆ クールダウン短縮',
        '槍の本数 +1 ＆ 範囲拡大',
        '【MAX】槍の本数 +1 ＆ 威力大幅強化！'
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
    }
  };

  const ENEMIES = {
    slime_ball: { id: 'slime_ball', name: 'ミニ・ローグボール', hp: 28, speed: 78, damage: 7, radius: 15, xp: 3, score: 10, desc: '群れで押し寄せる基本の敵ボール。' },
    pirate_ball: { id: 'pirate_ball', name: '海賊ソマリアボール', hp: 56, speed: 102, damage: 10, radius: 17, xp: 5, score: 18, desc: '素早く回り込んでくる眼帯の荒くれ者。' },
    cameroon_ball: { id: 'cameroon_ball', name: 'カメルーンボール', hp: 96, speed: 112, damage: 12, radius: 18, xp: 8, score: 28, desc: '「不屈のライオン」の異名を持つ俊足＆タフな猛攻ボール！' },
    mali_ball: { id: 'mali_ball', name: 'マリボール', hp: 80, speed: 94, damage: 10, radius: 17, xp: 7, score: 26, coinBonus: true, desc: '黄金帝国の末裔！倒すと高確率でゴールドコインを落とすお宝ボール！' },
    viking_ball: { id: 'viking_ball', name: 'バイキングボール', hp: 138, speed: 84, damage: 13, radius: 20, xp: 8, score: 30, desc: 'ツノ付き兜がトレードマークのタフな戦士。' },
    speed_ball: { id: 'speed_ball', name: 'ターボ・レーサーボール', hp: 64, speed: 145, damage: 11, radius: 15, xp: 7, score: 25, desc: '猛スピードで突っ込んでくる危険な弾丸ボール。' },
    kazakh_brick: { id: 'kazakh_brick', name: 'カザフスタン・ブリック', hp: 340, speed: 62, damage: 16, radius: 24, xp: 15, score: 50, desc: 'ずっしり重い長方形の守護壁。ノックバックに強い！' },
    turret_ball: { id: 'turret_ball', name: '砲台ボール', hp: 125, speed: 68, damage: 12, radius: 18, xp: 11, score: 40, shooter: true, desc: '距離を取りながらエネルギー弾を撃ってくる厄介者。' },
    alien_ball: { id: 'alien_ball', name: 'エイリアン6ボール', hp: 205, speed: 110, damage: 15, radius: 18, xp: 13, score: 48, desc: '宇宙空間を漂う謎の緑エイリアン6ボール。' },
    // Mid-bosses (Rebalanced for epic boss battles!)
    boss_viking: { id: 'boss_viking', name: '巨大バイキング王', hp: 7800, speed: 104, damage: 28, radius: 40, xp: 120, score: 600, isBoss: true, isMidBoss: true, dasher: true, shooter: true, desc: '1分半に出現する中ボス。猛突進と衝撃弾で襲いかかる！倒すと宝箱ドロップ！' },
    boss_prussia: { id: 'boss_prussia', name: 'プロイセン帝国', hp: 17500, speed: 114, damage: 32, radius: 44, xp: 200, score: 1100, isBoss: true, isMidBoss: true, dasher: true, shooter: true, desc: '3分に出現する誇り高き鉄十字の覇者。7連弾幕と突進で迫る！' },
    boss_ufo: { id: 'boss_ufo', name: 'マザーUFOボール', hp: 31000, speed: 108, damage: 36, radius: 46, xp: 280, score: 1600, isBoss: true, isMidBoss: true, shooter: true, summoner: true, desc: '4分半に出現する宇宙円盤。全方位プラズマ弾＆エイリアン6ボール召喚！' },
    // Final Boss (2-Phase Raid Boss!)
    reichtangle: { id: 'reichtangle', name: 'ライヒタングル (REICHTANGLE)', hp: 70000, speed: 118, damage: 42, radius: 50, xp: 800, score: 5000, isBoss: true, isFinalBoss: true, dasher: true, shooter: true, summoner: true, desc: '「Guten Tag...」6分に出現する最恐の最終ボス！HP半分以下で本気モード（螺旋弾幕＆連続突進）へ！' }
  };

  const STAGES = [
    {
      id: 'meadow',
      name: 'ヨーロッパ大草原',
      subtitle: 'Stage 1 — はじまりの地',
      desc: 'のどかな草原と石畳。まずはここでポーランドボール軍団をなぎ倒そう！',
      bgmName: '♪ かけっこ競争',
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
      desc: '見渡す限りの青空と雲海！速い敵と砲台ボールが増えてスリル満点！',
      bgmName: '♪ 楽しく軽快に',
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
      desc: 'ついに宇宙へ到達！エイリアン軍団と強化ライヒタングルが待つ最終決戦！',
      bgmName: '♪ Warp_Area',
      duration: 360,
      bg: '#0f172a',
      bgAccent: '#1e293b',
      propType: 'space',
      difficulty: 1.75,
      coinMult: 1.75,
      badge: '🌌 超激戦'
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
    { id: 'defeat_reichtangle', name: 'Guten Tag 撃退！', desc: '最終ボス「ライヒタングル」を撃破', reward: 140, icon: '👑' },
    { id: 'poland_space', name: 'Polan CAN into Space!', desc: 'ポーランドで宇宙軌道ステージをクリア', reward: 180, icon: '🪐' },
    { id: 'coop_play', name: '同盟締結！', desc: '2〜3人協力プレイで出撃する', reward: 40, icon: '🤝' },
    { id: 'coop_revive', name: '友情の蘇生', desc: '協力プレイでパートナーを蘇生させる', reward: 60, icon: '💖' },
    { id: 'unlock_char', name: '新たな仲間', desc: '隠しキャラクターを1体解放する', reward: 35, icon: '🔓' }
  ];

  const EMOTES = [
    { id: 'help', label: '助けろ！', icon: '🆘' },
    { id: 'nice', label: 'ナイス！', icon: '👍' },
    { id: 'gather', label: '集合！', icon: '🤝' },
    { id: 'space', label: '宇宙へ！', icon: '🚀' }
  ];

  return {
    CHARACTERS,
    PASSIVES,
    WEAPONS,
    ENEMIES,
    STAGES,
    SHOP_UPGRADES,
    ACHIEVEMENTS,
    EMOTES
  };
})();
