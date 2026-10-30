/* Ergin Kaplan Net · 2003 oyun salonu
   Ergin Lab / özgün tarayıcı oyunları · © Ergin Kaplan */
(function () {
  "use strict";
  const E = globalThis.EKN;
  if (!E) return;
  const K = E.keys, P = E.pressed, M = E.pointer, W = E.W, H = E.H;
  const hit = function (code) {
    if (!P[code]) return false;
    delete P[code];
    return true;
  };
  const click = function () {
    if (!M.click) return false;
    M.click = false;
    return true;
  };
  const rightClick = function () {
    if (!M.right) return false;
    M.right = false;
    return true;
  };
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  const dist = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
  function stars(seed, count) {
    const out = [];
    for (let i = 0; i < count; i++) {
      const x = Math.abs(Math.sin((i + 1) * (seed + 7)) * 10000) % W;
      const y = Math.abs(Math.sin((i + 3) * (seed + 13)) * 10000) % H;
      out.push({ x: x, y: y, s: i % 7 === 0 ? 2 : 1, a: 0.25 + (i % 5) * 0.12 });
    }
    return out;
  }
  function drawStars(list, shift) {
    E.clear("#050b14");
    for (let i = 0; i < list.length; i++) {
      const q = list[i];
      E.ctx.globalAlpha = q.a;
      E.rect(q.x, (q.y + shift) % H, q.s, q.s, i % 9 === 0 ? "#e8b86b" : "#b7d7e8");
    }
    E.ctx.globalAlpha = 1;
  }
  function finish(id, score, title, message) {
    E.remember(id, score);
    E.showEnd(title, message);
  }

  /* 01 · Yıldız Koridoru */
  E.starters.yildiz = function () {
    let ship = { x: 306, y: 337, w: 28, h: 26, hp: 3, inv: 0 };
    let shots = [], hostile = [], foes = [], particles = [];
    let spawn = 0.5, fire = 0, score = 0, wave = 1, elapsed = 0;
    const sky = stars(19, 95);
    function makeFoe() {
      const boss = score > 0 && score % 180 === 0 && !foes.some(function (f) { return f.boss; });
      foes.push({ x: boss ? 250 : E.rand(28, 588), y: boss ? 34 : -24, w: boss ? 140 : 24, h: boss ? 30 : 20,
        hp: boss ? 18 : 1, boss: boss, vx: E.rand(-32, 32), phase: E.rand(0, 6.2), fire: E.rand(1, 3) });
    }
    E.loop(function (dt) {
      elapsed += dt;
      if (K.ArrowLeft || K.KeyA) ship.x -= 245 * dt;
      if (K.ArrowRight || K.KeyD) ship.x += 245 * dt;
      if (K.ArrowUp || K.KeyW) ship.y -= 200 * dt;
      if (K.ArrowDown || K.KeyS) ship.y += 200 * dt;
      if (M.down) { ship.x += (M.x - ship.x - 14) * Math.min(1, dt * 9); ship.y += (M.y - ship.y - 13) * Math.min(1, dt * 9); }
      ship.x = clamp(ship.x, 8, 604); ship.y = clamp(ship.y, 170, 365);
      ship.inv = Math.max(0, ship.inv - dt);
      fire -= dt;
      if ((K.Space || K.KeyF || M.down) && fire <= 0) {
        shots.push({ x: ship.x + 13, y: ship.y - 8, vy: -390 });
        fire = 0.16; E.sfx(650, 0.035, "square", 0.018);
      }
      spawn -= dt;
      if (spawn <= 0) { makeFoe(); spawn = Math.max(0.42, 1.05 - score / 950); }
      shots.forEach(function (b) { b.y += b.vy * dt; });
      shots = shots.filter(function (b) { return b.y > -12; });
      hostile.forEach(function (b) { b.x += b.vx * dt; b.y += b.vy * dt; });
      hostile = hostile.filter(function (b) { return b.y < H + 12 && b.x > -12 && b.x < W + 12; });
      foes.forEach(function (f) {
        f.phase += dt * 2;
        f.x += (f.vx + Math.sin(f.phase) * 24) * dt;
        f.y += (f.boss ? 12 : 38 + wave * 2) * dt;
        f.x = clamp(f.x, 4, W - f.w - 4);
        f.fire -= dt;
        if (f.fire <= 0 && f.y > 0) {
          hostile.push({ x: f.x + f.w / 2, y: f.y + f.h, vx: (ship.x - f.x) * 0.17, vy: f.boss ? 155 : 118 });
          f.fire = f.boss ? 0.75 : E.rand(2, 3.8);
        }
      });
      for (let i = foes.length - 1; i >= 0; i--) {
        const f = foes[i];
        for (let j = shots.length - 1; j >= 0; j--) {
          if (shots[j].x > f.x - 4 && shots[j].x < f.x + f.w + 4 && shots[j].y < f.y + f.h && shots[j].y > f.y - 5) {
            shots.splice(j, 1); f.hp--; E.sfx(280, 0.04, "triangle", 0.025);
            if (f.hp <= 0) { score += f.boss ? 100 : 10; E.burst(particles, f.x + f.w / 2, f.y + f.h / 2, f.boss ? 32 : 10, f.boss ? "#e8a838" : "#e25b4a"); foes.splice(i, 1); }
            break;
          }
        }
        if (foes[i] && f.y > H + 12) { foes.splice(i, 1); ship.hp--; ship.inv = 0.8; }
      }
      if (ship.inv <= 0) {
        for (let i = hostile.length - 1; i >= 0; i--) {
          const b = hostile[i];
          if (b.x > ship.x - 5 && b.x < ship.x + ship.w + 5 && b.y > ship.y - 4 && b.y < ship.y + ship.h + 4) {
            hostile.splice(i, 1); ship.hp--; ship.inv = 1.1; E.burst(particles, ship.x + 14, ship.y + 12, 14, "#e25b4a"); break;
          }
        }
      }
      E.drawParts(particles, dt);
      wave = 1 + Math.floor(score / 100);
      E.setScore(score + " · ♥ " + ship.hp + " · DALGA " + wave);
      if (ship.hp <= 0) finish("yildiz", score, "Gemi düştü", "Koridor kapandı. Toplam puanın: " + score);
    }, function () {
      drawStars(sky, elapsed * 18);
      E.rect(0, 374, W, 26, "#0b1b24");
      E.text("SEKTÖR 07  /  DERİN UZAY", 14, 12, 11, "#80a9b8");
      foes.forEach(function (f) {
        if (f.boss) {
          E.rect(f.x, f.y, f.w, f.h, "#8d4538"); E.rect(f.x + 12, f.y + 6, f.w - 24, 9, "#e8a838");
          E.rect(f.x + 45, f.y + 23, 50, 4, "#e25b4a");
        } else {
          E.rect(f.x + 4, f.y + 4, 16, 11, "#a84c44"); E.rect(f.x, f.y + 14, 24, 5, "#e8a838");
          E.rect(f.x + 8, f.y + 6, 8, 4, "#f6d78c");
        }
      });
      shots.forEach(function (b) { E.rect(b.x, b.y, 3, 10, "#7ee0d2"); E.rect(b.x - 1, b.y + 5, 5, 3, "#e8a838"); });
      hostile.forEach(function (b) { E.rect(b.x - 3, b.y - 3, 6, 7, "#e25b4a"); });
      if (ship.inv <= 0 || Math.floor(elapsed * 14) % 2 === 0) {
        E.rect(ship.x + 9, ship.y + 3, 10, 20, "#8ed8d5"); E.rect(ship.x + 3, ship.y + 14, 22, 8, "#307b87");
        E.rect(ship.x + 12, ship.y - 4, 4, 10, "#e8a838"); E.rect(ship.x + 12, ship.y + 22, 4, 7, "#e25b4a");
      }
      E.drawParts(particles, 0);
      E.panel();
    });
  };

  /* 02 · Ring Kaplan */
  E.starters.ring = function () {
    let p1 = { x: 170, y: 285, hp: 100, face: 1, stun: 0, cooldown: 0, jump: 0 };
    let p2 = { x: 440, y: 285, hp: 100, face: -1, stun: 0, cooldown: 0, jump: 0 };
    let score = 0, elapsed = 0, aiBeat = 0, sparks = [];
    function strike(a, b, power, reach) {
      if (a.cooldown > 0 || a.stun > 0) return;
      a.cooldown = 0.42;
      if (Math.abs(a.x - b.x) < reach && Math.abs(a.y - b.y) < 45 && a.face === (b.x > a.x ? 1 : -1)) {
        b.hp = Math.max(0, b.hp - power); b.stun = 0.18;
        E.burst(sparks, b.x, b.y - 26, 11, "#e8a838"); E.sfx(115, 0.09, "sawtooth", 0.035);
        if (a === p1) score += power;
      } else E.sfx(170, 0.04, "square", 0.016);
    }
    E.loop(function (dt) {
      elapsed += dt; aiBeat -= dt;
      [p1, p2].forEach(function (p) { p.cooldown = Math.max(0, p.cooldown - dt); p.stun = Math.max(0, p.stun - dt); p.jump = Math.max(0, p.jump - dt); });
      if (!p1.stun) {
        if (K.KeyA || K.ArrowLeft) p1.x -= 175 * dt;
        if (K.KeyD) p1.x += 175 * dt;
        if (hit("KeyW") && p1.jump <= 0) p1.jump = 0.55;
        p1.face = p2.x > p1.x ? 1 : -1;
        if (hit("KeyF")) strike(p1, p2, 8, 65);
        if (hit("KeyG")) strike(p1, p2, 14, 82);
      }
      const twoPlayer = K.ArrowLeft || K.ArrowRight || K.ArrowDown || K.KeyK || K.KeyL;
      if (twoPlayer) {
        if (!p2.stun) {
          if (K.ArrowLeft) p2.x -= 165 * dt;
          if (K.ArrowRight) p2.x += 165 * dt;
          p2.face = p1.x > p2.x ? 1 : -1;
          if (hit("KeyK")) strike(p2, p1, 8, 62);
          if (hit("KeyL")) strike(p2, p1, 13, 78);
        }
      } else if (!p2.stun) {
        const gap = p1.x - p2.x;
        if (Math.abs(gap) > 52) p2.x += Math.sign(gap) * (88 + Math.sin(elapsed * 2) * 18) * dt;
        p2.face = gap > 0 ? 1 : -1;
        if (aiBeat <= 0 && Math.abs(gap) < 78) { strike(p2, p1, 6, 64); aiBeat = E.rand(0.65, 1.25); }
      }
      p1.x = clamp(p1.x, 55, 585); p2.x = clamp(p2.x, 55, 585);
      if (Math.abs(p1.x - p2.x) < 40) { const mid = (p1.x + p2.x) / 2; p1.x = mid - 21; p2.x = mid + 21; }
      E.drawParts(sparks, dt);
      E.setScore("KAPLAN " + p1.hp + "  :  " + p2.hp + " RIZA");
      if (p1.hp <= 0 || p2.hp <= 0) finish("ring", score, "Maç bitti", (p1.hp > p2.hp ? "Kaplan" : "Rakip") + " ringin galibi. Vuruş puanı: " + score);
    }, function () {
      E.clear("#101015"); E.rect(0, 0, W, 72, "#161d29");
      for (let x = 0; x < W; x += 32) E.rect(x, 80, 1, 270, "#202a34");
      E.rect(0, 350, W, 50, "#191217");
      E.rect(30, 108, 580, 7, "#e8a838"); E.rect(30, 108, 7, 245, "#e8a838"); E.rect(603, 108, 7, 245, "#e8a838");
      E.rect(30, 345, 580, 7, "#e8a838"); E.rect(30, 120, 7, 220, "#9e6040"); E.rect(603, 120, 7, 220, "#9e6040");
      E.text("KERVAN MAHALLESİ SPOR KULÜBÜ", 320, 18, 13, "#e8b86b", "center");
      E.text("KAPLAN", 18, 54, 12, "#7ee0d2"); E.rect(18, 72, 180, 8, "#253b3a"); E.rect(18, 72, 180 * p1.hp / 100, 8, "#7ee0d2");
      E.text("RIZA", 622, 54, 12, "#e25b4a", "right"); E.rect(442, 72, 180, 8, "#42262a"); E.rect(442 + 180 * (100 - p2.hp) / 100, 72, 180 * p2.hp / 100, 8, "#e25b4a");
      function fighter(p, color, skin) {
        const y = p.y - (p.jump > 0 ? 42 : 0);
        E.rect(p.x - 10, y - 40, 21, 18, skin); E.rect(p.x - 14, y - 22, 28, 32, color);
        E.rect(p.x - 12, y + 8, 10, 26, "#222b3a"); E.rect(p.x + 2, y + 8, 10, 26, "#222b3a");
        E.rect(p.x + p.face * 10, y - 35, 4, 4, "#171717");
        E.rect(p.x + p.face * 13, y - 17, p.face * 15, 8, "#c78b68");
        if (p.stun > 0) E.text("✦", p.x, y - 65, 18, "#e8a838", "center");
      }
      fighter(p1, "#287b83", "#c78b68"); fighter(p2, "#9c493d", "#b97d60");
      E.drawParts(sparks, 0); E.panel();
    });
  };

  /* 03 · Ergin Yılan */
  E.starters.yilan = function () {
    const cols = 25, rows = 15, cell = 22, ox = 45, oy = 35;
    let snake, dir, next, food, acc = 0, score = 0, dead = false;
    function placeFood() {
      let p;
      do { p = { x: E.irand(0, cols - 1), y: E.irand(0, rows - 1) }; }
      while (snake.some(function (s) { return s.x === p.x && s.y === p.y; }));
      food = p;
    }
    function reset() { snake = [{x:12,y:7},{x:11,y:7},{x:10,y:7}]; dir = {x:1,y:0}; next = dir; score = 0; acc = 0; dead = false; placeFood(); }
    reset();
    E.loop(function (dt) {
      if (hit("ArrowUp") && dir.y !== 1) next = {x:0,y:-1};
      if (hit("ArrowDown") && dir.y !== -1) next = {x:0,y:1};
      if (hit("ArrowLeft") && dir.x !== 1) next = {x:-1,y:0};
      if (hit("ArrowRight") && dir.x !== -1) next = {x:1,y:0};
      acc += dt;
      if (!dead && acc > 0.115) {
        acc = 0; dir = next;
        const head = {x:snake[0].x+dir.x,y:snake[0].y+dir.y};
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
          dead = true; finish("yilan", score, "Oyun bitti", "Yılan " + score + " çay bardağı topladı."); return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) { score += 10; placeFood(); E.sfx(520, 0.06, "square", 0.025); }
        else snake.pop();
        E.setScore(score + " puan");
      }
    }, function () {
      E.clear("#07140e"); E.rect(ox - 7, oy - 7, cols * cell + 14, rows * cell + 14, "#1a3324");
      E.rect(ox, oy, cols * cell, rows * cell, "#06100b");
      for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) if ((x + y) % 2 === 0) E.rect(ox + x * cell, oy + y * cell, cell - 1, cell - 1, "#0a1a11");
      E.rect(ox + food.x * cell + 4, oy + food.y * cell + 4, 14, 14, "#e25b4a");
      snake.forEach(function (s, i) { E.rect(ox + s.x * cell + 1, oy + s.y * cell + 1, 20, 20, i === 0 ? "#e8a838" : "#3d9a62"); });
      E.text("ÇAY MOLASI / " + score, 320, 8, 12, "#b7f5c8", "center"); E.panel();
    });
  };

  /* 04 · Tuğla Duvarı */
  E.starters.tugla = function () {
    let paddle = { x: 270, y: 360, w: 100, h: 12 };
    let ball = { x: 320, y: 345, vx: 150, vy: -205, r: 7 };
    let bricks = [], lives = 3, score = 0, launched = false;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) bricks.push({x:42+c*56,y:55+r*24,w:50,h:15,hp:1,color:["#e25b4a","#e8a838","#4f9c9a","#8f79bd","#5d9b63"][r]});
    E.loop(function (dt) {
      if (K.ArrowLeft || K.KeyA) paddle.x -= 340 * dt;
      if (K.ArrowRight || K.KeyD) paddle.x += 340 * dt;
      if (M.down) paddle.x = M.x - paddle.w / 2;
      paddle.x = clamp(paddle.x, 8, W - paddle.w - 8);
      if (!launched && hit("Space")) launched = true;
      if (!launched) { ball.x = paddle.x + paddle.w / 2; return; }
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy = Math.abs(ball.vy);
      if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y < paddle.y + 14 && ball.x > paddle.x - 4 && ball.x < paddle.x + paddle.w + 4) {
        const offset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = offset * 235; ball.vy = -Math.max(170, Math.abs(ball.vy)); E.sfx(340, 0.04, "square", 0.025);
      }
      for (let i = bricks.length - 1; i >= 0; i--) {
        const b = bricks[i];
        if (ball.x > b.x && ball.x < b.x + b.w && ball.y - ball.r < b.y + b.h && ball.y + ball.r > b.y) {
          ball.vy *= -1; bricks.splice(i, 1); score += 10; break;
        }
      }
      if (ball.y > H + 15) {
        lives--; launched = false; ball.y = 345; ball.vx = E.rand(-150,150); ball.vy = -205;
        if (lives <= 0) finish("tugla", score, "Son top düştü", "Duvarın arkasında " + score + " puan bıraktın.");
      }
      E.setScore(score + " puan · " + lives + " top");
      if (!bricks.length) finish("tugla", score, "Duvar yıkıldı!", "Mahallenin en iyi raketi sensin. Puan: " + score);
    }, function () {
      E.clear("#10101a"); E.rect(0, 0, W, 30, "#202333"); E.text("KAPLAN RAKETİ  /  TUR " + (1 + Math.floor(score / 500)), 18, 9, 11, "#d3c2a0");
      bricks.forEach(function (b) { E.rect(b.x, b.y, b.w, b.h, b.color); E.rect(b.x + 3, b.y + 3, b.w - 6, 3, "#ffffff"); });
      E.rect(paddle.x, paddle.y, paddle.w, paddle.h, "#e8a838"); E.rect(paddle.x + 8, paddle.y + 3, paddle.w - 16, 3, "#fff0b5");
      E.ctx.fillStyle = "#7ee0d2"; E.ctx.beginPath(); E.ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); E.ctx.fill();
      if (!launched) E.text("BOŞLUK TUŞU / SERVİS", 320, 300, 12, "#7ee0d2", "center");
      E.panel();
    });
  };

  /* 05 · Mahalle Tenisi */
  E.starters.tenis = function () {
    let a = {x:24,y:160,w:13,h:78}, b = {x:603,y:160,w:13,h:78};
    let ball = {x:320,y:200,vx:215,vy:95,r:7}, scoreA = 0, scoreB = 0, wait = 0;
    function serve(direction) { ball = {x:320,y:200,vx:215*direction,vy:E.rand(-120,120),r:7}; wait = 0.35; }
    E.loop(function (dt) {
      if (K.KeyW || K.ArrowUp) a.y -= 260 * dt;
      if (K.KeyS || K.ArrowDown) a.y += 260 * dt;
      a.y = clamp(a.y, 8, H - a.h - 8);
      b.y += ((ball.y - b.h / 2) - b.y) * Math.min(1, dt * 4.1);
      b.y = clamp(b.y, 8, H - b.h - 8);
      if (wait > 0) wait -= dt;
      else {
        ball.x += ball.vx * dt; ball.y += ball.vy * dt;
        if (ball.y < 10 || ball.y > H - 10) ball.vy *= -1;
        if (ball.vx < 0 && ball.x - ball.r < a.x + a.w && ball.x > a.x && ball.y > a.y - 4 && ball.y < a.y + a.h + 4) {
          ball.vx = Math.abs(ball.vx) * 1.04; ball.vy = ((ball.y - (a.y + a.h / 2)) / 39) * 230;
          E.sfx(400, 0.05, "square", 0.03);
        }
        if (ball.vx > 0 && ball.x + ball.r > b.x && ball.x < b.x + b.w && ball.y > b.y - 4 && ball.y < b.y + b.h + 4) {
          ball.vx = -Math.abs(ball.vx) * 1.03; ball.vy = ((ball.y - (b.y + b.h / 2)) / 39) * 220;
          E.sfx(400, 0.05, "square", 0.03);
        }
        if (ball.x < -10) { scoreB++; serve(-1); }
        if (ball.x > W + 10) { scoreA++; serve(1); }
      }
      E.setScore(scoreA + "  :  " + scoreB);
      if (scoreA >= 7 || scoreB >= 7) finish("tenis", Math.max(scoreA,scoreB), "Maç bitti", (scoreA > scoreB ? "Sen kazandın!" : "Rıza kazandı.") + " Set: " + scoreA + " - " + scoreB);
    }, function () {
      E.clear("#071c1b"); E.rect(0, 0, W, H, "#0b3732"); E.rect(14, 14, W - 28, H - 28, "#d7cba1");
      E.rect(24, 24, W - 48, H - 48, "#16746b"); E.rect(318, 24, 3, H - 48, "#d7cba1");
      E.rect(24, 199, W - 48, 2, "rgba(255,255,255,.25)");
      for (let i = 0; i < 5; i++) E.rect(316, 38 + i * 75, 7, 7, "#e8a838");
      E.rect(a.x, a.y, a.w, a.h, "#e8a838"); E.rect(b.x, b.y, b.w, b.h, "#e25b4a");
      E.ctx.fillStyle = "#fff4cf"; E.ctx.beginPath(); E.ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); E.ctx.fill();
      E.text("KAPLAN", 18, 6, 11, "#b7f5c8"); E.text("RIZA", 622, 6, 11, "#f2afa3", "right"); E.panel();
    });
  };

  /* 06 · Kaplan Tank */
  E.starters.tank = function () {
    let player = {x:310,y:320,a:0,hp:5,fire:0};
    let enemies = [], shells = [], score = 0, spawn = 0.8, elapsed = 0, sparks = [];
    function enemy() { enemies.push({x:E.rand(40,600),y:-20,hp:2,fire:E.rand(1.2,2.6),speed:E.rand(30,52),phase:E.rand(0,6)}); }
    E.loop(function (dt) {
      elapsed += dt; player.fire -= dt; spawn -= dt;
      let dx = (K.ArrowRight || K.KeyD ? 1 : 0) - (K.ArrowLeft || K.KeyA ? 1 : 0);
      let dy = (K.ArrowDown || K.KeyS ? 1 : 0) - (K.ArrowUp || K.KeyW ? 1 : 0);
      player.x = clamp(player.x + dx * 180 * dt, 18, 602); player.y = clamp(player.y + dy * 180 * dt, 90, 372);
      if ((hit("KeyF") || hit("Space") || M.down) && player.fire <= 0) {
        shells.push({x:player.x,y:player.y-16,vx:Math.sin(player.a)*-260,vy:-260}); player.fire = 0.38; E.sfx(260,0.07,"square",0.03);
      }
      if (spawn <= 0) { enemy(); spawn = Math.max(0.65, 1.7 - score / 240); }
      enemies.forEach(function (e) {
        e.phase += dt; e.y += e.speed * dt; e.x += Math.sin(e.phase * 1.5) * 34 * dt;
        e.fire -= dt;
        if (e.fire < 0 && e.y < 300) {
          shells.push({x:e.x,y:e.y+12,vx:(player.x-e.x)*0.16,vy:125}); e.fire = E.rand(1.6,2.6);
        }
      });
      shells.forEach(function (s) { s.x += s.vx * dt; s.y += s.vy * dt; });
      shells = shells.filter(function (s) { return s.y > -10 && s.y < H + 10 && s.x > -10 && s.x < W + 10; });
      for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = shells.length - 1; j >= 0; j--) {
          let s = shells[j], e = enemies[i];
          if (s.vy < 0 && Math.abs(s.x-e.x)<20 && Math.abs(s.y-e.y)<20) {
            shells.splice(j,1); e.hp--; if (e.hp <= 0) { enemies.splice(i,1); score += 20; E.burst(sparks,e.x,e.y,15,"#e8a838"); } break;
          }
        }
        const e = enemies[i];
        if (e && Math.abs(e.x-player.x)<22 && Math.abs(e.y-player.y)<22) { enemies.splice(i,1); player.hp--; }
        else if (e && e.y > H+10) { enemies.splice(i,1); player.hp--; }
      }
      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i];
        if (s.vy > 0 && Math.abs(s.x-player.x)<13 && Math.abs(s.y-player.y)<16) { shells.splice(i,1); player.hp--; E.burst(sparks,player.x,player.y,12,"#e25b4a"); }
      }
      E.drawParts(sparks,dt); E.setScore(score + " puan · zırh " + player.hp);
      if (player.hp <= 0) finish("tank", score, "Tank devre dışı", "Mahalle savunması sona erdi. Puan: " + score);
    }, function () {
      E.clear("#121a14");
      for (let x=15;x<W;x+=42) E.rect(x,0,1,H,"#1d2c21");
      for (let y=10;y<H;y+=42) E.rect(0,y,W,1,"#1d2c21");
      E.rect(0,62,W,5,"#344634"); E.rect(0,68,W,2,"#78815b");
      E.text("KERVAN MAHALLESİ / SAVUNMA HATTI", 16, 15, 11, "#b7c58d");
      enemies.forEach(function(e){E.rect(e.x-10,e.y-10,20,20,"#a64a3d");E.rect(e.x-3,e.y-15,6,10,"#d28b51");E.rect(e.x-3,e.y-3,6,7,"#292b21");});
      shells.forEach(function(s){E.rect(s.x-3,s.y-5,6,10,s.vy<0?"#e8a838":"#e25b4a");});
      E.rect(player.x-12,player.y-12,24,24,"#4f9b89");E.rect(player.x-3,player.y-18,6,19,"#b7f5c8");E.rect(player.x-3,player.y-25,6,12,"#e8a838");
      E.panel();
    });
  };

  /* 07 · Gece Vardiyası */
  E.starters.vardiya = function () {
    let lane = 1, playerY = 324, traffic = [], spawn = 0.4, score = 0, speed = 175, elapsed = 0, dead = false;
    const laneX = [210,320,430];
    E.loop(function (dt) {
      elapsed += dt; speed = 175 + Math.min(150, elapsed * 5); spawn -= dt;
      if (hit("ArrowLeft") || hit("KeyA")) lane = Math.max(0,lane-1);
      if (hit("ArrowRight") || hit("KeyD")) lane = Math.min(2,lane+1);
      if (spawn <= 0) { const l=E.irand(0,2); traffic.push({lane:l,y:-55,color:["#b84d42","#d5a34f","#4c8290","#748c58"][E.irand(0,3)],h:42}); spawn=E.rand(0.7,1.15); }
      traffic.forEach(function(t){t.y+=speed*dt;});
      for (let i=traffic.length-1;i>=0;i--) {
        let t=traffic[i];
        if (t.lane===lane && t.y+36>playerY && t.y<playerY+38) dead=true;
        if (t.y>H+60) {traffic.splice(i,1);score+=5;}
      }
      E.setScore(score+" puan · "+Math.floor(speed)+" km/s");
      if (dead) finish("vardiya",score,"Gece vardiyası sona erdi","Sokağın sonunda "+score+" puan topladın.");
    }, function () {
      E.clear("#121a1d"); E.rect(145,0,350,H,"#202a2c"); E.rect(150,0,5,H,"#c5b585"); E.rect(485,0,5,H,"#c5b585");
      for(let y=0;y<H;y+=46){E.rect(260,y+((elapsed*speed)%46),4,23,"#d8c991");E.rect(375,y+((elapsed*speed)%46),4,23,"#d8c991");}
      E.rect(0,330,W,70,"#111719"); E.text("KAPLAN SOKAK  /  02:17",14,12,12,"#c6d1be");
      traffic.forEach(function(t){let x=laneX[t.lane]-23;E.rect(x,t.y,46,37,t.color);E.rect(x+6,t.y+5,34,8,"#d6d1b3");E.rect(x+4,t.y+31,8,7,"#e8a838");E.rect(x+34,t.y+31,8,7,"#e8a838");});
      const x=laneX[lane]-22;E.rect(x,playerY,44,39,"#317d85");E.rect(x+7,playerY+5,30,10,"#a6d6cb");E.rect(x+6,playerY+32,8,6,"#e8a838");E.rect(x+30,playerY+32,8,6,"#e8a838");
      E.panel();
    });
  };

  /* 08 · Balon Patlat */
  E.starters.balon = function () {
    let balloons=[], score=0, misses=0, timer=45, spawn=0, elapsed=0, particles=[];
    function add() { balloons.push({x:E.rand(35,605),y:420,r:E.rand(13,22),vy:E.rand(58,105),vx:E.rand(-18,18),c:["#e25b4a","#e8a838","#69a5aa","#9d7bb8","#74a66b"][E.irand(0,4)],phase:E.rand(0,6)}); }
    E.loop(function(dt){
      timer-=dt;elapsed+=dt;spawn-=dt;
      if(spawn<=0){add();if(Math.random()<0.45)add();spawn=E.rand(0.48,0.82);}
      balloons.forEach(function(b){b.y-=b.vy*dt;b.x+=b.vx*dt+Math.sin(elapsed*2+b.phase)*12*dt;});
      for(let i=balloons.length-1;i>=0;i--){if(balloons[i].y<-30){balloons.splice(i,1);misses++;}}
      if(click()){
        for(let i=balloons.length-1;i>=0;i--){const b=balloons[i];if(Math.hypot(M.x-b.x,M.y-b.y)<b.r+8){score+=Math.round(10+b.r/2);E.burst(particles,b.x,b.y,12,b.c);balloons.splice(i,1);E.sfx(480,0.055,"triangle",0.026);break;}}
      }
      if(hit("Space")){for(let i=balloons.length-1;i>=0;i--){const b=balloons[i];if(Math.hypot(320-b.x,200-b.y)<b.r+20){score+=10;balloons.splice(i,1);}}}
      E.drawParts(particles,dt);E.setScore(score+" puan · "+Math.ceil(timer)+" sn");
      if(timer<=0)finish("balon",score,"Şenlik bitti","Patlayan balon: "+score+" puan · Kaçan balon: "+misses);
    },function(){
      E.clear("#111629");for(let i=0;i<16;i++)E.rect(i*42,0,1,H,"#1b253b");
      E.rect(0,365,W,35,"#30262a");E.text("MAHALLE ŞENLİĞİ  ·  BALON STANDI",320,12,12,"#e8c88d","center");
      balloons.forEach(function(b){E.ctx.fillStyle=b.c;E.ctx.beginPath();E.ctx.arc(b.x,b.y,b.r,0,Math.PI*2);E.ctx.fill();E.rect(b.x-1,b.y+b.r-1,2,15,"#d5c8aa");E.rect(b.x-b.r/3,b.y-b.r/2,5,5,"rgba(255,255,255,.5)");});
      E.drawParts(particles,0);E.panel();
    });
  };

  /* 09 · Refleks Testi */
  E.starters.refleks = function () {
    let state="wait", delay=E.rand(1.8,4.2), elapsed=0, start=0, result=null, attempts=0, best=9999, falseStart=0;
    function reset(){state="wait";delay=E.rand(1.8,4.2);elapsed=0;start=0;result=null;}
    E.loop(function(dt){
      elapsed+=dt;
      const action=click()||hit("Space")||hit("Enter");
      if(state==="wait"&&elapsed>=delay){state="go";start=performance.now();E.sfx(740,0.12,"sine",0.035);}
      if(action){
        if(state==="wait"){falseStart++;state="early";result="ÇOK ERKEN!";E.sfx(130,0.14,"sawtooth",0.04);}
        else if(state==="go"){const ms=Math.round(performance.now()-start);attempts++;best=Math.min(best,ms);result=ms+" ms";state="done";E.remember("refleks",Math.max(0,2000-ms));E.sfx(520,0.09,"triangle",0.035);}
        else reset();
      }
      E.setScore(result||("DENEME "+(attempts+1)));
    },function(){
      E.clear(state==="go"?"#123f29":state==="early"?"#451d24":"#101c20");
      E.rect(35,35,570,330,state==="go"?"#1c6b3c":state==="early"?"#7d3030":"#1c3034");
      E.rect(50,50,540,300,"#101817");
      E.text("REAKSİYON ÖLÇER / TEST 01",320,82,13,"#c6d1be","center");
      E.text(state==="go"?"ŞİMDİ TIKLA!":state==="early"?"ERKEN BASTIN":state==="done"?result:"YEŞİLİ BEKLE",320,175,28,state==="go"?"#9bf3a5":state==="early"?"#ff9e88":"#e8c88d","center");
      E.text(state==="done"?"Tekrar denemek için tıkla":state==="early"?"Yeniden dene": "Renk değişene kadar bekle",320,235,13,"#a9b8a5","center");
      E.text("EN İYİ  "+(best===9999?"—":best+" ms")+"   /   ERKEN BASMA "+falseStart,320,292,11,"#7b9a86","center");
      E.panel();
    });
  };
})();