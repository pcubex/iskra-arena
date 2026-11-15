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

// СПРАЙТИ УСІХ 8 ГЕРОЇВ З АНІМАЦІЄЮ БІГУ, ДИХАННЯ, ВІДДАЧІ ЗБРОЇ ТА ЕФЕКТУ ВЛУЧАННЯ
function sprite(c, k, x, y, scale = 1, outfit = 0, flip = false, anim = null) {
  c.save();
  c.translate(x, y);
  const now = performance.now() * 0.001;
  const moving = anim ? anim.moving : false;
  const phase = anim && anim.phase !== undefined ? anim.phase : now * 3.2;
  const recoil = anim ? (anim.recoil || 0) : 0;
  const hurt = anim ? (anim.hurt || 0) : 0;

  // Живе похитування при бігу або плавне дихання в лобі/на місці
  const stride = moving ? Math.sin(phase) : 0;
  const bob = moving ? -Math.abs(Math.sin(phase)) * 2.6 : Math.sin(now * 3.2 + k) * 0.9;
  const tilt = moving ? stride * 0.08 : Math.sin(now * 2 + k) * 0.02;
  const footL = moving ? stride * 3.5 : 0;
  const footR = moving ? -stride * 3.5 : 0;
  const kick = recoil > 0 ? Math.min(1, recoil * 7) : 0;

  c.scale(flip ? -scale : scale, scale);
  const ink = '#192536', color = heroes[k].color;

  // Тінь на землі (пульсує в такт стрибкам/крокам)
  oval(c, 0, 17.5, 20 - Math.abs(bob) * 0.7, 5, '#19253645');

  c.translate(-kick * 2.2, bob);
  c.rotate(tilt);

  if (k === 0) {
    // РИСЬ: бірюзова кібер-рись із китичками на вухах, шарфом, бурштиновими очима
    box(c, -12, 9 + footL, 8, 10, 4, ink); box(c, 4, 9 + footR, 8, 10, 4, ink);
    oval(c, -8, 17 + footL, 4, 2, '#b9fff4'); oval(c, 8, 17 + footR, 4, 2, '#b9fff4');
    const scarfWave = Math.sin(now * 9 + phase) * 2.2;
    poly(c, [[-8, 1], [-29, 4 + scarfWave], [-23, 9 + scarfWave * 0.7], [-31, 14 + scarfWave], [-7, 10]], outfit ? '#ffd45e' : '#ff6c52', ink);
    oval(c, 0, 6, 15, 12, '#1e425e', ink);
    oval(c, 0, 6, 9, 8, '#cffdf4');
    poly(c, [[-19, -4], [-23, -8], [-17, -11], [17, -11], [23, -8], [19, -4], [14, 2], [-14, 2]], color, ink);
    poly(c, [[-16, -12], [-20, -29], [-6, -18]], color, ink);
    poly(c, [[16, -12], [20, -29], [6, -18]], color, ink);
    poly(c, [[-20, -29], [-22, -34], [-17, -31]], ink);
    poly(c, [[20, -29], [22, -34], [17, -31]], ink);
    poly(c, [[-14, -15], [-16, -24], [-8, -17]], '#ffb4c4');
    poly(c, [[14, -15], [16, -24], [8, -17]], '#ffb4c4');
    oval(c, 0, -10, 18, 15, color, ink);
    oval(c, 0, -5, 12, 7.5, '#f6f9ec');
    oval(c, -7, -11, 3.8, 4.2, '#ffcf4b', ink);
    oval(c, 7, -11, 3.8, 4.2, '#ffcf4b', ink);
    oval(c, -6.5, -11, 1.8, 3, ink);
    oval(c, 7.5, -11, 1.8, 3, ink);
    oval(c, -7.5, -12.5, 1, 1, '#fff'); oval(c, 6.5, -12.5, 1, 1, '#fff');
    poly(c, [[-2.8, -6.5], [2.8, -6.5], [0, -3.5]], '#294257');
    box(c, -1.5, -21, 3, 5, 1.5, '#1e6e75');
    if (kick > 0.1) star(c, 18, 2, 5.5, '#7afff0');
  } else if (k === 1) {
    // БАСТІОН: золотий лицар-мех із наплічниками, реактором і дробовиком
    box(c, -13, 9 + footL, 9, 10, 4, ink); box(c, 4, 9 + footR, 9, 10, 4, ink);
    box(c, -25, -6 - stride * 1.2, 12, 18, 5, '#d67e2c', ink);
    box(c, 13, -6 + stride * 1.2, 12, 18, 5, '#d67e2c', ink);
    box(c, -23, -4 - stride * 1.2, 8, 7, 3, '#ffe38f');
    box(c, -16, -16, 32, 30, 8, color, ink);
    box(c, -11, 1, 22, 10, 4, '#8c4b2b', ink);
    oval(c, 0, 6, 4.5, 4.5, '#7afff0', ink);
    box(c, -14, -21, 28, 19, 7, '#ffcf6e', ink);
    box(c, -11, -15, 22, 9, 4, ink);
    box(c, -8, -13, 6.5, 4, 1.5, '#68fff2');
    box(c, 1.5, -13, 6.5, 4, 1.5, '#68fff2');
    poly(c, [[-5, -21], [0, -29], [5, -21]], '#ff6f47', ink);
    box(c, 15 - kick * 4, 0, 14, 8, 3, '#3b4e68', ink);
  } else if (k === 2) {
    // КОМЕТА: зоряна чарівниця в гострому капелюсі з магічним посохом
    box(c, -11, 9 + footL, 7, 10, 3.5, ink); box(c, 4, 9 + footR, 7, 10, 3.5, ink);
    poly(c, [[-17, 14], [-12, -3], [12, -3], [17, 14], [7, 12], [0, 15], [-7, 12]], '#5e389c', ink);
    poly(c, [[-6, -1], [0, 13], [6, -1]], '#a575f5');
    oval(c, 0, -8, 13, 11.5, '#ffe0c2', ink);
    poly(c, [[-13, -10], [-16, 2], [-10, 0]], '#e2b5ff', ink);
    poly(c, [[13, -10], [16, 2], [10, 0]], '#e2b5ff', ink);
    oval(c, -5, -8, 3, 3.5, '#4b2382'); oval(c, 5, -8, 3, 3.5, '#4b2382');
    oval(c, -5.8, -9.2, 1.1, 1.1, '#fff'); oval(c, 4.2, -9.2, 1.1, 1.1, '#fff');
    oval(c, -8, -4.5, 2.2, 1.2, '#ffa3c2'); oval(c, 8, -4.5, 2.2, 1.2, '#ffa3c2');
    poly(c, [[-22, -13], [0, -18], [22, -13], [12, -10], [-12, -10]], '#47287a', ink);
    poly(c, [[-13, -14], [-2, -33], [14, -30], [7, -21], [12, -14]], color, ink);
    star(c, 14, -30, 5, '#ffe680');
    box(c, 16 + kick * 2, -12 - kick * 3, 3.5, 25, 1.5, '#8c5638', ink);
    star(c, 17.8 + kick * 2, -14 - kick * 3, 7.5 + kick * 2, '#ffdf6b');
  } else if (k === 3) {
    // ВІХОЛА: полярна лисичка-лучниця у хутряному капюшоні
    box(c, -11, 9 + footL, 7, 10, 3.5, ink); box(c, 4, 9 + footR, 7, 10, 3.5, ink);
    poly(c, [[-17, 13], [-13, -4], [13, -4], [17, 13]], '#26689e', ink);
    oval(c, 0, 0, 12, 4.5, '#f2fbff', ink);
    oval(c, 0, -10, 17, 15, '#4ebaf0', ink);
    oval(c, 0, -9, 13, 11.5, '#eefaff', ink);
    poly(c, [[-14, -17], [-18, -30], [-6, -21]], '#87e4ff', ink);
    poly(c, [[14, -17], [18, -30], [6, -21]], '#87e4ff', ink);
    poly(c, [[-5, -20], [0, -32], [5, -20]], '#ccf6ff', ink);
    oval(c, -5.5, -9, 3, 3.4, '#16456b'); oval(c, 5.5, -9, 3, 3.4, '#16456b');
    oval(c, -6.2, -10.2, 1.1, 1.1, '#fff'); oval(c, 4.8, -10.2, 1.1, 1.1, '#fff');
    poly(c, [[-2, -5.5], [2, -5.5], [0, -3.5]], '#29587d');
    star(c, 19 + kick * 3, 1, 7.5 + kick * 2, '#bef4ff');
  } else if (k === 4) {
    // ГРІМ: вікінг-громовержець із крилатим шоломом, рудою бородою та молотом
    box(c, -13, 9 + footL, 9, 10, 4, ink); box(c, 4, 9 + footR, 9, 10, 4, ink);
    poly(c, [[-19, 13], [-15, -5], [15, -5], [19, 13]], '#8a2f3d', ink);
    box(c, -14, -3, 28, 16, 6, '#3b4f6b', ink);
    box(c, -14, 6, 28, 4.5, 2, '#d99a3d', ink);
    oval(c, 0, -9, 14, 11, '#ffd4ad', ink);
    poly(c, [[-13, -6], [-15, 4], [-6, 9], [0, 6], [6, 9], [15, 4], [13, -6], [6, -3], [-6, -3]], '#d95b38', ink);
    box(c, -8, -11, 5.5, 3.5, 1.2, ink); box(c, 2.5, -11, 5.5, 3.5, 1.2, ink);
    poly(c, [[-10, -13], [-2, -11], [-2, -13]], '#8c311c');
    poly(c, [[10, -13], [2, -11], [2, -13]], '#8c311c');
    poly(c, [[-15, -12], [-12, -23], [0, -25], [12, -23], [15, -12]], '#586f8c', ink);
    poly(c, [[-13, -17], [-24, -27], [-17, -12]], '#ffe074', ink);
    poly(c, [[13, -17], [24, -27], [17, -12]], '#ffe074', ink);
    c.save();
    c.translate(18, 2);
    c.rotate(kick * 0.45 - stride * 0.15);
    box(c, -2, -7, 4, 18, 1.5, '#7a492e', ink);
    box(c, -8, -16, 16, 10, 3, '#8fb2d4', ink);
    star(c, 0, -11, 4.5, '#ffef8a');
    c.restore();
  } else if (k === 5) {
    // ВЕРБА: лісова дріада-цілителька з вінком із листя та квіткою лотоса
    box(c, -11, 9 + footL, 7, 10, 3.5, ink); box(c, 4, 9 + footR, 7, 10, 3.5, ink);
    poly(c, [[-17, 14], [-12, -3], [12, -3], [17, 14]], '#2d7a5e', ink);
    poly(c, [[-8, -1], [0, 13], [8, -1]], '#b6f299');
    oval(c, 0, -9, 14, 12, '#ffe4c4', ink);
    poly(c, [[-15, -10], [-18, 5], [-11, 2]], '#59b872', ink);
    poly(c, [[15, -10], [18, 5], [11, 2]], '#59b872', ink);
    oval(c, -5.5, -9, 3, 3.4, '#1d5940'); oval(c, 5.5, -9, 3, 3.4, '#1d5940');
    oval(c, -6.2, -10.2, 1.1, 1.1, '#fff'); oval(c, 4.8, -10.2, 1.1, 1.1, '#fff');
    oval(c, -8.5, -5.5, 2.2, 1.2, '#ff9ebb'); oval(c, 8.5, -5.5, 2.2, 1.2, '#ff9ebb');
    poly(c, [[-16, -13], [-10, -24], [0, -19], [10, -24], [16, -13], [8, -14], [0, -17], [-8, -14]], color, ink);
    oval(c, 0, -22, 5.5, 5.5, '#ff8eb5', ink);
    oval(c, 0, -22, 2.5, 2.5, '#fff18f');
    box(c, 16, -9 - kick * 2, 3.5, 22, 1.5, '#6e4c36', ink);
    oval(c, 17.8, -12 - kick * 2, 6, 6, '#ff9ec4', ink);
    oval(c, 17.8, -12 - kick * 2, 2.8, 2.8, '#fff18f');
  } else if (k === 6) {
    // ПАНДІ (ПОВНІСТЮ ПЕРЕМАЛЬОВАНИЙ): майстер кунг-фу у смарагдовому кімоно, з золотим поясом, банданою та бамбуковим посохом
    const dark = '#1d2b36', cream = '#fcf9ed', jade = '#2b8a64';
    // Лапки з подушечками, що крокують
    box(c, -13, 8 + footL, 8.5, 11, 4, dark, ink);
    box(c, 4.5, 8 + footR, 8.5, 11, 4, dark, ink);
    oval(c, -8.8, 16.5 + footL, 3.2, 2, '#5a6e7d');
    oval(c, 8.8, 16.5 + footR, 3.2, 2, '#5a6e7d');
    // Пухнастий округлий тулуб у смарагдовому жилеті кунг-фу
    oval(c, 0, 6, 17.5, 13.5, jade, ink);
    oval(c, 0, 5.5, 11, 10.5, cream);
    // Схрещені борти кімоно та золотий пояс із нефритовою пряжкою
    poly(c, [[-8, -2], [0, 8], [-4, 12], [-13, 2]], '#68d89b');
    poly(c, [[8, -2], [0, 8], [4, 12], [13, 2]], '#68d89b');
    box(c, -16, 7, 32, 4.5, 2, '#f7c14d', ink);
    oval(c, 0, 9.2, 4, 3.2, '#47f0a6', ink);
    // Чорні плечі та лапки-руки
    oval(c, -16, 2 - stride * 1.5, 5.5, 6.5, dark, ink);
    oval(c, 16, 2 + stride * 1.5, 5.5, 6.5, dark, ink);
    // Круглі вушка з чітким контуром
    oval(c, -15, -21, 6.8, 6.8, dark, ink);
    oval(c, 15, -21, 6.8, 6.8, dark, ink);
    oval(c, -15, -21, 3.4, 3.4, '#415566');
    oval(c, 15, -21, 3.4, 3.4, '#415566');
    // Голова панди з пухкими щічками
    oval(c, 0, -10, 19.5, 16, cream, ink);
    // Смарагдова бандана майстра з золотим знаком листка та стрічками позаду
    poly(c, [[-17, -18], [-27, -15 + stride * 1.5], [-24, -10 + stride * 1.5], [-16, -14]], '#35a674', ink);
    poly(c, [[-18, -17], [0, -21], [18, -17], [16, -13], [0, -16], [-16, -13]], '#35a674', ink);
    oval(c, 0, -17, 4, 2.8, '#ffe375', ink);
    // Фірмові чорні плями навколо очей під кутом та іскристі очі
    c.save(); c.translate(-7.2, -10); c.rotate(-0.22); oval(c, 0, 0, 5.4, 6.4, dark); c.restore();
    c.save(); c.translate(7.2, -10); c.rotate(0.22); oval(c, 0, 0, 5.4, 6.4, dark); c.restore();
    oval(c, -6.8, -10.2, 3.2, 3.5, '#3b2416');
    oval(c, 6.8, -10.2, 3.2, 3.5, '#3b2416');
    oval(c, -6.8, -10.2, 2.1, 2.4, '#111822');
    oval(c, 6.8, -10.2, 2.1, 2.4, '#111822');
    oval(c, -7.7, -11.4, 1.2, 1.2, '#ffffff');
    oval(c, 5.9, -11.4, 1.2, 1.2, '#ffffff');
    // Рум'янець, носик та усмішка
    oval(c, -11.5, -5.2, 2.6, 1.4, '#ffa3b5');
    oval(c, 11.5, -5.2, 2.6, 1.4, '#ffa3b5');
    poly(c, [[-3.2, -6.2], [3.2, -6.2], [0, -3.2]], dark);
    c.strokeStyle = dark; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, -3.2); c.lineTo(-2.8, -1.2); c.moveTo(0, -3.2); c.lineTo(2.8, -1.2); c.stroke();
    // Бамбуковий посох із зеленими листочками (рухається при атаці)
    c.save();
    c.translate(18 + kick * 2.5, 0);
    c.rotate(kick * 0.35 - stride * 0.12);
    box(c, -2.5, -20, 5, 34, 2.2, '#4ba865', ink);
    box(c, -3, -11, 6, 2.5, 1, '#a8f29b');
    box(c, -3, 0, 6, 2.5, 1, '#a8f29b');
    poly(c, [[2, -18], [10, -23], [6, -15]], '#78e887', ink);
    poly(c, [[-2, -20], [-9, -25], [-5, -17]], '#a8f29b', ink);
    c.restore();
  } else if (k === 7) {
    // КОТИК: чорно-білий пухнастик сина з живою анімацією хвоста й лапок
    const fur = '#1e2532', white = '#faf7f0', nose = '#f598aa';
    const tailWag = Math.sin(now * 7 + phase) * 2.5;
    poly(c, [[-12, 10], [-26, 6 + tailWag], [-30, -4 + tailWag], [-24, -7 + tailWag], [-20, 3 + tailWag * 0.5], [-10, 6]], fur, '#131822');
    oval(c, -26, -5 + tailWag, 3.5, 3.5, white);
    oval(c, 0, 7, 16, 13, fur);
    oval(c, 1, 8, 10, 9, white);
    box(c, -13, 8 + footL, 7, 10, 3.5, fur); box(c, 7, 8 + footR, 7, 10, 3.5, fur);
    oval(c, -9.5, 16 + footL, 3, 2, white); oval(c, 10.5, 16 + footR, 3, 2, white);
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

  // Візуальні відзнаки образів (Золота / Зоряна корона й нагрудний знак)
  if (outfit) {
    poly(c, [[-13, 2], [11, 6], [12, 10], [-11, 6]], outfit === 2 ? '#ff94c4' : '#ffdc72');
    star(c, 7, 7, 3.2, '#fffad4');
    if (outfit === 2) {
      poly(c, [[-6, -25], [-3, -31], [0, -27], [3, -31], [6, -25]], '#ffe066', ink);
    }
  }

  // Спалах при отриманні шкоди (як у Brawl Stars)
  if (hurt > 0.01) {
    oval(c, 0, -3, 21, 23, 'rgba(255, 255, 255, ' + Math.min(0.65, hurt * 3.5) + ')');
  }
  c.restore();
}

// УНІКАЛЬНІ ФОРМИ СНАРЯДІВ ДЛЯ КОЖНОГО БІЙЦЯ
function drawShot(c, shot) {
  const k = shot.owner ? shot.owner.kind : 0;
  const col = shot.color || heroes[k].color;
  const angle = Math.atan2(shot.dy, shot.dx);
  c.save();
  c.translate(shot.x, shot.y);
  c.rotate(angle);
  if (k === 0) {
    // Рись: гострий бірюзовий енергетичний півмісяць
    poly(c, [[-7, -4], [8, 0], [-7, 4], [-3, 0]], col, '#143842');
  } else if (k === 1) {
    // Бастіон: розпечена картеч дробовика з вогняним хвостом
    oval(c, -3, 0, 6, 3.2, '#ff7738');
    oval(c, 1, 0, 4.5, 4.5, '#ffe382', '#522914');
  } else if (k === 2) {
    // Комета: обертова магічна зірка
    c.rotate(performance.now() * 0.012);
    star(c, 0, 0, 7.5, '#e2b5ff');
    oval(c, 0, 0, 3, 3, '#fff6b8');
  } else if (k === 3) {
    // Віхола: крижаний кристал-бурулька
    poly(c, [[-8, 0], [-1, -4.5], [9, 0], [-1, 4.5]], '#8ce7ff', '#1b4f78');
    poly(c, [[-4, 0], [5, 0], [0, -2]], '#ffffff');
  } else if (k === 4) {
    // Грім: грозова куля з блискавкою
    oval(c, 0, 0, 8, 8, '#ff9c6e', '#591f1a');
    star(c, 0, 0, 6.5, '#fff085');
  } else if (k === 5) {
    // Верба: смарагдова лікувальна хвиля-листок
    oval(c, 0, 0, 9, 6, '#9ef285', '#1d573a');
    oval(c, 1, 0, 4.5, 2.5, '#e8ffcf');
  } else if (k === 6) {
    // Панді: зелений бамбуковий паросток із вузликом
    box(c, -7, -3, 14, 6, 2.5, '#5cd678', '#1c4f32');
    box(c, -1, -3.5, 2.5, 7, 1, '#c8ff9e');
  } else if (k === 7) {
    // Котик: рожева котяча лапка-іскра
    oval(c, 0, 0, 6, 5.5, '#ff9ec4', '#3d1d33');
    oval(c, -1, 0, 3, 2.5, '#fff0f6');
    oval(c, 3.5, -2.8, 1.5, 1.5, '#fff0f6');
    oval(c, 4.5, 0, 1.5, 1.5, '#fff0f6');
    oval(c, 3.5, 2.8, 1.5, 1.5, '#fff0f6');
  } else {
    oval(c, 0, 0, 5, 5, col);
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

  const waterCols = m === 1 ? ['#d95338', '#ff9b52'] : m === 2 || m === 4 ? ['#51428f', '#8e7dff'] : ['#237a9c', '#5ce1e6'];
  for (const [wx, wy, ww, wh] of (d.water || [])) {
    box(c, wx - 3, wy - 2, ww + 6, wh + 6, 18, '#13283d45');
    box(c, wx, wy, ww, wh, 16, waterCols[0]);
    box(c, wx + 5, wy + 5, ww - 10, wh - 12, 13, waterCols[1]);
    oval(c, wx + ww * 0.32, wy + wh * 0.38, ww * 0.16, 3.5, '#ffffff65');
    oval(c, wx + ww * 0.68, wy + wh * 0.62, ww * 0.12, 2.5, '#ffffff55');
  }

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
  const step = Math.sin((z.walkPhase || 0)) * 2.5;
  c.save(); c.translate(z.x, z.y - Math.abs(step) * 0.5); c.scale(Math.cos(z.heading) < 0 ? -1 : 1, 1);
  oval(c, 0, 14, 15, 5, '#25304745');
  box(c, -9, 8 + step, 6, 8, 2, '#33374b'); box(c, 3, 8 - step, 7, 8, 2, '#33374b');
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
