/* Ergin Kaplan Net — salon motoru
   Ergin Lab · © Ergin Kaplan. İzinsiz kopyalanamaz. */
globalThis.EKN = (function () {
  "use strict";
  const W = 640, H = 400;
  const $ = (id) => document.getElementById(id);
  const canvas = $("stage");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const GAMES = [
    { id: "yildiz", name: "Yıldız Koridoru", shelf: "lab", blurb: "Derin uzay savunması", hint: "Oklar veya WASD ile uç. Boşluk / F ile ateş." },
    { id: "ring", name: "Ring Kaplan", shelf: "lab", blurb: "Mahalle usulü dövüş", hint: "1. oyuncu: A/D, W, F/G. 2. oyuncu: oklar, K/L. Aynı klavyede." },
    { id: "yilan", name: "Ergin Yılan", shelf: "arcade", blurb: "Çay bardağını yakala", hint: "Ok tuşlarıyla yön değiştir. Duvara ve kendine çarpma." },
    { id: "tugla", name: "Tuğla Duvarı", shelf: "arcade", blurb: "Raketini konuştur", hint: "Sol/sağ veya fare ile raketi taşı. Boşlukla servis." },
    { id: "tenis", name: "Mahalle Tenisi", shelf: "arcade", blurb: "Rıza'ya karşı ilk 7 sayı", hint: "W/S veya yukarı/aşağı oklarla raketi taşı." },
    { id: "tank", name: "Kaplan Tank", shelf: "arcade", blurb: "Mahalle savunma hattı", hint: "WASD veya oklarla hareket et. F / Boşluk ile ateş." },
    { id: "vardiya", name: "Gece Vardiyası", shelf: "arcade", blurb: "Kervan Sokak'ta gece sürüşü", hint: "Sol/sağ oklarla şerit değiştir, trafiğe çarpma." },
    { id: "balon", name: "Balon Patlat", shelf: "arcade", blurb: "Mahalle şenliği", hint: "Fareyle veya dokunarak balonları patlat. 45 saniye." },
    { id: "disket", name: "Disket Koşusu", shelf: "arcade", blurb: "Gece yolunda disketleri kurtar", hint: "Boşluk / yukarı ile zıpla, aşağı ile eğil." },
    { id: "kaset", name: "Kaset Ritmi", shelf: "arcade", blurb: "Kaseti ritme göre sar", hint: "A / S / D / F tuşlarıyla notaları çizgide yakala." },
    { id: "refleks", name: "Refleks Testi", shelf: "zeka", blurb: "Elin mi hızlı, gözün mü?", hint: "Ekran yeşile dönünce tıkla veya Boşluk'a bas." },
    { id: "labirent", name: "Nöbet Labirenti", shelf: "zeka", blurb: "Dört fişi topla, çıkışı bul", hint: "Oklar veya WASD ile hareket et. Dört fişi topla." },
    { id: "mayin", name: "Mayın Tarlası", shelf: "zeka", blurb: "İlk kare güvenli", hint: "Sol tık açar, sağ tık bayrak koyar." },
    { id: "renk", name: "Renk Patlat", shelf: "zeka", blurb: "Taşları üçlü eşleştir", hint: "Yan yana iki taşı seçerek yer değiştir." },
    { id: "hafiza", name: "Hafıza Kartları", shelf: "zeka", blurb: "Sekiz çifti bul", hint: "İki kart aç. Aynı harfleri eşleştir." },
    { id: "lira", name: "Lira Yığ", shelf: "zeka", blurb: "Eski milyonları birleştir", hint: "Ok tuşlarıyla taşları kaydır. Aynı değerler birleşir." },
    { id: "dort", name: "Dört Sıra", shelf: "masa", blurb: "Rıza'ya karşı dört taşı diz", hint: "Sütun seç. Dört taşı yatay, dikey veya çapraz sırala." },
    { id: "uctas", name: "Üç Taş", shelf: "masa", blurb: "X sen, O Rıza", hint: "Boş kareye tıkla. Üç taşı sıraya diz." },
    { id: "dart", name: "Dart Ustası", shelf: "masa", blurb: "Beş atış, tek hedef", hint: "Hedefe tıkla. Merkeze yaklaştıkça puan yükselir." },
    { id: "penalti", name: "Penaltı Nöbeti", shelf: "masa", blurb: "Kaleciyi şaşırt", hint: "Kaleye tıklayarak köşe seç. Beş penaltı hakkın var." }
  ];

  const starters = Object.create(null);
  let best = {};
  try { best = JSON.parse(localStorage.getItem("ekn_best") || "{}") || {}; } catch (e) { best = {}; }

  const keys = Object.create(null);
  const pressed = Object.create(null);
  const pointer = { x: 0, y: 0, down: false, click: false, right: false, id: null };

  let current = null;
  let gen = 0;
  let raf = 0;
  let lastT = 0;
  let soundOn = true;
  let ac = null;

  function unlock() {
    if (ac) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
    } catch (e) {}
  }
  function sfx(freq, dur, type, vol) {
    if (!soundOn || !ac) return;
    try {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.value = vol == null ? 0.04 : vol;
      o.connect(g); g.connect(ac.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (dur || 0.08));
      o.stop(ac.currentTime + (dur || 0.08) + 0.02);
    } catch (e) {}
  }
  function boom() { sfx(60, 0.18, "sawtooth", 0.06); setTimeout(() => sfx(40, 0.12, "triangle", 0.04), 40); }

  function clear(col) {
    ctx.fillStyle = col || "#07110d";
    ctx.fillRect(0, 0, W, H);
  }
  function rect(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  }
  function text(str, x, y, size, col, align) {
    ctx.fillStyle = col || "#b7f5c8";
    ctx.font = (size || 14) + "px \"Courier New\",monospace";
    ctx.textAlign = align || "left";
    ctx.textBaseline = "top";
    ctx.fillText(String(str), x, y);
  }
  function panel() {
    ctx.strokeStyle = "rgba(183,245,200,.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, W - 8, H - 8);
  }
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function irand(a, b) { return (a + Math.random() * (b - a + 1)) | 0; }
  function burst(parts, x, y, n, col) {
    for (let i = 0; i < n; i++) {
      parts.push({ x, y, vx: rand(-120, 120), vy: rand(-160, 40), life: rand(0.3, 0.8), col: col || "#e8a838" });
    }
  }
  function drawParts(parts, dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 280 * dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life * 1.4);
      rect(p.x, p.y, 3, 3, p.col);
      ctx.globalAlpha = 1;
    }
  }
  function paintIcon(id) {
    const c = document.createElement("canvas"); c.width = 64; c.height = 40;
    const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
    g.fillStyle = "#06110c"; g.fillRect(0, 0, 64, 40);
    const bar = (x,y,w,h,color) => { g.fillStyle=color; g.fillRect(x,y,w,h); };
    if (id === "yildiz") {
      bar(28,28,8,6,"#7ee0d2"); bar(27,10,10,18,"#2c8e9a"); bar(30,5,4,9,"#e8a838");
      for(let i=0;i<5;i++)bar(6+i*12,5+(i%3)*5,5,5,"#e25b4a");
    } else if (id === "ring") {
      bar(10,12,15,22,"#287b83");bar(39,12,15,22,"#a84c44");bar(12,7,11,8,"#c78b68");bar(41,7,11,8,"#b97d60");
    } else if (id === "yilan") {
      for(let i=0;i<6;i++)bar(7+i*8,17,7,7,i===5?"#e8a838":"#3d9a62");bar(54,17,5,7,"#e25b4a");
    } else if (id === "tugla") {
      for(let r=0;r<2;r++)for(let x=0;x<4;x++)bar(5+x*14,5+r*8,12,6,r?"#e8a838":"#e25b4a");
      bar(22,31,21,3,"#7ee0d2");bar(29,23,7,7,"#ffffff");
    } else if (id === "tenis") {
      bar(12,7,3,25,"#e8a838");bar(49,7,3,25,"#e25b4a");bar(25,18,14,4,"#fff0b5");bar(30,13,5,14,"#fff0b5");
    } else if (id === "tank") {
      bar(19,8,26,25,"#4f9b89");bar(27,3,10,20,"#b7f5c8");bar(30,1,4,13,"#e8a838");bar(12,12,7,17,"#293b32");bar(45,12,7,17,"#293b32");
    } else if (id === "vardiya") {
      bar(20,7,24,28,"#317d85");bar(24,10,16,7,"#b7d7d0");bar(15,10,4,7,"#e8a838");bar(45,10,4,7,"#e8a838");
    } else if (id === "balon") {
      ["#e25b4a","#e8a838","#69a5aa"].forEach((v,i)=>{g.fillStyle=v;g.beginPath();g.arc(15+i*18,14+(i%2)*5,8,0,Math.PI*2);g.fill();bar(14+i*18,22+(i%2)*5,2,8,"#cbbd9c");});
    } else if (id === "disket") {
      bar(10,5,44,30,"#b7c9b4");bar(15,8,32,9,"#26362d");bar(19,9,5,7,"#e8a838");bar(20,20,24,11,"#647f71");bar(25,23,14,5,"#d7dfc7");
    } else if (id === "kaset") {
      bar(7,9,50,24,"#bea36d");bar(10,12,44,18,"#2c302d");bar(14,15,10,10,"#d8c48c");bar(40,15,10,10,"#d8c48c");bar(24,17,16,6,"#e8a838");bar(27,18,3,4,"#333");
    } else if (id === "refleks") {
      g.strokeStyle="#80e59a";g.lineWidth=3;g.beginPath();g.arc(32,20,13,0,Math.PI*2);g.stroke();bar(30,5,4,30,"#e8a838");bar(17,18,30,4,"#e8a838");
    } else if (id === "labirent") {
      for(let y=0;y<4;y++)for(let x=0;x<7;x++)if((x+y)%2===0)bar(5+x*8,4+y*8,7,7,"#526e58");bar(53,28,6,6,"#e8a838");
    } else if (id === "mayin") {
      for(let y=0;y<3;y++)for(let x=0;x<4;x++)bar(9+x*12,4+y*10,10,8,"#6a8273");g.fillStyle="#e25b4a";g.beginPath();g.arc(33,18,5,0,Math.PI*2);g.fill();
    } else if (id === "renk") {
      ["#e25b4a","#e8a838","#5a9db1","#7eaa65"].forEach((v,i)=>bar(7+i*13,10,10,20,v));
    } else if (id === "hafiza") {
      for(let i=0;i<3;i++){bar(8+i*17,7,13,26,"#bca16b");bar(10+i*17,9,9,22,"#25332d");}
      bar(13,15,4,10,"#e8a838");bar(30,15,4,10,"#7ee0d2");
    } else if (id === "lira") {
      bar(10,7,19,25,"#b58d55");bar(34,7,20,25,"#d9b77c");g.fillStyle="#332619";g.font="bold 17px monospace";g.fillText("₺",15,26);g.fillText("₺",39,26);
    } else if (id === "dort") {
      bar(8,5,48,30,"#23618a");for(let y=0;y<3;y++)for(let x=0;x<5;x++){g.fillStyle=(x+y)%2?"#e25b4a":"#e8a838";g.beginPath();g.arc(14+x*9,10+y*9,3,0,Math.PI*2);g.fill();}
    } else if (id === "uctas") {
      bar(20,5,2,30,"#a8b9ae");bar(42,5,2,30,"#a8b9ae");bar(10,14,44,2,"#a8b9ae");bar(10,25,44,2,"#a8b9ae");bar(15,8,8,8,"#e8a838");bar(39,27,8,8,"#7ee0d2");
    } else if (id === "dart") {
      [15,11,7,3].forEach((r,i)=>{g.beginPath();g.arc(32,20,r,0,Math.PI*2);g.fillStyle=i%2?"#e8a838":"#e25b4a";g.fill();});
    } else if (id === "penalti") {
      bar(9,5,46,25,"#e8e0c7");bar(12,8,40,19,"#34794a");bar(20,13,24,14,"#e8e0c7");bar(30,29,4,6,"#fff0b5");
    }
    return c.toDataURL();
  }
  function setScore(s) {
    const el = $("g-score");
    if (el) el.textContent = "Skor: " + s;
  }
  function saveBest(id, val) {
    if (val == null || isNaN(val)) return;
    const prev = best[id];
    if (prev != null && val <= prev) return;
    best[id] = val;
    try { localStorage.setItem("ekn_best", JSON.stringify(best)); } catch (e) {}
    renderBests();
  }
  function remember(id, val) { saveBest(id, val); }

  function renderBests() {
    const el = $("bests");
    if (!el) return;
    const rows = GAMES.filter((g) => best[g.id] != null);
    if (!rows.length) { el.innerHTML = '<div class="best-row">Henüz yok</div>'; return; }
    el.innerHTML = rows.slice(0, 8).map((g) =>
      '<div class="best-row"><b>' + g.name.replace(/^Ergin Lab: /, "") + '</b> · ' + best[g.id] + '</div>'
    ).join("");
  }

  function buildLobby() {
    GAMES.forEach((g) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "card" + (g.shelf === "lab" ? " lab" : "");
      el.title = g.hint || g.blurb;
      el.innerHTML = '<canvas width="64" height="40" aria-hidden="true"></canvas><b>' + g.name + '</b><span>' + g.blurb + '</span>';
      const ic = el.querySelector("canvas");
      const img = new Image();
      img.onload = () => { const c = ic.getContext("2d"); c.drawImage(img, 0, 0); };
      img.src = paintIcon(g.id);
      el.addEventListener("click", () => startGame(g.id));
      const shelf = $(g.shelf);
      if (shelf) shelf.appendChild(el);
    });
    $("count").textContent = GAMES.length + " oyun";
    renderBests();
  }
  function loop(update, draw) {
    const my = ++gen;
    lastT = performance.now();
    function frame(t) {
      if (my !== gen) return;
      let dt = (t - lastT) / 1000;
      lastT = t;
      if (dt > 0.05) dt = 0.05;
      update(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }
  function stopLoop() { gen++; if (raf) cancelAnimationFrame(raf); raf = 0; }

  function clearInput() {
    for (const k in pressed) delete pressed[k];
    pointer.click = false; pointer.right = false;
  }

  function startGame(id) {
    const g = GAMES.find((x) => x.id === id);
    if (!g || !starters[id]) return;
    unlock(); dismissBoot();
    $("lobby").style.display = "none";
    $("game-view").classList.add("on");
    $("g-title").textContent = g.name;
    $("g-hint").textContent = g.hint || "";
    $("overlay").classList.remove("on");
    current = id; updateTouch(); starters[id]();
  }
  function backLobby() {
    stopLoop(); clearInput();
    current = null;
    $("game-view").classList.remove("on");
    $("lobby").style.display = "";
    $("overlay").classList.remove("on");
    renderBests();
  }
  function showEnd(title, msg) {
    stopLoop();
    $("ov-title").textContent = title || "Bitti";
    $("ov-msg").textContent = msg || "";
    $("overlay").classList.add("on");
  }
  function hideEnd() { $("overlay").classList.remove("on"); }
  function dismissBoot() {
    const b = $("boot");
    if (b) b.classList.add("gone");
  }

  function updateTouch() {
    const t = $("touch");
    if (!t) return;
    const need = current && /yildiz|yilan|tugla|tenis|tank|vardiya|labirent|lira|disket/.test(current);
    t.classList.toggle("on", !!need && ("ontouchstart" in window || navigator.maxTouchPoints > 0));
  }

  function boot() {
    buildLobby();
    function tickClock() {
      const d = new Date();
      const s = (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
      const c1 = $("clock"), c2 = $("clock2");
      if (c1) c1.textContent = s; if (c2) c2.textContent = s;
    }
    tickClock(); setInterval(tickClock, 15000);

    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x === b));
      document.querySelectorAll("[data-shelf]").forEach((s) => {
        s.hidden = s.getAttribute("data-shelf") !== b.getAttribute("data-tab");
      });
    }));

    document.querySelectorAll("[data-game]").forEach((b) => b.addEventListener("click", () => startGame(b.dataset.game)));
    $("btn-back").addEventListener("click", backLobby);
    $("btn-restart").addEventListener("click", () => { if (current) startGame(current); });
    $("ov-btn").addEventListener("click", () => { hideEnd(); if (current) startGame(current); });
    $("btn-random").addEventListener("click", () => startGame(GAMES[irand(0, GAMES.length - 1)].id));
    $("btn-clear").addEventListener("click", () => { best = {}; try { localStorage.removeItem("ekn_best"); } catch (e) {} renderBests(); });
    $("btn-sound").addEventListener("click", () => {
      soundOn = !soundOn; unlock();
      $("btn-sound").textContent = soundOn ? "Ses açık" : "Ses kapalı";
    });

    window.addEventListener("keydown", (e) => {
      keys[e.code] = true; keys[e.key] = true;
      if (!pressed[e.code]) pressed[e.code] = true;
      if (current && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => { keys[e.code] = false; keys[e.key] = false; });

    canvas.addEventListener("pointerdown", (e) => {
      pointer.down = true; pointer.click = true; pointer.id = e.pointerId;
      const r = canvas.getBoundingClientRect();
      const rw = r.width || canvas.width, rh = r.height || canvas.height;
      pointer.x = (e.clientX - r.left) * (canvas.width / rw);
      pointer.y = (e.clientY - r.top) * (canvas.height / rh);
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      const rw = r.width || canvas.width, rh = r.height || canvas.height;
      pointer.x = (e.clientX - r.left) * (canvas.width / rw);
      pointer.y = (e.clientY - r.top) * (canvas.height / rh);
    });
    canvas.addEventListener("pointerup", (e) => {
      pointer.down = false;
      if (e.button === 2) pointer.right = true;
    });
    canvas.addEventListener("pointercancel", () => { pointer.down = false; });
    canvas.addEventListener("contextmenu", (e) => { if (!current) return; e.preventDefault(); pointer.right = true; });

    document.querySelectorAll("#touch button").forEach((b) => {
      const k = b.getAttribute("data-k");
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); keys[k] = true; pressed[k] = true; });
      b.addEventListener("pointerup", () => { keys[k] = false; });
      b.addEventListener("pointercancel", () => { keys[k] = false; });
    });

    setTimeout(dismissBoot, 900);
  }

  return {
    W, H, canvas, ctx, keys, pressed, pointer, starters, GAMES, loop, stopLoop,
    sfx, boom, clear, rect, text, panel, overlap, rand, irand, burst, drawParts,
    setScore, saveBest, remember, showEnd, hideEnd, startGame, backLobby, boot
  };
})();
