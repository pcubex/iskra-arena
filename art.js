'use strict';
function poly(c, pts, fill, edge) {
  c.beginPath();
  pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (edge) { c.strokeStyle = edge; c.lineWidth = 1.6; c.stroke(); }
}
function oval(c, x, y, rx, ry, fill, edge) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
  c.fillStyle = fill;
  c.fill();
  if (edge) { c.strokeStyle = edge; c.lineWidth = 1.6; c.stroke(); }
}
function box(c, x, y, w, h, r, col, edge) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = col;
  c.fill();
  if (edge) { c.strokeStyle = edge; c.lineWidth = 1.6; c.stroke(); }
}
function star(c, x, y, r, col) {
  poly(c, Array.from({ length: 10 }, (_, i) => {
    const a = i * Math.PI / 5 - Math.PI / 2, l = i % 2 ? r * .44 : r;
    return [x + l * Math.cos(a), y + l * Math.sin(a)];
  }), col);
}

// ОНОВЛЕНІ ДЕТАЛІЗОВАНІ СПРАЙТИ УСІХ 8 ГЕРОЇВ
function sprite(c, k, x, y, scale = 1, outfit = 0, flip = false) {
  c.save();
  c.translate(x, y);
  c.scale(flip ? -scale : scale, scale);
  const ink = '#192536', color = heroes[k].color;
  oval(c, 0, 17, 20, 5, '#19253642');

  if (k === 0) {
    // РИСЬ: бірюзова кібер-рись із китичками на вухах, шарфом, бурштиновими очима та енергетичними кігтями
    box(c, -12, 9, 8, 10, 4, ink); box(c, 4, 9, 8, 10, 4, ink);
    oval(c, -8, 17, 4, 2, '#b9fff4'); oval(c, 8, 17, 4, 2, '#b9fff4');
    // Шарф, що майорить позаду
    poly(c, [[-8, 1], [-29, 4], [-23, 9], [-31, 14], [-7, 10]], outfit ? '#ffd45e' : '#ff6c52', ink);
    // Тулуб у жилеті
    oval(c, 0, 6, 15, 12, '#1e425e', ink);
    oval(c, 0, 6, 9, 8, '#cffdf4');
    // Вусаті щічки та голова
    poly(c, [[-19, -4], [-23, -8], [-17, -11], [17, -11], [23, -8], [19, -4], [14, 2], [-14, 2]], color, ink);
    // Гострі вуха з чорними китичками
    poly(c, [[-16, -12], [-20, -29], [-6, -18]], color, ink);
    poly(c, [[16, -12], [20, -29], [6, -18]], color, ink);
    poly(c, [[-20, -29], [-22, -34], [-17, -31]], ink);
    poly(c, [[20, -29], [22, -34], [17, -31]], ink);
    poly(c, [[-14, -15], [-16, -24], [-8, -17]], '#ffb4c4');
    poly(c, [[14, -15], [16, -24], [8, -17]], '#ffb4c4');
    // Голова та маска
    oval(c, 0, -10, 18, 15, color, ink);
    oval(c, 0, -5, 12, 7.5, '#f6f9ec');
    // Виразні котячі бурштинові очі
    oval(c, -7, -11, 3.8, 4.2, '#ffcf4b', ink);
    oval(c, 7, -11, 3.8, 4.2, '#ffcf4b', ink);
    oval(c, -6.5, -11, 1.8, 3, ink);
    oval(c, 7.5, -11, 1.8, 3, ink);
    oval(c, -7.5, -12.5, 1, 1, '#fff'); oval(c, 6.5, -12.5, 1, 1, '#fff');
    poly(c, [[-2.8, -6.5], [2.8, -6.5], [0, -3.5]], '#294257');
    // Смужки на лобі
    box(c, -1.5, -21, 3, 5, 1.5, '#1e6e75');
  } else if (k === 1) {
    // БАСТІОН: золотий лицар-мех із масивними наплічниками, реактором на грудях і дробовиком
    box(c, -13, 9, 9, 10, 4, ink); box(c, 4, 9, 9, 10, 4, ink);
    // Масивні наплічники
    box(c, -25, -6, 12, 18, 5, '#d67e2c', ink);
    box(c, 13, -6, 12, 18, 5, '#d67e2c', ink);
    box(c, -23, -4, 8, 7, 3, '#ffe38f');
    // Броньований корпус
    box(c, -16, -16, 32, 30, 8, color, ink);
    box(c, -11, 1, 22, 10, 4, '#8c4b2b', ink);
    // Енергетичне бурштинове ядро в центрі
    oval(c, 0, 6, 4.5, 4.5, '#7afff0', ink);
    // Шолом і світиться візор
    box(c, -14, -21, 28, 19, 7, '#ffcf6e', ink);
    box(c, -11, -15, 22, 9, 4, ink);
    box(c, -8, -13, 6.5, 4, 1.5, '#68fff2');
    box(c, 1.5, -13, 6.5, 4, 1.5, '#68fff2');
    // Гребінь шолома та гармата
    poly(c, [[-5, -21], [0, -29], [5, -21]], '#ff6f47', ink);
    box(c, 15, 0, 13, 8, 3, '#3b4e68', ink);
  } else if (k === 2) {
    // КОМЕТА: зоряна чарівниця в гострому капелюсі, з золотим півмісяцем та магічним посохом
    box(c, -11, 9, 7, 10, 3.5, ink); box(c, 4, 9, 7, 10, 3.5, ink);
    // Зоряна мантія
    poly(c, [[-17, 14], [-12, -3], [12, -3], [17, 14], [7, 12], [0, 15], [-7, 12]], '#5e389c', ink);
    poly(c, [[-6, -1], [0, 13], [6, -1]], '#a575f5');
    // Обличчя та волосся
    oval(c, 0, -8, 13, 11.5, '#ffe0c2', ink);
    poly(c, [[-13, -10], [-16, 2], [-10, 0]], '#e2b5ff', ink);
    poly(c, [[13, -10], [16, 2], [10, 0]], '#e2b5ff', ink);
    // Великі фіолетові очі
    oval(c, -5, -8, 3, 3.5, '#4b2382'); oval(c, 5, -8, 3, 3.5, '#4b2382');
    oval(c, -5.8, -9.2, 1.1, 1.1, '#fff'); oval(c, 4.2, -9.2, 1.1, 1.1, '#fff');
    oval(c, -8, -4.5, 2.2, 1.2, '#ffa3c2'); oval(c, 8, -4.5, 2.2, 1.2, '#ffa3c2');
    // Чарівний капелюх із золотою стрічкою
    poly(c, [[-22, -13], [0, -18], [22, -13], [12, -10], [-12, -10]], '#47287a', ink);
    poly(c, [[-13, -14], [-2, -33], [14, -30], [7, -21], [12, -14]], color, ink);
    star(c, 14, -30, 5, '#ffe680');
    // Зоряний посох
    box(c, 16, -12, 3.5, 25, 1.5, '#8c5638', ink);
    star(c, 17.8, -14, 7.5, '#ffdf6b');
  } else if (k === 3) {
    // ВІХОЛА: полярна лисичка-лучниця у хутряному капюшоні з крижаною короною
    box(c, -11, 9, 7, 10, 3.5, ink); box(c, 4, 9, 7, 10, 3.5, ink);
    // Зимовий плащ із білим хутром
    poly(c, [[-17, 13], [-13, -4], [13, -4], [17, 13]], '#26689e', ink);
    oval(c, 0, 0, 12, 4.5, '#f2fbff', ink);
    // Капюшон і біла лисяча мордочка
    oval(c, 0, -10, 17, 15, '#4ebaf0', ink);
    oval(c, 0, -9, 13, 11.5, '#eefaff', ink);
    // Крижані вушка та корона-сніжинка
    poly(c, [[-14, -17], [-18, -30], [-6, -21]], '#87e4ff', ink);
    poly(c, [[14, -17], [18, -30], [6, -21]], '#87e4ff', ink);
    poly(c, [[-5, -20], [0, -32], [5, -20]], '#ccf6ff', ink);
    // Блакитні очі та носик
    oval(c, -5.5, -9, 3, 3.4, '#16456b'); oval(c, 5.5, -9, 3, 3.4, '#16456b');
    oval(c, -6.2, -10.2, 1.1, 1.1, '#fff'); oval(c, 4.8, -10.2, 1.1, 1.1, '#fff');
    poly(c, [[-2, -5.5], [2, -5.5], [0, -3.5]], '#29587d');
    star(c, 19, 1, 7.5, '#bef4ff');
  } else if (k === 4) {
    // ГРІМ: вікінг-громовержець із крилатим шоломом, рудою бородою та молотом блискавок
    box(c, -13, 9, 9, 10, 4, ink); box(c, 4, 9, 9, 10, 4, ink);
    // Плащ і обладунок із поясом-блискавкою
    poly(c, [[-19, 13], [-15, -5], [15, -5], [19, 13]], '#8a2f3d', ink);
    box(c, -14, -3, 28, 16, 6, '#3b4f6b', ink);
    box(c, -14, 6, 28, 4.5, 2, '#d99a3d', ink);
    // Обличчя та пишна руда борода
    oval(c, 0, -9, 14, 11, '#ffd4ad', ink);
    poly(c, [[-13, -6], [-15, 4], [-6, 9], [0, 6], [6, 9], [15, 4], [13, -6], [6, -3], [-6, -3]], '#d95b38', ink);
    // Суворі очі під бровами
    box(c, -8, -11, 5.5, 3.5, 1.2, ink); box(c, 2.5, -11, 5.5, 3.5, 1.2, ink);
    poly(c, [[-10, -13], [-2, -11], [-2, -13]], '#8c311c');
    poly(c, [[10, -13], [2, -11], [2, -13]], '#8c311c');
    // Шолом із золотими рогами-блискавками
    poly(c, [[-15, -12], [-12, -23], [0, -25], [12, -23], [15, -12]], '#586f8c', ink);
    poly(c, [[-13, -17], [-24, -27], [-17, -12]], '#ffe074', ink);
    poly(c, [[13, -17], [24, -27], [17, -12]], '#ffe074', ink);
    // Молот Грому в руці
    box(c, 16, -5, 4, 18, 1.5, '#7a492e', ink);
    box(c, 10, -14, 16, 10, 3, '#8fb2d4', ink);
    star(c, 18, -9, 4.5, '#ffef8a');
  } else if (k === 5) {
    // ВЕРБА: лісова дріада-цілителька з вінком із листя та рожевою квіткою лотоса
    box(c, -11, 9, 7, 10, 3.5, ink); box(c, 4, 9, 7, 10, 3.5, ink);
    // Смарагдова сукня з листям
    poly(c, [[-17, 14], [-12, -3], [12, -3], [17, 14]], '#2d7a5e', ink);
    poly(c, [[-8, -1], [0, 13], [8, -1]], '#b6f299');
    // Обличчя та зелене волосся
    oval(c, 0, -9, 14, 12, '#ffe4c4', ink);
    poly(c, [[-15, -10], [-18, 5], [-11, 2]], '#59b872', ink);
    poly(c, [[15, -10], [18, 5], [11, 2]], '#59b872', ink);
    // Смарагдові очі та усмішка
    oval(c, -5.5, -9, 3, 3.4, '#1d5940'); oval(c, 5.5, -9, 3, 3.4, '#1d5940');
    oval(c, -6.2, -10.2, 1.1, 1.1, '#fff'); oval(c, 4.8, -10.2, 1.1, 1.1, '#fff');
    oval(c, -8.5, -5.5, 2.2, 1.2, '#ff9ebb'); oval(c, 8.5, -5.5, 2.2, 1.2, '#ff9ebb');
    // Вінок із листя та квітки на голові
    poly(c, [[-16, -13], [-10, -24], [0, -19], [10, -24], [16, -13], [8, -14], [0, -17], [-8, -14]], color, ink);
    oval(c, 0, -22, 5.5, 5.5, '#ff8eb5', ink);
    oval(c, 0, -22, 2.5, 2.5, '#ffe878');
    // Посох із квіткою життя
    box(c, 16, -9, 3.5, 22, 1.5, '#6e4c36', ink);
    oval(c, 17.8, -12, 6, 6, '#ff9ec4', ink);
    oval(c, 17.8, -12, 2.8, 2.8, '#fff18f');
  } else if (k === 6) {
    // ПАНДІ: добродушний бамбуковий охоронець
    oval(c, -18, -12, 9, 9, '#283b46'); oval(c, 19, -13, 9, 9, '#283b46');
    oval(c, 0, 7, 19, 16, '#263a43'); oval(c, 0, 6, 16, 13, '#faf5dc');
    box(c, -15, 7, 7, 12, 4, '#263a43'); box(c, 9, 7, 7, 12, 4, '#263a43');
    oval(c, 0, -9, 23, 20, '#293e47'); oval(c, 0, -10, 20, 18, '#faf9e8');
    oval(c, -9, -12, 7, 8, '#2b4247'); oval(c, 9, -12, 7, 8, '#2b4247');
    oval(c, -8, -12, 2.8, 3.4, '#f7faf1'); oval(c, 9, -12, 2.8, 3.4, '#f7faf1');
    oval(c, 0, -4, 4.5, 3.2, '#2b4247'); oval(c, 0, 1, 2.4, 1, '#d67f82');
    poly(c, [[-17, 5], [14, 5], [19, 12], [-11, 13]], '#f9c86e', '#805648');
    box(c, 16, -19, 5, 31, 2, '#4c9f68'); box(c, 16, -18, 5, 5, 2, '#9de18b');
    box(c, 15, -6, 7, 4, 2, '#b4f596'); star(c, -10, 5, 3, '#ffefb3');
  } else if (k === 7) {
    // КОТИК: чорно-білий пухнастик сина (tuxedo cat) з білою мордочкою, рожевим носиком та зеленими очима
    const fur = '#1e2532', white = '#faf7f0', nose = '#f598aa';
    poly(c, [[-12, 10], [-26, 6], [-30, -4], [-24, -7], [-20, 3], [-10, 6]], fur, '#131822');
    oval(c, -26, -5, 3.5, 3.5, white);
    oval(c, 0, 7, 16, 13, fur);
    oval(c, 1, 8, 10, 9, white);
    box(c, -13, 8, 7, 10, 3.5, fur); box(c, 7, 8, 7, 10, 3.5, fur);
    oval(c, -9.5, 16, 3, 2, white); oval(c, 10.5, 16, 3, 2, white);
    poly(c, [[-17, -14], [-19, -32], [-5, -22]], fur, '#131822');
    poly(c, [[17, -14], [19, -32], [5, -22]], fur, '#131822');
    poly(c, [[-15, -16], [-16, -27], [-7, -20]], white);
    poly(c, [[15, -16], [16, -27], [7, -20]], white);
    oval(c, 0, -11, 20, 17, fur);
    poly(c, [[0, -18], [-12, -3], [12, -3]], white);
    oval(c, 0, -5, 12, 8.5, white);
    oval(c, -8, -12, 3.6, 3.8, '#4f8062'); oval(c, 8, -12, 3.6, 3.8, '#4f8062');
    oval(c, -8, -12, 2.4, 2.7, '#111722'); oval(c, 8, -12, 2.4, 2.7, '#111722');
    oval(c, -9, -13, 1, 1, '#ffffff'); oval(c, 7, -13, 1, 1, '#ffffff');
    poly(c, [[-3.2, -7], [3.2, -7], [0, -3.5]], nose);
    c.strokeStyle = '#d6778a'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(0, -3.5); c.lineTo(-2.5, -1.5); c.moveTo(0, -3.5); c.lineTo(2.5, -1.5); c.stroke();
  }
  if (outfit) {
    poly(c, [[-13, 2], [11, 6], [12, 10], [-11, 6]], outfit === 2 ? '#ff94c4' : '#ffdc72');
    star(c, 7, 7, 3, '#fffad4');
  }
  c.restore();
}

function banner(c, x, y, kind = 0, scale = 1) {
  c.save(); c.translate(x, y); c.scale(scale, scale);
  box(c, -2, -32, 4, 34, 2, '#333c55');
  poly(c, [[1, -31], [25, -29], [19, -21], [26, -16], [1, -18]], flagColors[kind][0]);
  poly(c, [[1, -23], [21, -22], [24, -18], [1, -20]], flagColors[kind][1]);
  c.restore();
}

function terrain(c, m) {
  const d = maps[m];
  c.fillStyle = d.floor;
  c.fillRect(0, 0, W, H);
  c.strokeStyle = '#ffffff15'; c.lineWidth = 2;
  for (let x = 22; x < W; x += 46) for (let y = 16; y < H; y += 46) {
    const jitter = (x * 13 + y * 7) % 13;
    box(c, x + jitter, y + (jitter % 5), 21, 12, 4, '#ffffff0b');
    if ((x + y) % 4 === 0) oval(c, x + 31, y + 23, 3, 1.5, '#182e3a1b');
  }
  c.beginPath(); c.roundRect(18, 18, W - 36, H - 36, 24); c.stroke();
  for (let i = 0; i < 260; i++) {
    const x = (i * 79 + 17) % W, y = (i * i * 13 + i * 71) % H;
    oval(c, x, y, 2 + i % 5, 1.4, i % 2 ? '#fff6d430' : '#34384a1f');
  }
  c.strokeStyle = '#fffaf014'; c.lineWidth = 18;
  c.beginPath(); c.moveTo(76, 270); c.bezierCurveTo(260, 125, 625, 395, 850, 270); c.stroke();
  if (m === 1) {
    for (const y of [238, 408]) for (let x = 372; x < 545; x += 13) box(c, x, y, 12, y === 238 ? 58 : 20, 2, '#b77b55');
  }

  // Вода / енергетичні калюжі (непрохідні для ніг, але прострілюються кулями)
  const waterCols = m === 1 ? ['#d95338', '#ff9b52'] : m === 2 || m === 4 ? ['#51428f', '#8e7dff'] : ['#237a9c', '#5ce1e6'];
  for (const [wx, wy, ww, wh] of (d.water || [])) {
    box(c, wx - 3, wy - 2, ww + 6, wh + 6, 18, '#13283d45');
    box(c, wx, wy, ww, wh, 16, waterCols[0]);
    box(c, wx + 5, wy + 5, ww - 10, wh - 12, 13, waterCols[1]);
    oval(c, wx + ww * 0.32, wy + wh * 0.38, ww * 0.16, 3.5, '#ffffff65');
    oval(c, wx + ww * 0.68, wy + wh * 0.62, ww * 0.12, 2.5, '#ffffff55');
  }

  // Тверді стіни
  for (const [x, y, w, h] of d.blocks) {
    box(c, x + 5, y + 10, w, h, 12, '#192f4757');
    box(c, x + 1, y + 5, w, h, 10, '#21263869');
    box(c, x, y, w, h, 9, d.shade);
    if (m === 1) {
      box(c, x + 2, y + 2, w - 4, h - 5, 8, '#563f55');
      for (let i = 10; i < w - 8; i += 24) poly(c, [[x + i, y], [x + i + 15, y], [x + i + 6, y + 10]], '#f5bd85');
    } else {
      box(c, x, y - 4, w, h - 7, 10, d.wall);
      box(c, x + 7, y + 4, w - 14, 3, 2, '#ffffff45');
      for (let i = 12; i < w - 8; i += 24) {
        if (m === 2) {
          oval(c, x + i, y + 8, 6, 5, '#c79cce');
          oval(c, x + i - 1, y + 6, 2, 1.5, '#ffeab8');
        } else {
          poly(c, [[x + i, y + 8], [x + i - 5, y + 1], [x + i, y + 4], [x + i + 4, y - 2], [x + i + 5, y + 6]], '#5a997e');
        }
      }
    }
  }
  for (let i = 0; i < 26; i++) {
    let x = i * 77 % W, y = i % 2 ? H - 8 : 11;
    if (m === 0) poly(c, [[x, y], [x - 4, y - 7], [x - 1, y - 13], [x + 2, y - 6], [x + 7, y - 12], [x + 4, y]], '#e78075');
    if (m === 2) { oval(c, x, y, 7, 4, '#df92ca'); oval(c, x + 9, y - 5, 2, 2, '#ffe48b'); }
  }
}

function drawJumpPads(c, pads, clock = 0) {
  for (const [px, py, dx, dy] of (pads || [])) {
    c.save();
    c.translate(px, py);
    box(c, -18, -16, 36, 32, 9, '#1c2d42');
    box(c, -15, -13, 30, 26, 7, '#345375', '#75a8d6');
    const pulse = 1 + Math.sin(clock * 5) * 0.08;
    c.scale(pulse, pulse);
    c.rotate(Math.atan2(dy, dx));
    poly(c, [[-7, -8], [9, 0], [-7, 8], [-3, 0]], '#ffe169', '#2b3d54');
    c.restore();
  }
}

function drawCrate(c, cr) {
  const { x, y, kind, hp, max } = cr;
  if (kind === 'barrel') {
    oval(c, x, y + 12, 16, 6, '#18243655');
    oval(c, x, y, 15, 16, '#b83737', '#2b1820');
    box(c, x - 14, y - 8, 28, 4, 2, '#ffd269');
    box(c, x - 14, y + 4, 28, 4, 2, '#ffd269');
    star(c, x, y, 6, '#ffe885');
  } else {
    box(c, x - 15, y - 13, 30, 28, 6, '#18243655');
    box(c, x - 15, y - 15, 30, 27, 6, '#9e6336', '#3d2516');
    box(c, x - 12, y - 12, 24, 21, 4, '#c98549');
    poly(c, [[x - 11, y - 11], [x + 11, y + 8], [x + 8, y + 10], [x - 12, y - 8]], '#875129');
    star(c, x, y - 2, 6.5, '#7affea');
  }
  if (hp < max) {
    box(c, x - 14, y - 23, 28, 4.5, 2, '#1f2e42');
    box(c, x - 13, y - 22, 26 * (hp / max), 2.5, 1, '#ffcf66');
  }
}

function mapPreview(c, map) {
  const d = maps[map];
  c.fillStyle = d.sky; c.fillRect(0, 0, 180, 88);
  oval(c, 137, 22, 13, 13, map === 2 ? '#fff6bd' : '#ffedac');
  if (map === 0) {
    poly(c, [[0, 50], [38, 33], [63, 43], [96, 29], [120, 40], [180, 32], [180, 88], [0, 88]], '#438f82');
    poly(c, [[0, 55], [63, 46], [102, 53], [180, 42], [180, 88], [0, 88]], '#4ad3bd');
    poly(c, [[0, 76], [53, 59], [86, 65], [132, 63], [180, 54], [180, 88], [0, 88]], '#ffe1a0');
    for (const x of [24, 39, 48]) poly(c, [[x, 69], [x - 6, 54], [x - 2, 46], [x + 6, 52], [x + 7, 66]], '#47cabb', '#247c83');
  } else if (map === 1) {
    poly(c, [[0, 39], [36, 23], [63, 24], [72, 48], [110, 41], [132, 14], [165, 16], [180, 28], [180, 88], [0, 88]], '#ce8065');
    poly(c, [[0, 62], [36, 39], [60, 41], [73, 61], [111, 65], [143, 30], [180, 34], [180, 88], [0, 88]], '#995465');
    poly(c, [[44, 88], [67, 54], [96, 51], [139, 88]], '#583e58');
    for (let i = 0; i < 10; i++) box(c, 50 + i * 7, 58 + Math.sin(i / 3) * 3, 7, 5, 1, '#ffca82');
  } else if (map === 2) {
    poly(c, [[0, 61], [32, 36], [63, 54], [105, 31], [143, 54], [180, 36], [180, 88], [0, 88]], '#65558e');
    for (const [x, y, r] of [[20, 68, 14], [50, 75, 19], [123, 65, 12], [149, 80, 18]]) {
      box(c, x - 2, y, 4, 13, 2, '#f8cfdd'); oval(c, x, y, r, r * .43, '#e49dc4'); oval(c, x - 3, y - 1, 3, 2, '#fff1bf');
    }
    for (let i = 0; i < 14; i++) oval(c, 7 + i * 13, 34 + (i * 23) % 45, 1.7, 1.7, '#fff7aa');
  } else {
    poly(c, [[0, 60], [38, 33], [68, 52], [102, 23], [130, 51], [180, 30], [180, 88], [0, 88]], d.mount);
    for (let i = 0; i < 7; i++) box(c, 12 + i * 25, 55 + (i % 3) * 7, 15, 16, 3, d.wall);
  }
  const patches = brushLayouts[map] || [];
  for (let i = 0; i < Math.min(4, patches.length); i++) {
    const p = patches[i], x = p[0] / W * 180, y = 56 + (p[1] / H) * 22;
    oval(c, x, y, 10, 4, '#2d7454'); oval(c, x, y - 2, 7, 3, '#98e8a3');
  }
}

function zombieSprite(c, z) {
  c.save(); c.translate(z.x, z.y); c.scale(Math.cos(z.heading) < 0 ? -1 : 1, 1);
  oval(c, 0, 14, 15, 5, '#25304745');
  box(c, -9, 8, 6, 8, 2, '#33374b'); box(c, 3, 8, 7, 8, 2, '#33374b');
  box(c, -10, -2, 22, 15, 4, '#60537a'); box(c, 5, 1, z.windup > 0 ? 18 : 13, 5, 2, '#a3cf79');
  box(c, -10, -18, 21, 19, 5, '#365849'); box(c, -9, -17, 19, 16, 4, '#accf80');
  box(c, -8, -18, 15, 4, 2, '#626878'); box(c, -3, -11, 4, 4, 1, '#fff4ba'); box(c, 5, -10, 4, 4, 1, '#ffdb8f');
  box(c, 1, -4, 7, 2, 1, '#405044');
  c.restore();
}

function drawBrush(c, patches, layer, map, playerPatches = []) {
  const palette = brushColors[map] || brushColors[5];
  c.save();
  for (const p of patches) {
    const [x, y, w, h] = p, own = playerPatches.includes(p), waves = Math.sin((typeof left === 'number' ? left : 0) * 1.4 + x * .13) * 1.2;
    if (!layer) {
      box(c, x + 2, y + 7, w, h - 5, 14, '#163d354a');
      box(c, x, y, w, h - 7, 14, palette[0]);
      for (let i = 0; i < Math.max(5, Math.floor(w / 15)); i++) {
        const px = x + 11 + (i * 17) % (w - 18), py = y + 11 + (i * 29) % (h - 23);
        oval(c, px, py, 9 + (i % 3) * 2, 7, palette[1]);
        poly(c, [[px - 6, py + 5], [px + 2, py - 7], [px + 8, py + 5]], palette[0]);
      }
      if (p.length === 5) for (let i = 0; i < 4; i++) star(c, x + 18 + i * 31, y + 12 + i % 2 * 23, 3, '#f6ffb5');
    } else {
      c.globalAlpha = own ? .24 : .62;
      for (let i = 0; i < Math.max(5, Math.floor(w / 18)); i++) {
        const px = x + 11 + (i * 19) % (w - 12), py = y + 9 + (i * 11) % (h - 15);
        oval(c, px, py + waves, 9 + i % 2 * 3, 5.3, palette[1]);
        poly(c, [[px - 4, py + waves], [px, py - 7 + waves], [px + 4, py + waves]], i % 3 ? '#b5ee8b' : '#d9f6a7');
      }
      c.globalAlpha = 1;
    }
  }
  c.restore();
}
