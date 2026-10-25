/* Arka plan: kor, yıldırım, yavaş metal mühür. İzleme yok. */
(function () {
  const canvas = document.getElementById("rift");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  let lastFrame = 0;
  let framePending = false;
  let w = 0;
  let h = 0;
  let dpr = 1;
  const count = Math.min(90, Math.max(36, Math.round((window.innerWidth * window.innerHeight) / 18000)));
  const sparks = Array.from({ length: count }, spawn);
  let bolt = null;
  let boltLife = 0;
  let tear = null;
  let angle = 0;

  function spawn() {
    return {
      x: Math.random(),
      y: Math.random(),
      v: 0.12 + Math.random() * 0.7,
      s: 0.6 + Math.random() * 1.8,
      a: 0.25 + Math.random() * 0.75,
      drift: Math.random() * 6,
    };
  }

  function accent() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--red").trim();
    const hex = raw.startsWith("#") ? raw.slice(1) : "";
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
    return [255, 31, 26];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 720 ? 1.35 : 1.75);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function sigil(cx, cy, r, rot) {
    const [r0, g0, b0] = accent();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = `rgba(${r0},${g0},${b0},0.28)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const th = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(th) * r * 0.86;
      const y = Math.sin(th) * r * 0.86;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 3; i += 1) {
      const th = -Math.PI / 2 + (i / 3) * Math.PI * 2 + rot;
      const x = Math.cos(th) * r * 0.42;
      const y = Math.sin(th) * r * 0.42;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function makeBolt(x1, y1, x2, y2) {
    const pts = [[x1, y1]];
    const segs = 7 + Math.floor(Math.random() * 5);
    for (let i = 1; i <= segs; i += 1) {
      const t = i / segs;
      pts.push([
        x1 + (x2 - x1) * t + (Math.random() - 0.5) * 70,
        y1 + (y2 - y1) * t,
      ]);
    }
    return pts;
  }

  function scheduleFrame() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(frame);
  }

  function frame(now) {
    framePending = false;
    const motionOn = document.documentElement.dataset.motion === "on";
    const tremor = document.documentElement.dataset.tremor !== "off";
    /* The texture is atmospheric, so 30 FPS is visually enough and halves canvas work. */
    if (motionOn && tremor && now - lastFrame < 1000 / 30) {
      scheduleFrame();
      return;
    }
    lastFrame = now;
    ctx.clearRect(0, 0, w, h);
    const nx = window.__nx ?? 0.72;
    const ny = window.__ny ?? 0.22;
    if (motionOn && tremor) angle += 0.0011;
    const r1 = Math.min(w, h) * 0.34;
    sigil(w * (0.78 + (nx - 0.5) * 0.04), h * (0.22 + (ny - 0.5) * 0.03), r1, angle);
    sigil(w * 0.08, h * 0.86, Math.min(w, h) * 0.16, -angle * 1.4);

    const [r0, g0, b0] = accent();
    if (motionOn && tremor) {
      sparks.forEach((p) => {
        p.y -= p.v * 0.0032;
        p.x += Math.sin(now * 0.001 + p.drift) * 0.00035;
        if (p.y < -0.04) {
          p.y = 1.04;
          p.x = Math.random();
        }
        ctx.fillStyle = `rgba(${r0},${g0},${b0},${0.15 + p.a * 0.55})`;
        ctx.fillRect(p.x * w, p.y * h, p.s, p.s * 3.2);
      });
      if (!bolt && Math.random() < 0.0035) {
        const x = w * (0.15 + Math.random() * 0.7);
        bolt = makeBolt(x, -10, x + (Math.random() - 0.5) * 180, h * (0.35 + Math.random() * 0.4));
        boltLife = 1;
      }
      if (!tear && Math.random() < 0.01) {
        tear = { y: Math.random() * h, h: 2 + Math.random() * 10, life: 1, shift: (Math.random() - 0.5) * 24 };
      }
    }

    if (bolt) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, boltLife);
      ctx.strokeStyle = `rgb(${r0},${g0},${b0})`;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = `rgb(${r0},${g0},${b0})`;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      bolt.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
      ctx.stroke();
      ctx.restore();
      boltLife -= 0.08;
      if (boltLife <= 0) bolt = null;
    }

    if (tear) {
      ctx.fillStyle = `rgba(${r0},${g0},${b0},${0.18 * tear.life})`;
      ctx.fillRect(tear.shift, tear.y, w, tear.h);
      tear.life -= 0.12;
      if (tear.life <= 0) tear = null;
    }

    if (motionOn && tremor) scheduleFrame();
  }

  window.addEventListener("resize", resize, { passive: true });
  const motionObserver = new MutationObserver(() => {
    if (document.documentElement.dataset.motion === "on" &&
        document.documentElement.dataset.tremor !== "off") scheduleFrame();
  });
  motionObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion", "data-tremor"],
  });
  resize();
  scheduleFrame();
})();
