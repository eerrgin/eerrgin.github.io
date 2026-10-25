import * as THREE from "three";

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
  ["Merak", 11.0307, 56.382, 2.37], ["Phecda", 11.897, 53.695, 2.44], ["Megrez", 12.257, 57.033, 3.31], ["Mizar", 13.398, 54.925, 2.04],
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
    name: "Ay", color: 0xf2efe6, ra: moon.ra, dec: moon.dec, parallax: moon.parallax,
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, innerWidth <= 720 ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x070208, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x14060c, 0.012);
const camera = new THREE.PerspectiveCamera(56,innerWidth/innerHeight,.1,400);
camera.position.set(0,0,0);camera.rotation.order="YXZ";
let viewYaw=.16,viewPitch=.28,targetYaw=viewYaw,targetPitch=viewPitch,focusedBodyIndex=null,dragState=null;
camera.rotation.set(viewPitch,viewYaw,0);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const wrapDelta=(to,from)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
const viewPresets={overview:{yaw:.16,pitch:.28,fov:56},north:{yaw:0,pitch:.06,fov:49},east:{yaw:Math.PI/2,pitch:.16,fov:51},zenith:{yaw:.2,pitch:1.18,fov:61},south:{yaw:Math.PI,pitch:.16,fov:51}};
let targetFov=camera.fov;
function setView(name){
 const preset=viewPresets[name]||viewPresets.overview;targetYaw=preset.yaw;targetPitch=preset.pitch;targetFov=preset.fov;focusedBodyIndex=null;
 document.querySelectorAll("[data-view]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.view===name)));
 document.querySelectorAll("[data-focus-index]").forEach(b=>b.setAttribute("aria-pressed","false"));
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
const guideCard=document.getElementById("guide-card"),guideToggle=document.getElementById("guide-toggle");
function closeGuide(){guideCard.hidden=true;guideToggle.setAttribute("aria-expanded","false");}
document.getElementById("guide-dismiss").addEventListener("click",closeGuide);
document.getElementById("guide-start").addEventListener("click",closeGuide);
guideToggle.addEventListener("click",()=>{const opening=guideCard.hidden;guideCard.hidden=!opening;guideToggle.setAttribute("aria-expanded",String(opening));});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
canvas.addEventListener("pointerdown",e=>{if(e.button!==0)return;dragState={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);canvas.classList.add("dragging");});
canvas.addEventListener("pointermove",e=>{
 if(!dragState||dragState.id!==e.pointerId)return;
 const dx=e.clientX-dragState.x,dy=e.clientY-dragState.y;dragState.x=e.clientX;dragState.y=e.clientY;
 if(Math.hypot(e.clientX-dragState.sx,e.clientY-dragState.sy)>4)dragState.moved=true;
 if(!dragState.moved)return;
 targetYaw-=dx*.0045;targetPitch=clamp(targetPitch-dy*.004,-1.43,1.43);focusedBodyIndex=null;
 document.querySelectorAll("[data-view]").forEach(b=>b.setAttribute("aria-pressed","false"));
 document.querySelectorAll("[data-focus-index]").forEach(b=>b.setAttribute("aria-pressed","false"));
});
function endDrag(e){
 if(!dragState||dragState.id!==e.pointerId)return;const state=dragState;dragState=null;canvas.classList.remove("dragging");if(state.moved)return;
 pointer.x=e.clientX/innerWidth*2-1;pointer.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects([...planetMeshes.values()].filter(m=>m.visible),false)[0];
 if(hit){const name=[...planetMeshes.entries()].find(([,m])=>m===hit.object)?.[0];const index=latestState?.bodies.findIndex(b=>b.name===name)??-1;if(index>=0)focusBody(index);}
}
canvas.addEventListener("pointerup",endDrag);
canvas.addEventListener("pointercancel",()=>{dragState=null;canvas.classList.remove("dragging");});
canvas.addEventListener("lostpointercapture",()=>{dragState=null;canvas.classList.remove("dragging");});
canvas.addEventListener("wheel",e=>{e.preventDefault();targetFov=clamp(targetFov+Math.sign(e.deltaY)*2.5,34,75);},{passive:false});

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
  const g = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.6, transparent: true });
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), g);
  scene.add(m);
  const label = document.createElement("div");
  return m;
}
for(const n of ["Güneş","Ay",...PLANETS.filter(p=>p.name!=="Dünya").map(p=>p.name)]){
 const r=n==="Güneş"?1.05:n==="Ay"?.7:n==="Jüpiter"?.62:n==="Satürn"?.55:.46;
 const color=n==="Güneş"?0xffd59a:n==="Ay"?0xe6e8f2:(PLANETS.find(p=>p.name===n)?.color??0xdac9b7);
 planetMeshes.set(n,makeBody(color,r));
}

function addDomeLine(points,color=0x94b7e9,opacity=.17,loop=false){
 const g=new THREE.BufferGeometry().setFromPoints(points),m=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});
 scene.add(loop?new THREE.LineLoop(g,m):new THREE.Line(g,m));
}
function addCompassSprite(shortLabel,subLabel,azimuth){
 const c=document.createElement("canvas");c.width=320;c.height=112;const x=c.getContext("2d");
 x.fillStyle="rgba(6,7,16,.82)";x.strokeStyle="rgba(157,195,255,.52)";x.lineWidth=2;x.beginPath();x.roundRect(3,3,314,106,16);x.fill();x.stroke();
 x.textAlign="center";x.textBaseline="middle";x.fillStyle="#fff0df";x.font="600 38px monospace";x.fillText(shortLabel,160,39);x.fillStyle="#b8c9e7";x.font="22px monospace";x.fillText(subLabel,160,79);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
 sprite.position.copy(domeVector($(2),$(azimuth),DOME*.91));sprite.scale.set(8.4,2.95,1);scene.add(sprite);
}
function addCelestialDome(){
 const radius=DOME*.975;
 for(const altitude of [0,30,60]){
  const points=[];
  for(let degree=0;degree<360;degree+=3){const az=$(degree),alt=$(altitude);points.push(new THREE.Vector3(radius*Math.cos(alt)*Math.sin(az),radius*Math.sin(alt),-radius*Math.cos(alt)*Math.cos(az)));}
  addDomeLine(points,altitude===0?0xff6b61:0x88a8dd,altitude===0?.45:.16,true);
 }
 for(let azimuth=0;azimuth<180;azimuth+=30){
  const points=[];
  for(let altitude=0;altitude<=90;altitude+=3){const a=$(altitude),z=$(azimuth);points.push(new THREE.Vector3(radius*Math.cos(a)*Math.sin(z),radius*Math.sin(a),-radius*Math.cos(a)*Math.cos(z)));}
  for(let altitude=87;altitude>=0;altitude-=3){const a=$(altitude),z=$(azimuth+180);points.push(new THREE.Vector3(radius*Math.cos(a)*Math.sin(z),radius*Math.sin(a),-radius*Math.cos(a)*Math.cos(z)));}
  addDomeLine(points,0x7790be,.1,false);
 }
 addCompassSprite("K","KUZEY",0);addCompassSprite("D","DOĞU",90);addCompassSprite("G","GÜNEY",180);addCompassSprite("B","BATI",270);
}
addCelestialDome();
function makeStarLabel(name){
 const c=document.createElement("canvas");c.width=300;c.height=60;const x=c.getContext("2d");x.font="24px monospace";x.textAlign="left";x.textBaseline="middle";x.fillStyle="rgba(218,228,250,.92)";x.fillText(name.toUpperCase(),3,30);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(7.2,1.45,1);s.visible=false;scene.add(s);return s;
}
const labelledStarNames=["Polaris","Vega","Sirius","Betelgeuse","Rigel","Arcturus","Altair","Deneb"];
const starLabels=new Map(labelledStarNames.map(n=>[n,makeStarLabel(n)]));
const focusHalo=new THREE.Mesh(new THREE.RingGeometry(1.1,1.32,56),new THREE.MeshBasicMaterial({color:0xffe5b2,transparent:true,opacity:.95,side:THREE.DoubleSide,depthTest:false}));
focusHalo.visible=false;scene.add(focusHalo);



const readouts=document.getElementById("readouts"),panel=document.getElementById("panel");
const bodyRows=document.getElementById("body-rows"),visibleCount=document.getElementById("visible-count");
const offsetLabel=document.getElementById("offset-label"),offsetInput=document.getElementById("off"),when=document.getElementById("when");
let dayOffset=0,latestState=null,lastHud=-Infinity;
function fmt(n,d=2){return Number.isFinite(n)?n.toFixed(d):"—";}
function formatDegrees(rad){const v=deg(rad);return (v>0?"+":"")+v.toFixed(1)+"°";}
function compassDirection(rad){const names=["KUZEY","KD","DOĞU","GD","GÜNEY","GB","BATI","KB"],v=((deg(rad)%360)+360)%360;return names[Math.round(v/45)%8];}
function formatLightTime(seconds){
 if(!Number.isFinite(seconds)||seconds<0)return "—";
 if(seconds<60)return seconds.toFixed(1)+" sn";
 if(seconds<3600)return Math.floor(seconds/60)+" dk "+Math.round(seconds%60)+" sn";
 if(seconds<86400)return Math.floor(seconds/3600)+" sa "+Math.floor((seconds%3600)/60)+" dk";
 return Math.floor(seconds/86400)+" gün "+Math.floor((seconds%86400)/3600)+" sa";
}
function updateOffsetLabel(){const offset=Number(offsetInput.value);offsetLabel.textContent=Math.abs(offset)<.001?"BUGÜN":(offset>0?"+":"")+offset.toFixed(1)+" GÜN";when.textContent=Math.abs(offset)<.001?"CANLI":"ZAMAN KAYDIRILDI";}
function focusBody(index){
 const b=latestState?.bodies[index];if(!b)return;focusedBodyIndex=index;targetYaw=b.az;targetPitch=clamp(b.alt,-1.35,1.35);targetFov=43;
 document.querySelectorAll("[data-view]").forEach(b=>b.setAttribute("aria-pressed","false"));
 panel.querySelectorAll("[data-focus-index]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.focusIndex)===index)));
}
function buildBodyRows(state){
 bodyRows.innerHTML=state.bodies.map((b,i)=>{
  const color="#"+(b.color>>>0).toString(16).padStart(6,"0");
  return `<tr id="body-row-${i}"><td><button type="button" class="body-focus" data-focus-index="${i}" aria-pressed="false" title="${b.name} gökyüzünde ortala"><span class="body-dot" style="--body-color:${color}"></span><span class="body-title"><strong>${b.name}</strong><small id="body-status-${i}">HESAPLANIYOR</small></span></button></td><td data-label="Yükseklik"><span class="altitude-value" id="body-alt-${i}">—</span></td><td data-label="Yön"><span class="azimuth-value"><strong id="body-dir-${i}">—</strong><small id="body-az-${i}">—</small></span></td><td data-label="Işık yolu" id="body-light-${i}">—</td><td data-label="Sapma ölçeği" id="body-ein-${i}">—</td></tr>`;
 }).join("");
 panel.querySelectorAll("[data-focus-index]").forEach(b=>b.addEventListener("click",()=>focusBody(Number(b.dataset.focusIndex))));
}
function updateDashboard(state){
 const sun=state.bodies.find(b=>b.name==="Güneş"),date=new Date((state.jd-2440587.5)*86400000);
 const localTime=date.toLocaleTimeString("tr-TR",{timeZone:"Europe/Istanbul",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});
 const localDate=date.toLocaleDateString("tr-TR",{timeZone:"Europe/Istanbul",day:"2-digit",month:"short",year:"numeric"});
 const lstH=((deg(state.lst)/15)%24+24)%24;
 readouts.innerHTML=`<span><small>SAMATYA SAATİ</small><b>${localTime}</b></span><span><small>YEREL TARİH</small><b>${localDate}</b></span><span><small>YEREL YILDIZ ZAMANI</small><b>${fmt(lstH,2)} sa</b></span>`;
 if(!bodyRows.children.length)buildBodyRows(state);
 let above=0;
 state.bodies.forEach((b,i)=>{
  const row=document.getElementById("body-row-"+i),status=document.getElementById("body-status-"+i),alt=document.getElementById("body-alt-"+i);
  const dir=document.getElementById("body-dir-"+i),az=document.getElementById("body-az-"+i),light=document.getElementById("body-light-"+i),ein=document.getElementById("body-ein-"+i);
  if(!row||!status||!alt||!dir||!az||!light||!ein)return;
  const onSky=b.alt>0;if(onSky)above++;row.classList.toggle("below-horizon",!onSky);status.textContent=onSky?"UFUK ÜSTÜ":"UFUK ALTI";
  alt.textContent=formatDegrees(b.alt);alt.className="altitude-value "+(onSky?"above":"below");
  const azDeg=((deg(b.az)%360)+360)%360;dir.textContent=compassDirection(b.az);az.textContent=Math.round(azDeg)+"°";light.textContent=formatLightTime(b.lightDays*86400);
  const sep=Math.acos(Math.max(-1,Math.min(1,Math.sin(b.alt)*Math.sin(sun.alt)+Math.cos(b.alt)*Math.cos(sun.alt)*Math.cos(b.az-sun.az))));
  ein.textContent="≈"+fmt(b.name==="Güneş"?1.75:einsteinArcsec(Math.max(sep,.00465)),2)+"″";
 });
 visibleCount.textContent=String(above);
}
function place(state){
 latestState=state;const pos=starGeo.attributes.position,col=starGeo.attributes.color;
 starBase.forEach((s,i)=>{
  const hor=eqToHorizontal(s.ra,s.dec,state.lst);hor.alt+=refractionRad(hor.alt);
  const mag=apparentMag(s.v,hor.alt),v=domeVector(hor.alt,hor.az,DOME*.98);pos.setXYZ(i,v.x,v.y,v.z);
  const bright=(mag<5.2&&hor.alt>0)?Math.max(.15,1.15-mag/5):.02;col.setXYZ(i,bright,bright*.82,bright*.75);
  const label=starLabels.get(s.name);if(label){label.position.copy(domeVector(hor.alt,hor.az,DOME*.89));label.visible=hor.alt>3*Math.PI/180;}
 });
 pos.needsUpdate=true;col.needsUpdate=true;
 for(const b of state.bodies){const mesh=planetMeshes.get(b.name);if(!mesh)continue;mesh.position.copy(domeVector(b.alt,b.az,DOME*.94));mesh.visible=Math.abs(b.alt)<Math.PI/2;mesh.material.opacity=b.alt>0?1:.22;mesh.material.emissiveIntensity=b.alt>0?.35:.08;if(b.name==="Güneş")moonLight.position.copy(mesh.position);}
 if(focusedBodyIndex!=null&&state.bodies[focusedBodyIndex]){const mesh=planetMeshes.get(state.bodies[focusedBodyIndex].name);if(mesh){focusHalo.visible=mesh.visible;focusHalo.position.copy(mesh.position);focusHalo.quaternion.copy(camera.quaternion);}}else focusHalo.visible=false;
 if(performance.now()-lastHud>500){lastHud=performance.now();updateDashboard(state);}
}

addEventListener("resize",()=>{
 const width=Math.max(1,innerWidth),height=Math.max(1,innerHeight);
 camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,width<=720?1.35:1.75));renderer.setSize(width,height);
},{passive:true});
offsetInput.addEventListener("input",()=>{dayOffset=parseFloat(offsetInput.value)||0;updateOffsetLabel();});
document.getElementById("now").addEventListener("click",()=>{dayOffset=0;offsetInput.value="0";updateOffsetLabel();lastHud=-Infinity;});



const LINES = [
  ["Dubhe","Merak"],["Merak","Phecda"],["Phecda","Megrez"],["Megrez","Dubhe"],["Megrez","Alioth"],["Alioth","Mizar"],["Mizar","Alkaid"],
  ["Betelgeuse","Bellatrix"],["Bellatrix","Alnilam"],["Alnilam","Alnitak"],["Alnitak","Rigel"],
  ["Altair","Vega"],["Vega","Deneb"],["Deneb","Altair"],
];
const byName = Object.fromEntries(starBase.map((s,i)=>[s.name,i]));
const linePos = new Float32Array(LINES.length * 2 * 3);
const lineGeo = new THREE.BufferGeometry();
lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xff2a22, transparent: true, opacity: 0.35 })));

const MW = 1400;
const mwPos = new Float32Array(MW * 3);
const mwCol = new Float32Array(MW * 3);
const mwBase = [];
for (let i = 0; i < MW; i++) {
  const l = Math.random() * Math.PI * 2;
  const b = (Math.random() - 0.5) * 0.28;
  const poleRa = 192.85948 * Math.PI / 180;
  const poleDec = 27.12825 * Math.PI / 180;
  const angp = 122.932 * Math.PI / 180;
  const sb = Math.sin(b), cb = Math.cos(b);
  const sl = Math.sin(l - angp), cl = Math.cos(l - angp);
  const dec = Math.asin(Math.sin(poleDec)*sb + Math.cos(poleDec)*cb*cl);
  const y = cb*sl;
  const x = Math.cos(poleDec)*sb - Math.sin(poleDec)*cb*cl;
  const ra = wrap(poleRa + Math.atan2(y, x));
  mwBase.push({ ra, dec });
  mwCol[i*3] = 0.55; mwCol[i*3+1] = 0.28; mwCol[i*3+2] = 0.32;
}
const mwGeo = new THREE.BufferGeometry();
mwGeo.setAttribute("position", new THREE.BufferAttribute(mwPos, 3));
mwGeo.setAttribute("color", new THREE.BufferAttribute(mwCol, 3));
scene.add(new THREE.Points(mwGeo, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.55 })));

const saturn = planetMeshes.get("Satürn");
if (saturn) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.7, 1.25, 40),
    new THREE.MeshBasicMaterial({ color: 0xe6d3a1, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
  );
  ring.rotation.x = Math.PI / 2.4;
  saturn.add(ring);
}

function earthVel(T) {
  const dt = 1 / 36525;
  const a = heliocentric(PLANETS[2], T);
  const b = heliocentric(PLANETS[2], T + dt);
  const eps = obliquity(T);
  const va = eclipticToEq(b.x - a.x, b.y - a.y, b.z - a.z, eps);
  const days = dt * 36525;
  return new THREE.Vector3(va.x / days, va.y / days, va.z / days);
}
function aberrate(ra, dec, vel) {
  const u = new THREE.Vector3(Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec));
  u.addScaledVector(vel, 1 / C_AU_PER_DAY);
  u.normalize();
  return { ra: Math.atan2(u.y, u.x), dec: Math.asin(Math.max(-1, Math.min(1, u.z))) };
}

const _place = place;
function placeAber(state) {
  const vel = earthVel(state.T);
  state.vel = vel;
  for (const s of starBase) {
    if (!s._ra) { s._ra = s.ra; s._dec = s.dec; }
    const q = aberrate(s._ra, s._dec, vel);
    s.ra = q.ra; s.dec = q.dec;
  }
  for (const b of state.bodies) {
    const q = aberrate(b.ra, b.dec, vel);
    const hor = eqToHorizontal(q.ra, q.dec, state.lst);
    if (b.name === "Ay") hor.alt -= b.parallax || 0;
    b.alt = hor.alt + refractionRad(hor.alt);
    b.az = hor.az;
  }
  _place(state);
  const sp = starGeo.attributes.position;
  LINES.forEach((pair, i) => {
    const ia = byName[pair[0]], ib = byName[pair[1]];
    if (ia == null || ib == null) return;
    linePos.set([sp.getX(ia), sp.getY(ia), sp.getZ(ia), sp.getX(ib), sp.getY(ib), sp.getZ(ib)], i * 6);
  });
  lineGeo.attributes.position.needsUpdate = true;
  const mp = mwGeo.attributes.position;
  mwBase.forEach((s, i) => {
    const q = aberrate(s.ra, s.dec, vel);
    let hor = eqToHorizontal(q.ra, q.dec, state.lst);
    hor.alt += refractionRad(hor.alt);
    const v = domeVector(hor.alt, hor.az, DOME * 0.97);
    mp.setXYZ(i, v.x, v.y, v.z);
  });
  mp.needsUpdate = true;
}

let lastSkyUpdate=-Infinity,renderFrameId=0;
function frame(now=performance.now()){
 if(now-lastSkyUpdate>=200){const live=julianDate(new Date()),state=bodyAt(live+dayOffset);placeAber(state);lastSkyUpdate=now;}
 viewYaw+=wrapDelta(targetYaw,viewYaw)*.12;viewPitch+=(targetPitch-viewPitch)*.12;camera.fov+=(targetFov-camera.fov)*.12;
 camera.rotation.set(viewPitch,viewYaw,0,"YXZ");camera.updateProjectionMatrix();
 if(focusedBodyIndex!=null){const body=latestState?.bodies[focusedBodyIndex],mesh=body?planetMeshes.get(body.name):null;if(mesh){focusHalo.position.copy(mesh.position);focusHalo.quaternion.copy(camera.quaternion);}}
 renderer.render(scene,camera);renderFrameId=requestAnimationFrame(frame);
}
document.addEventListener("visibilitychange",()=>{
 if(document.visibilityState==="hidden"){if(renderFrameId)cancelAnimationFrame(renderFrameId);renderFrameId=0;}
 else if(!renderFrameId){lastSkyUpdate=-Infinity;renderFrameId=requestAnimationFrame(frame);}
});
updateOffsetLabel();renderFrameId=requestAnimationFrame(frame);
