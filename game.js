'use strict';
const $ = id => document.getElementById(id), world = $('world'), ctx = world.getContext('2d');
const profileKey = 'iskra.adventure.v1';

// --- ПРОЦЕДУРНИЙ ЗВУКОВИЙ РУШІЙ (Web Audio API) ---
let audioCtx = null, soundMuted = false;
try { soundMuted = localStorage.getItem('iskra.muted') === '1'; } catch {}
function updateSoundUI() {
  const btn = $('soundToggle');
  if (btn) btn.textContent = soundMuted ? '🔇' : '🔊';
}
function sfx(type) {
  if (soundMuted) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    if (type === 'shoot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(170, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.07);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.07);
      osc.start(now); osc.stop(now + 0.07);
    } else if (type === 'gem') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.3, now);
      osc.frequency.setValueAtTime(880, now + 0.055);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.16);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === 'super') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.22);
      gain.gain.setValueAtTime(0.13, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.23);
      osc.start(now); osc.stop(now + 0.23);
    } else if (type === 'jump') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.18);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.19);
      osc.start(now); osc.stop(now + 0.19);
    } else if (type === 'boom') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.24);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'ko') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'triangle'; o.connect(g); g.connect(audioCtx.destination);
        o.frequency.setValueAtTime(f, now + idx * 0.08);
        g.gain.setValueAtTime(0.1, now + idx * 0.08);
        g.gain.linearRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
        o.start(now + idx * 0.08); o.stop(now + idx * 0.08 + 0.22);
      });
    } else if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.start(now); osc.stop(now + 0.04);
    }
  } catch {}
}

function newProfile() {
  return {
    schemaVersion: 3, cups: 0, legacyTrophies: 0, coins: 0, matches: 0, wins: 0,
    streak: 0, bestStreak: 0, roadClaimed: -1, modeWins: modes.map(() => 0),
    hero: 0, map: 0, difficulty: 0, rule: 0, banner: 0,
    roster: heroes.map(() => ({ xp: 0, played: 0, wins: 0, trophies: 0, bestTrophies: 0,
      training: 0, forge: 0, power: 0, wear: 0, charm: 0 }))
  };
}
const safeInt = (x, max = 1e9) => Number.isSafeInteger(x) && x >= 0 && x <= max ? x : 0;
const totalTrophies = () => profile.legacyTrophies + profile.roster.reduce((sum, r) => sum + r.trophies, 0);
function readProfile() {
  const p = newProfile();
  try {
    const raw = JSON.parse(localStorage.getItem(profileKey));
    if (!raw || !Array.isArray(raw.roster)) return p;
    for (const [key, max] of Object.entries({ matches: 1e8, hero: heroes.length - 1, map: maps.length - 1, difficulty: 2, rule: modes.length - 1, banner: 2 })) p[key] = safeInt(raw[key], max);
    if (maps[p.map].unlock > p.matches) p.map = 0;
    p.roster.forEach((r, i) => {
      const saved = raw.roster[i] || {};
      r.training = safeInt(saved.training, 6);
      r.forge = safeInt(saved.forge, 6);
      r.power = safeInt(saved.power, 6);
      r.xp = safeInt(saved.xp);
      r.played = safeInt(saved.played, 1e8);
      r.wins = safeInt(saved.wins, r.played);
      r.trophies = safeInt(saved.trophies, 1e8);
      r.bestTrophies = Math.max(r.trophies, safeInt(saved.bestTrophies, 1e8));
      r.wear = safeInt(saved.wear, levelOf(r.xp) >= 3 ? 2 : r.played ? 1 : 0);
      r.charm = safeInt(saved.charm, levelOf(r.xp) >= 2 ? 1 : 0);
    });
    if (raw.schemaVersion >= 3) {
      p.legacyTrophies = safeInt(raw.legacyTrophies);
      p.coins = safeInt(raw.coins);
      p.wins = safeInt(raw.wins, p.matches);
      p.streak = safeInt(raw.streak, 1e5);
      p.bestStreak = Math.max(p.streak, safeInt(raw.bestStreak, 1e5));
      p.roadClaimed = Number.isInteger(raw.roadClaimed) && raw.roadClaimed >= -1 && raw.roadClaimed < roadMilestones.length ? raw.roadClaimed : -1;
      if (Array.isArray(raw.modeWins)) p.modeWins = modes.map((_, i) => safeInt(raw.modeWins[i], 1e8));
    } else {
      // Старі кубки були валютою. Повертаємо також суми, витрачені на поліпшення,
      // щоб загальний рейтинг не втрачав минулі досягнення; історію по героях не вигадуємо.
      const oldCosts = [4, 8, 12];
      const spent = p.roster.reduce((acc, r) => acc + ['training', 'forge', 'power'].reduce((sum, key) =>
        sum + oldCosts.slice(0, Math.min(3, r[key])).reduce((x, cost) => x + cost, 0), 0), 0);
      p.legacyTrophies = safeInt(raw.cups) + spent;
      // Приблизна конвертація купівельної спроможності старих кубків у монети.
      p.coins = Math.min(1e9, safeInt(raw.cups) * 8);
      p.roadClaimed = roadMilestones.reduce((last, m, i) => p.legacyTrophies >= m.at ? i : last, -1);
    }
    p.cups = p.legacyTrophies + p.roster.reduce((sum, r) => sum + r.trophies, 0);
  } catch (err) { console.warn('Не вдалося прочитати збереження:', err); }
  return p;
}
const profile = readProfile();
function save() {
  profile.cups = totalTrophies(); // поле лишається для сумісності експорту v2.x.
  try { localStorage.setItem(profileKey, JSON.stringify(profile)); }
  catch { $('storageMsg').hidden = false; }
}
function claimRoadRewards() {
  const unlocked = [];
  for (let i = profile.roadClaimed + 1; i < roadMilestones.length; i++) {
    const m = roadMilestones[i];
    if (totalTrophies() < m.at) break;
    profile.coins += m.coins;
    profile.roadClaimed = i;
    unlocked.push(m);
  }
  return unlocked;
}
function renderRoad() {
  const total = totalTrophies();
  $('roadStats').textContent = `🏆 ${total} кубків · 🪙 ${profile.coins} монет · ${profile.wins} перемог · Серія ${profile.streak} (рекорд ${profile.bestStreak})`;
  const upcoming = roadMilestones.filter((m, i) => i > profile.roadClaimed).slice(0, 4);
  $('roadItems').replaceChildren(...upcoming.map(m => {
    const el = document.createElement('div'); el.className = 'road-prize';
    const count = document.createElement('strong'); count.textContent = '🏆 ' + m.at;
    const prize = document.createElement('span'); prize.textContent = '+' + m.coins + ' 🪙';
    const prog = document.createElement('progress'); prog.max = m.at; prog.value = Math.min(total, m.at);
    el.append(count, prize, prog); return el;
  }));
  if (!upcoming.length) $('roadItems').textContent = 'Усі нагороди здобуто! Твій рейтинг продовжує зростати.';
  $('rosterStats').replaceChildren(...heroes.map((h, i) => {
    const r = profile.roster[i], el = document.createElement('div');
    el.className = 'rank-item' + (i === profile.hero ? ' active' : '');
    const left = document.createElement('strong'); left.textContent = h.name + ' · Рівень ' + levelOf(r.xp);
    const right = document.createElement('span'); right.textContent = '🏆 ' + r.trophies + ' · ' + heroRankNames[rankOf(r.bestTrophies)];
    el.append(left, right); return el;
  }));
}

let state = 'menu', units = [], gems = [], loot = [], shots = [], meteors = [], rings = [], floatTexts = [], crates = [], water = [], pads = [], flag, previewGem, left, spawnIn, lootIn, supply, blocks, background;
let moveStick = [0, 0], pointer = null, held = false, last = performance.now();
let brush = [], temporaryBrush = [], particles = [];
let gemCountdown = 0, countdownLeader = null, stormInset = 0, stormTick = 0;
const keys = new Set(), dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Стіни блокують і рух, і постріли; вода блокує тільки рух по землі (кулі та стрибки пролітають!)
const blockedWall = (x, y, r) => x < r || x > W - r || y < r || y > H - r || blocks.some(([a, b, w, h]) => x > a - r && x < a + w + r && y > b - r && y < b + h + r);
const blockedWalk = (x, y, r) => blockedWall(x, y, r) || (water && water.some(([a, b, w, h]) => x > a - r && x < a + w + r && y > b - r && y < b + h + r));

function floatText(x, y, text, color = '#ffe875') {
  floatTexts.push({ x, y: y - 22, text, color, t: 0.8 });
  if (floatTexts.length > 45) floatTexts.shift();
}

function options(id, rows, value) {
  const el = $(id);
  if (!el) return;
  el.replaceChildren(...rows.map(([label, locked], i) => {
    const o = new Option(label, i);
    o.disabled = Boolean(locked);
    return o;
  }));
  el.value = value;
}

const invasionGoals = [
  { gems: 20, kills: 15, seconds: 120 },
  { gems: 30, kills: 25, seconds: 150 },
  { gems: 40, kills: 40, seconds: 180 }
];
let kills = 0, eliminations = 0, combo = 0, comboClock = 0;
const invasion = () => profile.rule === 2;
const showdown = () => profile.rule === 4;
const quota = () => invasionGoals[profile.difficulty];
const cleared = () => units[0].score >= quota().gems && kills >= quota().kills;
function tally() {
  return '◆ ' + Math.min(units[0].score, quota().gems) + '/' + quota().gems + ' · Зомбі ' + Math.min(kills, quota().kills) + '/' + quota().kills;
}

function zombieSpawn(z) {
  const player = units[0];
  const edges = [{ x: 38, y: 38 }, { x: W - 38, y: 38 }, { x: 38, y: H - 38 }, { x: W - 38, y: H - 38 }, { x: W / 2, y: H - 28 }, { x: W / 2, y: 28 }];
  const choices = edges.filter(p => dist(p, player) > 220 && !blockedWalk(p.x, p.y, 16));
  Object.assign(z, (choices.length ? choices : edges)[Math.floor(Math.random() * (choices.length || edges.length))]);
  z.hp = z.max; z.dead = 0; z.shield = 0; z.windup = 0; z.cd = .5; z.way = null; z.lastSeen = null;
}

function hunt(z, dt) {
  const player = units[0];
  if (player.dead) { z.windup = 0; return; }
  const sees = visible(z, player);
  if (sees) z.lastSeen = { x: player.x, y: player.y };
  const near = dist(z, player) < 32 && sees;
  if (z.windup > 0) {
    z.windup = Math.max(0, z.windup - dt);
    if (!z.windup) {
      if (near) {
        if (player.dome) {
          if (player.heal) { player.hp = Math.min(player.max, player.hp + 1); player.heal = false; floatText(player.x, player.y, '+1 ♥', '#8cffb0'); }
        } else hit(player, 1);
      }
      z.cd = 1.1;
    }
    return;
  }
  if (near) { if (z.cd <= 0) z.windup = .38; return; }
  z.nav -= dt;
  if (!z.way || z.nav <= 0 || dist(z, z.way) < 3) {
    const goal = sees ? player : (z.lastSeen && dist(z, z.lastSeen) > 30 ? z.lastSeen : closest(z, gems) || { x: W / 2, y: H / 2 });
    z.way = waypoint(z, goal); z.nav = .35;
  }
  const dx = z.way.x - z.x, dy = z.way.y - z.y;
  z.heading = Math.atan2(dy, dx);
  move(z, dx, dy, Math.min(82 + profile.difficulty * 12, Math.hypot(dx, dy) / dt), dt);
}

// Кубки — окремий рейтинг кожного героя. Монети — витратна валюта.
const trophyWin = [6, 9, 12];
const upgradeCosts = [32, 64, 104, 160, 232, 320];
const upgradeLevelGates = [1, 2, 3, 5, 7, 10];
function buyUpgrade(slot) {
  if (state !== 'menu') return;
  const r = profile.roster[profile.hero], tier = r[slot], cost = upgradeCosts[tier];
  if (!['training', 'forge', 'power'].includes(slot) || !cost || profile.coins < cost ||
      levelOf(r.xp) < upgradeLevelGates[tier] || (slot === 'forge' && levelOf(r.xp) < 2)) return;
  profile.coins -= cost;
  r[slot]++;
  sfx('gem'); save(); lobby();
}
function workshop(r) {
  for (const [slot, name] of [['training', 'Здоров’я +1 ♥'], ['forge', 'Перезарядка супер −0,3 с'], ['power', 'Сила атаки +12%']]) {
    const button = $(slot), cost = upgradeCosts[r[slot]];
    const need = cost ? Math.max(upgradeLevelGates[r[slot]], slot === 'forge' ? 2 : 1) : 0;
    const locked = cost && levelOf(r.xp) < need;
    if (!button) continue;
    button.textContent = name + ' · ' + r[slot] + '/6 · ' + (locked ? 'з рівня ' + need : cost ? cost + ' 🪙' : 'МАКС');
    button.disabled = Boolean(locked || !cost || profile.coins < cost);
    button.onclick = () => buyUpgrade(slot);
  }
}

function setTab(name) {
  const lobbyEl = $('lobby');
  if (lobbyEl) lobbyEl.dataset.tab = name;
  document.querySelectorAll('.tab-panel').forEach(p => { p.hidden = p.dataset.panel !== name; });
  document.querySelectorAll('.tab-btn').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  const panels = document.querySelector('.tab-panels');
  if (panels) panels.scrollTop = 0;
}

function lobby() {
  state = 'menu';
  document.body.classList.remove('playing');
  $('battle').hidden = true;
  $('lobby').hidden = false;
  const k = profile.hero, h = heroes[k], r = profile.roster[k], level = levelOf(r.xp), m = maps[profile.map];
  $('career').textContent = '🏆 ' + totalTrophies() + ' · 🪙 ' + profile.coins;
  workshop(r);
  $('heroName').textContent = h.name;
  $('role').textContent = roles[k];
  $('skillName').textContent = h.ability;
  $('lobby').style.setProperty('--hero-color', h.color);
  const portrait = $('portrait').getContext('2d');
  portrait.clearRect(0, 0, 420, 380);
  sprite(portrait, k, 223, 209, 6.4, r.wear);
  $('mapInfo').textContent = m.hint + ' 🌿 У заростях тебе не бачать здалеку; стрільба тимчасово видає позицію.';
  if ($('activeMapLabel')) $('activeMapLabel').textContent = m.name;

  $('maps').replaceChildren(...maps.map((map, i) => {
    const button = document.createElement('button'), art = document.createElement('canvas');
    const name = document.createElement('strong'), note = document.createElement('small');
    button.type = 'button';
    art.width = 180; art.height = 88;
    mapPreview(art.getContext('2d'), i);
    button.disabled = map.unlock > profile.matches;
    button.setAttribute('aria-pressed', String(profile.map === i));
    name.textContent = map.name;
    note.textContent = button.disabled ? 'Після ' + map.unlock + (map.unlock === 1 ? ' бою' : ' боїв') : profile.map === i ? '✓ Обрано' : 'Обрати';
    button.append(art, name, note);
    button.onclick = () => { profile.map = i; sfx('tap'); save(); lobby(); };
    return button;
  }));

  $('heroes').replaceChildren(...heroes.map((hero, i) => {
    const b = document.createElement('button'), c = document.createElement('canvas');
    b.type = 'button';
    c.width = 112; c.height = 108;
    const brushCtx = c.getContext('2d');
    sprite(brushCtx, i, 56, 60, 1.85, profile.roster[i].wear);
    const nameTag = document.createElement('span'); nameTag.textContent = hero.name;
    const rankTag = document.createElement('small');
    rankTag.textContent = '🏆 ' + profile.roster[i].trophies + ' · ' + heroRankNames[rankOf(profile.roster[i].bestTrophies)];
    b.append(c, nameTag, rankTag);
    b.setAttribute('aria-pressed', String(i === k));
    b.onclick = () => { profile.hero = i; sfx('tap'); save(); lobby(); };
    return b;
  }));

  $('desc').textContent = h.hint;
  const currentXP = heroLevelXP[level - 1];
  const nextXP = heroLevelXP[level] ?? currentXP;
  $('bar').style.width = level >= heroLevelXP.length ? '100%' :
    Math.min(100, (r.xp - currentXP) / Math.max(1, nextXP - currentXP) * 100) + '%';
  $('level').textContent = 'Рівень ' + level + '/20 · ' + r.xp + ' XP' +
    (level < 20 ? ' · До наступного ' + (nextXP - r.xp) + ' XP' : ' · Найвищий рівень!');
  $('heroRank').textContent = '🏆 ' + r.trophies + ' кубків · Ранг ' + (rankOf(r.bestTrophies) + 1) + '/12 «' + heroRankNames[rankOf(r.bestTrophies)] + '» · ' + r.wins + ' перемог';

  options('difficulty', tiers.map((x, i) => [invasion() ? x + ' · ' + invasionGoals[i].kills + ' зомбі' : profile.rule === 6 ? x + ' · 1 суперник' : x + ' · ' + (2 + i) + ' боти']), profile.difficulty);
  options('rule', modes.map(x => [x]), profile.rule);
  options('banner', flags.map(x => [x]), profile.banner);
  options('wear', [['Базовий образ'], ['Золота стрічка' + (!r.played ? ' · за перший бій' : ''), !r.played], ['Зоряна стрічка' + (level < 3 ? ' · рівень 3' : ''), level < 3]], r.wear);
  options('charm', [['Без амулета'], [h.item + (level < 2 ? ' · рівень 2' : ''), level < 2]], r.charm);
  $('itemInfo').textContent = h.item + ' · ' + h.perk;
  $('heroStats').textContent = '♥ ' + (h.hp + r.training) + ' здоров’я · ⚡ ' + h.speed + ' швидкість · 🎯 ' + Math.round(1 / h.rate * 10) / 10 + ' атаки/с · ✦ супер: ' + h.cd + ' с · Сила ' + (100 + r.power * 12) + '%';
  renderRoad();
  $('mission').textContent = invasion()
    ? 'Збери ' + quota().gems + ' кристалів і переможи ' + quota().kills + ' зомбі за ' + quota().seconds + ' с. Відступай, коли зомбі замахується.'
    : showdown()
      ? 'Зіткнення (Showdown): розбивай ящики з кубиками сили, тікай від отруйного туману й залишся останнім на арені!'
      : profile.rule === 5 ? 'Контроль маяка: займи світлове коло в центрі арени. Очки йдуть, коли у зоні немає суперників. Перший до 65 виграє!'
      : profile.rule === 6 ? 'Дуель: один суперник, три нокаути для перемоги. Уважно використовуй кущі й укриття!'
      : profile.rule === 1
        ? 'Забери прапор і повернись до своєї бази. Перший із трьома доставками перемагає.'
        : profile.rule === 3
          ? 'Арена мисливців: першим здійсни 8 нокаутів. Після поразки повертайся до бою.'
          : 'Збери 7 кристалів і втримай перевагу 10 секунд! При нокауті зібрані кристали випадають на землю.';
}

for (const id of ['difficulty', 'rule', 'banner', 'wear', 'charm']) {
  const el = $(id);
  if (el) el.onchange = () => {
    const target = ['wear', 'charm'].includes(id) ? profile.roster[profile.hero] : profile;
    target[id] = Number(el.value);
    sfx('tap');
    save();
    lobby();
  };
}

function clearInput() {
  keys.clear();
  moveStick = [0, 0];
  pointer = null;
  held = false;
  if ($('stick')?.firstElementChild) $('stick').firstElementChild.style.transform = '';
}

function point() {
  for (let i = 0; i < 200; i++) {
    const p = { x: 85 + Math.random() * 750, y: 58 + Math.random() * 425 };
    if (!blockedWalk(p.x, p.y, 32)) return p;
  }
  return { x: 280, y: 270 };
}

function start() {
  sfx('tap');
  const m = maps[profile.map];
  blocks = m.blocks;
  water = m.water || [];
  pads = m.pads || [];
  crates = (m.crates || []).map(([x, y, kind]) => ({ x, y, kind, hp: kind === 'barrel' ? 2 : 3, max: kind === 'barrel' ? 2 : 3 }));
  brush = brushLayouts[profile.map].map(b => [...b]);
  temporaryBrush = [];
  particles = [];
  floatTexts = [];
  gemCountdown = 0;
  countdownLeader = null;
  stormInset = 0;
  stormTick = 0;

  units = [...bases, ...(typeof extraSpawns !== "undefined" ? extraSpawns : [{ x: 80, y: 450 }, { x: 255, y: 42 }])].slice(0, profile.rule === 6 ? 2 : 3 + profile.difficulty).map((base, i) => {
    const kind = i ? Math.floor(Math.random() * heroes.length) : profile.hero, h = heroes[kind];
    return {
      ...base, base, kind, i,
      hp: h.hp + (i ? 0 : profile.roster[kind].training),
      max: h.hp + (i ? 0 : profile.roster[kind].training),
      ammo: 3, outOfCombat: 0, cubes: 0, jumpTime: 0, jumpVx: 0, jumpVy: 0, padCool: 0, eliminated: false,
      slow: 0, hits: 0, boost: 0, score: 0, picks: 0,
      cd: i ? 0.6 : 0, cool: i ? h.cd * 0.5 : h.cd * 0.35,
      dome: 0, dead: 0, shield: 1,
      angle: i ? Math.PI : 0, heading: i ? Math.PI : 0,
      nav: 0, way: null, think: .7 + i * .3, aim: null, heal: false, reveal: 0, lastSeen: null
    };
  });
  kills = 0; eliminations = 0; combo = 0; comboClock = 0;
  if (invasion()) {
    units.slice(1).forEach(z => { z.zombie = true; z.max = 2; zombieSpawn(z); });
  }
  gems = (profile.rule === 0 || invasion()) ? Array.from({ length: 5 }, point) : [];
  loot = []; shots = []; meteors = []; rings = [];
  left = invasion() ? quota().seconds : showdown() ? 110 : profile.rule === 5 ? 125 : profile.rule === 6 ? 100 : 95;
  supply = { ...point(), wait: 12 };
  spawnIn = 2; lootIn = 5; previewGem = point();
  flag = { x: 460, y: 270, carrier: null };
  background = document.createElement('canvas');
  background.width = W; background.height = H;
  terrain(background.getContext('2d'), profile.map);
  clearInput();
  state = 'play';
  $('controls').hidden = false;
  $('lobby').hidden = true;
  $('battle').hidden = false;
  $('modal').hidden = true;
  document.body.classList.add('playing');
  window.scrollTo(0, 0);
  hud();
  draw();
}

$('start').onclick = start;

function modal(title, message, next) {
  $('controls').hidden = true;
  $('victoryFlag').hidden = true;
  $('title').textContent = title;
  $('summary').textContent = message;
  $('next').textContent = next;
  $('modal').hidden = false;
  $('leave').hidden = state !== 'pause';
  $('equip').hidden = true;
}

function pause() {
  if (state !== 'play') return;
  state = 'pause';
  clearInput();
  $('overline').textContent = maps[profile.map].name;
  modal('Пауза', 'Бій чекає на тебе.', 'Продовжити');
}

$('pause').onclick = pause;
$('leave').onclick = lobby;
$('next').onclick = () => {
  if (state === 'pause') {
    state = 'play';
    $('controls').hidden = false;
    $('modal').hidden = true;
  } else lobby();
};

window.addEventListener('resize', () => { if (state === 'play' || state === 'pause') draw(); });
window.addEventListener('orientationchange', () => { setTimeout(() => { if (state === 'play' || state === 'pause') draw(); }, 120); });
window.addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

function finish() {
  if (state !== 'play') return;
  state = 'result';
  clearInput();
  const a = units[0], r = profile.roster[a.kind];
  let win = false;
  if (invasion()) win = cleared();
  else if (showdown()) win = !a.eliminated && !a.dead && units.slice(1).every(b => b.eliminated || b.dead);
  else if (profile.rule === 0 && countdownLeader && gemCountdown <= 0) win = countdownLeader === a;
  else {
    const best = Math.max(...units.filter(b => !b.zombie).map(b => b.score));
    win = a.score === best && units.filter(b => b.score === best).length === 1;
  }
  if (win) sfx('win'); else sfx('ko');
  const prev = levelOf(r.xp);
  const xp = 12 + Math.min(14, a.picks * 2) + (win ? 8 : 0) +
    (profile.rule === 5 ? Math.min(8, Math.floor(a.score / 10)) : 0);
  const oldTrophies = r.trophies;
  const streakBonus = win ? Math.min(4, profile.streak) : 0;
  const trophyDelta = win ? trophyWin[profile.difficulty] + streakBonus :
    -Math.min(r.trophies, r.trophies < 25 ? 0 : r.trophies < 80 ? 2 : r.trophies < 250 ? 3 : 5);
  const coins = 12 + profile.difficulty * 7 + (win ? 13 : 0) + Math.min(10, a.picks * 2);
  r.trophies = Math.max(0, r.trophies + trophyDelta);
  r.bestTrophies = Math.max(r.bestTrophies, r.trophies);
  r.xp += xp;
  r.played++;
  profile.coins += coins;
  profile.matches++;
  if (win) {
    profile.wins++; r.wins++; profile.modeWins[profile.rule]++;
    profile.streak++; profile.bestStreak = Math.max(profile.bestStreak, profile.streak);
  } else profile.streak = 0;
  const road = claimRoadRewards();
  save();
  const earned = [];
  if (r.played === 1) earned.push(['wear', 1, 'Золота стрічка']);
  if (prev < 2 && levelOf(r.xp) >= 2) earned.push(['charm', 1, heroes[a.kind].item]);
  if (prev < 3 && levelOf(r.xp) >= 3) earned.push(['wear', 2, 'Зоряна стрічка']);
  const arena = maps.find(m => m.unlock === profile.matches);
  $('overline').textContent = heroes[a.kind].name + ' · +' + xp + ' XP · ' +
    (trophyDelta >= 0 ? '+' : '') + trophyDelta + ' 🏆 · +' + coins + ' 🪙';
  const scoreMsg = invasion() ? tally() : showdown()
    ? 'Кубики сили: ' + (a.cubes || 0) + ' · Твоя позиція: ' + (1 + units.slice(1).filter(u => !u.eliminated).length)
    : profile.rule === 5 ? 'Очки контролю: ' + Math.floor(a.score) + '/65'
    : 'Рахунок: ' + units.map(b => Math.floor(b.score)).join(' / ');
  const newRank = rankOf(r.bestTrophies) > rankOf(oldTrophies)
    ? 'Новий ранг: ' + heroRankNames[rankOf(r.bestTrophies)] + '! ' : '';
  const rewards = road.map(m => 'Нагорода шляху кубків: +' + m.coins + ' 🪙. ').join('');
  modal(
    win ? 'Перемога!' : showdown() && a.eliminated ? 'Тебе вибито!' : invasion() ? 'Час вичерпано' : 'Бій завершено',
    scoreMsg + '. ' + newRank + rewards +
      (win && profile.streak > 1 ? 'Серія перемог ×' + profile.streak + '! ' : '') +
      (arena ? 'Нова арена: ' + arena.name + '. ' : '') +
      earned.map(e => 'Здобич: ' + e[2] + '.').join(' '),
    'До героїв'
  );
  if (win) {
    const c = $('victoryFlag').getContext('2d');
    c.clearRect(0, 0, 80, 55);
    banner(c, 24, 50, profile.banner, 1.45);
    $('victoryFlag').hidden = false;
  }
  if (earned.length) {
    $('equip').hidden = false;
    $('equip').textContent = 'Одягнути · ' + earned.map(e => e[2]).join(' і ');
    $('equip').onclick = () => {
      for (const [slot, id] of earned) r[slot] = id;
      save();
      $('equip').hidden = true;
      $('summary').textContent += ' Спорядження одягнено.';
    };
  }
}

function move(a, dx, dy, speed, dt) {
  const len = Math.max(1, Math.hypot(dx, dy));
  const step = speed * dt;
  const vx = (dx / len) * step, vy = (dy / len) * step;
  const check = a.jumpTime > 0 ? blockedWall : blockedWalk;
  const r = 13.5;

  // Якщо персонаж опинився всередині перешкоди — м'яко виштовхуємо у вільну точку
  if (check(a.x, a.y, r)) {
    for (let rad = 4; rad <= 36; rad += 4) {
      let freed = false;
      for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]]) {
        if (!check(a.x + ox * rad, a.y + oy * rad, r)) {
          a.x += ox * rad; a.y += oy * rad; freed = true; break;
        }
      }
      if (freed) break;
    }
  }

  let movedX = false, movedY = false;
  if (!check(a.x + vx, a.y, r)) {
    a.x += vx; movedX = true;
  } else if (Math.abs(vx) > 0.05) {
    // Ковзання вздовж кутів по вертикалі, коли рух по X вперся в кут перешкоди
    for (const dir of [1, -1]) {
      if (!check(a.x + vx * 0.5, a.y + dir * 5, r) && !check(a.x, a.y + dir * step * 0.75, r)) {
        a.y += dir * step * 0.75; break;
      }
    }
  }

  if (!check(a.x, a.y + vy, r)) {
    a.y += vy; movedY = true;
  } else if (Math.abs(vy) > 0.05 && !movedX) {
    // Ковзання вздовж кутів по горизонталі, коли рух по Y вперся в кут перешкоди
    for (const dir of [1, -1]) {
      if (!check(a.x + dir * 5, a.y + vy * 0.5, r) && !check(a.x + dir * step * 0.75, a.y, r)) {
        a.x += dir * step * 0.75; break;
      }
    }
  }
}

function waypoint(a, g) {
  const size = 20, cols = 46, rows = 27;
  const clampCell = (cx, cy) => Math.max(0, Math.min(rows - 1, cy)) * cols + Math.max(0, Math.min(cols - 1, cx));
  const index = (x, y) => clampCell(Math.floor(x / size), Math.floor(y / size));
  const cellCenter = id => ({ x: (id % cols) * size + 10, y: Math.floor(id / cols) * size + 10 });
  const passable = id => { const c = cellCenter(id); return !blockedWalk(c.x, c.y, 13.5); };

  let start = index(a.x, a.y), goal = index(g.x, g.y);
  // Якщо стартова або цільова клітинка заблокована, шукаємо найближчу вільну сусідню клітинку
  if (!passable(start)) {
    const sx = start % cols, sy = Math.floor(start / cols);
    for (let d = 1; d <= 3; d++) {
      let found = -1;
      for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
        const nid = clampCell(sx + dx, sy + dy);
        if (passable(nid)) { found = nid; break; }
      }
      if (found >= 0) { start = found; break; }
    }
  }
  if (!passable(goal)) {
    const gx = goal % cols, gy = Math.floor(goal / cols);
    for (let d = 1; d <= 4; d++) {
      let found = -1;
      for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
        const nid = clampCell(gx + dx, gy + dy);
        if (passable(nid)) { found = nid; break; }
      }
      if (found >= 0) { goal = found; break; }
    }
  }
  if (start === goal) return g;

  const queue = [start], prev = new Map([[start, -1]]);
  let closestId = start, closestDist = Infinity;
  for (let k = 0; k < queue.length; k++) {
    const id = queue[k];
    if (id === goal) {
      let n = id;
      while (prev.get(n) !== start && prev.has(n)) n = prev.get(n);
      return cellCenter(n);
    }
    const c = cellCenter(id), dGoal = Math.hypot(c.x - g.x, c.y - g.y);
    if (dGoal < closestDist && id !== start) { closestDist = dGoal; closestId = id; }

    const cx = id % cols, cy = Math.floor(id / cols);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = cx + dx, ny = cy + dy, n = ny * cols + nx;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || prev.has(n) || !passable(n)) continue;
      // Для діагонального кроку перевіряємо обидві суміжні клітинки, щоб бот не зрізав крізь кут стіни
      if (dx && dy && (!passable(cy * cols + nx) || !passable(ny * cols + cx))) continue;
      prev.set(n, id); queue.push(n);
    }
  }
  if (closestId !== start) {
    let n = closestId;
    while (prev.get(n) !== start && prev.has(n)) n = prev.get(n);
    return cellCenter(n);
  }
  return g;
}

function inBrush(u, patch) { return u.x >= patch[0] && u.x <= patch[0] + patch[2] && u.y >= patch[1] && u.y <= patch[1] + patch[3]; }
function brushAt(u) { return [...brush, ...temporaryBrush].filter(p => inBrush(u, p)); }
function hiddenByBrush(observer, target) {
  if (!target || !Number.isInteger(target.kind) || target.dead || target.reveal > 0 || dist(observer, target) < 88) return false;
  const hiding = brushAt(target);
  if (!hiding.length) return false;
  return !hiding.some(p => inBrush(observer, p));
}
function visible(a, b) {
  if (hiddenByBrush(a, b)) return false;
  const n = Math.ceil(dist(a, b) / 10);
  for (let i = 1; i < n; i++) if (blockedWall(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n, 4)) return false;
  return true;
}
function seenOpponents(a) { return opponents(a).filter(b => visible(a, b)); }

function sparkle(x, y, color, count = 8, power = 75) {
  for (let i = 0; i < count; i++) {
    const dir = Math.random() * Math.PI * 2, spd = (.3 + Math.random()) * power;
    particles.push({ x, y, vx: Math.cos(dir) * spd, vy: Math.sin(dir) * spd, t: .25 + Math.random() * .32, color, r: 1.5 + Math.random() * 3 });
  }
  if (particles.length > 260) particles.splice(0, particles.length - 260);
}

function closest(a, list) { return list.reduce((prev, v) => !prev || dist(a, v) < dist(a, prev) ? v : prev, null); }
function opponents(a) { return units.filter(b => b !== a && !b.dead && !b.eliminated); }

function damageCrate(cr, dmg, attacker) {
  cr.hp -= dmg;
  sparkle(cr.x, cr.y, cr.kind === 'barrel' ? '#ff9d5c' : '#ffd885', 6, 65);
  floatText(cr.x, cr.y, '-' + Math.round(dmg * 10) / 10, '#ffd885');
  if (cr.hp > 0) return;
  const idx = crates.indexOf(cr);
  if (idx >= 0) crates.splice(idx, 1);
  if (cr.kind === 'barrel') {
    sfx('boom');
    rings.push({ x: cr.x, y: cr.y, r: 96, t: .4, color: '#ff8a47' });
    sparkle(cr.x, cr.y, '#ff7340', 22, 130);
    for (const u of units) {
      if (!u.dead && !u.eliminated && dist(u, cr) <= 96) hit(u, 2, attacker);
    }
  } else {
    sfx('gem');
    loot.push({ x: cr.x, y: cr.y, kind: 'cube' });
  }
}

function fire(a) {
  if (a.cd > 0 || a.dead || a.eliminated || (a.ammo !== undefined && a.ammo < 1)) return;
  const maxRange = a.kind === 1 ? 260 : a.kind === 5 ? 360 : 418;
  const targets = seenOpponents(a).filter(b => dist(a, b) <= maxRange);
  let enemy = a.i && profile.rule === 1 && profile.difficulty && targets.includes(flag.carrier) ? flag.carrier : closest(a, targets);
  // Якщо поруч немає ворога, цілимось у найближчий ящик або бочку
  if (!enemy) {
    const nearCrate = closest(a, crates.filter(cr => dist(a, cr) <= maxRange * 0.85));
    if (nearCrate) enemy = nearCrate;
  }

  if (a.i && (!enemy || dist(a, enemy) > maxRange)) return;

  if (enemy && dist(a, enemy) <= maxRange) {
    const error = a.i ? [.26, .095, .035][profile.difficulty] * (Math.random() * 2 - 1) : 0;
    a.angle = Math.atan2(enemy.y - a.y, enemy.x - a.x) + error;
  } else {
    a.angle = a.heading || 0;
  }

  if (a.ammo !== undefined) a.ammo = Math.max(0, a.ammo - 1);
  a.outOfCombat = 0;
  if (!a.i) sfx('shoot');

  const count = (a.kind === 1 || a.kind === 3) ? 3 : (a.kind === 6 || a.kind === 7) ? 2 : 1;
  const spread = a.kind === 1 ? .28 : a.kind === 6 ? .20 : a.kind === 7 ? .15 : .17;
  const life = a.kind === 1 ? .62 : a.kind === 5 ? 1.0 : 1.14;
  const speed = a.kind === 1 ? 390 : a.kind === 6 ? 420 : a.kind === 7 ? 410 : 360;
  const dmg = a.kind === 4 ? 2 : a.kind === 1 ? .65 : a.kind === 3 ? .75 : a.kind === 6 ? .75 : a.kind === 7 ? .85 : 1;

  for (let n = 0; n < count; n++) {
    const angle = a.angle + (n - (count - 1) / 2) * spread;
    shots.push({
      x: a.x, y: a.y, owner: a,
      dx: Math.cos(angle), dy: Math.sin(angle),
      t: life, damage: dmg, speed,
      radius: a.kind === 5 ? 9 : a.kind === 4 ? 8 : 5,
      slow: a.kind === 3 ? 1.3 : 0,
      color: heroes[a.kind].color
    });
  }
  a.reveal = a.kind === 6 ? .95 : 1.35;
  sparkle(a.x + Math.cos(a.angle) * 20, a.y + Math.sin(a.angle) * 20, heroes[a.kind].color, 3, 25);
  a.cd = a.i ? [1.28, .9, .72][profile.difficulty] : heroes[a.kind].rate;
}

function hit(b, n, attacker) {
  if (b.dead || b.eliminated || b.shield > 0 || b.dome > 0) return;
  const upgrade = attacker && !attacker.i && !attacker.zombie ? profile.roster[attacker.kind].power : 0;
  const cubeBonus = attacker ? (attacker.cubes || 0) * 0.15 : 0;
  const dmg = Math.round(n * (1 + upgrade * .12 + cubeBonus) * 10) / 10;
  b.hp -= dmg;
  b.outOfCombat = 0;
  b.reveal = Math.max(b.reveal || 0, .5);
  floatText(b.x, b.y, '-' + dmg, b.i ? '#ffe27a' : '#ff7b7b');
  if (attacker === units[0] || b === units[0]) sfx('hit');

  if (attacker && !attacker.zombie) {
    attacker.cool = Math.max(0, (attacker.cool || 0) - 1.35);
  }

  sparkle(b.x, b.y, heroes[attacker?.kind]?.color || '#ffda8d', 6);
  if (attacker?.kind === 5 && !attacker.i) {
    attacker.hits = (attacker.hits || 0) + 1;
    if (attacker.hits % 3 === 0 && attacker.hp < attacker.max) {
      attacker.hp = Math.min(attacker.max, attacker.hp + 1);
      floatText(attacker.x, attacker.y, '+1 ♥', '#9dffb0');
    }
  }
  if (b.hp > 0) return;
  b.dead = 2.2; b.dome = 0; b.way = null;
  rings.push({ x: b.x, y: b.y, r: 32, t: .4, color: '#ffe7a1' });
  if (!b.zombie) sfx('ko');
  if (b.zombie) { kills++; gems.push({ x: b.x, y: b.y }); return; }
  if (attacker === units[0] && b !== attacker) eliminations++;

  // Режим Зіткнення (Showdown): вибулий залишає кубик сили і більше не відроджується
  if (showdown()) {
    b.eliminated = true;
    loot.push({ x: b.x, y: b.y, kind: 'cube' });
    if (attacker && !attacker.i) { a_score_bump(attacker); }
    if (b === units[0] || units.slice(1).every(u => u.eliminated)) setTimeout(finish, 350);
    return;
  }

  if ((profile.rule === 3 || profile.rule === 6) && attacker && attacker !== b && !attacker.zombie) {
    attacker.score++; attacker.picks++;
    if (!attacker.i) { combo = comboClock > 0 ? combo + 1 : 1; comboClock = 7; }
  }
  if (flag.carrier === b) { flag = { x: b.x, y: b.y, carrier: null }; }

  // У режимі «Кристали» (Gem Grab) при нокауті випадають зібрані кристали (до 5 шт. навколо)
  if (profile.rule === 0 && b.score > 0) {
    const dropCount = Math.min(b.score, 5);
    b.score -= dropCount;
    for (let d = 0; d < dropCount; d++) {
      const ang = (Math.PI * 2 * d) / dropCount;
      const gx = Math.max(40, Math.min(W - 40, b.x + Math.cos(ang) * 24));
      const gy = Math.max(40, Math.min(H - 40, b.y + Math.sin(ang) * 24));
      gems.push({ x: gx, y: gy });
    }
    floatText(b.x, b.y, '-' + dropCount + ' ◆', '#ff927e');
  }
}
function a_score_bump(u) { u.score++; u.picks++; }

function collect(a) {
  const idx = gems.findIndex(g => dist(g, a) < 22);
  if (idx < 0) return;
  const gem = gems.splice(idx, 1)[0];
  a.score++; a.picks++;
  if (!a.i) sfx('gem');
  floatText(a.x, a.y, '+1 ◆', '#7affea');
  sparkle(gem.x, gem.y, '#8cffe2', 11, 85);
}

function cast(a) {
  if (state !== 'play' || a.dead || a.eliminated || a.cool > 0) return;
  const h = heroes[a.kind], charmed = !a.i && profile.roster[a.kind].charm;
  if (!a.i) sfx('super');

  if (a.kind === 0) {
    a.shield = Math.max(a.shield, 0.35);
    const struck = new Set();
    for (let j = 0; j < 36; j++) {
      const x = a.x + 4 * Math.cos(a.heading), y = a.y + 4 * Math.sin(a.heading);
      if (blockedWall(x, y, 14)) break;
      a.x = x; a.y = y;
      if (j % 6 === 0) rings.push({ x, y, r: 15, t: .4, color: h.color });
      for (const b of opponents(a)) {
        if (!struck.has(b) && dist(a, b) < 30) { hit(b, 2, a); struck.add(b); }
      }
      if (charmed && (profile.rule === 0 || invasion())) {
        collect(a);
        if (invasion() && cleared()) { finish(); break; }
      }
    }
  } else if (a.kind === 1) {
    a.dome = 3; a.heal = charmed;
  } else if (a.kind === 3) {
    for (const b of opponents(a)) {
      if (dist(a, b) < 145) { b.slow = Math.max(b.slow, 3.5); hit(b, 1, a); }
    }
    rings.push({ x: a.x, y: a.y, r: 140, t: .4, color: h.color });
    if (charmed) { a.hp = Math.min(a.max, a.hp + 2); floatText(a.x, a.y, '+2 ♥', '#9dffb0'); }
  } else if (a.kind === 4) {
    for (const b of opponents(a)) {
      if (dist(a, b) < 128) {
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        move(b, Math.cos(ang), Math.sin(ang), 220, 0.16);
        hit(b, 3, a);
      }
    }
    rings.push({ x: a.x, y: a.y, r: 125, t: .4, color: h.color });
    if (charmed) { a.cd = 0; a.ammo = 3; }
  } else if (a.kind === 5) {
    a.hp = Math.min(a.max, a.hp + 3);
    floatText(a.x, a.y, '+3 ♥', '#9dffb0');
    for (const b of opponents(a)) { if (dist(a, b) < 108) hit(b, 2, a); }
    if (charmed) a.dome = 1.5;
    rings.push({ x: a.x, y: a.y, r: 108, t: .4, color: h.color });
  } else if (a.kind === 6) {
    const w = 168, hg = 124;
    temporaryBrush.push([Math.max(14, Math.min(W - w - 14, a.x - w / 2)), Math.max(14, Math.min(H - hg - 14, a.y - hg / 2)), w, hg, 9]);
    const healAmt = charmed ? 3 : 2;
    a.hp = Math.min(a.max, a.hp + healAmt);
    floatText(a.x, a.y, '+' + healAmt + ' ♥', '#9dffb0');
    if (charmed) a.dome = 1.15;
    rings.push({ x: a.x, y: a.y, r: 86, t: .4, color: '#acffb1' });
    sparkle(a.x, a.y, '#d5ff9f', 26, 115);
  } else if (a.kind === 7) {
    a.shield = Math.max(a.shield, 0.35);
    const struck = new Set();
    for (let j = 0; j < 32; j++) {
      const x = a.x + 4.2 * Math.cos(a.heading), y = a.y + 4.2 * Math.sin(a.heading);
      if (blockedWall(x, y, 14)) break;
      a.x = x; a.y = y;
      if (j % 7 === 0) rings.push({ x, y, r: 16, t: .35, color: h.color });
      for (const b of opponents(a)) {
        if (!struck.has(b) && dist(a, b) < 34) { hit(b, 2, a); struck.add(b); }
      }
    }
    sparkle(a.x, a.y, '#ffb8d5', 18, 95);
    if (charmed) {
      a.boost = Math.max(a.boost, 3);
      a.hp = Math.min(a.max, a.hp + 1);
      floatText(a.x, a.y, '+1 ♥', '#9dffb0');
    }
  } else {
    const b = closest(a, seenOpponents(a));
    if (!b) return;
    meteors.push({ owner: a, x: b.x, y: b.y, t: .55, r: 85, power: 3 });
    if (charmed) meteors.push({ owner: a, x: b.x, y: b.y, t: 1.05, r: 65, power: 1 });
  }
  a.cool = h.cd - (charmed ? 0.3 * profile.roster[a.kind].forge : 0);
}

function objective(a) {
  if (showdown()) {
    const cubeLoot = closest(a, loot.filter(l => l.kind === 'cube'));
    if (cubeLoot) return cubeLoot;
    const boxTarget = closest(a, crates.filter(cr => cr.kind === 'box'));
    if (boxTarget && dist(a, boxTarget) < 260) return boxTarget;
    return closest(a, seenOpponents(a)) || { x: W / 2, y: H / 2 };
  }
  if (profile.rule === 1) return flag.carrier === a ? a.base : (flag.carrier && visible(a, flag.carrier) ? flag.carrier : flag);
  if (profile.rule === 3 || profile.rule === 6) return closest(a, seenOpponents(a)) || { x: 460, y: 270 };
  if (profile.rule === 5) return { x: 460, y: 270 };
  if (profile.rule === 0 && countdownLeader && countdownLeader !== a && visible(a, countdownLeader)) return countdownLeader;
  if (!profile.difficulty) return closest(a, gems) || { x: 460, y: 270 };
  let best = null, min = Infinity;
  for (const gem of gems) {
    const travel = dist(a, gem);
    const contested = seenOpponents(a).some(other => dist(other, gem) + 30 < travel);
    const cost = travel + (visible(a, gem) ? 0 : 55) + (contested ? 85 : 0);
    if (cost < min) { min = cost; best = gem; }
  }
  return best || { x: 460, y: 270 };
}

function tactic(a) {
  const tier = profile.difficulty, enemy = closest(a, seenOpponents(a));
  let target = objective(a);
  if (showdown() && stormInset > 10) {
    if (a.x < stormInset + 55 || a.x > W - stormInset - 55 || a.y < stormInset + 55 || a.y > H - stormInset - 55) {
      return { x: W / 2, y: H / 2 };
    }
  }
  if (tier === 2) {
    const danger = meteors.find(m => m.owner !== a && dist(a, m) < m.r);
    if (danger) {
      const safe = [{ x: a.x + 95, y: a.y }, { x: a.x - 95, y: a.y }, { x: a.x, y: a.y + 95 }, { x: a.x, y: a.y - 95 }].filter(p => !blockedWalk(p.x, p.y, 16)).sort((u, v) => dist(v, danger) - dist(u, danger));
      if (safe.length) return safe[0];
    }
    const leader = seenOpponents(a).find(b => b.score >= (profile.rule === 1 ? 2 : profile.rule === 3 ? 6 : 6));
    if (leader && dist(a, leader) < 240 && a.score < (profile.rule === 1 ? 2 : 6)) target = leader;
  }
  if (tier && enemy && a.hp <= 2 && dist(a, enemy) < 210) {
    const heart = closest(a, loot.filter(p => p.kind === 'heart' || p.kind === 'supply'));
    if (heart) return heart;
    const cover = blocks.flatMap(([x, y, w, h]) => [{ x: x - 24, y: y + h / 2 }, { x: x + w + 24, y: y + h / 2 }, { x: x + w / 2, y: y - 24 }, { x: x + w / 2, y: y + h + 24 }]).filter(p => !blockedWalk(p.x, p.y, 16) && !visible(enemy, p));
    return closest(a, cover) || target;
  }
  return target;
}

function bot(a, dt) {
  a.nav -= dt; a.think -= dt;
  const movedDist = a.prevX !== undefined ? Math.hypot(a.x - a.prevX, a.y - a.prevY) : 5;
  a.prevX = a.x; a.prevY = a.y;
  if (movedDist < 0.35) a.stuckTime = (a.stuckTime || 0) + dt;
  else a.stuckTime = 0;

  if (!a.way || a.nav <= 0 || dist(a, a.way) < 6 || a.stuckTime > 0.28) {
    if (a.stuckTime > 0.28) {
      const dirs = [[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]]
        .map(([ox, oy]) => ({ x: a.x + ox * 48, y: a.y + oy * 48 }))
        .filter(p => !blockedWalk(p.x, p.y, 14));
      a.way = dirs.length ? dirs[Math.floor(Math.random() * dirs.length)] : waypoint(a, { x: W / 2, y: H / 2 });
      a.stuckTime = 0;
      a.nav = .35;
    } else {
      a.way = waypoint(a, tactic(a));
      a.nav = .38;
    }
  }
  const dx = a.way.x - a.x, dy = a.way.y - a.y;
  if (dx || dy) a.heading = Math.atan2(dy, dx);
  move(a, dx, dy, Math.min([88, 111, 138][profile.difficulty] * (a.boost ? 1.3 : 1) * (a.slow > .01 ? .65 : 1), Math.hypot(dx, dy) / dt), dt);
  if (a.think <= 0) {
    a.think = [.85, .42, .23][profile.difficulty];
    const b = closest(a, seenOpponents(a));
    if (b && dist(a, b) < [210, 275, 330][profile.difficulty]) {
      fire(a);
      if (profile.difficulty && (!a.cool) && ((a.kind === 0 || a.kind === 7) ? dist(a, b) < 130 : a.kind === 1 ? visible(a, b) : a.kind === 2 ? dist(a, b) < 240 : dist(a, b) < 160)) {
        if (a.kind === 0 || a.kind === 7) a.heading = Math.atan2(b.y - a.y, b.x - a.x);
        cast(a);
      }
    } else if (crates.length && profile.rule !== 5) {
      const cr = closest(a, crates);
      if (cr && dist(a, cr) < 190) fire(a);
    }
  }
}

function update(dt) {
  left -= dt; spawnIn -= dt; lootIn -= dt;
  comboClock = Math.max(0, comboClock - dt);
  if (comboClock === 0) combo = 0;
  supply.wait -= dt;
  if (supply.wait <= 0) {
    loot.push({ x: supply.x, y: supply.y, kind: 'supply' });
    supply = { ...point(), wait: 20 };
  }
  if ((profile.rule === 0 || invasion()) && spawnIn <= 0 && gems.length < 9) {
    gems.push(previewGem); previewGem = point(); spawnIn = 1.8;
  }
  if (lootIn <= 0) {
    if (loot.length < 4) loot.push({ ...point(), kind: ['heart', 'spark', 'wind'][Math.floor(Math.random() * 3)] });
    lootIn = 5;
  }
  for (let i = temporaryBrush.length - 1; i >= 0; i--) {
    temporaryBrush[i][4] -= dt;
    if (temporaryBrush[i][4] <= 0) temporaryBrush.splice(i, 1);
  }
  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 50 * dt; p.t -= dt; }
  particles = particles.filter(p => p.t > 0);
  for (const ft of floatTexts) { ft.y -= 24 * dt; ft.t -= dt; }
  floatTexts = floatTexts.filter(ft => ft.t > 0);

  // Отруйний туман у режимі «Зіткнення» (Showdown)
  if (showdown()) {
    stormInset = Math.min(185, stormInset + dt * 1.9);
    stormTick += dt;
    if (stormTick >= 1.0) {
      stormTick = 0;
      for (const u of units) {
        if (u.dead || u.eliminated) continue;
        if (u.x < stormInset || u.x > W - stormInset || u.y < stormInset || u.y > H - stormInset) {
          hit(u, 1);
          floatText(u.x, u.y, '☁ Туман -1', '#c78cff');
        }
      }
    }
  }

  for (const a of units) {
    if (a.eliminated) continue;
    a.boost = Math.max(0, a.boost - dt);
    a.cool = Math.max(0, a.cool - dt * 0.75);
    a.cd -= dt;
    a.shield -= dt;
    a.dome = Math.max(0, a.dome - dt);
    a.slow = Math.max(0, (a.slow || 0) - dt);
    a.reveal = Math.max(0, (a.reveal || 0) - dt);
    a.padCool = Math.max(0, (a.padCool || 0) - dt);

    if (a.dead) {
      a.dead = Math.max(0, a.dead - dt);
      if (!a.dead && a.zombie) zombieSpawn(a);
      else if (!a.dead) { Object.assign(a, a.base); a.hp = a.max; a.ammo = 3; a.outOfCombat = 0; a.shield = 1.4; }
      continue;
    }
    if (a.zombie) { hunt(a, dt); continue; }

    // Пружини-трампліни (Jump Pads)
    if (a.jumpTime > 0) {
      a.jumpTime = Math.max(0, a.jumpTime - dt);
      move(a, a.jumpVx, a.jumpVy, 420, dt);
      if (a.jumpTime === 0) rings.push({ x: a.x, y: a.y, r: 28, t: .35, color: '#ffe169' });
      continue;
    }
    if (a.padCool <= 0) {
      const padHit = pads.find(([px, py]) => Math.hypot(a.x - px, a.y - py) < 22);
      if (padHit) {
        a.jumpTime = 0.46;
        a.jumpVx = padHit[2];
        a.jumpVy = padHit[3];
        a.padCool = 1.6;
        a.shield = Math.max(a.shield, 0.46);
        if (!a.i) sfx('jump');
        rings.push({ x: padHit[0], y: padHit[1], r: 30, t: .35, color: '#ffe169' });
        floatText(a.x, a.y, 'Стрибок! 🚀', '#ffe169');
        continue;
      }
    }

    a.ammo = Math.min(3, (a.ammo ?? 3) + dt * 0.85);
    a.outOfCombat = (a.outOfCombat || 0) + dt;
    if (a.outOfCombat >= 3.2 && a.hp < a.max) {
      const prevHp = Math.floor(a.hp);
      a.hp = Math.min(a.max, a.hp + dt * 0.9);
      if (Math.floor(a.hp) > prevHp && !a.i) floatText(a.x, a.y, '+1 ♥', '#8cffb0');
    }

    if (a.i) bot(a, dt);
    else {
      const dx = moveStick[0] + Number(keys.has('ArrowRight') || keys.has('KeyD')) - Number(keys.has('ArrowLeft') || keys.has('KeyA'));
      const dy = moveStick[1] + Number(keys.has('ArrowDown') || keys.has('KeyS')) - Number(keys.has('ArrowUp') || keys.has('KeyW'));
      if (dx || dy) a.heading = Math.atan2(dy, dx);
      move(a, dx, dy, heroes[a.kind].speed * (a.boost ? 1.3 : 1) * (a.slow > .01 ? .65 : 1), dt);
      if (held || keys.has('Space')) fire(a);
    }

    if (profile.rule === 1) {
      if (!flag.carrier && dist(a, flag) < 22) { flag.carrier = a; if (!a.i) sfx('gem'); }
      if (flag.carrier === a && dist(a, a.base) < 29) { a.score++; a.picks++; if (!a.i) sfx('super'); flag = { x: 460, y: 270, carrier: null }; }
      if (a.score >= 3) { finish(); return; }
    } else if (profile.rule === 3 || profile.rule === 6) {
      if (a.score >= (profile.rule === 6 ? 3 : 8)) { finish(); return; }
    } else if (profile.rule === 0 || invasion()) {
      collect(a);
      if (invasion() && cleared()) { finish(); return; }
    }

    const j = loot.findIndex(p => dist(a, p) < 22);
    if (j >= 0) {
      const item = loot.splice(j, 1)[0];
      if (!a.i) sfx('gem');
      if (item.kind === 'cube') {
        a.cubes = (a.cubes || 0) + 1;
        a.max += 1; a.hp = Math.min(a.max, a.hp + 1);
        a.picks++;
        floatText(a.x, a.y, '⚡ Куб сили +' + a.cubes, '#7affb2');
      } else if (item.kind === 'supply') {
        a.boost = 4; a.hp = Math.min(a.max, a.hp + 2); a.cool = Math.max(0, a.cool - 3); floatText(a.x, a.y, '+2 ♥ ⚡', '#ffe889');
      } else if (item.kind === 'heart') {
        a.hp = Math.min(a.max, a.hp + 2); floatText(a.x, a.y, '+2 ♥', '#ff91a4');
      } else if (item.kind === 'wind') {
        a.boost = 4; floatText(a.x, a.y, 'Швидкість!', '#80f9ff');
      } else {
        a.cool = Math.max(0, a.cool - 3); floatText(a.x, a.y, 'Заряд ✦', '#d7c5ff');
      }
      rings.push({ x: a.x, y: a.y, t: .4, r: 26, color: item.kind === 'cube' ? '#7affb2' : item.kind === 'heart' ? '#ff91a4' : '#ffe889' });
    }
  }

  // Контроль маяка: зону зараховуємо тільки єдиному живому бійцю в радіусі.
  if (profile.rule === 5) {
    const center = { x: 460, y: 270 };
    const occupiers = units.filter(u => !u.dead && !u.eliminated && dist(u, center) < 98);
    if (occupiers.length === 1) {
      const leader = occupiers[0];
      leader.score = Math.min(65, leader.score + dt * 3);
      if (leader.score >= 65) { finish(); return; }
    }
  }

  // Зворотний відлік 10 секунд у режимі «Кристали».
  if (profile.rule === 0) {
    const aliveUnits = units.filter(u => !u.zombie);
    const maxGems = Math.max(...aliveUnits.map(u => u.score));
    const leaders = aliveUnits.filter(u => u.score === maxGems && u.score >= 7);
    if (leaders.length === 1) {
      if (countdownLeader !== leaders[0]) {
        countdownLeader = leaders[0];
        gemCountdown = 10;
        sfx('super');
        floatText(countdownLeader.x, countdownLeader.y, 'Відлік 10 с!', '#ffe169');
      } else {
        gemCountdown -= dt;
        if (gemCountdown <= 0) { finish(); return; }
      }
    } else {
      if (countdownLeader) floatText(W / 2, H / 2, 'Відлік зупинено!', '#ff927e');
      countdownLeader = null;
      gemCountdown = 0;
    }
  }

  for (const m of meteors) {
    m.t -= dt;
    if (m.t <= 0) {
      opponents(m.owner).filter(b => dist(m, b) <= m.r).forEach(b => hit(b, m.power, m.owner));
      crates.filter(cr => dist(m, cr) <= m.r).forEach(cr => damageCrate(cr, m.power, m.owner));
      rings.push({ ...m, color: '#ffd2ff', t: .4 });
    }
  }
  meteors = meteors.filter(m => m.t > 0);

  for (const s of shots) {
    s.t -= dt;
    s.x += s.dx * (s.speed || 360) * dt;
    s.y += s.dy * (s.speed || 360) * dt;
    if (blockedWall(s.x, s.y, 4)) s.t = 0;
    if (s.t <= 0) continue;

    // Влучання по ящиках / бочках
    const crHit = crates.find(cr => Math.hypot(s.x - cr.x, s.y - cr.y) < 18);
    if (crHit) {
      damageCrate(crHit, s.damage || 1, s.owner);
      s.t = 0;
      continue;
    }

    const hitRadius = (s.radius || 5) + 12;
    const b = opponents(s.owner).find(b => dist(s, b) < (b.dome ? 36 : hitRadius));
    if (b) {
      if (b.dome) {
        if (b.heal) { b.hp = Math.min(b.max, b.hp + 1); b.heal = false; floatText(b.x, b.y, '+1 ♥', '#9dffb0'); }
        rings.push({ x: s.x, y: s.y, t: .4, r: 11, color: '#fff2b1' });
      } else {
        hit(b, s.damage || 1, s.owner);
        if (s.slow) b.slow = Math.max(b.slow, s.slow);
      }
      s.t = 0;
    }
  }
  shots = shots.filter(s => s.t > 0);
  rings = rings.filter(r => (r.t -= dt) > 0);
  if (left <= 0 || (invasion() && cleared())) finish();
  else hud();
}

function hud() {
  const a = units[0];
  $('time').textContent = (profile.rule === 0 && countdownLeader) ? ('⏳ ' + Math.ceil(gemCountdown) + ' с!') : (Math.ceil(left) + ' с');
  if (invasion()) {
    $('score').textContent = tally();
  } else if (showdown()) {
    const aliveCount = units.filter(u => !u.eliminated && !u.dead).length;
    $('score').textContent = '☣ Бійців: ' + aliveCount + '/' + units.length + ' · ⚡ Куби: ' + (a.cubes || 0);
  } else {
    const bestBot = Math.max(0, ...units.slice(1).map(b => b.score));
    const goal = profile.rule === 1 || profile.rule === 6 ? 3 : profile.rule === 3 ? 8 : profile.rule === 5 ? 65 : 7;
    const icon = profile.rule === 1 ? '⚑ ' : profile.rule === 3 || profile.rule === 6 ? '⚔ ' : profile.rule === 5 ? '◎ ' : '◆ ';
    $('score').textContent = icon + 'Ти ' + Math.floor(a.score) + '/' + goal + ' · Лідер ботів: ' + Math.floor(bestBot);
  }
  $('streak').textContent = (profile.rule === 0 && countdownLeader)
    ? (countdownLeader === a ? '🔥 Утримай кристали!' : '⚠️ Зупини лідера!')
    : (profile.rule === 3 && combo > 1 ? '⚡ Серія ×' + combo : '');
  $('streak').hidden = !((profile.rule === 0 && countdownLeader) || (profile.rule === 3 && combo > 1));
  const covered = brushAt(a).length > 0;
  $('stealth').hidden = !covered;
  $('stealth').textContent = a.reveal > 0 ? '👀 Позицію видано' : '🌿 У кущах';
  $('stealth').dataset.revealed = String(a.reveal > 0);
  $('super').textContent = heroes[a.kind].ability + (a.cool > 0.05 ? ' · ' + Math.ceil(a.cool) + ' с' : ' ✦');
  $('super').disabled = Boolean(a.cool > 0.05 || a.dead || a.eliminated);
}

function draw() {
  const width = world.clientWidth, height = world.clientHeight;
  if (!width || !height) return;
  const ratio = Math.min(2, window.devicePixelRatio || 1), pw = Math.round(width * ratio), ph = Math.round(height * ratio);
  if (world.width !== pw || world.height !== ph) { world.width = pw; world.height = ph; }
  const s = Math.max(width / W, height / H), vw = width / s, vh = height / s, a = units[0];
  const camX = Math.max(0, Math.min(W - vw, a.x - vw / 2)), camY = Math.max(0, Math.min(H - vh, a.y - vh / 2));
  ctx.setTransform(s * ratio, 0, 0, s * ratio, -camX * s * ratio, -camY * s * ratio);
  ctx.drawImage(background, 0, 0);
  drawJumpPads(ctx, pads, left);
  if (profile.rule === 5) {
    const active = units.filter(u => !u.dead && !u.eliminated && dist(u, {x:460,y:270}) < 98);
    ctx.save();
    ctx.beginPath(); ctx.arc(460, 270, 98, 0, Math.PI * 2);
    ctx.fillStyle = active.length === 1 ? (active[0] === a ? '#48f7b42e' : '#ff766d38') : '#f8e6a51e';
    ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = active.length === 1 ? (active[0] === a ? '#75ffd0' : '#ff9e83') : '#ffdf8b'; ctx.stroke();
    ctx.beginPath(); ctx.arc(460, 270, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#2a4162'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe18c'; ctx.stroke();
    star(ctx, 460, 270, 12, '#ffe89d');
    ctx.restore();
  }
  drawBrush(ctx, brush, 0, profile.map);
  drawBrush(ctx, temporaryBrush, 0, 5);

  for (const cr of crates) drawCrate(ctx, cr);

  for (const b of units) {
    if (b.zombie || showdown() || profile.rule === 5 || profile.rule === 6) continue;
    const p = b.base;
    oval(ctx, p.x, p.y, 28, 14, b.i ? '#944e623d' : '#33968960');
    banner(ctx, p.x - 16, p.y - 2, b.i ? (profile.banner + b.i) % 3 : profile.banner, .63);
  }
  if (profile.map === 2 && (profile.rule === 0 || invasion()) && gems.length < 8) {
    for (let i = 0; i < 5; i++) {
      const t = left * 2 + i * 1.25;
      oval(ctx, previewGem.x + Math.cos(t) * 14, previewGem.y + Math.sin(t) * 8, 2, 2, '#fff094');
    }
  }
  for (const g of gems) {
    const x = g.x, y = g.y + Math.sin(left * 3 + g.x) * 2;
    poly(ctx, [[x, y - 12], [x + 9, y - 3], [x + 7, y + 4], [x, y + 12], [x - 9, y + 1], [x - 7, y - 6]], '#49ffc9', '#246d70');
    poly(ctx, [[x, y - 10], [x + 7, y - 3], [x, y + 10]], '#18b9aa');
  }
  if (supply.wait <= 3) {
    ctx.strokeStyle = '#ffef99'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(supply.x, supply.y, 16 + supply.wait * 5, 0, Math.PI * 2); ctx.stroke();
    star(ctx, supply.x, supply.y, 8, '#ffef99');
  }
  for (const p of loot) {
    if (p.kind === 'supply') {
      box(ctx, p.x - 13, p.y - 10, 26, 20, 4, '#99532f');
      box(ctx, p.x - 12, p.y - 11, 24, 8, 2, '#ffd367');
      star(ctx, p.x, p.y + 1, 6, '#fff3af');
      continue;
    }
    if (p.kind === 'cube') {
      box(ctx, p.x - 10, p.y - 10, 20, 20, 5, '#19a86b', '#d9ffea');
      box(ctx, p.x - 6, p.y - 6, 12, 12, 3, '#6effb8');
      continue;
    }
    oval(ctx, p.x, p.y, 12, 12, p.kind === 'heart' ? '#b64b69' : p.kind === 'wind' ? '#197f94' : '#977827');
    ctx.fillStyle = '#fff2c3'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(p.kind === 'heart' ? '♥' : p.kind === 'wind' ? '»' : 'ϟ', p.x, p.y + 5);
  }
  for (const m of meteors) {
    oval(ctx, m.x, m.y, m.r, m.r, '#cb4ba44d');
    star(ctx, m.x, m.y - Math.min(.55, m.t) * 100, 12, '#fff2a8');
  }

  for (const b of units) {
    if (b.dead || b.eliminated || (b !== a && hiddenByBrush(a, b))) continue;
    const jumpScale = b.jumpTime > 0 ? 1.18 : .85;
    if (b.boost) oval(ctx, b.x, b.y + 12, 21, 6, '#80f9ff');
    if (b.slow > 0) oval(ctx, b.x, b.y + 16, 23, 5, '#b1edff');
    if (b.zombie) {
      if (b.windup > 0) oval(ctx, b.x, b.y, 26, 14, '#ff714963');
      zombieSprite(ctx, b);
    } else {
      sprite(ctx, b.kind, b.x, b.y - (b.jumpTime > 0 ? 12 : 0), jumpScale, b.i ? 0 : profile.roster[b.kind].wear, Math.cos(b.heading) < 0);
    }
    box(ctx, b.x - 16, b.y - 31, 32, 5, 2, '#263647');
    box(ctx, b.x - 15, b.y - 30, Math.max(0, 30 * b.hp / b.max), 3, 1, b.i ? '#ff927e' : '#73fde1');
    if (!b.i) {
      for (let slot = 0; slot < 3; slot++) {
        const fill = Math.max(0, Math.min(1, (b.ammo ?? 3) - slot));
        box(ctx, b.x - 15 + slot * 10.5, b.y - 24, 9, 2.5, 1, '#1d2b3a');
        if (fill > 0) box(ctx, b.x - 15 + slot * 10.5, b.y - 24, 9 * fill, 2.5, 1, fill === 1 ? '#ffb84d' : '#ffe299');
      }
      poly(ctx, [[b.x - 5, b.y - 40], [b.x + 5, b.y - 40], [b.x, b.y - 35]], '#fffacc', '#26404e');
    }
    if (b.cubes > 0) {
      ctx.fillStyle = '#7affb2'; ctx.font = '900 10px "SupercellHeadline", "SupercellText", system-ui'; ctx.textAlign = 'left';
      ctx.fillText('⚡' + b.cubes, b.x + 18, b.y - 26);
    }
    if (b.dome || b.shield > 0) {
      const r = b.dome ? 36 : 25;
      oval(ctx, b.x, b.y, r, r, b.dome ? '#ffd66532' : '#affff318');
      ctx.strokeStyle = b.dome ? '#ffda75' : '#aafff3'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  drawBrush(ctx, brush, 1, profile.map, brushAt(a));
  drawBrush(ctx, temporaryBrush, 1, 5, brushAt(a));

  // Отруйний туман по краях у режимі Зіткнення
  if (showdown() && stormInset > 1) {
    ctx.fillStyle = '#6f2da866';
    ctx.fillRect(0, 0, W, stormInset);
    ctx.fillRect(0, H - stormInset, W, stormInset);
    ctx.fillRect(0, stormInset, stormInset, H - stormInset * 2);
    ctx.fillRect(W - stormInset, stormInset, stormInset, H - stormInset * 2);
    ctx.strokeStyle = '#bc7aff'; ctx.lineWidth = 3;
    ctx.strokeRect(stormInset, stormInset, W - stormInset * 2, H - stormInset * 2);
  }

  if (brushAt(a).length) {
    ctx.strokeStyle = '#efff9c'; ctx.lineWidth = 2; ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.arc(a.x, a.y + 7, 25, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
  if (profile.rule === 1) {
    const p = flag.carrier || flag;
    banner(ctx, p.x + 6, p.y - (flag.carrier ? 14 : 0), profile.banner, .95);
    if (a === flag.carrier) {
      ctx.strokeStyle = '#fff1a2'; ctx.lineWidth = 3; ctx.setLineDash([4, 9]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y + 18); ctx.lineTo(a.base.x, a.base.y); ctx.stroke(); ctx.setLineDash([]);
    } else if (Math.abs(p.x - a.x) > vw / 2 - 25) {
      const side = p.x > a.x ? 1 : -1;
      banner(ctx, Math.max(camX + 12, Math.min(camX + vw - 30, a.x + side * vw)), camY + vh / 2, profile.banner, .6);
    }
  }
  for (const shot of shots) {
    const r = shot.radius || (shot.damage > 1 ? 8 : shot.slow ? 4 : 5);
    oval(ctx, shot.x, shot.y, r, r, shot.color || heroes[shot.owner.kind].color);
  }
  for (const p of particles) oval(ctx, p.x, p.y, p.r * Math.min(1, p.t * 3), p.r * Math.min(1, p.t * 3), p.color);
  for (const r of rings) {
    ctx.strokeStyle = r.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(r.x, r.y, Math.max(.1, r.r * (1 - r.t / .4)), 0, Math.PI * 2); ctx.stroke();
  }
  for (const ft of floatTexts) {
    ctx.save();
    ctx.font = '900 13px "SupercellHeadline", "SupercellText", system-ui';
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, ft.t * 2);
    ctx.strokeStyle = '#101b2d'; ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
  if (a.dead && !a.eliminated) {
    ctx.fillStyle = '#193443'; ctx.font = 'bold 20px "SupercellHeadline", "SupercellText", system-ui'; ctx.textAlign = 'center';
    ctx.fillText('Повернення за ' + Math.ceil(a.dead) + ' с', camX + vw / 2, camY + vh / 2);
  }
}

window.addEventListener('keydown', e => {
  if (state !== 'play') return;
  if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  keys.add(e.code);
  if (e.code === 'KeyE' && !e.repeat) cast(units[0]);
  if (e.code === 'Escape') pause();
});
window.addEventListener('keyup', e => keys.delete(e.code));

const pad = $('stick');
function slide(e) {
  if (e.pointerId !== pointer) return;
  const r = pad.getBoundingClientRect(), travel = r.width * .29, x = (e.clientX - r.left - r.width / 2) / travel, y = (e.clientY - r.top - r.height / 2) / travel, d = Math.max(1, Math.hypot(x, y));
  moveStick = [x / d, y / d];
  pad.firstElementChild.style.transform = 'translate(' + moveStick[0] * travel + 'px,' + moveStick[1] * travel + 'px)';
}
pad.onpointerdown = e => {
  if (pointer !== null || state !== 'play') return;
  pointer = e.pointerId;
  try { pad.setPointerCapture(pointer); } catch {}
  slide(e);
};
pad.onpointermove = slide;
pad.onpointerup = pad.onpointercancel = pad.onlostpointercapture = () => {
  pointer = null; moveStick = [0, 0];
  if (pad.firstElementChild) pad.firstElementChild.style.transform = '';
};

const fireBtn = $('fire');
fireBtn.onpointerdown = e => {
  e.preventDefault();
  held = true;
  if (state === 'play' && units[0]) fire(units[0]);
  try { fireBtn.setPointerCapture(e.pointerId); } catch {}
};
fireBtn.onpointerup = fireBtn.onpointercancel = fireBtn.onlostpointercapture = () => { held = false; };
$('super').onclick = () => cast(units[0]);

$('help').textContent = matchMedia('(pointer:coarse)').matches
  ? 'Джойстик — рух · Утримуй «Вогонь» для автоатаки та перевірки кущів'
  : 'WASD або стрілки — рух · Пробіл — атака · E — здібність';

// --- ЗБЕРЕЖЕННЯ ПРОГРЕСУ (КОД, ФАЙЛ .JSON, QR/ПОСИЛАННЯ) ---
$('exportProgress').onclick = () => {
  const json = JSON.stringify(profile);
  $('backupText').value = json;
  $('backupText').select();
  if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
  $('backupStatus').textContent = 'Код скопійовано в буфер обміну!';
};

if ($('downloadSave')) {
  $('downloadSave').onclick = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'iskra-arena-save.json';
    a.click();
    URL.revokeObjectURL(a.href);
    $('backupStatus').textContent = 'Файл збереження завантажено!';
  };
}

if ($('uploadSaveBtn') && $('uploadSaveInput')) {
  $('uploadSaveBtn').onclick = () => $('uploadSaveInput').click();
  $('uploadSaveInput').onchange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      $('backupText').value = String(reader.result || '');
      $('importProgress').click();
    };
    reader.readAsText(file);
  };
}

if ($('shareSaveLink')) {
  $('shareSaveLink').onclick = async () => {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(profile))));
    const url = location.origin + location.pathname + '?save=' + encoded;
    $('backupText').value = url;
    if (navigator.share) {
      try { await navigator.share({ title: 'Іскра Арена — Моє збереження', url }); return; } catch {}
    }
    if (navigator.clipboard) await navigator.clipboard.writeText(url).catch(() => {});
    $('backupStatus').textContent = 'Посилання зі збереженням скопійовано! Відкрий його на іншому пристрої.';
  };
}

$('importProgress').onclick = () => {
  let raw = $('backupText').value.trim();
  if (!raw || raw.length > 100000) { $('backupStatus').textContent = 'Встав код або посилання збереження.'; return; }
  try {
    if (raw.includes('?save=')) {
      const param = new URL(raw).searchParams.get('save');
      if (param) raw = decodeURIComponent(escape(atob(param)));
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.roster) || !Number.isInteger(parsed.cups)) throw Error('format');
    if (!confirm('Замінити поточний прогрес на імпортований?')) return;
    localStorage.setItem(profileKey, JSON.stringify(parsed));
    location.search = '';
    location.reload();
  } catch {
    $('backupStatus').textContent = 'Помилка формату. Потрібен код або файл Іскра Арени.';
  }
};

// Автоматичне підхоплення збереження з URL (?save=...)
try {
  const urlSave = new URLSearchParams(location.search).get('save');
  if (urlSave) {
    const decoded = decodeURIComponent(escape(atob(urlSave)));
    const parsed = JSON.parse(decoded);
    if (parsed && Array.isArray(parsed.roster) && Number.isInteger(parsed.cups)) {
      if (confirm('Знайдено прогрес у посиланні (' + parsed.cups + ' 🏆). Завантажити його?')) {
        localStorage.setItem(profileKey, JSON.stringify(parsed));
        history.replaceState(null, '', location.pathname);
        location.reload();
      } else {
        history.replaceState(null, '', location.pathname);
      }
    }
  }
} catch {}

if ($('resetCache')) {
  $('resetCache').onclick = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch {}
    location.reload();
  };
}

if ($('soundToggle')) {
  updateSoundUI();
  $('soundToggle').onclick = () => {
    soundMuted = !soundMuted;
    try { localStorage.setItem('iskra.muted', soundMuted ? '1' : '0'); } catch {}
    updateSoundUI();
    if (!soundMuted) sfx('tap');
  };
}

document.querySelectorAll('.tab-btn').forEach(b => {
  b.addEventListener('click', () => { sfx('tap'); setTab(b.dataset.tab); });
});
document.querySelectorAll('[data-goto]').forEach(b => {
  b.addEventListener('click', () => { sfx('tap'); setTab(b.dataset.goto); });
});

setTab('play');
lobby();
function frame(now) {
  const dt = Math.min(.034, (now - last) / 1000);
  last = now;
  if (state === 'play' && dt > 0) { update(dt); draw(); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
