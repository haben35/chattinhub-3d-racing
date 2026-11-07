/* ChattinHub 3D Racing Pro — Three.js r128 (MIT). No tokens/secrets here; only local, non-sensitive saves. */
(() => {
'use strict';
const $ = id => document.getElementById(id), tg = window.Telegram && Telegram.WebApp;
try { if (tg) { tg.ready(); tg.expand(); tg.disableVerticalSwipes && tg.disableVerticalSwipes(); } } catch (e) {}

const N = 600, W = 9, BW = 12.5, TAU = Math.PI * 2, CP = [150, 300, 450];
const CARS = [
  { n: 'Comet GT', price: 0,    w: 1.9,  l: 4.3, h: .5,  cab: .5,  spd: 56, acc: 22, han: 1,    brk: 34, c: 0xd62828 },
  { n: 'Viper S',  price: 800,  w: 1.95, l: 4.5, h: .42, cab: .42, spd: 60, acc: 23, han: 1.05, brk: 36, c: 0x1d6fe0 },
  { n: 'Falcon R', price: 1500, w: 1.85, l: 4.1, h: .48, cab: .5,  spd: 63, acc: 25, han: 1.1,  brk: 38, c: 0xf2b705 },
  { n: 'Titan X',  price: 2500, w: 2.1,  l: 4.7, h: .62, cab: .6,  spd: 66, acc: 24, han: .95,  brk: 40, c: 0x2a9d4a },
  { n: 'Phantom',  price: 4000, w: 2,    l: 4.6, h: .4,  cab: .4,  spd: 70, acc: 27, han: 1.15, brk: 42, c: 0x7a3fd1 },
  { n: 'Nova One', price: 6000, w: 2,    l: 4.8, h: .38, cab: .38, spd: 74, acc: 30, han: 1.2,  brk: 46, c: 0xeeeeee }];
const COLORS = [0xd62828, 0x1d6fe0, 0xf2b705, 0x2a9d4a, 0x7a3fd1, 0xeeeeee, 0xff7a00, 0x111111];
const UPN = ['Engine', 'Accel', 'Handling', 'Brakes', 'Nitro'];
const hex = c => '#' + c.toString(16).padStart(6, '0');
const TRACKS = [
  { n: 'Coastal Circuit', k: 1.1, pts: [[0, 0], [130, -15], [260, 30], [330, 150], [260, 270], [130, 300], [40, 230], [-60, 290], [-200, 250], [-270, 120], [-190, 10], [-90, -50]],
    g0: '#3f6b32', g1: '#4a7a3a', g2: '#35592a', road: '#3b3c41', line: '#f2f2f2', sky: ['#2f6fd0', '#a9cdf2', '#e8f1fa'], gnd: '#5d7a4a', cloud: 'rgba(255,255,255,.7)', fog: 0xb9d3ee, fn: 250, hi: .75, si: 1.2, trees: 260, tc: 0x1f5a2b, mt: 0x7d8a9c, bld: 28, br: 520, be: 0x888888 },
  { n: 'Mountain Pass', k: 1.2, pts: [[0, 0], [120, 10], [230, -30], [320, 40], [340, 150], [270, 230], [170, 200], [120, 280], [20, 320], [-90, 270], [-120, 170], [-220, 130], [-260, 30], [-160, -40]],
    g0: '#6a7a4a', g1: '#78895a', g2: '#586638', road: '#46464a', line: '#f5f5f5', sky: ['#4a78b8', '#c4d6e8', '#f0f4f8'], gnd: '#7a8a6a', cloud: 'rgba(255,255,255,.85)', fog: 0xc9d8e6, fn: 120, hi: .8, si: 1.3, trees: 380, tc: 0x2b5a3a, mt: 0x9aa3ad, bld: 0, br: 520, be: 0x888888 },
  { n: 'Neon City', k: 1.1, pts: [[0, 0], [150, 0], [260, -20], [330, 60], [320, 170], [230, 210], [200, 290], [110, 330], [0, 300], [-30, 210], [-120, 180], [-210, 230], [-280, 150], [-240, 40], [-130, -20]], neon: 0xff2bd6,
    g0: '#14161d', g1: '#1a1d27', g2: '#10121a', road: '#202228', line: '#00e5ff', sky: ['#05060f', '#1b1f4a', '#4a2c6b'], gnd: '#0b0c14', cloud: 'rgba(255,255,255,.12)', fog: 0x0c0f24, fn: 60, hi: .4, si: .4, trees: 30, tc: 0x1b3b2b, mt: 0x1a1c2e, bld: 70, br: 410, be: 0xcccccc }];

// ---------- save (non-sensitive, local only) ----------
const KEY = 'chrp_v1';
let save = { credits: 300, owned: [0], sel: 0, cfg: {}, best: {}, mute: false };
try { Object.assign(save, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
save.best = save.best || {}; save.ghost = save.ghost || {};
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} };
const cfgOf = i => save.cfg[i] || (save.cfg[i] = { color: CARS[i].c, wheel: 0, spoiler: i > 1 ? 1 : 0, up: [0, 0, 0, 0, 0] });
let low = save.low !== undefined ? save.low : (navigator.hardwareConcurrency || 4) <= 4;

const fmt = t => t == null ? '--' : Math.floor(t / 60) + ':' + (t % 60).toFixed(2).padStart(5, '0');
const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const setT = (el, s) => { if (el._t !== s) { el.textContent = s; el._t = s; } };
const cvs = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
const tex = (c, rx = 1, ry = 1) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };

// ---------- renderer / scene ----------
let R, scene, CAM, sun, world, garageG, sky, fog, hemi, MM, pickups = [], ghostMesh = null, camMode = 0, tiltV = 0, P = [], T = [], Nn = [], CURV = [], SP = 3;
const cs = { h: 0 };

function initRenderer() {
  R = new THREE.WebGLRenderer({ canvas: $('c'), antialias: !low, powerPreference: 'high-performance' });
  R.outputEncoding = THREE.sRGBEncoding; R.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene(); CAM = new THREE.PerspectiveCamera(62, 1, .5, 2500);
  hemi = new THREE.HemisphereLight(0xcfe3ff, 0x4a5a3a, .75); scene.add(hemi);
  sun = new THREE.DirectionalLight(0xfff1d0, 1.2); sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = sc.bottom = -60; sc.right = sc.top = 60; sc.near = 1; sc.far = 250; sun.shadow.bias = -.0005;
  scene.add(sun, sun.target);
  applyGfx();
  addEventListener('resize', resize); resize();
}
function applyGfx() {
  R.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1 : 1.75)); R.shadowMap.enabled = !low; sun.castShadow = !low;
  scene.traverse(o => { if (o.material) o.material.needsUpdate = true; });
  resize(); $('bgfx').textContent = 'Graphics: ' + (low ? 'Low' : 'High');
}
function resize() { R.setSize(innerWidth, innerHeight, false); CAM.aspect = innerWidth / innerHeight; CAM.updateProjectionMatrix(); }

// ---------- track & environment ----------
function ribbon(a, b, y, rep) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const k = i % N, p = P[k], n = Nn[k];
    pos.push(p.x + n.x * a, y, p.z + n.z * a, p.x + n.x * b, y, p.z + n.z * b); uv.push(0, i / N * rep, 1, i / N * rep);
    if (i < N) { const j = i * 2; idx.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); }
  }
  return mk(pos, uv, idx);
}
function wall(off, h, rep) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const k = i % N, p = P[k], n = Nn[k];
    pos.push(p.x + n.x * off, 0, p.z + n.z * off, p.x + n.x * off, h, p.z + n.z * off); uv.push(0, i / N * rep, 1, i / N * rep);
    if (i < N) { const j = i * 2; idx.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); }
  }
  return mk(pos, uv, idx);
}
function mk(pos, uv, idx) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const MS = (o) => new THREE.MeshStandardMaterial(Object.assign({ side: THREE.DoubleSide }, o));

function buildWorld(id) {
  const th = TRACKS[id], rnd = mul(7 + id * 13);
  if (world) { scene.remove(world); world.traverse(o => { o.geometry && o.geometry.dispose(); }); }
  P = []; T = []; Nn = []; CURV = [];
  world = new THREE.Group(); scene.add(world);
  const pts = th.pts.map(a => new THREE.Vector3(a[0] * th.k, 0, a[1] * th.k));
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', .5);
  const sp = curve.getSpacedPoints(N); SP = curve.getLength() / N;
  for (let i = 0; i < N; i++) P.push(sp[i]);
  for (let i = 0; i < N; i++) { const t = P[(i + 1) % N].clone().sub(P[(i - 1 + N) % N]).setY(0).normalize(); T.push(t); Nn.push(new THREE.Vector3(-t.z, 0, t.x)); }
  for (let i = 0; i < N; i++) CURV.push(Math.acos(Math.min(1, T[i].dot(T[(i + 14) % N]))));

  // sky + reflections
  const skyC = cvs(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, th.sky[0]); gr.addColorStop(.5, th.sky[1]); gr.addColorStop(.62, th.sky[2]); gr.addColorStop(.63, th.gnd); gr.addColorStop(1, th.gnd);
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = th.cloud;
    for (let i = 0; i < 26; i++) { g.beginPath(); g.ellipse(rnd() * w, 30 + rnd() * 90, 20 + rnd() * 40, 6 + rnd() * 8, 0, 0, TAU); g.fill(); }
  });
  sky = new THREE.CanvasTexture(skyC); sky.mapping = THREE.EquirectangularReflectionMapping; sky.encoding = THREE.sRGBEncoding;
  fog = new THREE.Fog(th.fog, th.fn, 1500);
  try { const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromEquirectangular(sky).texture; pm.dispose(); } catch (e) { console.warn('env map skipped', e); }

  // road, curbs, walls
  const road = tex(cvs(128, 256, (g, w, h) => {
    g.fillStyle = th.road; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},.05)`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    g.fillStyle = th.line; g.fillRect(5, 0, 5, h); g.fillRect(w - 10, 0, 5, h); g.fillStyle = '#f5d442'; g.fillRect(62, 0, 4, h / 2);
  }));
  const rm = new THREE.Mesh(ribbon(-W, W, .02, 90), MS({ map: road, roughness: .85 })); rm.receiveShadow = true; world.add(rm);
  const stripe = tex(cvs(8, 32, (g) => { g.fillStyle = '#d62828'; g.fillRect(0, 0, 8, 16); g.fillStyle = '#fff'; g.fillRect(0, 16, 8, 16); }));
  const cm = MS({ map: stripe, roughness: .7 });
  world.add(new THREE.Mesh(ribbon(W, W + 1.4, .035, 300), cm), new THREE.Mesh(ribbon(-W - 1.4, -W, .035, 300), cm));
  if (th.neon) { const nm = new THREE.MeshBasicMaterial({ color: th.neon, side: THREE.DoubleSide }); world.add(new THREE.Mesh(ribbon(W + 1.4, W + 1.9, .06, 1), nm), new THREE.Mesh(ribbon(-W - 1.9, -W - 1.4, .06, 1), nm)); }
  const wm = MS({ map: tex(cvs(16, 64, g => { g.fillStyle = '#e9e9ec'; g.fillRect(0, 0, 16, 64); g.fillStyle = '#2a63d6'; g.fillRect(0, 40, 16, 12); }), 1, 1), roughness: .6 });
  [BW, -BW].forEach(o => { const m = new THREE.Mesh(wall(o, 1.1, 100), wm); m.castShadow = true; world.add(m); });

  // ground
  const gt = tex(cvs(64, 64, (g, w, h) => { g.fillStyle = th.g0; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.fillStyle = rnd() > .5 ? th.g1 : th.g2; g.fillRect(rnd() * w, rnd() * h, 2, 2); } }), 350, 350);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(3200, 3200).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: gt, roughness: 1 })); gr.position.set(0, -.02, 150); gr.receiveShadow = true; world.add(gr);

  const minD = (x, z) => { let m = 1e9; for (let i = 0; i < N; i += 2) { const dx = x - P[i].x, dz = z - P[i].z; m = Math.min(m, dx * dx + dz * dz); } return Math.sqrt(m); };
  // trees (instanced)
  const NT = th.trees, tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(.25, .35, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x5a3d22 }), NT);
  const fo = new THREE.InstancedMesh(new THREE.ConeGeometry(1.9, 5.5, 7), new THREE.MeshStandardMaterial({ color: th.tc, flatShading: true }), NT);
  const o = new THREE.Object3D(); let n = 0;
  for (let t = 0; t < 2000 && n < NT; t++) {
    const x = -480 + rnd() * 1000, z = -260 + rnd() * 700; if (minD(x, z) < 24) continue;
    const s = .8 + rnd() * .8; o.position.set(x, 1.2 * s, z); o.scale.set(s, s, s); o.updateMatrix(); tr.setMatrixAt(n, o.matrix);
    o.position.y = 4.2 * s; o.updateMatrix(); fo.setMatrixAt(n++, o.matrix);
  }
  tr.count = fo.count = n; world.add(tr, fo);
  // mountains
  const mm = new THREE.MeshStandardMaterial({ color: th.mt, flatShading: true, roughness: 1 });
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 780 + rnd() * 150, h = 150 + rnd() * 170, m = new THREE.Mesh(new THREE.ConeGeometry(150 + rnd() * 110, h, 7), mm); m.position.set(20 + Math.cos(a) * r, h / 2 - 6, 140 + Math.sin(a) * r); world.add(m); }
  // buildings
  const wt = tex(cvs(64, 128, (g, w, h) => { g.fillStyle = '#2b3140'; g.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 12)for (let x = 4; x < w; x += 12) { g.fillStyle = rnd() > .45 ? '#ffe9a6' : '#1a1f2b'; g.fillRect(x, y, 6, 8); } }));
  const bm = new THREE.MeshStandardMaterial({ map: wt, emissiveMap: wt, emissive: th.be, roughness: .8 });
  for (let i = 0; i < th.bld; i++) { const a = rnd() * TAU, r = th.br + rnd() * 90, h = 30 + rnd() * 80, b = new THREE.Mesh(new THREE.BoxGeometry(24 + rnd() * 20, h, 24 + rnd() * 20), bm); b.position.set(20 + Math.cos(a) * r, h / 2, 140 + Math.sin(a) * r); world.add(b); }
  // grandstand
  const crowd = tex(cvs(128, 32, (g, w, h) => { g.fillStyle = '#555'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = `hsl(${rnd() * 360},70%,55%)`; g.fillRect(rnd() * w, rnd() * h, 3, 4); } }), 6, 1);
  const gs = new THREE.Group(), cmat = new THREE.MeshStandardMaterial({ map: crowd });
  for (let r = 0; r < 3; r++) { const b = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 36), cmat); b.position.set(r * 3, .5 + r, 0); b.castShadow = b.receiveShadow = true; gs.add(b); }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(11, .3, 38), new THREE.MeshStandardMaterial({ color: 0xcccccc })); roof.position.set(4.5, 6, 0); gs.add(roof);
  gs.position.copy(P[10]).addScaledVector(Nn[10], -(W + 14)); gs.rotation.y = Math.atan2(T[10].x, T[10].z); world.add(gs);
  // trackside lights
  const lp = new THREE.InstancedMesh(new THREE.CylinderGeometry(.12, .15, 7, 6), new THREE.MeshStandardMaterial({ color: 0x444a55 }), 40);
  const lb = new THREE.InstancedMesh(new THREE.SphereGeometry(.45, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff2b0 }), 40); n = 0;
  for (let i = 0; i < N; i += 30)[1, -1].forEach(s => { const p = P[i].clone().addScaledVector(Nn[i], s * (BW + 2)); o.scale.set(1, 1, 1); o.position.set(p.x, 3.5, p.z); o.updateMatrix(); lp.setMatrixAt(n, o.matrix); o.position.y = 7; o.updateMatrix(); lb.setMatrixAt(n++, o.matrix); });
  lp.count = lb.count = n; world.add(lp, lb);
  // start/finish + checkpoints
  const chk = tex(cvs(64, 16, g => { for (let x = 0; x < 8; x++)for (let y = 0; y < 2; y++) { g.fillStyle = (x + y) % 2 ? '#fff' : '#111'; g.fillRect(x * 8, y * 8, 8, 8); } }), 6, 1);
  const sl = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, 2.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: chk })); sl.position.set(P[0].x, .05, P[0].z); sl.rotation.y = Math.atan2(T[0].x, T[0].z); world.add(sl);
  const ban = tex(cvs(256, 48, (g, w, h) => { g.fillStyle = '#c1121f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.fillText('START / FINISH', w / 2, 34); }));
  const ga = new THREE.Group(), pm2 = new THREE.MeshStandardMaterial({ color: 0x333842 });
  [-1, 1].forEach(s => { const p = new THREE.Mesh(new THREE.BoxGeometry(.6, 8, .6), pm2); p.position.set(s * (W + 2), 4, 0); ga.add(p); });
  const bn = new THREE.Mesh(new THREE.BoxGeometry(W * 2 + 4, 1.8, .5), new THREE.MeshBasicMaterial({ map: ban })); bn.position.y = 8; ga.add(bn);
  ga.position.copy(P[0]); ga.rotation.y = Math.atan2(T[0].x, T[0].z); world.add(ga);
  CP.forEach(k => [1, -1].forEach(s => { const m = new THREE.Mesh(new THREE.ConeGeometry(.6, 3, 8), new THREE.MeshBasicMaterial({ color: 0x00e5ff })); const p = P[k].clone().addScaledVector(Nn[k], s * (W + 2.5)); m.position.set(p.x, 1.5, p.z); world.add(m); }));

  // garage
  if (!garageG) {
  garageG = new THREE.Group(); garageG.visible = false; scene.add(garageG);
  const fl = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.3, .3, 48), new THREE.MeshStandardMaterial({ color: 0x1a1d27, metalness: .8, roughness: .3 })); fl.position.y = -.15; fl.receiveShadow = true;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(6.1, .08, 8, 64).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x00d4ff }));
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(400, 400).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x0b0e14, roughness: 1 })); bg.position.y = -.4;
  const l1 = new THREE.PointLight(0xffffff, .9, 60); l1.position.set(8, 7, 8); const l2 = new THREE.PointLight(0x4aa8ff, .8, 60); l2.position.set(-8, 5, -6);
  garageG.add(fl, ring, bg, l1, l2);
  }
  buildExtras();
}
function setView(m) {
  const th = TRACKS[Math.max(0, curTrk)]; hemi.intensity = m === 'world' ? th.hi : .8; sun.intensity = m === 'world' ? th.si : 1.2;
  world.visible = m === 'world'; garageG.visible = m === 'garage';
  scene.background = m === 'world' ? sky : new THREE.Color(0x0b0e14); scene.fog = m === 'world' ? fog : null;
}

// ---------- cars ----------
function makeCar(i, cf) {
  const d = CARS[i], g = new THREE.Group(), y0 = .34;
  const paint = new THREE.MeshStandardMaterial({ color: cf.color, metalness: .65, roughness: .25 });
  const blk = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: .6, metalness: .2 });
  const gl = new THREE.MeshStandardMaterial({ color: 0x1b2a3a, metalness: .9, roughness: .08 });
  const em = c => new THREE.MeshBasicMaterial({ color: c });
  const B = (w, h, l, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  B(d.w, d.h, d.l, paint, 0, y0 + d.h / 2, 0);
  B(d.w * .92, d.h * .3, d.l * .3, paint, 0, y0 + d.h + .07, d.l * .3);
  B(d.w * .8, d.cab, d.l * .36, gl, 0, y0 + d.h + d.cab / 2, -d.l * .06);
  B(d.w * .76, .07, d.l * .3, paint, 0, y0 + d.h + d.cab + .03, -d.l * .06);
  B(d.w * 1.02, .14, .3, blk, 0, y0 + .1, d.l / 2); B(d.w * 1.02, .14, .3, blk, 0, y0 + .1, -d.l / 2);
  B(.12, .14, d.l * .6, blk, d.w / 2, y0 + .02, 0); B(.12, .14, d.l * .6, blk, -d.w / 2, y0 + .02, 0);
  [-1, 1].forEach(s => { B(.4, .12, .05, em(0xfff6c8), s * d.w * .32, y0 + d.h * .7, d.l / 2 + .02); B(.45, .1, .05, em(0xff1a1a), s * d.w * .32, y0 + d.h * .75, -d.l / 2 - .02); });
  if (cf.spoiler) { B(.1, .4, .1, blk, d.w * .3, y0 + d.h + .2, -d.l / 2 + .25); B(.1, .4, .1, blk, -d.w * .3, y0 + d.h + .2, -d.l / 2 + .25); B(d.w * 1.05, .07, .55, paint, 0, y0 + d.h + .42, -d.l / 2 + .2); }
  const wr = .38, tgm = new THREE.CylinderGeometry(wr, wr, .32, 20).rotateZ(Math.PI / 2);
  const rg = new THREE.CylinderGeometry(.25, .25, .34, [5, 10, 24][cf.wheel]).rotateZ(Math.PI / 2);
  const rmat = new THREE.MeshStandardMaterial({ color: [0xd0d0d0, 0xffc83d, 0x2c3038][cf.wheel], metalness: .9, roughness: .2 });
  const sg = new THREE.BoxGeometry(.36, .46, .05); g.userData.wh = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(sx * (d.w / 2 - .08), wr, sz * d.l * .32);
    const sp = new THREE.Group(), t = new THREE.Mesh(tgm, blk); t.castShadow = true; sp.add(t, new THREE.Mesh(rg, rmat));
    const s1 = new THREE.Mesh(sg, blk), s2 = new THREE.Mesh(sg, blk); s1.position.x = s2.position.x = sx * .02; s2.rotation.x = Math.PI / 2; sp.add(s1, s2);
    piv.add(sp); g.add(piv); g.userData.wh.push({ sp, piv, front: sz > 0 });
  }
  const fg = new THREE.ConeGeometry(.13, 1, 8).rotateX(-Math.PI / 2).translate(0, 0, -.5);
  g.userData.fl = [-1, 1].map(s => { const f = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: 0x66c8ff, transparent: true, opacity: .9 })); f.position.set(s * d.w * .28, y0 + .2, -d.l / 2 - .05); f.visible = false; g.add(f); return f; });
  g.userData.d = d; return g;
}
function spinWheels(m, fw, steer, dt) { m.userData.wh.forEach(w => { w.sp.rotation.x += fw / .38 * dt; if (w.front) w.piv.rotation.y = steer * .4; }); }

// ---------- particles ----------
const parts = []; let pTex;
function initParts() {
  pTex = new THREE.CanvasTexture(cvs(32, 32, g => { const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); }));
  for (let i = 0; i < 60; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: pTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); parts.push({ s, life: 0 }); }
}
function emit(x, y, z, vx, vy, vz, life, size, color, grow) {
  const p = parts.find(q => q.life <= 0); if (!p) return;
  p.life = p.max = life; p.vx = vx; p.vy = vy; p.vz = vz; p.size = size; p.grow = grow; p.s.material.color.setHex(color); p.s.position.set(x, y, z); p.s.visible = true;
}
function stepParts(dt) { for (const p of parts) { if (p.life <= 0) continue; p.life -= dt; if (p.life <= 0) { p.s.visible = false; continue; } p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt; const k = p.life / p.max; p.s.material.opacity = k * .6; const s = p.size + p.grow * (1 - k); p.s.scale.set(s, s, 1); } }

// ---------- audio (starts after first user gesture) ----------
const A = {};
function audioInit() {
  if (A.ctx) { A.ctx.state === 'suspended' && A.ctx.resume(); return; }
  try {
    const x = A.ctx = new (window.AudioContext || window.webkitAudioContext)();
    A.m = x.createGain(); A.m.gain.value = save.mute ? 0 : .6; A.m.connect(x.destination);
    A.o1 = x.createOscillator(); A.o1.type = 'sawtooth'; A.o2 = x.createOscillator(); A.o2.type = 'square';
    A.f = x.createBiquadFilter(); A.f.type = 'lowpass'; A.f.frequency.value = 700; A.eg = x.createGain(); A.eg.gain.value = 0;
    A.o1.connect(A.f); A.o2.connect(A.f); A.f.connect(A.eg); A.eg.connect(A.m); A.o1.start(); A.o2.start();
    const nb = x.createBuffer(1, x.sampleRate, x.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; A.nb = nb;
    const ns = x.createBufferSource(); ns.buffer = nb; ns.loop = true; const bp = x.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; A.sg = x.createGain(); A.sg.gain.value = 0;
    ns.connect(bp); bp.connect(A.sg); A.sg.connect(A.m); ns.start();
    let st = 0; const notes = [220, 262, 330, 392, 330, 262, 294, 349];
    setInterval(() => { if (!save.mute && A.ctx.state === 'running') { tone(notes[st++ % 8] / (st % 16 < 8 ? 1 : 1.25), .18, 'triangle', .05); } }, 240);
  } catch (e) { console.warn('audio unavailable', e); }
}
function tone(f, dur, type, vol) { if (!A.ctx) return; const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, A.ctx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, A.ctx.currentTime + dur); o.connect(g); g.connect(A.m); o.start(); o.stop(A.ctx.currentTime + dur); }
function burst(dur, freq, vol) { if (!A.ctx) return; const s = A.ctx.createBufferSource(); s.buffer = A.nb; const f = A.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; const g = A.ctx.createGain(); g.gain.setValueAtTime(vol, A.ctx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, A.ctx.currentTime + dur); s.connect(f); f.connect(g); g.connect(A.m); s.start(); s.stop(A.ctx.currentTime + dur); }
function audioTick(sp, thr, drift, on) {
  if (!A.ctx) return; const t = A.ctx.currentTime;
  A.o1.frequency.setTargetAtTime(50 + sp * 3.2, t, .05); A.o2.frequency.setTargetAtTime(25 + sp * 1.6, t, .05);
  A.f.frequency.setTargetAtTime(500 + sp * 18, t, .05); A.eg.gain.setTargetAtTime(on ? .09 + thr * .06 : 0, t, .08);
  A.sg.gain.setTargetAtTime(on && drift > 5 && sp > 12 ? Math.min(.12, drift * .01) : 0, t, .05);
}
const setMute = () => { A.m && (A.m.gain.value = save.mute ? 0 : .6); const s = 'Sound: ' + (save.mute ? 'Off' : 'On'); $('bmusic').textContent = s; $('bmusic2').textContent = s; };

// ---------- input ----------
const kb = {}, tc = {};
const inp = () => ({ l: kb.l || tc.l, r: kb.r || tc.r, gas: kb.gas || tc.gas, brk: kb.brk || tc.brk, nit: kb.nit || tc.nit, dr: kb.dr || tc.dr });
function bindInput() {
  document.querySelectorAll('[data-k]').forEach(el => {
    const k = el.dataset.k, on = e => { e.preventDefault(); audioInit(); hap('light'); tc[k] = 1; el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (_) {} };
    const off = e => { tc[k] = 0; el.classList.remove('on'); };
    el.addEventListener('pointerdown', on); ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'].forEach(ev => el.addEventListener(ev, off));
  });
  const map = { ArrowLeft: 'l', a: 'l', ArrowRight: 'r', d: 'r', ArrowUp: 'gas', w: 'gas', ArrowDown: 'brk', s: 'brk', ' ': 'nit', Shift: 'nit', x: 'dr', Control: 'dr' };
  addEventListener('keydown', e => { const k = map[e.key.length > 1 ? e.key : e.key.toLowerCase()]; if (k) { kb[k] = 1; audioInit(); e.preventDefault(); } if (e.key === 'Escape' || e.key === 'p') act(game.state === 'paused' ? 'resume' : 'pause'); if (e.key === 'r' && game.state === 'race') respawn(); if (e.key === 'v') act('cam'); });
  addEventListener('keyup', e => { const k = map[e.key.length > 1 ? e.key : e.key.toLowerCase()]; if (k) kb[k] = 0; });
  const rel = () => { for (const k in tc) tc[k] = 0; for (const k in kb) kb[k] = 0; document.querySelectorAll('.k.on').forEach(e => e.classList.remove('on')); };
  addEventListener('blur', rel); document.addEventListener('visibilitychange', () => { rel(); document.hidden && game.state === 'race' && act('pause'); });
  document.addEventListener('contextmenu', e => e.preventDefault()); document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  document.body.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) { audioInit(); act(b.dataset.act, b.dataset); } });
  const pad = $('pad'), kn = $('knob');
  const setPad = e => { const r = pad.getBoundingClientRect(), v = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width / 2 - 20))); tc.an = -v; kn.style.left = (50 + v * 42) + '%'; };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); audioInit(); try { pad.setPointerCapture(e.pointerId); } catch (_) {} setPad(e); hap('light'); });
  pad.addEventListener('pointermove', e => { if (tc.an != null) setPad(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => pad.addEventListener(ev, () => { tc.an = null; kn.style.left = '50%'; }));
  addEventListener('deviceorientation', e => { if ((save.ctl || 0) < 2 || e.gamma == null) return; const a = (screen.orientation && screen.orientation.angle) || 0, v = a === 90 ? -e.beta : a === 270 ? e.beta : e.gamma; tiltV = Math.max(-1, Math.min(1, -(Math.abs(v) < 3 ? 0 : v) / 25)); });
  let drag = null; const cv = $('c');
  cv.addEventListener('pointerdown', e => { drag = e.clientX; }); addEventListener('pointerup', () => drag = null);
  cv.addEventListener('pointermove', e => { if (drag != null && game.state === 'garage') { gAng -= (e.clientX - drag) * .01; drag = e.clientX; } });
}

// ---------- game state ----------
const game = { state: 'load', type: 'quick', laps: 3, t: 0, cd: 0 };
let champ = null, curTrk = -1, c, pmesh, rivals = [], shake = 0, msgT = 0, gm = null, gAng = 0, gI = 0, lastN = 0;
const idxOf = s => ((Math.floor(s) % N) + N) % N;

function resetPlayer() {
  const i = N - 11; c = { x: P[i].x, z: P[i].z, h: Math.atan2(T[i].x, T[i].z), vx: 0, vz: 0, steer: 0, nitro: 100, idx: i, prev: i, d: 0, laps: 0, cpNext: 0, lapT: 0, bestLap: null, prog: -11, off: 0, fin: null, nOn: false, drift: 0, rec: [], rt: 0 };
  cs.h = c.h;
}
function setPlayerMesh() { pmesh && scene.remove(pmesh); pmesh = makeCar(save.sel, cfgOf(save.sel)); scene.add(pmesh); }
function startRace(type) {
  game.type = type; game.laps = type === 'practice' ? 999 : 3; game.t = 0; game.cd = 3.99; game.state = 'countdown'; lastN = 4;
  ['menu', 'garage', 'pause', 'results'].forEach(s => $(s).classList.add('hidden')); $('hud').classList.remove('hidden');
  const tid = champ ? champ.r : (save.trk || 0); if (tid !== curTrk) { buildWorld(tid); curTrk = tid; }
  clearGarageCar(); setView('world'); resetPlayer(); setPlayerMesh();
  rivals.forEach(r => scene.remove(r.m)); rivals = [];
  if (type === 'quick') for (let k = 0; k < 3; k++) {
    const ci = Math.floor(Math.random() * CARS.length), m = makeCar(ci, { color: COLORS[(k * 2 + 3) % 8], wheel: k % 3, spoiler: k % 2 });
    scene.add(m); const home = k % 2 ? -3.5 : 3.5; rivals.push({ m, s: -4 - k * 4.5, v: 0, off: home, home, tl: home, base: CARS[ci].spd * (.8 + .05 * k) * (.9 + save.sel * .03) * [.88, 1, 1.1][save.diff ?? 1], fin: null, x: 0, z: 0 });
  }
  $('hbest').textContent = ''; msg('');
  ghostMesh && scene.remove(ghostMesh); ghostMesh = null;
  if (type === 'trial' && save.ghost[tid]) { ghostMesh = makeCar(save.sel, cfgOf(save.sel)); ghostMesh.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = .35; } }); scene.add(ghostMesh); }
  applyCtl(); msg(champ ? 'Championship ' + (champ.r + 1) + '/3 · ' + TRACKS[tid].n : TRACKS[tid].n);
}
function msg(s) { const e = $('hmsg'); e.textContent = s; e.style.opacity = s ? 1 : 0; msgT = 1.6; }
function respawn() { const i = c.idx; c.x = P[i].x; c.z = P[i].z; c.h = Math.atan2(T[i].x, T[i].z); c.vx = c.vz = 0; c.off = 0; cs.h = c.h; }

function stepPlayer(dt, i) {
  const d = CARS[save.sel], up = cfgOf(save.sel).up, locked = game.state !== 'race';
  const maxS = d.spd * (1 + .035 * up[0]), acc = d.acc * (1 + .08 * up[1]), han = d.han * (1 + .06 * up[2]), brk = d.brk * (1 + .08 * up[3]);
  const fx = Math.sin(c.h), fz = Math.cos(c.h), rx = Math.cos(c.h), rz = -Math.sin(c.h);
  let fw = c.vx * fx + c.vz * fz, lat = c.vx * rx + c.vz * rz;
  const gas = !locked && i.gas, br = !locked && i.brk, nit = !locked && i.nit && c.nitro > 0 && fw > 3;
  let mx = maxS, a = acc;
  if (nit) { mx *= 1.35; a *= 2.4; c.nitro = Math.max(0, c.nitro - 30 / (1 + .18 * up[4]) * dt); if (!c.nOn) { burst(.7, 1500, .35); hap('medium'); } } else c.nitro = Math.min(100, c.nitro + 5 * dt);
  c.nOn = nit;
  const off = Math.abs(c.d) > W + 1.4; if (off) mx *= .45;
  if (gas || nit) { if (fw < -1) fw += brk * dt; else fw += a * Math.max(.1, 1 - fw / mx) * dt; }
  if (fw > mx) fw = Math.max(mx, fw - 25 * dt);
  if (br) { if (fw > .5) fw -= brk * dt; else fw = Math.max(-14, fw - 12 * dt); }
  if (!gas && !br && !nit) fw -= Math.sign(fw) * Math.min(Math.abs(fw), (5 + Math.abs(fw) * .05) * dt);
  if (game.state === 'finished') fw *= 1 - 1.2 * dt;
  fw -= Math.sign(fw) * Math.min(Math.abs(fw), Math.abs(lat) * .3 * dt);
  const sin = locked ? 0 : steerIn(i);
  c.steer += (sin - c.steer) * Math.min(1, dt * (sin ? 7 : 10));
  lat *= Math.exp(-(off ? 3 : 7 * han / (1 + Math.abs(fw) / 120) * (br && fw > 20 ? .55 : 1) * (i.dr && !locked ? .3 : 1)) * dt);
  if (!locked && !off && fw > 20 && Math.abs(lat) > 5) c.drift += Math.abs(lat) * dt * 2;
  c.vx = fx * fw + rx * lat; c.vz = fz * fw + rz * lat;
  const sf = Math.min(1, Math.abs(fw) / 9) / (1 + Math.abs(fw) / 35);
  c.h += c.steer * 2.2 * han * (i.dr ? 1.35 : 1) * sf * Math.sign(fw || 1) * dt;
  c.x += c.vx * dt; c.z += c.vz * dt;
  locate(c);
  const n = Nn[c.idx], s = Math.sign(c.d);
  if (Math.abs(c.d) > BW - .9) {
    const pen = Math.abs(c.d) - (BW - .9); c.x -= n.x * s * pen; c.z -= n.z * s * pen;
    const vn = c.vx * n.x + c.vz * n.z;
    if (vn * s > 0) { const imp = vn * s; c.vx -= n.x * vn * 1.3; c.vz -= n.z * vn * 1.3; c.vx *= .96; c.vz *= .96; if (imp > 3) { hap('heavy'); burst(.3, 400, Math.min(.6, imp * .05)); shake = Math.min(.6, imp * .04); for (let k = 0; k < 6; k++) emit(c.x - n.x * s, .6, c.z - n.z * s, (Math.random() - .5) * 8, Math.random() * 4, (Math.random() - .5) * 8, .4, .35, 0xffcc44, .2); } }
    c.vx *= 1 - .5 * dt; c.vz *= 1 - .5 * dt;
  }
  c.off = off ? c.off + dt : 0; if (c.off > 6) respawn();
  const sp = Math.hypot(c.vx, c.vz);
  // visuals
  pmesh.position.set(c.x, 0, c.z); pmesh.rotation.y = c.h; pmesh.rotation.z = -c.steer * Math.min(1, sp / 60) * .05;
  spinWheels(pmesh, fw, c.steer, dt); pmesh.userData.fl.forEach(f => { f.visible = nit; f.scale.z = .8 + Math.random() * .8; });
  const drift = Math.abs(lat);
  if ((drift > 4 || off || (br && fw > 25)) && sp > 8 && Math.random() < .7) { const col = off ? 0x8a7a55 : 0xcccccc; for (const sx of [-1, 1]) emit(c.x - fx * 1.4 + rx * sx * .9, .3, c.z - fz * 1.4 + rz * sx * .9, (Math.random() - .5) * 2, 1 + Math.random(), (Math.random() - .5) * 2, .8, .8, col, 2.5); }
  audioTick(sp, gas ? 1 : 0, drift, game.state !== 'paused');
  c.sp = sp; c.fw = fw; c.nit = nit;
}
function locate(o) {
  let best = 1e9, bi = o.idx;
  for (let k = -25; k <= 25; k++) { const j = (o.idx + k + N) % N, dx = o.x - P[j].x, dz = o.z - P[j].z, q = dx * dx + dz * dz; if (q < best) { best = q; bi = j; } }
  o.prev = o.idx; o.idx = bi; o.d = (o.x - P[bi].x) * Nn[bi].x + (o.z - P[bi].z) * Nn[bi].z;
}
function lapLogic() {
  const pi = c.prev, ni = c.idx;
  if (c.cpNext < 3) { const q = CP[c.cpNext]; if (pi < q && ni >= q && ni - q < 40) { c.cpNext++; msg('CHECKPOINT ' + c.cpNext + '/3'); tone(660, .15, 'sine', .15); } }
  if (pi > N - 60 && ni < 60 && c.cpNext === 3 && game.state === 'race') {
    c.cpNext = 0; c.laps++; const lt = game.t - c.lapT; c.lapT = game.t;
    if (game.type === 'trial') { const g0 = save.ghost[curTrk]; if (!g0 || lt < g0.t) { save.ghost[curTrk] = { t: lt, s: c.rec }; persist(); } c.rec = []; c.rt = 0; } if (!c.bestLap || lt < c.bestLap) c.bestLap = lt;
    msg('LAP ' + c.laps + ' · ' + fmt(lt)); tone(880, .3, 'square', .12);
    if (c.laps >= game.laps) finish();
  }
  let ix = ni; if (c.laps === 0 && c.cpNext === 0 && ix > N * .5) ix -= N;
  c.prog = Math.min(c.laps * N + ix, game.laps * N);
}
function stepRivals(dt) {
  for (const r of rivals) {
    const k = idxOf(r.s), f = r.s - Math.floor(r.s);
    let tgt = r.base * (1 - Math.min(.5, CURV[k] * .8));
    const gap = (c.prog - r.s) * SP; tgt *= gap > 60 ? 1.08 : gap < -60 ? .94 : 1;
    const ds = (c.prog - r.s) * SP, ld = c.d - r.off; r.tl = (ds > 0 && ds < 18 && Math.abs(ld) < 3.2) ? Math.max(-6, Math.min(6, r.off - Math.sign(ld || 1) * 3.5)) : r.home;
    if (game.state === 'countdown') tgt = 0; if (r.fin != null) tgt = 12;
    r.v += (tgt - r.v) * Math.min(1, dt * 1.2); r.s += r.v * dt / SP; r.off += (r.tl - r.off) * Math.min(1, dt * 1.5);
    const a = P[k], b = P[(k + 1) % N]; r.x = a.x + (b.x - a.x) * f + Nn[k].x * r.off; r.z = a.z + (b.z - a.z) * f + Nn[k].z * r.off;
    r.m.position.set(r.x, 0, r.z); r.m.rotation.y = Math.atan2(T[k].x, T[k].z); spinWheels(r.m, r.v, 0, dt);
    if (r.fin == null && r.s >= game.laps * N) r.fin = game.t;
    // collision with player
    const dx = c.x - r.x, dz = c.z - r.z, dd = Math.hypot(dx, dz);
    if (dd < 2.7 && dd > .01) { const ov = 2.7 - dd, nx = dx / dd, nz = dz / dd; c.x += nx * ov; c.z += nz * ov; const cl = (c.vx - 0) * -nx + c.vz * -nz; if (cl > 3) { burst(.25, 600, .3); shake = .3; } c.vx *= .985; c.vz *= .985; r.v *= .99; }
  }
}
const position = () => 1 + rivals.filter(r => Math.min(r.s, game.laps * N) > c.prog || (r.fin != null && r.fin <= (c.fin == null ? 1e9 : c.fin))).length;

function finish() {
  game.state = 'finished'; c.fin = game.t;
  const L = [{ id: 0, f: c.fin, p: 1e9 }].concat(rivals.map((r, k) => ({ id: k + 1, f: r.fin == null ? 1e9 : r.fin, p: r.s })));
  L.sort((a, b) => a.f - b.f || b.p - a.p); c.order = L.map(o => o.id); const pos = c.pos = c.order.indexOf(0) + 1;
  const b = save.best, key = (game.type === 'trial' ? 'trial' : 'race') + curTrk;
  if (!b[key] || game.t < b[key]) { b[key] = game.t; c.newBest = true; }
  if (c.bestLap && (!b['lap' + curTrk] || c.bestLap < b['lap' + curTrk])) b['lap' + curTrk] = c.bestLap;
  let rew = Math.round((game.type === 'quick' ? [500, 300, 180, 100][pos - 1] : game.type === 'trial' ? 150 : 0) * [.8, 1, 1.3][save.diff ?? 1]) + Math.floor(c.drift / 5);
  if (champ) {
    c.order.forEach((id, i) => champ.pts[id] += [10, 6, 3, 1][i]);
    if (champ.r === 2) { champ.fin = [0, 1, 2, 3].sort((a, b) => champ.pts[b] - champ.pts[a]); champ.rank = champ.fin.indexOf(0) + 1; c.bonus = [1500, 900, 500, 200][champ.rank - 1]; rew += c.bonus; }
  }
  c.reward = rew; save.credits += rew; persist(); hap('ok');
  msg(game.type === 'quick' ? 'FINISH! P' + pos : 'FINISH!'); setTimeout(showResults, 1800);
}
function showResults() {
  if (game.state !== 'finished') return; $('hud').classList.add('hidden'); $('results').classList.remove('hidden');
  const q = game.type === 'quick', NM = ['You', 'Rival A', 'Rival B', 'Rival C'];
  $('rtitle').textContent = q ? (c.pos === 1 ? '🏆 You won!' : 'Position ' + c.pos + ' / ' + (rivals.length + 1)) : game.type === 'trial' ? 'Time Trial complete' : 'Finished';
  let h = `Race time <b>${fmt(c.fin)}</b>${c.newBest ? ' (new best!)' : ''}<br>Best lap <b>${fmt(c.bestLap)}</b><br>Drift score <b>${Math.floor(c.drift)}</b><br>Credits earned: <b>+${c.reward}</b> (total ${save.credits})`;
  if (champ) { h += `<br><br><b>Championship · race ${champ.r + 1}/3</b><br>` + [0, 1, 2, 3].sort((a, b) => champ.pts[b] - champ.pts[a]).map((id, i) => `${i + 1}. ${NM[id]} — ${champ.pts[id]} pts`).join('<br>'); if (champ.r === 2) h += `<br><b>Final: P${champ.rank}${c.bonus ? ' · bonus +' + c.bonus : ''}</b>`; }
  $('rbody').innerHTML = h; $('rnext').classList.toggle('hidden', !champ); $('rrestart').classList.toggle('hidden', !!champ);
  $('rnext').textContent = champ && champ.r < 2 ? 'Next race ▶ ' + TRACKS[champ.r + 1].n : 'Finish';
}

// ---------- camera ----------
function chase(dt, snap) {
  let dh = c.h - cs.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); cs.h = snap ? c.h : cs.h + dh * (1 - Math.exp(-4 * dt));
  const sp = c.sp || 0, cm = camMode, dist = [7.4, 12, -.3][cm] + (cm < 2 ? sp * .03 : 0), hy = [3, 5.2, 1.15][cm] + (cm < 2 ? sp * .008 : 0); shake *= Math.exp(-6 * dt); pmesh.visible = cm !== 2;
  CAM.position.set(c.x - Math.sin(cs.h) * dist + (Math.random() - .5) * shake, hy + (Math.random() - .5) * shake, c.z - Math.cos(cs.h) * dist);
  CAM.lookAt(c.x + Math.sin(cs.h) * 5, 1.2, c.z + Math.cos(cs.h) * 5);
  const tf = (innerHeight > innerWidth ? 74 : 62) + sp * .18 + (c.nit ? 10 : 0); CAM.fov += (tf - CAM.fov) * Math.min(1, dt * 4); CAM.updateProjectionMatrix();
  sun.position.set(c.x + 40, 70, c.z + 30); sun.target.position.set(c.x, 0, c.z);
  $('fx').style.opacity = c.nit ? .6 : sp > 55 ? .2 : 0;
}

// ---------- garage ----------
function clearGarageCar() { if (gm) { scene.remove(gm); gm = null; } }
function buildGarageCar() { clearGarageCar(); gm = makeCar(gI, cfgOf(gI)); gm.position.set(0, .05, 0); scene.add(gm); }
function openGarage() {
  game.state = 'garage'; ['menu', 'pause', 'results'].forEach(s => $(s).classList.add('hidden')); $('hud').classList.add('hidden'); $('garage').classList.remove('hidden');
  pmesh && (pmesh.visible = false); rivals.forEach(r => r.m.visible = false); setView('garage'); gI = save.sel; buildGarageCar(); renderGarage();
}
function renderGarage() {
  const d = CARS[gI], own = save.owned.includes(gI), cf = cfgOf(gI), u = cf.up;
  $('gname').textContent = d.n; $('gcred').textContent = '💰 ' + save.credits;
  const pc = v => Math.max(8, Math.min(100, v));
  const st = [['Speed', (d.spd * (1 + .035 * u[0]) - 40) / 45 * 100], ['Accel', (d.acc * (1 + .08 * u[1]) - 15) / 25 * 100], ['Handling', (d.han * (1 + .06 * u[2]) - .8) / .7 * 100], ['Brakes', (d.brk * (1 + .08 * u[3]) - 25) / 30 * 100]];
  $('gstats').innerHTML = st.map(s => `<div class="st"><span>${s[0]}</span><div class="bar"><i style="width:${pc(s[1])}%"></i></div></div>`).join('');
  const b = $('gact'); b.textContent = own ? (save.sel === gI ? 'Selected ✓' : 'Select this car') : 'Unlock · 💰 ' + d.price; b.disabled = own ? save.sel === gI : save.credits < d.price;
  let h = '<div>' + COLORS.map((col, k) => `<span class="sw ${cf.color === col ? 'on' : ''}" style="background:${hex(col)}" data-act="gcol" data-v="${k}"></span>`).join('') + '</div><div>';
  h += ['Wheels A', 'Wheels B', 'Wheels C'].map((n, k) => `<span class="chip ${cf.wheel === k ? 'on' : ''}" data-act="gwh" data-v="${k}">${n}</span>`).join('');
  h += `<span class="chip ${cf.spoiler ? 'on' : ''}" data-act="gsp">Spoiler</span></div>`;
  if (own) h += UPN.map((n, k) => `<div class="up"><span>${n} Lv ${u[k]}/5</span><button class="btn sm" data-act="gup" data-v="${k}" ${u[k] >= 5 || save.credits < 200 * (u[k] + 1) ? 'disabled' : ''}>${u[k] >= 5 ? 'MAX' : '💰 ' + 200 * (u[k] + 1)}</button></div>`).join('');
  else h += '<p class="sub">Unlock this car to upgrade it.</p>';
  $('gcust').innerHTML = h;
}

// ---------- actions ----------
function act(a, ds = {}) {
  const v = +ds.v;
  switch (a) {
    case 'quick': case 'trial': case 'practice': champ = null; startRace(a); break;
    case 'champ': champ = { r: 0, pts: [0, 0, 0, 0] }; startRace('quick'); break;
    case 'next': if (champ && champ.r < 2) { champ.r++; startRace('quick'); } else toMenu(); break;
    case 'trk': save.trk = ((save.trk || 0) + 1) % TRACKS.length; persist(); toMenu(); break;
    case 'diff': save.diff = ((save.diff ?? 1) + 1) % 3; persist(); labels(); break;
    case 'ctl': save.ctl = ((save.ctl || 0) + 1) % 4; persist(); labels(); applyCtl(); if (save.ctl >= 2 && window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().catch(() => {}); break;
    case 'hap': save.hap = save.hap === false; persist(); labels(); hap('medium'); break;
    case 'cam': camMode = (camMode + 1) % 3; save.cam = camMode; persist(); msg(['Chase camera', 'Far camera', 'Hood camera'][camMode]); break;
    case 'respawn': if (game.state === 'race') respawn(); break;
    case 'garage': openGarage(); break;
    case 'gback': case 'tomenu': toMenu(); break;
    case 'togarage': openGarage(); break;
    case 'gprev': gI = (gI + CARS.length - 1) % CARS.length; buildGarageCar(); renderGarage(); break;
    case 'gnext': gI = (gI + 1) % CARS.length; buildGarageCar(); renderGarage(); break;
    case 'gsel': if (save.owned.includes(gI)) save.sel = gI; else if (save.credits >= CARS[gI].price) { save.credits -= CARS[gI].price; save.owned.push(gI); save.sel = gI; tone(660, .2, 'square', .12); } persist(); renderGarage(); break;
    case 'gcol': cfgOf(gI).color = COLORS[v]; persist(); buildGarageCar(); renderGarage(); break;
    case 'gwh': cfgOf(gI).wheel = v; persist(); buildGarageCar(); renderGarage(); break;
    case 'gsp': cfgOf(gI).spoiler ^= 1; persist(); buildGarageCar(); renderGarage(); break;
    case 'gup': { const u = cfgOf(gI).up, cost = 200 * (u[v] + 1); if (u[v] < 5 && save.credits >= cost) { save.credits -= cost; u[v]++; persist(); renderGarage(); } break; }
    case 'music': save.mute = !save.mute; persist(); setMute(); break;
    case 'gfx': low = !low; save.low = low; persist(); applyGfx(); break;
    case 'pause': if (game.state === 'race' || game.state === 'countdown') { game.prev = game.state; game.state = 'paused'; $('pause').classList.remove('hidden'); A.eg && (A.eg.gain.value = 0); } break;
    case 'resume': if (game.state === 'paused') { game.state = game.prev; $('pause').classList.add('hidden'); } break;
    case 'restart': startRace(game.type); break;
  }
}
function labels() {
  $('btrk').textContent = '🏁 ' + TRACKS[save.trk || 0].n; $('bdiff').textContent = 'Rivals: ' + ['Easy', 'Normal', 'Hard'][save.diff ?? 1];
  $('bctl').textContent = 'Steer: ' + ['Buttons', 'Slider', 'Tilt', 'Tilt (inv)'][save.ctl || 0]; $('bhap').textContent = 'Haptics: ' + (save.hap === false ? 'Off' : 'On');
  $('bgfx').textContent = 'Graphics: ' + (low ? 'Low' : 'High'); setMute();
  $('mcred').textContent = save.credits; const t = save.trk || 0; $('mbest').textContent = fmt(save.best['race' + t]); $('mlap').textContent = fmt(save.best['lap' + t]);
}
const applyCtl = () => { $('hud').dataset.ctl = save.ctl || 0; };
function toMenu() {
  champ = null; const want = save.trk || 0; if (want !== curTrk) { buildWorld(want); curTrk = want; }
  game.state = 'menu'; ['garage', 'pause', 'results', 'loading'].forEach(s => $(s).classList.add('hidden')); $('hud').classList.add('hidden'); $('menu').classList.remove('hidden');
  ghostMesh && scene.remove(ghostMesh); ghostMesh = null; clearGarageCar(); setView('world'); rivals.forEach(r => scene.remove(r.m)); rivals = []; resetPlayer(); setPlayerMesh(); pmesh.visible = true; c.sp = 0; audioTick(0, 0, 0, false);
  const day = new Date().toDateString(); if (save.day !== day) { save.day = day; save.credits += 200; persist(); $('mdaily').textContent = '🎁 Daily bonus +200!'; }
  labels(); applyCtl();
}
function hap(t) { if (save.hap === false) return; try { if (tg && tg.HapticFeedback) { t === 'ok' ? tg.HapticFeedback.notificationOccurred('success') : tg.HapticFeedback.impactOccurred(t || 'light'); } else if (navigator.vibrate) navigator.vibrate(t === 'heavy' ? 40 : 10); } catch (e) {} }
function steerIn(i) { const m = save.ctl || 0, kv = (kb.l ? 1 : 0) - (kb.r ? 1 : 0); if (kv) return kv; if (m === 1) return tc.an != null ? tc.an : 0; if (m >= 2) return tiltV * (m === 3 ? -1 : 1); return (i.l ? 1 : 0) - (i.r ? 1 : 0); }
function buildExtras() {
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; P.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); });
  const s = 104 / Math.max(x1 - x0, z1 - z0), ox = (128 - (x1 - x0) * s) / 2, oz = (128 - (z1 - z0) * s) / 2;
  MM = { x: x0, z: z0, s, ox, oz, cv: cvs(128, 128, g => { g.lineJoin = 'round'; g.beginPath(); P.forEach((p, i) => { const a = (p.x - x0) * s + ox, b = 128 - ((p.z - z0) * s + oz); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 8; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 4; g.stroke(); }) };
  pickups = [60, 150, 240, 330, 420, 510].map((k, j) => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(.9), new THREE.MeshBasicMaterial({ color: 0x00e5ff })), p = P[k].clone().addScaledVector(Nn[k], j % 2 ? 4 : -4); m.position.set(p.x, 1.2, p.z); world.add(m); return { m, on: true, t: 0, x: p.x, z: p.z }; });
}
function drawMini() {
  const x = $('mini').getContext('2d'); x.clearRect(0, 0, 128, 128); x.drawImage(MM.cv, 0, 0);
  const dot = (px, pz, col, r) => { x.fillStyle = col; x.beginPath(); x.arc((px - MM.x) * MM.s + MM.ox, 128 - ((pz - MM.z) * MM.s + MM.oz), r, 0, TAU); x.fill(); };
  rivals.forEach(r => dot(r.x, r.z, '#ffd166', 3.5)); dot(c.x, c.z, '#ff3b4a', 5.5);
}
function extras(dt) {
  for (const pk of pickups) {
    pk.m.rotation.y += dt * 3;
    if (!pk.on) { if ((pk.t -= dt) <= 0) { pk.on = true; pk.m.visible = true; } }
    else if (Math.hypot(c.x - pk.x, c.z - pk.z) < 3.2) { pk.on = false; pk.m.visible = false; pk.t = 10; c.nitro = Math.min(100, c.nitro + 35); hap('ok'); tone(990, .15, 'sine', .15); msg('+NITRO'); }
  }
  if (game.type === 'trial' && game.state === 'race') { c.rt += dt; if (c.rt >= .05) { c.rt -= .05; c.rec.push([Math.round(c.x * 100) / 100, Math.round(c.z * 100) / 100, Math.round(c.h * 100) / 100]); } }
  if (ghostMesh) { const gd = save.ghost[curTrk], g = game.state === 'race' && gd && gd.s[Math.floor((game.t - c.lapT) / .05)]; ghostMesh.visible = !!g; if (g) { ghostMesh.position.set(g[0], 0, g[1]); ghostMesh.rotation.y = g[2]; } }
  setT($('hdr'), c.drift > 5 ? 'DRIFT ' + Math.floor(c.drift) : ''); $('knit').style.setProperty('--n', c.nitro); drawMini();
}

// ---------- main loop ----------
let last = 0, ang = 0;
function frame(t) {
  requestAnimationFrame(frame); const dt = Math.min(.05, (t - last) / 1000 || 0); last = t; const st = game.state;
  if (st === 'menu') { ang += dt * .3; pmesh.position.set(c.x, 0, c.z); pmesh.rotation.y = c.h; CAM.position.set(c.x + Math.sin(ang) * 8, 2.4, c.z + Math.cos(ang) * 8); CAM.lookAt(c.x, .8, c.z); sun.position.set(c.x + 40, 70, c.z + 30); sun.target.position.set(c.x, 0, c.z); CAM.fov = 55; CAM.updateProjectionMatrix(); }
  else if (st === 'garage' && gm) { gAng += dt * .35; gm.rotation.y = gAng; const p = innerHeight > innerWidth; CAM.position.set(p ? 0 : -3.2, p ? 3.2 : 2.6, p ? 9 : 8.8); CAM.lookAt(p ? 0 : -.8, .8, 0); CAM.fov = 45; CAM.updateProjectionMatrix(); sun.position.set(30, 50, 20); sun.target.position.set(0, 0, 0); }
  else if (st !== 'load' && st !== 'paused') {
    if (st === 'countdown') { game.cd -= dt; const n = Math.ceil(game.cd); if (n !== lastN) { lastN = n; if (n > 0) { tone(440, .2, 'square', .15); } } $('cd').textContent = game.cd > 0 ? Math.ceil(game.cd) : 'GO!'; if (game.cd <= 0) { game.state = 'race'; game.t = 0; tone(880, .5, 'square', .18); setTimeout(() => $('cd').textContent = '', 700); } }
    else if (st === 'race') game.t += dt;
    stepPlayer(dt, inp()); stepRivals(dt); lapLogic(); stepParts(dt); chase(dt, false); extras(dt);
    if (msgT > 0 && (msgT -= dt) <= 0) $('hmsg').style.opacity = 0;
    const lim = game.laps > 99 ? '' : '/' + game.laps;
    setT($('hpos'), game.type === 'quick' ? 'P' + position() + '/' + (rivals.length + 1) : game.type === 'trial' ? 'TIME TRIAL' : 'PRACTICE');
    setT($('hlap'), 'LAP ' + Math.min(c.laps + 1, game.laps) + lim); setT($('htime'), fmt(game.state === 'finished' ? c.fin : Math.max(0, game.t)));
    setT($('hbest'), 'Best lap ' + fmt(c.bestLap ?? save.best['lap' + curTrk])); setT($('hspd'), String(Math.round(Math.abs(c.fw || 0) * 3.6))); $('hnit').style.width = c.nitro + '%';
    const wrong = c.sp > 5 && (c.vx * T[c.idx].x + c.vz * T[c.idx].z) < -2; if (wrong && game.state === 'race') { msg('WRONG WAY'); msgT = .5; }
  } else if (st === 'paused') { /* frozen */ }
  R.render(scene, CAM);
}

// ---------- boot ----------
async function boot() {
  const bar = $('lbar'), say = (p, m) => { bar.style.width = p + '%'; $('lmsg').textContent = m; return new Promise(r => setTimeout(r, 30)); };
  try {
    if (typeof THREE === 'undefined') throw new Error('Three.js failed to load from cdnjs. Check your connection.');
    await say(10, 'Starting renderer…'); initRenderer();
    await say(35, 'Building circuit & environment…'); curTrk = save.trk || 0; camMode = save.cam || 0; buildWorld(curTrk);
    await say(75, 'Preparing cars…'); initParts(); bindInput();
    await say(95, 'Ready'); setMute(); toMenu(); requestAnimationFrame(frame);
    if (!(await new Promise(r => { try { const x = document.createElement('canvas'); r(!!(x.getContext('webgl') || x.getContext('webgl2'))); } catch (e) { r(false); } }))) throw new Error('WebGL not supported');
  } catch (e) { console.error(e); $('lmsg').textContent = 'Error: ' + e.message; $('retry').classList.remove('hidden'); $('loading').classList.remove('hidden'); }
}
addEventListener('load', boot);
})();
