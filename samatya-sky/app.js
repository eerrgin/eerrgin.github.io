import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/** Samatya, İstanbul. Rakım kıyı kotu. */
const SITE = {
  latDeg: 41.0028,
  lonDeg: 28.9404,
  altM: 18,
};
const LAT = (SITE.latDeg * Math.PI) / 180;
const LON = (SITE.lonDeg * Math.PI) / 180;
const AU_KM = 149597870.7;
const C_AU_PER_DAY = 173.144632674; // ışık hızı, AU/gün
const DOME = 80;

const $ = (n) => (n * Math.PI) / 180;
const deg = (n) => (n * 180) / Math.PI;
const wrap = (a) => {
  a %= 2 * Math.PI;
  return a < 0 ? a + 2 * Math.PI : a;
};

/** J2000 Kepler öğeleri. Açılar derece, T yüzyıl. NASA/JPL yaklaşık tablo. */
const PLANETS = [
  ["Merkür", 0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.2503235, 149472.67411, 77.45779628, 0.16047689, 48.33076593, -0.12534081, 0xc9b2a6],
  ["Venüs", 0.72333566, 0.0000039, 0.00677672, -0.00004107, 3.39467605, -0.0007889, 181.9790995, 58517.815387, 131.6024672, 0.00268329, 76.67984255, -0.27769418, 0xe6c7a2],
  ["Dünya", 1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.4645717, 35999.37245, 102.9376819, 0.32327364, 0.0, 0.0, 0x8fb7ff],
  ["Mars", 1.52371034, 0.00001847, 0.0933941, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268, -23.94362959, 0.44441088, 49.55953891, -0.29257343, 0xd2644a],
  ["Jüpiter", 5.202887, -0.00011607, 0.04838624, -0.00013253, 1.30439695, -0.00183714, 34.39644051, 3034.746128, 14.72847983, 0.21252668, 100.4739091, 0.20469106, 0xd8b48a],
  ["Satürn", 9.53667594, -0.0012506, 0.05386179, -0.00050991, 2.48599187, 0.00193609, 49.95424423, 1222.493622, 92.59887831, -0.41897216, 113.6624245, -0.28867794, 0xe6d3a1],
  ["Uranüs", 19.18916464, -0.00196176, 0.04725744, -0.00004397, 0.77263783, -0.00242939, 313.2381045, 428.4820279, 170.9542763, 0.40805281, 74.01692503, 0.04240589, 0x9fd6d2],
  ["Neptün", 30.06992276, 0.00026291, 0.00859048, 0.00005105, 1.77004347, 0.00035372, -55.12002969, 218.4594533, 44.96476227, -0.32241464, 131.7842257, -0.00508664, 0x6f8cff],
].map((p) => ({
  name: p[0], color: p[13],
  a0: p[1], a1: p[2], e0: p[3], e1: p[4], I0: p[5], I1: p[6],
  L0: p[7], L1: p[8], w0: p[9], w1: p[10], O0: p[11], O1: p[12],
}));

/** Parlak yıldızlar: RA saat, Dec derece, V kadir. Rastgele küre değil. */
const STARS = [
  ["Sirius", 6.7525, -16.716, -1.46], ["Canopus", 6.3992, -52.696, -0.74],
  ["Arcturus", 14.261, 19.182, -0.05], ["Vega", 18.6156, 38.784, 0.03],
  ["Capella", 5.2782, 45.998, 0.08], ["Rigel", 5.2423, -8.202, 0.13],
  ["Procyon", 7.655, 5.225, 0.34], ["Betelgeuse", 5.9195, 7.407, 0.5],
  ["Altair", 19.8464, 8.868, 0.76], ["Aldebaran", 4.5987, 16.509, 0.85],
  ["Spica", 13.42, -11.161, 0.97], ["Antares", 16.4901, -26.432, 1.06],
  ["Pollux", 7.7553, 28.026, 1.14], ["Fomalhaut", 22.9608, -29.622, 1.16],
  ["Deneb", 20.6905, 45.28, 1.25], ["Regulus", 10.1396, 11.967, 1.35],
  ["Adhara", 6.977, -28.972, 1.5], ["Castor", 7.5766, 31.888, 1.57],
  ["Shaula", 17.56, -37.1, 1.62], ["Bellatrix", 5.4188, 6.35, 1.64],
  ["Elnath", 5.4382, 28.608, 1.65], ["Miaplacidus", 9.22, -69.717, 1.68],
  ["Alnilam", 5.6036, -1.202, 1.69], ["Alnair", 22.137, -46.961, 1.74],
  ["Alnitak", 5.6793, -1.943, 1.77], ["Alioth", 12.9004, 55.96, 1.77],
  ["Dubhe", 11.0621, 61.751, 1.79], ["Mirfak", 3.4054, 49.861, 1.79],
  ["Kaus Australis", 18.4029, -34.385, 1.85], ["Wezen", 7.139, -26.393, 1.84],
  ["Alkaid", 13.7923, 49.313, 1.86], ["Avior", 8.375, -59.51, 1.86],
  ["Menkalinan", 5.9921, 44.947, 1.9], ["Atria", 16.811, -69.028, 1.91],
  ["Alhena", 6.6285, 16.399, 1.93], ["Peacock", 20.427, -56.735, 1.94],
  ["Polaris", 2.5303, 89.264, 1.98], ["Algieba", 10.3328, 19.841, 2.08],
  ["Hamal", 2.1195, 23.462, 2.0], ["Diphda", 0.7264, -17.987, 2.04],
];

function julianDate(date) {
  const t = date.getTime();
  return t / 86400000 + 2440587.5;
}

function gmstRad(jd) {
  const T = (jd - 2451545.0) / 36525;
  let s = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  s = ((s % 360) + 360) % 360;
  return $(s);
}

function obliquity(T) {
  return $(23.439291 - 0.0130042 * T);
}

function kepler(M, e) {
  let E = M;
  for (let i = 0; i < 10; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    E -= f / fp;
  }
  return E;
}

function heliocentric(body, T) {
  const a = body.a0 + body.a1 * T;
  const e = body.e0 + body.e1 * T;
  const I = $(body.I0 + body.I1 * T);
  const L = $(body.L0 + body.L1 * T);
  const wbar = $(body.w0 + body.w1 * T);
  const Om = $(body.O0 + body.O1 * T);
  const M = wrap(L - wbar);
  const E = kepler(M, e);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.hypot(xv, yv);
  const w = wbar - Om;
  const x = r * (Math.cos(Om) * Math.cos(w + v) - Math.sin(Om) * Math.sin(w + v) * Math.cos(I));
  const y = r * (Math.sin(Om) * Math.cos(w + v) + Math.cos(Om) * Math.sin(w + v) * Math.cos(I));
  const z = r * (Math.sin(w + v) * Math.sin(I));
  return { x, y, z, r };
}

function eclipticToEq(x, y, z, eps) {
  return {
    x: x,
    y: y * Math.cos(eps) - z * Math.sin(eps),
    z: y * Math.sin(eps) + z * Math.cos(eps),
  };
}

function eqToHorizontal(ra, dec, lst) {
  const H = wrap(lst - ra);
  const sinAlt = Math.sin(dec) * Math.sin(LAT) + Math.cos(dec) * Math.cos(LAT) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const y = -Math.cos(dec) * Math.sin(H);
  const x = Math.sin(dec) * Math.cos(LAT) - Math.cos(dec) * Math.cos(H) * Math.sin(LAT);
  let az = Math.atan2(y, x);
  if (az < 0) az += 2 * Math.PI;
  return { alt, az };
}

/** Bennett kırılması, yay-saniye. Nem İstanbul için kaba bir ölçek. */
function refractionRad(alt, humidity = 0.72) {
  const h = deg(alt);
  if (h < -1) return 0;
  const Rarcmin = (1.02 / Math.tan($((h + 10.3 / (h + 5.11))))) * (1 + 0.08 * (humidity - 0.5));
  return $(Rarcmin / 60);
}

function airmass(alt) {
  const h = Math.max(deg(alt), 1);
  return 1 / Math.sin($(h));
}

/** Işık kirliliği: Bortle ~8, sönüm ~0.32 kadir / hava kütlesi. */
function apparentMag(v, alt) {
  if (alt <= 0) return 99;
  return v + 0.32 * (airmass(alt) - 1) + 1.6;
}

function moonGeo(jd) {
  const d = jd - 2451545.0;
  const L = $(218.3164477 + 13.17639648 * d);
  const M = $(134.9633964 + 13.06499295 * d);
  const F = $(93.272095 + 13.22935024 * d);
  const lon = L + $(6.289) * Math.sin(M);
  const lat = $(5.128) * Math.sin(F);
  const distKm = 385000.56 - 20905.355 * Math.cos(M);
  const eps = obliquity((jd - 2451545.0) / 36525);
  const x = Math.cos(lat) * Math.cos(lon);
  const y = Math.cos(lat) * Math.sin(lon);
  const z = Math.sin(lat);
  const eq = eclipticToEq(x, y, z, eps);
  const ra = wrap(Math.atan2(eq.y, eq.x));
  const dec = Math.atan2(eq.z, Math.hypot(eq.x, eq.y));
  const hp = Math.asin(6378.14 / distKm);
  const alt0 = eqToHorizontal(ra, dec, gmstRad(jd) + LON).alt;
  const parallax = hp * Math.cos(alt0);
  return { ra, dec: dec - 0, distKm, parallax, name: "Ay" };
}

function bodyAt(jd) {
  const T = (jd - 2451545.0) / 36525;
  const eps = obliquity(T);
  const earth = PLANETS[2];
  let eph = heliocentric(earth, T);
  const out = [];
  const sunVec = eclipticToEq(-eph.x, -eph.y, -eph.z, eps);
  const sunR = Math.hypot(sunVec.x, sunVec.y, sunVec.z);
  out.push(pack("Güneş", sunVec, sunR, 0xffe2a8, jd));
  for (const body of PLANETS) {
    if (body.name === "Dünya") continue;
    let tau = 0;
    let vec = null;
    let rho = 1;
    for (let k = 0; k < 3; k++) {
      const p = heliocentric(body, T - tau / 36525);
      const dx = p.x - eph.x;
      const dy = p.y - eph.y;
      const dz = p.z - eph.z;
      rho = Math.hypot(dx, dy, dz);
      tau = (rho / C_AU_PER_DAY) * 36525 * 36525 / 36525;
      tau = rho / C_AU_PER_DAY;
      vec = eclipticToEq(dx, dy, dz, eps);
    }
    out.push(pack(body.name, vec, rho, body.color, jd, tau));
  }
  const moon = moonGeo(jd);
  const lst = gmstRad(jd) + LON;
  let hor = eqToHorizontal(moon.ra, moon.dec, lst);
  hor.alt -= moon.parallax;
  hor.alt += refractionRad(hor.alt);
  out.push({
    name: "Ay", color: 0xf2efe6, ra: moon.ra, dec: moon.dec,
    distAU: moon.distKm / AU_KM, lightDays: (moon.distKm / AU_KM) / C_AU_PER_DAY,
    ...hor, mag: -12,
  });
  return { bodies: out, lst, jd, T };
}

function pack(name, eq, rho, color, jd, tauDays = null) {
  const ra = wrap(Math.atan2(eq.y, eq.x));
  const dec = Math.atan2(eq.z, Math.hypot(eq.x, eq.y));
  const lst = gmstRad(jd) + LON;
  let hor = eqToHorizontal(ra, dec, lst);
  hor.alt += refractionRad(hor.alt);
  const lightDays = tauDays == null ? rho / C_AU_PER_DAY : tauDays;
  return { name, color, ra, dec, distAU: rho, lightDays, ...hor };
}

/** Güneş kenarında Einstein sapması ~1.75". çarpışma parametresi Güneş yarıçapı cinsinden. */
function einsteinArcsec(separationRad) {
  const sunRadiusRad = 0.00465 / 1; // ~16' açısal yarıçap yaklaşık 0.00465 rad
  const b = Math.max(separationRad, sunRadiusRad);
  return 1.75 * (sunRadiusRad / b);
}

function domeVector(alt, az, radius = DOME) {
  const c = Math.cos(alt);
  return new THREE.Vector3(
    radius * c * Math.sin(az),
    radius * Math.sin(alt),
    -radius * c * Math.cos(az)
  );
}

const canvas = document.getElementById("sky");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x070208, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x14060c, 0.012);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 400);
camera.position.set(0.2, 1.5, 0.2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(8, 6, -12);
controls.minDistance = 0.4;
controls.maxDistance = 28;

scene.add(new THREE.AmbientLight(0xffd0c0, 0.35));
const moonLight = new THREE.DirectionalLight(0xfff1e0, 0.6);
scene.add(moonLight);

const starGeo = new THREE.BufferGeometry();
const positions = new Float32Array(STARS.length * 3);
const colors = new Float32Array(STARS.length * 3);
const starBase = STARS.map((s) => ({ name: s[0], ra: $(s[1] * 15), dec: $(s[2]), v: s[3] }));
starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ size: 0.55, vertexColors: true, sizeAttenuation: true })
);
scene.add(stars);

const planetMeshes = new Map();
function makeBody(color, r) {
  const g = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.6 });
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), g);
  scene.add(m);
  const label = document.createElement("div");
  return m;
}
for (const n of ["Güneş", "Ay", ...PLANETS.filter((p) => p.name !== "Dünya").map((p) => p.name)]) {
  const r = n === "Güneş" ? 1.15 : n === "Ay" ? 0.55 : n === "Jüpiter" ? 0.7 : 0.38;
  planetMeshes.set(n, makeBody(0xffffff, r));
}

// Kütleçekimsel ızgara: Güneş doğrultusunda çöken bir düzlem, analitik sapma görseli.
const grid = new THREE.Mesh(
  new THREE.PlaneGeometry(36, 36, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0xff2a22, wireframe: true, transparent: true, opacity: 0.28 })
);
grid.rotation.x = -Math.PI / 2;
grid.position.y = -0.02;
scene.add(grid);

const horizon = new THREE.Mesh(
  new THREE.RingGeometry(6, 22, 80),
  new THREE.MeshBasicMaterial({ color: 0x2a1014, side: THREE.DoubleSide })
);
horizon.rotation.x = -Math.PI / 2;
horizon.position.y = -0.03;
scene.add(horizon);

const readouts = document.getElementById("readouts");
const panel = document.getElementById("panel");

function fmt(n, d = 2) {
  return Number.isFinite(n) ? n.toFixed(d) : "—";
}
function dms(rad) {
  const sign = rad < 0 ? "-" : "";
  let x = Math.abs(deg(rad));
  const dd = Math.floor(x);
  x = (x - dd) * 60;
  const mm = Math.floor(x);
  const ss = (x - mm) * 60;
  return `${sign}${dd}° ${String(mm).padStart(2, "0")}′ ${ss.toFixed(1)}″`;
}

let lastHud = 0;
function place(state) {
  const pos = starGeo.attributes.position;
  const col = starGeo.attributes.color;
  starBase.forEach((s, i) => {
    let hor = eqToHorizontal(s.ra, s.dec, state.lst);
    hor.alt += refractionRad(hor.alt);
    const mag = apparentMag(s.v, hor.alt);
    const v = domeVector(hor.alt, hor.az, DOME * 0.98);
    pos.setXYZ(i, v.x, v.y, v.z);
    const seen = mag < 5.2 && hor.alt > 0;
    const bright = seen ? Math.max(0.15, 1.15 - mag / 5) : 0.02;
    col.setXYZ(i, bright, bright * 0.82, bright * 0.75);
  });
  pos.needsUpdate = true;
  col.needsUpdate = true;

  const sun = state.bodies.find((b) => b.name === "Güneş");
  for (const b of state.bodies) {
    const mesh = planetMeshes.get(b.name);
    if (!mesh) continue;
    const v = domeVector(b.alt, b.az, b.name === "Ay" ? 28 : 46);
    mesh.position.copy(v);
    mesh.visible = b.alt > -0.12;
    if (b.name === "Güneş") moonLight.position.copy(v);
  }

  const gpos = grid.geometry.attributes.position;
  const sunDir = domeVector(sun.alt, sun.az, 1).normalize();
  for (let i = 0; i < gpos.count; i++) {
    const x = gpos.getX(i);
    const y = gpos.getY(i);
    const flat = new THREE.Vector3(x, 0, y).normalize();
    const sep = Math.acos(Math.max(-1, Math.min(1, flat.dot(new THREE.Vector3(sunDir.x, 0, sunDir.z).normalize()))));
    const bend = Math.min(1.4, 0.9 / Math.max(0.15, sep));
    gpos.setZ(i, -bend);
  }
  gpos.needsUpdate = true;

  const nowMs = performance.now();
  if (nowMs - lastHud > 250) {
    lastHud = nowMs;
    const utc = new Date((state.jd - 2440587.5) * 86400000);
    const lstH = (deg(state.lst) / 15);
    const domeMm = (rad) => rad * 2000;
    readouts.innerHTML = `
      <span>UTC <b>${utc.toISOString().slice(11, 19)}</b></span>
      <span>LST <b>${fmt(lstH, 3)} h</b></span>
      <span>ε <b>${fmt(deg(obliquity(state.T)), 5)}°</b></span>
      <span>1 m kubbede 1″ <b>${fmt(domeMm(Math.PI / 180 / 3600), 3)} mm</b></span>`;
    const rows = state.bodies.map((b) => {
      const sep = Math.acos(Math.max(-1, Math.min(1,
        Math.sin(b.alt) * Math.sin(sun.alt) + Math.cos(b.alt) * Math.cos(sun.alt) * Math.cos(b.az - sun.az)
      )));
      const ein = b.name === "Güneş" ? 1.75 : einsteinArcsec(Math.max(sep, 0.0047));
      return `<tr>
        <td class="name">${b.name}</td>
        <td class="${b.alt > 0 ? "up" : ""}">${dms(b.alt)}</td>
        <td>${dms(b.az)}</td>
        <td>${b.lightDays < 0.01 ? fmt(b.lightDays * 86400, 1) + " s" : fmt(b.lightDays * 1440, 1) + " dk"}</td>
        <td>${fmt(ein, 2)}″</td>
      </tr>`;
    }).join("");
    panel.innerHTML = `<h2>Ufuk hesabı, ışığın gecikmesiyle.</h2>
      <table><thead><tr><td></td><td>yükseklik</td><td>azimut</td><td>ışık</td><td>sapma</td></tr></thead><tbody>${rows}</tbody></table>
      <p style="color:#b7a39a;margin:8px 0 0">Azimut kuzeyden doğuya. Yükseklik refraksiyonlu. Gezegen ışık süresi 3 yinelemeli Kepler. Ay için ufuk paralaksı var. Sapma, Güneş kütlesinin Einstein açısı ölçeğinde.</p>`;
  }
}

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function frame() {
  const state = bodyAt(julianDate(new Date()));
  place(state);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
