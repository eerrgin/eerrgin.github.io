(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let playing = !reduce;
  let simNow = 0;
  let lastStamp = performance.now();
  const jobs = new Set();
  const G = 9.81;

  const CATALOG = {
    iz: {
      kicker: "01 · İZ",
      title: "Çizgin dairelere ayrılır.",
      lede: "Kapalı bir iz, dönen dairelerin toplamıdır. Kaç daire gerektiğini sen seç.",
    },
    tank: {
      kicker: "02 · TANK",
      title: "Karanlık da bir sonuçtur.",
      lede: "İki kaynak aynı suya dalga bırakır. Bazı yerlerde birbirini büyütür, bazılarında siler.",
    },
    benham: {
      kicker: "03 · BENHAM",
      title: "Boyasız disk renk uydurur.",
      lede: "Desende kırmızı da mavi de yok. Ortadaki noktaya bak. Rengi, hız üretir.",
    },
    kelebek: {
      kicker: "04 · KELEBEK",
      title: "Toz kadar fark, iki hikâye.",
      lede: "Aynı sarkaçtan iki tane. Başlangıçları neredeyse özdeş. Bir süre sonra yolları ayrılır.",
    },
    oran: {
      kicker: "05 · ORAN",
      title: "İki frekans bir şekil çizer.",
      lede: "Ekrandaki eğri, duyduğun oranın resmi. Sade oran sakin durur.",
    },
    siluet: {
      kicker: "06 · SİLUET",
      title: "Bir kelime, bir kıyı.",
      lede: "Hava durumuna bağlanmaz. Aynı tohum her seferinde aynı geceyi kurar. Harita değildir.",
    },
  };

  function esc(s) {
    return String(s)
      .replaceAll("&", "&" + "amp;")
      .replaceAll("<", "&" + "lt;")
      .replaceAll(">", "&" + "gt;")
      .replaceAll('"', "&" + "quot;");
  }
  function hashSeed(str) {
    let h = 2166136261;
    const s = String(str || "gece");
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function mulberry32(a) {
    let t = a >>> 0;
    return () => {
      t = (t + 0x6d2b79f5) >>> 0;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gcd(a, b) {
    return b ? gcd(b, a % b) : a;
  }
  function prep(canvas, dprCap) {
    const w = Math.max(2, Math.floor(canvas.clientWidth));
    const h = Math.max(2, Math.floor(canvas.clientHeight));
    const dpr = Math.min(dprCap || 2, window.devicePixelRatio || 1);
    const pw = Math.floor(w * dpr);
    const ph = Math.floor(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }
  function rel(e, el) {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function deriv(s) {
    const t1 = s[0], w1 = s[1], t2 = s[2], w2 = s[3];
    const m1 = 1, m2 = 1, L1 = 1, L2 = 1;
    const d = t1 - t2;
    const den = 2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2);
    const a1 =
      (-G * (2 * m1 + m2) * Math.sin(t1) -
        m2 * G * Math.sin(t1 - 2 * t2) -
        2 * Math.sin(d) * m2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) /
      (L1 * den);
    const a2 =
      (2 * Math.sin(d) * (w1 * w1 * L1 * (m1 + m2) + G * (m1 + m2) * Math.cos(t1) + w2 * w2 * L2 * m2 * Math.cos(d))) /
      (L2 * den);
    return [w1, a1, w2, a2];
  }
  function rk4(s, h) {
    const k1 = deriv(s);
    const s2 = s.map((v, i) => v + (k1[i] * h) / 2);
    const k2 = deriv(s2);
    const s3 = s.map((v, i) => v + (k2[i] * h) / 2);
    const k3 = deriv(s3);
    const s4 = s.map((v, i) => v + k3[i] * h);
    const k4 = deriv(s4);
    return s.map((v, i) => v + ((k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * h) / 6);
  }
  function integrate(s, dt, damp) {
    let left = dt, n = 0, cur = s;
    while (left > 1e-6 && n < 48) {
      const h = Math.min(0.0015, left);
      cur = rk4(cur, h);
      if (damp) {
        const k = 1 - damp * h;
        cur[1] *= k;
        cur[3] *= k;
      }
      if (!Number.isFinite(cur[0] + cur[1] + cur[2] + cur[3])) return null;
      left -= h;
      n++;
    }
    return cur;
  }
  function bobs(s, ox, oy, len) {
    const x1 = ox + Math.sin(s[0]) * len;
    const y1 = oy + Math.cos(s[0]) * len;
    const x2 = x1 + Math.sin(s[2]) * len;
    const y2 = y1 + Math.cos(s[2]) * len;
    return { x1, y1, x2, y2 };
  }
  function energy(s) {
    const t1 = s[0], w1 = s[1], t2 = s[2], w2 = s[3], L1 = 1, L2 = 1;
    const y1 = -L1 * Math.cos(t1);
    const y2 = y1 - L2 * Math.cos(t2);
    const vx1 = L1 * w1 * Math.cos(t1);
    const vy1 = L1 * w1 * Math.sin(t1);
    const vx2 = vx1 + L2 * w2 * Math.cos(t2);
    const vy2 = vy1 + L2 * w2 * Math.sin(t2);
    return 0.5 * (vx1 * vx1 + vy1 * vy1) + 0.5 * (vx2 * vx2 + vy2 * vy2) + G * y1 + G * y2;
  }
  function drawBob(ctx, s, ox, oy, len, color, trail) {
    const p = bobs(s, ox, oy, len);
    if (trail) {
      trail.push({ x: p.x2, y: p.y2 });
      if (trail.length > 320) trail.shift();
      ctx.lineWidth = 1.4;
      for (let i = 1; i < trail.length; i++) {
        ctx.strokeStyle = color.replace("ALPHA", String((i / trail.length) * 0.8));
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = color.replace("ALPHA", "0.9");
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(p.x1, p.y1);
    ctx.lineTo(p.x2, p.y2);
    ctx.stroke();
    ctx.fillStyle = color.replace("ALPHA", "1");
    ctx.beginPath();
    ctx.arc(p.x2, p.y2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x1, p.y1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    return p;
  }

  function closePath(pts) {
    if (pts.length < 2) return pts.slice();
    const a = pts[0], b = pts[pts.length - 1];
    const out = pts.slice();
    if (Math.hypot(a.x - b.x, a.y - b.y) > 0.02) out.push({ x: a.x, y: a.y });
    return out;
  }
  function resample(points, N) {
    if (!points || points.length < 2) return null;
    const pts = closePath(points);
    const seg = [];
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      seg.push(d);
      len += d;
    }
    if (len < 0.02) return null;
    const out = [];
    let acc = 0, si = 0;
    for (let k = 0; k < N; k++) {
      const target = (k / N) * len;
      while (si < seg.length - 1 && acc + seg[si] < target - 1e-9) {
        acc += seg[si];
        si++;
      }
      const d = seg[si] || 0;
      const t = d === 0 ? 0 : Math.min(1, (target - acc) / d);
      const p = pts[si], q = pts[si + 1] || p;
      out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
    return out;
  }
  function dft(pts) {
    const N = pts.length;
    const out = [];
    for (let k = 0; k < N; k++) {
      let re = 0, im = 0;
      const freq = k <= N / 2 ? k : k - N;
      for (let n = 0; n < N; n++) {
        const phi = (Math.PI * 2 * k * n) / N;
        const c = Math.cos(phi), sn = Math.sin(phi);
        const x = pts[n].x, y = pts[n].y;
        re += x * c + y * sn;
        im += y * c - x * sn;
      }
      re /= N;
      im /= N;
      out.push({ freq, amp: Math.hypot(re, im), phase: Math.atan2(im, re) });
    }
    out.sort((a, b) => b.amp - a.amp);
    return out;
  }
  function lemniscate() {
    const pts = [];
    for (let i = 0; i < 480; i++) {
      const t = (i / 480) * Math.PI * 2;
      const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s;
      pts.push({ x: (c / d) * 1.35, y: ((s * c) / d) * 1.35 });
    }
    return pts;
  }
  function rose() {
    const k = 5, pts = [];
    for (let i = 0; i < 640; i++) {
      const th = (i / 640) * Math.PI * 2;
      const r = Math.cos(k * th);
      pts.push({ x: r * Math.cos(th) * 0.95, y: r * Math.sin(th) * 0.95 });
    }
    return pts;
  }
  function coast() {
    const pts = [];
    for (let i = 0; i < 420; i++) {
      const th = (i / 420) * Math.PI * 2;
      const r = 0.72 + 0.16 * Math.sin(3 * th + 0.6) + 0.07 * Math.sin(8 * th) + 0.045 * Math.sin(15 * th + 1.1);
      pts.push({ x: Math.cos(th) * r, y: Math.sin(th) * r });
    }
    return pts;
  }

  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  function waveColor(v) {
    const u = Math.max(0, Math.min(1, v * 0.5 + 0.5));
    const s = u * u * (3 - 2 * u);
    const ink = [14, 12, 10], mid = [32, 78, 74], hot = [236, 196, 150];
    return s < 0.58 ? mix(ink, mid, s / 0.58) : mix(mid, hot, (s - 0.58) / 0.42);
  }
  function paintWaves(canvas, cssW, cssH, time, s1, s2, lambda, phase, speed) {
    const div = cssW > 700 ? 3 : 2.4;
    const w = Math.max(8, Math.floor(cssW / div));
    const h = Math.max(8, Math.floor(cssH / div));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      canvas._buf = null;
    }
    if (!canvas._buf) canvas._buf = new ImageData(w, h);
    const img = canvas._buf, data = img.data;
    const k = (Math.PI * 2) / lambda;
    const omega = time * 0.001 * speed;
    const ph = (phase * Math.PI) / 180;
    const ax = s1.x * w, ay = s1.y * h, bx = s2.x * w, by = s2.y * h;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const r1 = Math.hypot(x - ax, y - ay) + 0.8;
        const r2 = Math.hypot(x - bx, y - by) + 0.8;
        const f1 = Math.min(1.4, Math.pow(18 / r1, 0.45));
        const f2 = Math.min(1.4, Math.pow(18 / r2, 0.45));
        const v =
          Math.sin(k * (r1 * (cssW / w)) - omega) * f1 +
          Math.sin(k * (r2 * (cssW / w)) - omega + ph) * f2;
        const rgb = waveColor(Math.max(-1, Math.min(1, v * 0.72)));
        const i = (y * w + x) * 4;
        data[i] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
        data[i + 3] = 255;
      }
    }
    canvas.getContext("2d").putImageData(img, 0, 0);
  }

  function hexRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mixHex(a, b, t) {
    const A = hexRgb(a), B = hexRgb(b), m = mix(A, B, Math.max(0, Math.min(1, t)));
    return "rgb(" + (m[0] | 0) + ", " + (m[1] | 0) + ", " + (m[2] | 0) + ")";
  }
  function skyStops(hour) {
    const keys = [
      [0, ["#07080e", "#1a140f"]],
      [5, ["#241833", "#e39a6a"]],
      [8, ["#8eafc4", "#f0d7b4"]],
      [16, ["#6e97b8", "#e7d3b4"]],
      [18.5, ["#d88862", "#2a1c28"]],
      [20.5, ["#14182c", "#100e12"]],
      [24, ["#07080e", "#1a140f"]],
    ];
    const h = ((hour % 24) + 24) % 24;
    let i = 0;
    while (i < keys.length - 2 && h > keys[i + 1][0]) i++;
    const a = keys[i], b = keys[i + 1];
    const t = (h - a[0]) / (b[0] - a[0] || 1);
    return [mixHex(a[1][0], b[1][0], t), mixHex(a[1][1], b[1][1], t)];
  }
  function makeCity(seed) {
    const rnd = mulberry32(hashSeed(seed));
    const count = 15 + Math.floor(rnd() * 7);
    const buildings = [];
    let x = 0;
    for (let i = 0; i < count; i++) {
      const gap = 8 + rnd() * 14;
      const w = 34 + rnd() * 78;
      const h = 48 + Math.pow(rnd(), 0.62) * 250;
      buildings.push({
        x, w, h,
        setback: rnd() > 0.7,
        dome: rnd() > 0.9,
        mast: rnd() > 0.8,
        win: rnd(),
      });
      x += w + gap;
    }
    const stars = Array.from({ length: 36 }, () => ({
      x: rnd(), y: rnd() * 0.4, r: 0.4 + rnd() * 1.3, a: 0.25 + rnd() * 0.7,
    }));
    return { buildings, width: x, stars };
  }

  function drawBenham(ctx, R) {
    ctx.fillStyle = "#f4efe6";
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#14120f";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#14120f";
    ctx.lineCap = "butt";
    const start = Math.PI / 2, span = Math.PI;
    for (let g = 0; g < 4; g++) {
      const a0 = start + (g / 4) * span + 0.03;
      const a1 = a0 + (span / 4) * 0.7;
      const radial = 0.2 + g * 0.16;
      for (let k = 0; k < 3; k++) {
        ctx.lineWidth = Math.max(1.1, R * 0.011);
        ctx.beginPath();
        ctx.arc(0, 0, R * (radial + k * 0.034), a0, a1);
        ctx.stroke();
      }
    }
  }

  const ink = $("#ink");
  const paint = $("#paint");
  const aside = $("#aside");
  const veil = $("#veil");
  const dust = $("#dust");
  const hero = $("#heroCanvas");
  let abort = null;
  let current = null;
  let benhamSprite = null;
  let benhamR = 0;

  const heroState = {
    a: [2.35, 0, 2.35, 0],
    b: [2.35, 0, 2.35 + 0.02, 0],
    ta: [],
    tb: [],
  };
  const miniPend = {
    a: [2.2, 0.4, 1.4, 0],
    b: [2.2, 0.4, 1.4 + 0.05, 0],
  };
  let cityCache = { key: "", city: null };
  const dustMotes = Array.from({ length: 36 }, (_, i) => ({
    x: (i * 97) % 1000,
    y: (i * 53) % 800,
    r: 0.4 + (i % 5) * 0.25,
    v: 4 + (i % 7),
  }));

  function every(fn) {
    jobs.add(fn);
    return () => jobs.delete(fn);
  }

  function drawHero(_now, dt) {
    if (!hero) return;
    const { ctx, w, h } = prep(hero, 2);
    if (dt > 0) {
      heroState.a = integrate(heroState.a, dt, 0) || [2.35, 0, 2.35, 0];
      heroState.b = integrate(heroState.b, dt, 0) || heroState.a.slice();
    }
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(243,236,223,0.06)";
    ctx.lineWidth = 1;
    for (let x = 24; x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 16);
      ctx.lineTo(x, h - 16);
      ctx.stroke();
    }
    const len = Math.min(w, h) * 0.26;
    const ox = w * 0.5, oy = h * 0.2;
    drawBob(ctx, heroState.a, ox, oy, len, "rgba(143,208,200,ALPHA)", heroState.ta);
    drawBob(ctx, heroState.b, ox, oy, len, "rgba(232,161,90,ALPHA)", heroState.tb);
    ctx.fillStyle = "#e8a15a";
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCity(ctx, w, h, city, hour, wind, now, seed) {
    const sky = skyStops(hour);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, sky[0]);
    g.addColorStop(1, sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const night = hour < 6.2 || hour > 18.3;
    if (night) {
      for (const s of city.stars) {
        ctx.globalAlpha = s.a * (0.65 + 0.35 * Math.sin(now / 500 + s.x * 20));
        ctx.fillStyle = "#f3ecdf";
        ctx.fillRect(s.x * w, s.y * h * 0.7, s.r, s.r);
      }
      ctx.globalAlpha = 1;
      const mx = w * (0.18 + ((hour < 6 ? hour + 6 : hour - 18) / 12) * 0.62);
      const my = h * 0.16;
      const glow = ctx.createRadialGradient(mx, my, 4, mx, my, Math.min(w, h) * 0.22);
      glow.addColorStop(0, "rgba(243,236,223,0.95)");
      glow.addColorStop(1, "rgba(243,236,223,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mx, my, Math.min(w, h) * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    const ground = h * 0.72;
    const pad = w * 0.04;
    const scale = (w - pad * 2) / city.width;
    const base = ground;
    const seedN = hashSeed(seed);
    for (let i = 0; i < city.buildings.length; i++) {
      const b = city.buildings[i];
      const x = pad + b.x * scale;
      const bw = b.w * scale;
      const bh = b.h * scale * (h / 520);
      const y = base - bh;
      ctx.fillStyle = night ? "#14110f" : "#31404a";
      ctx.fillRect(x, y, bw, bh);
      if (b.setback) ctx.fillRect(x + bw * 0.18, y - bh * 0.18, bw * 0.64, bh * 0.18);
      if (b.dome) {
        ctx.beginPath();
        ctx.arc(x + bw / 2, y, bw * 0.28, Math.PI, 0);
        ctx.fill();
      }
      if (b.mast) {
        ctx.save();
        ctx.translate(x + bw * 0.72, y);
        ctx.rotate(Math.sin(now / 700 + i) * 0.08 * wind);
        ctx.fillRect(-0.6, -bh * 0.28, 1.2, bh * 0.28);
        ctx.restore();
      }
      const cell = Math.max(5, 7 * (w / 900));
      const lights = night ? 1 : 0.22;
      for (let wy = y + 8; wy < base - 8; wy += cell) {
        for (let wx = x + 4; wx < x + bw - 4; wx += cell) {
          const flick = (seedN ^ Math.imul(wx | 0, 131) ^ Math.imul(wy | 0, 977)) >>> 0;
          const on = ((Math.floor(now / 800) + flick) % 11) > (night ? 3 : 8);
          ctx.fillStyle = on ? "rgba(232,180,120," + (0.35 + lights * 0.6) + ")" : "rgba(6,8,12,0.45)";
          ctx.fillRect(wx, wy, Math.max(2, cell * 0.42), Math.max(3, cell * 0.55));
        }
      }
    }
    if (city.buildings.length > 5) {
      const A = city.buildings[2], B = city.buildings[5];
      const x1 = pad + (A.x + A.w * 0.5) * scale;
      const y1 = base - A.h * scale * (h / 520);
      const x2 = pad + (B.x + B.w * 0.2) * scale;
      const y2 = base - B.h * scale * (h / 520);
      ctx.strokeStyle = "rgba(243,236,223,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + 18 + wind * 16, x2, y2 + Math.sin(now / 500) * wind * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(8,10,14,0.55)";
    ctx.fillRect(0, ground, w, h - ground);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, ground, w, h - ground);
    ctx.clip();
    ctx.globalAlpha = 0.28;
    ctx.translate(0, ground * 2);
    ctx.scale(1, -1);
    for (const b of city.buildings) {
      const x = pad + b.x * scale;
      const bw = b.w * scale;
      const bh = b.h * scale * (h / 520);
      ctx.fillStyle = night ? "#c8beb0" : "#9bb0be";
      ctx.fillRect(x, ground - bh, bw, bh);
    }
    ctx.restore();
  }

  function drawMinis(now, dt) {
    document.querySelectorAll("canvas.mini").forEach((canvas) => {
      const kind = canvas.dataset.mini;
      const { ctx, w, h } = prep(canvas, 1.5);
      if (w < 4 || h < 4) return;
      ctx.clearRect(0, 0, w, h);
      if (kind === "iz") {
        const scale = Math.min(w, h) * 0.34;
        const t = (now / 1000 / 6) % 1;
        let x = w / 2, y = h / 2;
        const coeffs = canvas._c || (canvas._c = dft(resample(lemniscate(), 96)).slice(0, 14));
        ctx.lineWidth = 1;
        for (const c of coeffs) {
          const ang = Math.PI * 2 * c.freq * t + c.phase;
          const nx = x + Math.cos(ang) * c.amp * scale;
          const ny = y + Math.sin(ang) * c.amp * scale;
          if (c.amp * scale > 1.2) {
            ctx.beginPath();
            ctx.arc(x, y, c.amp * scale, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(143,208,200,0.35)";
            ctx.stroke();
          }
          x = nx;
          y = ny;
        }
        ctx.fillStyle = "#e8a15a";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === "tank") {
        paintWaves(canvas, w, h, now, { x: 0.32, y: 0.48 }, { x: 0.7, y: 0.55 }, 28, 40, 1.4);
      } else if (kind === "benham") {
        const R = Math.min(w, h) * 0.42;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((now / 1000) * 4);
        drawBenham(ctx, R);
        ctx.restore();
      } else if (kind === "kelebek") {
        if (dt > 0) {
          miniPend.a = integrate(miniPend.a, dt, 0) || miniPend.a;
          miniPend.b = integrate(miniPend.b, dt, 0) || miniPend.b;
        }
        const len = Math.min(w, h) * 0.28;
        drawBob(ctx, miniPend.a, w * 0.5, h * 0.16, len, "rgba(143,208,200,ALPHA)");
        drawBob(ctx, miniPend.b, w * 0.5, h * 0.16, len, "rgba(232,161,90,ALPHA)");
      } else if (kind === "oran") {
        ctx.strokeStyle = "rgba(243,236,223,0.15)";
        ctx.strokeRect(8, 8, w - 16, h - 16);
        ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
          const t = i / 12;
          const x = w / 2 + Math.sin(3 * t + 0.6) * w * 0.32;
          const y = h / 2 + Math.sin(2 * t) * h * 0.32;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = "#8fd0c8";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else if (kind === "siluet") {
        if (!canvas._city) canvas._city = makeCity("gece");
        drawCity(ctx, w, h, canvas._city, 22.4, 0.4, now, "gece");
      }
    });
  }

  function drawDust(now, dt) {
    const { ctx, w, h } = prep(dust, 1);
    ctx.clearRect(0, 0, w, h);
    if (!playing) return;
    ctx.fillStyle = "rgba(243,236,223,0.28)";
    for (const m of dustMotes) {
      m.y -= m.v * dt * 8;
      if (m.y < -4) m.y = h + 4;
      const x = ((m.x / 1000) * w + Math.sin(now / 900 + m.r) * 8) % w;
      ctx.globalAlpha = 0.15 + (m.r % 0.4);
      ctx.fillRect(x, m.y, m.r, m.r);
    }
    ctx.globalAlpha = 1;
  }

  const audio = {
    ctx: null,
    ensure() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error("no-audio");
      if (!this.ctx) this.ctx = new AC();
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },
  };
  let osc = [], gains = [], master = null, wantShepard = false, chordToken = 0, stairSpeed = 1;

  function silenceShepard() {
    for (const o of osc) {
      try { o.stop(); } catch (e) { /* */ }
    }
    osc = [];
    gains = [];
    if (master) {
      try { master.disconnect(); } catch (e) { /* */ }
      master = null;
    }
  }
  function startShepard() {
    const ctx = audio.ensure();
    silenceShepard();
    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
    for (let i = 0; i < 8; i++) {
      const o = ctx.createOscillator();
      o.type = "sine";
      const g = ctx.createGain();
      g.gain.value = 0;
      o.connect(g);
      g.connect(master);
      o.start();
      osc.push(o);
      gains.push(g);
    }
    wantShepard = true;
  }
  function updateShepard(time) {
    if (!wantShepard || !osc.length || !audio.ctx) return;
    const cycle = 9 / stairSpeed;
    const pos = (((time % cycle) + cycle) % cycle) / cycle;
    const N = osc.length, fMin = 46, fMax = 46 * 2 ** 6, now = audio.ctx.currentTime;
    for (let i = 0; i < N; i++) {
      const frac = (pos + i / N) % 1;
      const freq = fMin * (fMax / fMin) ** frac;
      const amp = 0.5 - 0.5 * Math.cos(Math.PI * 2 * frac);
      osc[i].frequency.setTargetAtTime(freq, now, 0.04);
      gains[i].gain.setTargetAtTime(amp * 0.045, now, 0.04);
    }
  }
  function playChord(a, b) {
    const ctx = audio.ensure();
    const token = ++chordToken;
    const resume = wantShepard;
    if (resume) silenceShepard();
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04);
    bus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);
    bus.connect(ctx.destination);
    for (const f of [196 * a, 196 * b]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(bus);
      o.start();
      o.stop(ctx.currentTime + 1.7);
    }
    if (resume) {
      setTimeout(() => {
        if (token === chordToken && wantShepard) {
          try { startShepard(); } catch (e) { wantShepard = false; }
        }
      }, 1750);
    }
  }

  const stair = $("#stair");
  function drawStair(now) {
    if (!stair) return;
    const { ctx, w, h } = prep(stair, 2);
    ctx.clearRect(0, 0, w, h);
    const time = wantShepard && audio.ctx ? audio.ctx.currentTime : now / 1000;
    if (wantShepard) updateShepard(time);
    const cycle = 9 / stairSpeed;
    const pos = (((time % cycle) + cycle) % cycle) / cycle;
    const N = 8;
    ctx.strokeStyle = "rgba(243,236,223,0.16)";
    ctx.beginPath();
    ctx.moveTo(18, h / 2);
    ctx.lineTo(w - 18, h / 2);
    ctx.stroke();
    for (let i = 0; i < N; i++) {
      const frac = (pos + i / N) % 1;
      const amp = 0.5 - 0.5 * Math.cos(Math.PI * 2 * frac);
      const x = 20 + frac * (w - 48);
      const bh = 10 + amp * (h * 0.72);
      ctx.globalAlpha = 0.12 + amp * 0.88;
      ctx.fillStyle = amp > 0.72 ? "#e8a15a" : "#8fd0c8";
      ctx.fillRect(x, h / 2 - bh / 2, Math.max(6, w / 70), bh);
    }
    ctx.globalAlpha = 1;
  }

  function meters(map) {
    for (const k of Object.keys(map)) {
      const el = aside.querySelector("[data-m=\"" + k + "\"]");
      const val = String(map[k]);
      if (el && el.textContent !== val) el.textContent = val;
    }
  }

  const instruments = {
    iz: {
      mount(signal) {
        let path = resample(lemniscate(), 180);
        let coeffs = dft(path);
        let raw = lemniscate();
        let count = 22;
        let trace = [];
        let lastT = 0;
        let lastSize = "";
        let drawing = false;
        let sketch = [];
        const view = { w: 1, h: 1 };
        aside.innerHTML =
          '<div class="row">' +
          '<button type="button" class="chip" data-preset="sonsuz" aria-pressed="true">Sonsuz</button>' +
          '<button type="button" class="chip" data-preset="gul" aria-pressed="false">Gül</button>' +
          '<button type="button" class="chip" data-preset="kiyi" aria-pressed="false">Kıyı</button></div>' +
          '<label class="field"><span>DAİRE SAYISI <b data-m="count">22</b></span>' +
          '<input type="range" min="1" max="60" step="1" value="22" data-k="count"></label>' +
          '<p class="hint">Sürgü daireleri azaltır. Biçim bozulur, fikir kalır. İstersen camın üstüne kendi çizgini bırak.</p>' +
          '<div class="meters"><div class="meter"><small>NOKTA</small><b data-m="pts">—</b></div>' +
          '<div class="meter"><small>SAPMA</small><b data-m="err">—</b></div></div>';
        veil.hidden = false;
        veil.textContent = "Basılı tutup çiz. Bırakınca daireler devralır.";
        function load(pts, preset) {
          raw = pts;
          path = resample(pts, 180);
          coeffs = path ? dft(path) : [];
          trace = [];
          lastT = 0;
          aside.querySelectorAll("[data-preset]").forEach((b) =>
            b.setAttribute("aria-pressed", String(b.dataset.preset === preset))
          );
        }
        aside.addEventListener("click", (e) => {
          const b = e.target.closest("[data-preset]");
          if (!b) return;
          const map = { sonsuz: lemniscate, gul: rose, kiyi: coast };
          load(map[b.dataset.preset](), b.dataset.preset);
        }, { signal });
        aside.addEventListener("input", (e) => {
          if (e.target.dataset.k === "count") count = Number(e.target.value);
          trace = [];
        }, { signal });
        ink.addEventListener("pointerdown", (e) => {
          drawing = true;
          sketch = [rel(e, ink)];
          ink.setPointerCapture(e.pointerId);
        }, { signal });
        ink.addEventListener("pointermove", (e) => {
          if (!drawing) return;
          sketch.push(rel(e, ink));
        }, { signal });
        const finish = () => {
          if (!drawing) return;
          drawing = false;
          if (sketch.length < 12) {
            veil.textContent = "Biraz daha uzun çiz.";
            return;
          }
          const scale = Math.min(view.w, view.h) * 0.4;
          const norm = sketch.map((p) => ({
            x: (p.x - view.w / 2) / scale,
            y: (p.y - view.h / 2) / scale,
          }));
          load(norm, "");
          veil.textContent = "Bu senin izindi. Daire sayısını azalt, neyin kaldığına bak.";
        };
        ink.addEventListener("pointerup", finish, { signal });
        ink.addEventListener("pointercancel", finish, { signal });
        every((now) => {
          const { ctx, w, h } = prep(ink, 2);
          view.w = w;
          view.h = h;
          const size = w + "x" + h;
          if (size !== lastSize) {
            trace = [];
            lastSize = size;
          }
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(243,236,223,0.06)";
          ctx.strokeRect(18, 18, w - 36, h - 36);
          if (drawing) {
            ctx.beginPath();
            sketch.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
            ctx.strokeStyle = "#e8a15a";
            ctx.lineWidth = 2;
            ctx.lineJoin = "round";
            ctx.stroke();
            return;
          }
          if (!path || !coeffs.length) return;
          const scale = Math.min(w, h) * 0.4;
          const t = ((now / 1000) / 8) % 1;
          if (t < lastT) trace = [];
          lastT = t;
          ctx.beginPath();
          raw.forEach((p, i) => {
            const x = w / 2 + p.x * scale;
            const y = h / 2 + p.y * scale;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          });
          ctx.closePath();
          ctx.strokeStyle = "rgba(232,161,90,0.28)";
          ctx.lineWidth = 1;
          ctx.stroke();
          let x = w / 2, y = h / 2;
          const n = Math.min(count, coeffs.length);
          ctx.lineWidth = 1;
          for (let i = 0; i < n; i++) {
            const c = coeffs[i];
            const rad = c.amp * scale;
            const ang = Math.PI * 2 * c.freq * t + c.phase;
            const nx = x + Math.cos(ang) * rad;
            const ny = y + Math.sin(ang) * rad;
            if (rad > 0.8) {
              ctx.beginPath();
              ctx.arc(x, y, rad, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(143,208,200,0.33)";
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(nx, ny);
              ctx.strokeStyle = "rgba(243,236,223,0.45)";
              ctx.stroke();
            }
            x = nx;
            y = ny;
          }
          trace.push({ x, y });
          if (trace.length > 1100) trace.shift();
          ctx.beginPath();
          trace.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
          ctx.strokeStyle = "#8fd0c8";
          ctx.lineWidth = 1.8;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.fillStyle = "#e8a15a";
          ctx.beginPath();
          ctx.arc(x, y, 3.2, 0, Math.PI * 2);
          ctx.fill();
          let err = 0;
          for (let i = 0; i < path.length; i += 2) {
            const tt = i / path.length;
            let rx = 0, ry = 0;
            for (let k = 0; k < n; k++) {
              const c = coeffs[k];
              const ang = Math.PI * 2 * c.freq * tt + c.phase;
              rx += c.amp * Math.cos(ang);
              ry += c.amp * Math.sin(ang);
            }
            err += Math.hypot(rx - path[i].x, ry - path[i].y);
          }
          err /= path.length / 2;
          meters({ count: String(n), pts: String(path.length), err: err.toFixed(3) });
        });
      },
    },
    tank: {
      mount(signal) {
        const s1 = { x: 0.33, y: 0.46 };
        const s2 = { x: 0.68, y: 0.56 };
        let lambda = 46, speed = 1.5, phase = 30, drag = null;
        const size = { w: 1, h: 1 };
        aside.innerHTML =
          '<label class="field"><span>DALGA BOYU <b data-m="lam">46</b></span>' +
          '<input type="range" min="18" max="110" step="1" value="46" data-k="lam"></label>' +
          '<label class="field"><span>HIZ <b data-m="spd">1.5</b></span>' +
          '<input type="range" min="0" max="3" step="0.1" value="1.5" data-k="spd"></label>' +
          '<label class="field"><span>FAZ <b data-m="ph">30°</b></span>' +
          '<input type="range" min="0" max="360" step="1" value="30" data-k="ph"></label>' +
          '<p class="hint">İşaretçiyi desenin üstünde gezdir. Yol farkı yarım dalgaya yakınsa orası kararır.</p>' +
          '<div class="meters"><div class="meter"><small>BURASI</small><b data-m="here">—</b></div>' +
          '<div class="meter"><small>YOL FARKI</small><b data-m="path">—</b></div></div>';
        aside.addEventListener("input", (e) => {
          const k = e.target.dataset.k, v = Number(e.target.value);
          if (k === "lam") lambda = v;
          if (k === "spd") speed = v;
          if (k === "ph") phase = v;
        }, { signal });
        const hit = (p) => {
          const a = { x: s1.x * size.w, y: s1.y * size.h };
          const b = { x: s2.x * size.w, y: s2.y * size.h };
          if (Math.hypot(p.x - a.x, p.y - a.y) < 28) return s1;
          if (Math.hypot(p.x - b.x, p.y - b.y) < 28) return s2;
          return null;
        };
        ink.addEventListener("pointerdown", (e) => {
          const p = rel(e, ink);
          drag = hit(p);
          if (drag) ink.setPointerCapture(e.pointerId);
        }, { signal });
        ink.addEventListener("pointermove", (e) => {
          const p = rel(e, ink);
          if (drag) {
            drag.x = Math.max(0.06, Math.min(0.94, p.x / size.w));
            drag.y = Math.max(0.06, Math.min(0.94, p.y / size.h));
          }
          const r1 = Math.hypot(p.x - s1.x * size.w, p.y - s1.y * size.h);
          const r2 = Math.hypot(p.x - s2.x * size.w, p.y - s2.y * size.h);
          const m = (r1 - r2) / lambda + phase / 360;
          const frac = Math.abs(m - Math.round(m));
          meters({ path: m.toFixed(2) + " λ", here: frac < 0.22 ? "AYDINLIK" : "KARANLIK" });
        }, { signal });
        ink.addEventListener("pointerup", () => (drag = null), { signal });
        every((now, dt) => {
          const box = ink.getBoundingClientRect();
          size.w = box.width;
          size.h = box.height;
          if (dt > 0 || drag || !paint._buf) {
            paintWaves(paint, box.width, box.height, now, s1, s2, lambda, phase, speed);
          }
          const { ctx, w, h } = prep(ink, 2);
          ctx.clearRect(0, 0, w, h);
          for (const [s, color, name] of [
            [s1, "#8fd0c8", "A"],
            [s2, "#e8a15a", "B"],
          ]) {
            ctx.beginPath();
            ctx.arc(s.x * w, s.y * h, 11, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.font = "11px IBM Plex Mono, monospace";
            ctx.fillText(name, s.x * w + 14, s.y * h - 10);
          }
          meters({ lam: String(lambda), spd: speed.toFixed(1), ph: phase + "°" });
        });
      },
    },
    benham: {
      mount(signal) {
        let rev = 6.5, dir = 1;
        aside.innerHTML =
          '<label class="field"><span>DEVİR / SN <b data-m="rev">6.5</b></span>' +
          '<input type="range" min="0" max="12" step="0.1" value="6.5" data-k="rev"></label>' +
          '<div class="row"><button type="button" class="chip" data-act="dir" aria-pressed="false">Yönü çevir</button>' +
          '<button type="button" class="chip" data-act="stop">Durdur</button></div>' +
          '<p class="hint">Ortadaki noktaya bak, desene değil. Hızı sıfırla: diskte yalnızca iki renk kalır. Yön değişince çoğu kişide sıcak ile soğuk yer değiştirir.</p>' +
          '<div class="meters"><div class="meter"><small>PALET</small><b data-m="pal">2 değer</b></div>' +
          '<div class="meter"><small>YÖN</small><b data-m="dir">saat yönü</b></div></div>';
        aside.addEventListener("input", (e) => {
          if (e.target.dataset.k === "rev") rev = Number(e.target.value);
        }, { signal });
        aside.addEventListener("click", (e) => {
          const b = e.target.closest("[data-act]");
          if (!b) return;
          if (b.dataset.act === "dir") {
            dir *= -1;
            b.setAttribute("aria-pressed", String(dir < 0));
          }
          if (b.dataset.act === "stop") {
            rev = 0;
            const range = aside.querySelector("[data-k=rev]");
            if (range) range.value = "0";
          }
        }, { signal });
        every((now) => {
          const { ctx, w, h } = prep(ink, 2);
          ctx.clearRect(0, 0, w, h);
          const R = Math.min(w, h) * 0.4;
          const pr = Math.round(R);
          if (!benhamSprite || benhamR !== pr) {
            benhamSprite = document.createElement("canvas");
            benhamSprite.width = benhamSprite.height = pr * 2;
            benhamR = pr;
            const c = benhamSprite.getContext("2d");
            c.translate(pr, pr);
            drawBenham(c, pr - 1);
          }
          const ang = (now / 1000) * rev * Math.PI * 2 * dir;
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate(ang);
          ctx.drawImage(benhamSprite, -pr, -pr);
          ctx.restore();
          ctx.fillStyle = "#e8a15a";
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(143,208,200,0.7)";
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
          ctx.stroke();
          meters({
            rev: rev.toFixed(1),
            dir: dir > 0 ? "saat yönü" : "tersi",
            pal: rev === 0 ? "yalnızca 2" : "2 + senin rengin",
          });
        });
      },
    },
    kelebek: {
      mount(signal) {
        let delta = 0.25, damp = 0;
        let a = [2.4, 0, 2.4, 0];
        let b = [2.4, 0, 2.4 + (delta * Math.PI) / 180, 0];
        let ta = [], tb = [];
        const e0 = energy(a);
        function reset() {
          const d = (delta * Math.PI) / 180;
          a = [2.4, 0, 2.4, 0];
          b = [2.4, 0, 2.4 + d, 0];
          ta = [];
          tb = [];
        }
        aside.innerHTML =
          '<label class="field"><span>BAŞLANGIÇ FARKI <b data-m="deg">0.25°</b></span>' +
          '<input type="range" min="0.05" max="8" step="0.05" value="0.25" data-k="deg"></label>' +
          '<div class="row"><button type="button" class="chip" data-act="air" aria-pressed="false">Hava: yok</button>' +
          '<button type="button" class="chip" data-act="reset">Yeniden bırak</button></div>' +
          '<p class="hint">Farkı değiştirmek sarkacı baştan bırakır. Küçük değerde bir süre ikisi de tek çizgi gibi durur.</p>' +
          '<div class="meters"><div class="meter"><small>AYRIŞMA</small><b data-m="gap">—</b></div>' +
          '<div class="meter"><small>ENERJİ</small><b data-m="en">—</b></div></div>';
        aside.addEventListener("input", (e) => {
          if (e.target.dataset.k === "deg") {
            delta = Number(e.target.value);
            reset();
          }
        }, { signal });
        aside.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-act]");
          if (!btn) return;
          if (btn.dataset.act === "air") {
            damp = damp ? 0 : 0.45;
            btn.setAttribute("aria-pressed", String(damp > 0));
            btn.textContent = damp ? "Hava: var" : "Hava: yok";
          }
          if (btn.dataset.act === "reset") reset();
        }, { signal });
        every((_now, dt) => {
          if (dt > 0) {
            a = integrate(a, dt, damp) || a;
            b = integrate(b, dt, damp) || b;
          }
          const { ctx, w, h } = prep(ink, 2);
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(243,236,223,0.05)";
          for (let y = 20; y < h; y += 26) {
            ctx.beginPath();
            ctx.moveTo(16, y);
            ctx.lineTo(w - 16, y);
            ctx.stroke();
          }
          const len = Math.min(w, h) * 0.24;
          const ox = w / 2, oy = h * 0.18;
          const pa = drawBob(ctx, a, ox, oy, len, "rgba(143,208,200,ALPHA)", ta);
          const pb = drawBob(ctx, b, ox, oy, len, "rgba(232,161,90,ALPHA)", tb);
          ctx.fillStyle = "#f3ecdf";
          ctx.beginPath();
          ctx.arc(ox, oy, 4, 0, Math.PI * 2);
          ctx.fill();
          const gap = Math.hypot(pa.x2 - pb.x2, pa.y2 - pb.y2) / len;
          const drift = Math.abs(energy(a) - e0);
          meters({
            deg: delta.toFixed(2) + "°",
            gap: gap.toFixed(2) + " L",
            en: drift < 0.05 ? "korunuyor" : "sapma " + drift.toFixed(2),
          });
        });
      },
    },
    oran: {
      mount(signal) {
        let a = 3, b = 2, ph = 0.6, fog = 0.12, clear = true;
        aside.innerHTML =
          '<label class="field"><span>FREKANS A <b data-m="a">3</b></span>' +
          '<input type="range" min="1" max="7" step="1" value="3" data-k="a"></label>' +
          '<label class="field"><span>FREKANS B <b data-m="b">2</b></span>' +
          '<input type="range" min="1" max="7" step="1" value="2" data-k="b"></label>' +
          '<label class="field"><span>FAZ <b data-m="ph">0.60</b></span>' +
          '<input type="range" min="0" max="1.57" step="0.01" value="0.6" data-k="ph"></label>' +
          '<label class="field"><span>FOSFOR <b data-m="fog">uzun</b></span>' +
          '<input type="range" min="0.04" max="0.5" step="0.01" value="0.12" data-k="fog"></label>' +
          '<button type="button" class="btn full" data-act="listen">Bu oranı dinle</button>' +
          '<p class="hint" data-m="feel">3:2 · beşli · kulak bunu tanıdık sayar</p>';
        function feel() {
          const g = gcd(a, b);
          const n = (a / g) * (b / g);
          const name = n <= 2 ? "çok sade" : n <= 6 ? "tanıdık" : n <= 15 ? "gerilimli" : "yabancı";
          return a + ":" + b + " · " + name;
        }
        aside.addEventListener("input", (e) => {
          const k = e.target.dataset.k, v = Number(e.target.value);
          if (k === "a") a = v;
          if (k === "b") b = v;
          if (k === "ph") ph = v;
          if (k === "fog") fog = v;
          if (k === "a" || k === "b" || k === "ph") clear = true;
        }, { signal });
        aside.addEventListener("click", (e) => {
          if (!e.target.closest("[data-act=listen]")) return;
          try {
            playChord(a, b);
          } catch (err) {
            const hint = aside.querySelector("[data-m=feel]");
            if (hint) hint.textContent = "Bu tarayıcı sesi açmadı.";
          }
        }, { signal });
        every(() => {
          const { ctx, w, h } = prep(ink, 2);
          if (clear) {
            ctx.fillStyle = "#100e0c";
            ctx.fillRect(0, 0, w, h);
            clear = false;
          } else {
            ctx.fillStyle = "rgba(16,14,12," + fog + ")";
            ctx.fillRect(0, 0, w, h);
          }
          const rx = w * 0.36, ry = h * 0.34;
          for (let i = 0; i < 160; i++) {
            const t = i * 0.04;
            const x = w / 2 + Math.sin(a * t + ph) * rx;
            const y = h / 2 + Math.sin(b * t) * ry;
            ctx.fillStyle = i % 9 === 0 ? "#e8a15a" : "#8fd0c8";
            ctx.fillRect(x, y, 1.6, 1.6);
          }
          ctx.strokeStyle = "rgba(243,236,223,0.14)";
          ctx.lineWidth = 1;
          ctx.strokeRect(16, 16, w - 32, h - 32);
          ctx.beginPath();
          ctx.moveTo(w / 2, 20);
          ctx.lineTo(w / 2, h - 20);
          ctx.moveTo(20, h / 2);
          ctx.lineTo(w - 20, h / 2);
          ctx.stroke();
          const fogName = fog < 0.1 ? "uzun" : fog < 0.25 ? "orta" : "kısa";
          meters({ a: String(a), b: String(b), ph: ph.toFixed(2), fog: fogName });
          const hint = aside.querySelector("[data-m=feel]");
          if (hint && hint.textContent !== feel()) hint.textContent = feel();
        });
      },
    },
    siluet: {
      mount(signal) {
        let seed = "gece", hour = 22.4, wind = 0.45;
        const words = ["gece", "tuz", "iskele", "karanfil", "peron", "loş", "mendirek", "nane", "istim", "halat", "eşik", "pus"];
        aside.innerHTML =
          '<label class="field"><span>TOHUM</span>' +
          '<input class="textin" data-k="seed" value="' + esc(seed) + '" maxlength="32" autocomplete="off" aria-label="Tohum kelimesi"></label>' +
          '<label class="field"><span>SAAT <b data-m="hour">22:24</b></span>' +
          '<input type="range" min="0" max="24" step="0.1" value="22.4" data-k="hour"></label>' +
          '<label class="field"><span>RÜZGÂR <b data-m="wind">0.45</b></span>' +
          '<input type="range" min="0" max="1.4" step="0.05" value="0.45" data-k="wind"></label>' +
          '<button type="button" class="btn ghost full" data-act="roll">Başka bir kelime</button>' +
          '<p class="hint">Aynı yazım, aynı kıyı. Bu bir tahmin değil, bir fonksiyon. Harita iddiası yok.</p>' +
          '<div class="meters"><div class="meter"><small>YAPI</small><b data-m="n">—</b></div>' +
          '<div class="meter"><small>GÖKYÜZÜ</small><b data-m="sky">gece</b></div></div>';
        aside.addEventListener("input", (e) => {
          const k = e.target.dataset.k;
          if (k === "seed") seed = e.target.value.trim() || "gece";
          if (k === "hour") hour = Number(e.target.value);
          if (k === "wind") wind = Number(e.target.value);
        }, { signal });
        aside.addEventListener("click", (e) => {
          if (!e.target.closest("[data-act=roll]")) return;
          seed = words[Math.floor(Math.random() * words.length)];
          const input = aside.querySelector("[data-k=seed]");
          if (input) input.value = seed;
        }, { signal });
        every((now) => {
          const key = seed;
          if (cityCache.key !== key) cityCache = { key, city: makeCity(key) };
          const { ctx, w, h } = prep(ink, 1.75);
          drawCity(ctx, w, h, cityCache.city, hour, wind, now, seed);
          const H = Math.floor(hour) % 24;
          const M = Math.floor((hour % 1) * 60);
          const stamp = String(H).padStart(2, "0") + ":" + String(M).padStart(2, "0");
          const sky = hour < 6 || hour > 18.5 ? "gece" : hour < 9 || hour > 16.5 ? "alacakaranlık" : "gün";
          meters({ hour: stamp, wind: wind.toFixed(2), n: String(cityCache.city.buildings.length), sky });
        });
      },
    },
  };

  function openInstrument(id, opts) {
    opts = opts || {};
    if (!CATALOG[id]) return;
    if (current === id && !opts.force) {
      if (opts.scroll) $("#stage").scrollIntoView({ behavior: playing ? "smooth" : "auto", block: "start" });
      return;
    }
    if (abort) abort.abort();
    jobs.clear();
    every(drawHero);
    every(drawMinis);
    every(drawDust);
    every(drawStair);
    abort = new AbortController();
    current = id;
    const meta = CATALOG[id];
    $("#stageKicker").innerHTML = "<i></i> " + meta.kicker;
    $("#stageTitle").textContent = meta.title;
    $("#stageLede").textContent = meta.lede;
    document.title = meta.kicker.split("·")[1].trim() + " — Ergin Lab";
    document.querySelectorAll("[data-open]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.open === id))
    );
    paint.style.visibility = id === "tank" ? "visible" : "hidden";
    if (id !== "tank") {
      paint.width = 2;
      paint.height = 2;
      paint._buf = null;
    }
    veil.hidden = true;
    ink.style.touchAction = id === "iz" || id === "tank" ? "none" : "pan-y";
    instruments[id].mount(abort.signal);
    if (opts.setHash !== false && location.hash !== "#" + id) location.hash = id;
    if (opts.scroll) $("#stage").scrollIntoView({ behavior: playing ? "smooth" : "auto", block: "start" });
  }

  function resolveHash() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ""));
    const alias = { taskflow: "iz", skyline: "siluet", tempo: "merdiven", "calc-lab": "oran", calc: "oran" };
    return alias[h] || h;
  }

  function tick(now) {
    requestAnimationFrame(tick);
    const wall = Math.min(0.05, (now - lastStamp) / 1000);
    lastStamp = now;
    const step = playing && !document.hidden ? wall : 0;
    if (step) simNow += step * 1000;
    for (const fn of jobs) fn(simNow, step);
  }

  function bootClock() {
    const el = $("#clock");
    const fmt = () => {
      try {
        return (
          new Intl.DateTimeFormat("tr-TR", {
            timeZone: "Europe/Istanbul",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
          }).format(new Date()) + " İST"
        );
      } catch (e) {
        return "";
      }
    };
    const paintClock = () => {
      el.textContent = fmt();
    };
    paintClock();
    setInterval(paintClock, 1000);
  }

  const motionBtn = $("#motionBtn");
  function paintMotion() {
    motionBtn.textContent = playing ? "Hareket açık" : "Hareket durdu";
    motionBtn.setAttribute("aria-pressed", String(playing));
  }
  motionBtn.addEventListener("click", () => {
    playing = !playing;
    paintMotion();
  });
  paintMotion();
  $("#openChaos").addEventListener("click", () => openInstrument("kelebek", { scroll: true }));
  $("#cards").addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (!b) return;
    openInstrument(b.dataset.open, { scroll: true });
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    const map = { "1": "iz", "2": "tank", "3": "benham", "4": "kelebek", "5": "oran", "6": "siluet" };
    if (map[e.key]) {
      e.preventDefault();
      openInstrument(map[e.key], { scroll: true });
    }
  });
  const soundBtn = $("#soundBtn");
  const stairRate = $("#stairRate");
  const stairOut = $("#stairOut");
  stairRate.addEventListener("input", () => {
    stairSpeed = Number(stairRate.value);
    stairOut.textContent = stairSpeed.toFixed(1);
  });
  soundBtn.addEventListener("click", () => {
    try {
      if (wantShepard) {
        wantShepard = false;
        silenceShepard();
        soundBtn.textContent = "Sesi aç";
        soundBtn.setAttribute("aria-pressed", "false");
      } else {
        startShepard();
        soundBtn.textContent = "Sesi kapat";
        soundBtn.setAttribute("aria-pressed", "true");
      }
    } catch (e) {
      soundBtn.textContent = "Ses açılamadı";
    }
  });
  window.addEventListener("hashchange", () => {
    const id = resolveHash();
    if (CATALOG[id]) openInstrument(id, { scroll: true, setHash: false });
    else if (id === "merdiven")
      $("#merdiven").scrollIntoView({ behavior: playing ? "smooth" : "auto", block: "start" });
  });

  bootClock();
  const start = resolveHash();
  if (CATALOG[start]) openInstrument(start, { scroll: true, setHash: false });
  else {
    openInstrument("iz", { scroll: false, setHash: false });
    if (start === "merdiven") $("#merdiven").scrollIntoView({ block: "start" });
  }
  requestAnimationFrame(tick);
})();
