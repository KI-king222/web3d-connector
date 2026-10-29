(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // three-global.cjs
  var require_three_global = __commonJS({
    "three-global.cjs"(exports, module) {
      module.exports = globalThis.THREE;
    }
  });

  // kit.js
  var kit_exports = {};
  __export(kit_exports, {
    BLACK: () => BLACK,
    G: () => G,
    GOLD: () => GOLD,
    M: () => M,
    R: () => R,
    THREE: () => THREE3,
    at: () => at,
    brushed: () => brushed,
    bx: () => bx,
    cable: () => cable,
    coat: () => coat,
    cone: () => cone,
    cy: () => cy,
    cyx: () => cyx,
    cyz: () => cyz,
    finish: () => finish,
    flat: () => flat,
    frameFan: () => frameFan,
    glass: () => glass,
    gpuFan: () => gpuFan,
    gpuPlate: () => gpuPlate,
    grille: () => grille,
    grp: () => grp,
    hex6: () => hex6,
    label: () => label,
    metal: () => metal,
    plastic: () => plastic,
    plate: () => plate,
    profile: () => profile,
    rb: () => rb,
    rectPts: () => rectPts,
    ring: () => ring,
    rng: () => rng,
    rrect: () => rrect,
    screw: () => screw,
    slots: () => slots,
    smd: () => smd,
    wall: () => wall
  });
  var THREE3 = __toESM(require_three_global(), 1);

  // components.js
  var THREE2 = __toESM(require_three_global(), 1);

  // rbox128.js
  var THREE = __toESM(require_three_global(), 1);
  var RoundedBoxGeometry = class extends THREE.BufferGeometry {
    constructor(w2 = 1, h = 1, d = 1, segments = 2, radius = 0.1) {
      super();
      const g = new THREE.BoxGeometry(w2, h, d, 4, 4, 4);
      const r = Math.min(radius, w2 / 2, h / 2, d / 2), hx = w2 / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
      const pos = g.attributes.position, nor = g.attributes.normal, v = new THREE.Vector3(), q = new THREE.Vector3(), n = new THREE.Vector3();
      const remap = (t, half, inner) => {
        const a = Math.abs(t) / half;
        return Math.sign(t) * (a > 0.99 ? half : a > 0.4 ? inner : 0);
      };
      const cl = (x, m) => Math.max(-m, Math.min(m, x));
      for (let i = 0; i < pos.count; i++) {
        v.set(remap(pos.getX(i), w2 / 2, hx), remap(pos.getY(i), h / 2, hy), remap(pos.getZ(i), d / 2, hz));
        q.set(cl(v.x, hx), cl(v.y, hy), cl(v.z, hz));
        n.subVectors(v, q);
        if (n.lengthSq() > 1e-9) {
          n.normalize();
          v.copy(q).addScaledVector(n, r);
          nor.setXYZ(i, n.x, n.y, n.z);
        }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      this.setIndex(g.index);
      this.setAttribute("position", pos);
      this.setAttribute("normal", nor);
      this.setAttribute("uv", g.attributes.uv);
      this.parameters = { width: w2, height: h, depth: d, segments, radius };
    }
  };

  // components.js
  var mat = (c, o = {}) => new THREE2.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.45, ...o });
  var glow = (c, i = 1.4) => new THREE2.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i });
  var dark = () => mat(723725, { metalness: 0.2, roughness: 0.7 });
  var gold = () => mat(13938487, { metalness: 1, roughness: 0.3 });
  var shadow = (o) => {
    o.castShadow = o.receiveShadow = true;
    return o;
  };
  var bx = (w2, h, d, m, x = 0, y = 0, z = 0) => {
    const o = shadow(new THREE2.Mesh(new THREE2.BoxGeometry(w2, h, d), m));
    o.position.set(x, y, z);
    return o;
  };
  var rb = (w2, h, d, m, r = 1.5, x = 0, y = 0, z = 0) => {
    const rr = Math.min(r, w2 / 2, h / 2, d / 2) * 0.98;
    const o = shadow(new THREE2.Mesh(new RoundedBoxGeometry(w2, h, d, 3, rr), m));
    o.position.set(x, y, z);
    return o;
  };
  var cy = (r, h, m, x = 0, y = 0, z = 0, seg = 24) => {
    const o = shadow(new THREE2.Mesh(new THREE2.CylinderGeometry(r, r, h, seg), m));
    o.position.set(x, y, z);
    return o;
  };
  function cable(pts, color = 1381656, r = 3) {
    const curve = new THREE2.CatmullRomCurve3(pts.map((p) => new THREE2.Vector3(...p)));
    return shadow(new THREE2.Mesh(new THREE2.TubeGeometry(curve, 64, r, 8, false), mat(color, { metalness: 0.1, roughness: 0.7 })));
  }
  function fan(size, t, speed = 8, blades = 9) {
    const g = new THREE2.Group(), th = 25, w2 = 3.5, inner = size - 2 * w2;
    const m = mat(t.body, { metalness: 0.2, roughness: 0.6 });
    g.add(
      rb(size, th, w2, m, 1, 0, 0, size / 2 - w2 / 2),
      rb(size, th, w2, m, 1, 0, 0, -size / 2 + w2 / 2),
      rb(w2, th, inner, m, 1, size / 2 - w2 / 2, 0, 0),
      rb(w2, th, inner, m, 1, -size / 2 + w2 / 2, 0, 0)
    );
    const ring2 = new THREE2.Mesh(new THREE2.TorusGeometry(size * 0.46, 1.1, 8, 40), glow(t.accent));
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = th / 2 - 1;
    g.add(ring2);
    const rotor = new THREE2.Group();
    rotor.userData.spin = speed;
    for (let i = 0; i < blades; i++) {
      const p = new THREE2.Group();
      p.rotation.y = i * Math.PI * 2 / blades;
      const b = bx(size * 0.34, 1.2, size * 0.14, m, size * 0.27, 0, 0);
      b.rotation.x = 0.45;
      p.add(b);
      rotor.add(p);
    }
    rotor.add(cy(size * 0.13, th * 0.6, m));
    g.add(rotor);
    return g;
  }
  var _seed = 7;
  var rnd = () => (_seed = _seed * 16807 % 2147483647) / 2147483647;
  var hex6 = (n) => "#" + n.toString(16).padStart(6, "0");
  function label(text, w2, h, o = {}) {
    if (typeof document === "undefined") return new THREE2.Group();
    const cw = 512, ch = Math.max(32, Math.round(512 * h / w2));
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    const x = c.getContext("2d");
    if (o.bg) {
      x.fillStyle = o.bg;
      x.fillRect(0, 0, cw, ch);
    }
    let fs = ch * 0.72, font = (f) => `600 ${f}px ui-monospace, Menlo, monospace`;
    x.font = font(fs);
    const tw = x.measureText(text).width;
    if (tw > cw * 0.94) {
      fs *= cw * 0.94 / tw;
      x.font = font(fs);
    }
    x.fillStyle = o.color || "#ffffff";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(text, cw / 2, ch / 2 + fs * 0.04);
    return new THREE2.Mesh(
      new THREE2.PlaneGeometry(w2, h),
      new THREE2.MeshBasicMaterial({ map: new THREE2.CanvasTexture(c), transparent: true, opacity: o.opacity ?? 0.85, depthWrite: false })
    );
  }
  var FLAT = new THREE2.Matrix4().set(-1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
  function flatLabel(text, w2, h, o = {}) {
    const l = label(text, w2, h, o);
    l.quaternion.setFromRotationMatrix(FLAT);
    return l;
  }
  function bundle(pts, colors, off = [0, 0, 3.4], r = 1.7) {
    const g = new THREE2.Group();
    colors.forEach((col, i) => {
      const k = i - (colors.length - 1) / 2;
      g.add(cable(pts.map((p) => [p[0] + off[0] * k, p[1] + off[1] * k, p[2] + off[2] * k]), col, r));
    });
    return g;
  }
  var tie = (g, x, y, z) => g.add(bx(9, 2.4, 9, mat(14540253, { metalness: 0.1, roughness: 0.8 }), x, y, z));
  function boardDetail(g, t, m) {
    const { L: L2, W: W2 } = m, top = 1.6, [sx, sz] = m.socket, ac = hex6(t.accent);
    const lab = (txt, w2, h, x, z, c) => {
      const l = flatLabel(txt, w2, h, { color: c || "#ffffff", opacity: 0.7 });
      l.position.set(x, top + 0.15, z);
      g.add(l);
    };
    const tr = glow(t.accent, 0.35);
    for (let i = 0; i < 26; i++) {
      const horiz = rnd() > 0.5, len2 = 20 + rnd() * 70, x = (rnd() - 0.5) * (L2 - 40), z = (rnd() - 0.5) * (W2 - 40);
      g.add(horiz ? bx(len2, 0.12, 0.7, tr, x, top + 0.07, z) : bx(0.7, 0.12, len2, tr, x, top + 0.07, z));
    }
    const cap = mat(1381658, { metalness: 0.3 }), capTop = mat(t.metal, { metalness: 0.9 });
    for (let i = 0; i < 9; i++) {
      const z = sz - 32 + i * 8;
      g.add(cy(3.1, 9, cap, sx - 66, top + 4.5, z, 16), cy(2.9, 0.4, capTop, sx - 66, top + 9.1, z, 16));
    }
    if (m.W > 200) for (let i = 0; i < 10; i++) {
      const x = sx - 36 + i * 8;
      g.add(cy(3.1, 9, cap, x, top + 4.5, sz + 62, 16), cy(2.9, 0.4, capTop, x, top + 9.1, sz + 62, 16));
    }
    [[sx + 10, W2 / 2 - 8, "CPU_FAN"], [L2 / 2 - 20, W2 / 2 - 14, "SYS_FAN1"], [L2 / 2 - 20, -W2 / 2 + 14, "SYS_FAN2"]].forEach(([x, z, n]) => {
      g.add(bx(18, 6, 6, dark(), x, top + 3, z), bx(14, 0.8, 1.2, gold(), x, top + 6.2, z));
      lab(n, 24, 5, x, z - 7);
    });
    for (let i = 0; i < 4; i++) g.add(bx(18, 7, 7, dark(), L2 / 2 - 30, top + 3.5, -W2 * 0.08 - i * 9));
    lab("SATA", 20, 5, L2 / 2 - 30, -W2 * 0.08 - 40);
    g.add(cy(10, 3.2, mat(13685720, { metalness: 0.9, roughness: 0.3 }), 20, top + 1.6, -80, 32));
    lab("CR2032", 16, 5, 20, -62);
    g.add(bx(30, 6, 12, dark(), L2 / 2 - 60, top + 3, -W2 / 2 + 10), bx(24, 6, 10, dark(), -20, top + 3, -W2 / 2 + 10));
    lab("F_PANEL", 28, 5, L2 / 2 - 60, -W2 / 2 + 19);
    lab("USB3", 20, 5, -20, -W2 / 2 + 18);
    lab("NOVA X670-E", 64, 12, L2 / 2 - 75, -W2 * 0.3 - 33, ac);
    lab("PCIe 5.0 x16", 44, 7, m.pcie[0], m.pcie[1] + 8);
    lab("DDR5", 30, 8, m.ram.x0 + (m.ram.n - 1) * m.ram.pitch / 2, m.ram.z - 72, ac);
    lab("M.2_1", 22, 6, m.m2[0], m.m2[1] - 15);
    lab("EATX12V", 26, 5, m.cpu8[0], m.cpu8[1] - 9);
    lab("ATX24", 22, 5, m.atx24[0] - 14, m.atx24[1]);
  }
  function gpuDetail(g, t, L2, Wd, T3, H2, labelText = "VOLT RX 9090") {
    const dk = mat(723725, { roughness: 0.8 });
    const lw = Math.min(L2 * 0.58, 150), lx = Math.min(0, L2 / 2 - 92 - lw / 2);
    const l = label(labelText, lw, 14, { color: hex6(t.accent), opacity: 0.95 });
    l.rotation.z = Math.PI;
    l.position.set(lx, 5 + H2 / 2, Wd / 2 + 0.25);
    g.add(l);
    for (let i = 0; i < 14; i++) g.add(bx(4, 0.6, Wd * 0.5, dk, -L2 * 0.3 + i * 7, 0, 0));
    g.add(bx(22, 9, 12, dk, L2 / 2 - 70, 9, Wd / 2 - 8));
    g.add(bx(18, 1, 2.2, mat(13938487, { metalness: 1, roughness: 0.3 }), L2 / 2 - 70, 13.7, Wd / 2 - 8));
  }
  function gpuPlate(L2, W2, th, cxs, r, corner = 1.5) {
    const s = new THREE2.Shape(), x0 = -L2 / 2, x1 = L2 / 2, y0 = -W2 / 2, y1 = W2 / 2, k = Math.min(corner, W2 / 2, L2 / 2);
    s.moveTo(x0 + k, y0);
    s.lineTo(x1 - k, y0);
    s.quadraticCurveTo(x1, y0, x1, y0 + k);
    s.lineTo(x1, y1 - k);
    s.quadraticCurveTo(x1, y1, x1 - k, y1);
    s.lineTo(x0 + k, y1);
    s.quadraticCurveTo(x0, y1, x0, y1 - k);
    s.lineTo(x0, y0 + k);
    s.quadraticCurveTo(x0, y0, x0 + k, y0);
    cxs.forEach((cx) => {
      const h = new THREE2.Path();
      h.absarc(cx, 0, r, 0, Math.PI * 2, true);
      s.holes.push(h);
    });
    const geo = new THREE2.ExtrudeGeometry(s, { depth: th, bevelEnabled: false, curveSegments: 64 });
    geo.rotateX(-Math.PI / 2);
    return geo;
  }
  function gpuFan(D, t, speed = 9, blades = 9) {
    const g = new THREE2.Group();
    const bm = mat(t.blade ?? 2764084, { metalness: 0.3, roughness: 0.5 }), hubM = mat(t.hub ?? 1711137, { metalness: 0.6, roughness: 0.35 });
    const r0 = D * 0.14, r1 = D * 0.5 - 0.8, N = 14, up = [], lo = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, r = r0 + (r1 - r0) * u;
      const hw = D * (0.035 + 0.075 * Math.sin(Math.PI * Math.pow(u, 1.6)));
      const c = -D * 0.1 * u * u;
      up.push([r, c + hw]);
      lo.push([r, c - hw]);
    }
    const s = new THREE2.Shape();
    s.moveTo(lo[0][0], lo[0][1]);
    lo.forEach((p) => s.lineTo(p[0], p[1]));
    s.lineTo(r1 + D * 0.02, -D * 0.1);
    for (let i = up.length - 1; i >= 0; i--) s.lineTo(up[i][0], up[i][1]);
    s.closePath();
    const geo = new THREE2.ExtrudeGeometry(s, { depth: 0.9, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, -0.45, 0);
    const rotor = new THREE2.Group();
    rotor.userData.spin = speed;
    for (let i = 0; i < blades; i++) {
      const p = new THREE2.Group();
      p.rotation.y = i * Math.PI * 2 / blades;
      const b = shadow(new THREE2.Mesh(geo, bm));
      b.rotation.x = 0.32;
      p.add(b);
      rotor.add(p);
    }
    rotor.add(cy(D * 0.15, 6, hubM, 0, 0, 0, 40));
    rotor.add(cy(D * 0.105, 0.8, mat(2369068, { metalness: 0.7, roughness: 0.3 }), 0, 3.3, 0, 40));
    const hr = new THREE2.Mesh(new THREE2.TorusGeometry(D * 0.12, 0.45, 8, 40), glow(t.accent, 0.9));
    hr.rotation.x = Math.PI / 2;
    hr.position.y = 3.5;
    rotor.add(hr);
    g.add(rotor);
    return g;
  }
  function gpuShroud(g, t, o) {
    const { L: L2, Wd, T: T3, n, body, metal: metal3, tier, conn, plastic: plastic2, premium, rgb } = o;
    const wall2 = 2.6, plateT = 3.2, endM = 8;
    const pitch = (L2 - 2 * endM) / n, fanD = Math.min(pitch - 7, Wd - 22), holeR = fanD / 2 + 1.1;
    const cxs = Array.from({ length: n }, (_, i) => -L2 / 2 + endM + pitch * (i + 0.5));
    const finTop = T3 - plateT - 7.3;
    const finN = plastic2 ? 16 : premium ? 48 : 34, hF = finTop - 4;
    const fm = plastic2 ? mat(11054260, { metalness: 0.75, roughness: 0.4 }) : mat(t.metal, { metalness: 0.8, roughness: 0.4 });
    for (let i = 0; i < finN; i++)
      g.add(bx(0.7, hF, Wd - 2 * wall2 - 1, fm, -L2 / 2 + 14 + i * ((L2 - 28) / (finN - 1)), 4 + hF / 2, 0));
    g.add(bx(L2 - 24, 0.8, Wd - 2 * wall2 - 1, dark(), 0, finTop - 1, 0));
    if (!plastic2 && finTop > 26) {
      const cu = mat(12088115, { metalness: 0.9, roughness: 0.3 });
      [10, 18.5].forEach((y) => {
        const p = cy(3.2, L2 - 40, cu, 0, y, -Wd / 2 + wall2 + 7, 16);
        p.rotation.z = Math.PI / 2;
        g.add(p);
      });
    }
    const wy = 3 + (T3 - 3) / 2, wh = T3 - 3, zc = Wd / 2 - wall2 / 2;
    g.add(rb(wall2, wh, Wd, body, 1.2, L2 / 2 - wall2 / 2, wy, 0), rb(wall2, wh, Wd, body, 1.2, -L2 / 2 + wall2 / 2, wy, 0));
    if (!conn) g.add(rb(L2, wh, wall2, body, 1.2, 0, wy, zc));
    else {
      const xa = L2 / 2 - 54 - (conn === 2 ? 30 : 0), xb = L2 / 2 - 26, gy = 18;
      g.add(
        rb(xa + L2 / 2, wh, wall2, body, 1.2, (xa - L2 / 2) / 2, wy, zc),
        rb(L2 / 2 - xb, wh, wall2, body, 1.2, (xb + L2 / 2) / 2, wy, zc),
        rb(xb - xa, T3 - gy, wall2, body, 1.2, (xa + xb) / 2, (gy + T3) / 2, zc)
      );
    }
    g.add(rb(L2, T3 - finTop, wall2, body, 1.2, 0, (T3 + finTop) / 2, -Wd / 2 + wall2 / 2));
    g.add(bx(L2 - 6, 2, wall2, metal3, 0, 4, -Wd / 2 + wall2 / 2));
    const plate3 = shadow(new THREE2.Mesh(gpuPlate(L2, Wd, plateT, cxs, holeR, 1.5), body));
    plate3.position.y = T3 - plateT;
    g.add(plate3);
    cxs.forEach((cx) => {
      const f = gpuFan(fanD, t, 9, tier >= 7 ? 11 : 9);
      f.position.set(cx, T3 - 5.5, 0);
      g.add(f);
      const rim = new THREE2.Mesh(new THREE2.TorusGeometry(holeR - 0.5, 0.9, 10, 64), rgb ? glow(t.accent, tier >= 7 ? 0.95 : 0.4) : metal3);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(cx, T3 - 0.9, 0);
      g.add(rim);
      if (!plastic2) {
        const bez = shadow(new THREE2.Mesh(new THREE2.TorusGeometry(holeR + 1.9, 0.7, 8, 64), metal3));
        bez.rotation.x = Math.PI / 2;
        bez.position.set(cx, T3, 0);
        g.add(bez);
      }
    });
    if (!plastic2) {
      g.add(bx(L2 - 30, 0.5, 1.6, metal3, 0, T3 + 0.15, Wd / 2 - 5.5), bx(L2 - 30, 0.5, 1.6, metal3, 0, T3 + 0.15, -Wd / 2 + 5.5));
    }
  }
  function caseDetail(g, t, { W: W2, H: H2, D }) {
    const dk = mat(723725, { roughness: 0.8 }), metal3 = mat(t.metal, { metalness: 0.9, roughness: 0.3 });
    for (let i = 0; i < 16; i++) g.add(bx(W2 - 80, 0.6, 5, dk, 0, H2 / 2 + 0.1, -D / 2 + 60 + i * 14));
    const btn = cy(7, 3, glow(t.accent, 1.2), W2 / 2 - 45, H2 / 2 - 10, D / 2 + 2.5);
    btn.rotation.x = Math.PI / 2;
    g.add(btn);
    g.add(bx(14, 6, 2, dk, W2 / 2 - 75, H2 / 2 - 10, D / 2 + 1), bx(14, 6, 2, dk, W2 / 2 - 95, H2 / 2 - 10, D / 2 + 1), bx(10, 4, 2, dk, W2 / 2 - 112, H2 / 2 - 10, D / 2 + 1));
    const tx = caseDims(H2 < 400 ? "mini" : H2 > 520 ? "full" : "mid").trayX;
    [[60, 130], [-40, 130], [190, -100]].forEach(([y, z]) => {
      g.add(bx(0.8, 80, 26, mat(1118484), tx + 0.95, y, z), bx(1, 70, 18, dk, tx + 1.05, y, z));
    });
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => {
      const s = cy(5, 2, metal3, W2 / 2 + 1, a * (H2 / 2 - 12), b * (D / 2 - 12), 16);
      s.rotation.z = Math.PI / 2;
      g.add(s);
    });
  }
  function systemCables(g, t, { cd, mb, mobZ, gdim }) {
    const { D } = cd, X0 = cd.trayX + 7.75, blk = 1315863, sl = [blk, blk, blk, 1908002];
    const xe = X0 + 13.6, ye = 40 + mb.atx24[1], ze = mobZ + mb.atx24[0], zf = -D / 2 + 163;
    g.add(bundle([[40, -182, zf - 10], [40, -182, zf + 80], [30, -165, D / 2 - 105], [-20, -90, D / 2 - 95], [xe + 10, 10, ze + 35], [xe, ye - 8, ze + 10], [xe, ye, ze]], sl, [0, 0, 3.4], 1.7));
    tie(g, -20, -90, D / 2 - 95);
    tie(g, xe + 10, 10, ze + 35);
    const cx = X0 + 6, cy8 = 40 + mb.cpu8[1], cz8 = mobZ + mb.cpu8[0];
    g.add(bundle([[30, -175, -66], [10, -160, -120], [-20, -150, -190], [-60, -130, -218], [-74, -60, -219], [-74, 60, -219], [-74, 130, -205], [-74, cy8, cz8 - 25], [cx, cy8, cz8]], [blk, blk, 1908002], [0, 0, 4], 1.8));
    tie(g, -74, -60, -219);
    tie(g, -74, 60, -219);
    const fx = cd.trayX + 7.75 + 6 + 8;
    g.add(bundle([[-45, 40, 203], [-72, 55, 185], [-76, 100, 120], [-74, 145, 72]], [2763312, 2763312, 3816002], [0, 0, 2.5], 1.1));
    if (gdim) {
      const { L: Lg, Wd } = gdim, cX = X0 + 1.6 + Wd - 11, cY = 40 + mb.pcie[1] - 9, z1 = mobZ - mb.L / 2 + Lg - 40;
      [[z1, 48], [z1 - 30, 56]].forEach(([z, sx0]) => {
        g.add(cable([[sx0, -176, -70], [sx0 + 4, -160, -10], [64, -135, z - 10], [64, -70, z], [62, -20, z], [cX + 22, cY, z], [cX, cY, z]], blk, 3.2));
        tie(g, 64, -70, z);
      });
    }
    g.add(cable([[18, -125, -12], [45, -112, -5], [62, -60, 10], [62, 0, 40], [40, 20, 58], [-30, 22, 60], [X0 - 5, 40 - mb.W * 0.08, mobZ + mb.L / 2 - 30]], 12597547, 1.6));
  }
  var FORMS = { atx: [305, 244], matx: [244, 244], itx: [170, 170] };
  function mbLayout(form = "atx") {
    const [L2, W2] = FORMS[form] || FORMS.atx;
    const sx = -L2 / 2 + 0.33 * L2, sz = W2 * 0.1;
    return {
      L: L2,
      W: W2,
      socket: [sx, sz],
      ram: { x0: sx + 52, z: sz - 8, pitch: 12, n: form === "itx" ? 2 : 4 },
      // Der erste x16-Slot sitzt im sichtbaren Top-down-Layout direkt unter
      // dem Sockel; M.2 liegt dazwischen, RAM rechts vom Sockel.
      pcie: [sx - 10, -W2 * 0.18],
      m2: [sx - 5, -W2 * 0.06],
      atx24: [L2 / 2 - 6, W2 * 0.1],
      cpu8: [sx - 30, W2 / 2 - 8]
    };
  }
  var CASES = { mini: { W: 200, H: 380, D: 380 }, mid: { W: 230, H: 480, D: 460 }, full: { W: 250, H: 560, D: 520 } };
  function caseDims(size = "mid") {
    const c = CASES[size] || CASES.mid;
    return { ...c, trayX: c.W / 2 - 28, shroudY: -c.H / 2 + 110 };
  }
  var P = {
    gpu: {
      compact: { length: 240, width: 112, slots: 2, fans: 2 },
      standard: {},
      flagship: { length: 336, width: 140, slots: 3.5, fans: 3 },
      t1: { length: 145, width: 105, slots: 1.4, fans: 1, rgb: false, backplate: false, plastic: true },
      t2: { length: 168, width: 112, slots: 1.7, fans: 1, rgb: false, backplate: false, plastic: true },
      t3: { length: 200, width: 118, slots: 2, fans: 2, rgb: false, backplate: false, plastic: true },
      t4: { length: 250, width: 115, slots: 2.2, fans: 2, rgb: false, backplate: true },
      t5: { length: 280, width: 118, slots: 2.5, fans: 2, rgb: true, backplate: true },
      t6: { length: 300, width: 120, slots: 2.5, fans: 3, rgb: true, backplate: true },
      t7: { length: 310, width: 125, slots: 2.7, fans: 3, rgb: true, backplate: true },
      t8: { length: 320, width: 132, slots: 3, fans: 3, rgb: true, backplate: true },
      t9: { length: 336, width: 140, slots: 3.2, fans: 3, rgb: true, backplate: true, premium: true },
      t10: { length: 352, width: 148, slots: 3.5, fans: 3, rgb: true, backplate: true, premium: true }
    },
    cpu: {
      t1: { size: 26, ihs: 16, pins: false, gold: false, label: "Axiom Pulse G2" },
      t2: { size: 28, ihs: 18, pins: false, gold: false, label: "Ember Spark 3K" },
      t3: { size: 32, ihs: 22, pins: true, gold: false, label: "Axiom Flux 3-1210" },
      t4: { size: 34, ihs: 26, pins: true, gold: false, label: "Ember Pyra 5 5600" },
      t5: { size: 37, ihs: 29, pins: true, gold: true, label: "Axiom Flux 5-1340F" },
      t6: { size: 40, ihs: 32, pins: true, gold: true, label: "Ember Pyra 7 5700" },
      t7: { size: 43, ihs: 35, pins: true, gold: true, label: "Axiom Flux 7-1370K" },
      t8: { size: 46, ihs: 38, pins: true, gold: true, label: "Ember Pyra 9 7900" },
      t9: { size: 48, ihs: 40, pins: true, gold: true, logo: true, label: "Axiom Flux 9-1490K" },
      t10: { size: 52, ihs: 44, pins: true, gold: true, logo: true, label: "Ember Pyra 9 7950 3D" }
    },
    cooler: { lowprofile: { height: 70, fins: 24, fans: 1 }, tower: {}, dual: { height: 165, fans: 2, fins: 44 } }
  };
  var B = {
    fan(t, o = {}) {
      const tier = Math.max(1, Math.min(10, Number(o.tier || 6)));
      const size = o.size ?? 80 + tier * 6, blades = o.blades ?? 5 + Math.floor(tier / 2);
      const g = new THREE2.Group(), f = fan(size, t, 5 + tier * 0.5, blades);
      f.position.y = 12.5;
      g.add(f);
      if (tier >= 7) g.add(bx(size * 0.72, 1.2, 2, glow(t.accent, 1.2), 0, 26, size / 2 - 4));
      return g;
    },
    cpu(t, o = {}) {
      const tier = Number(o.tier || (String(o.preset || "").match(/t?(\d+)/) || [0, 6])[1]);
      const c = { size: 40, ihs: 34, ...P.cpu["t" + tier] || P.cpu.t6, ...o };
      const S = c.size, I = c.ihs, g = new THREE2.Group();
      const subCol = tier <= 2 ? 660494 : tier <= 4 ? 1718818 : tier <= 7 ? 2783800 : 1093712;
      g.add(rb(S, 0.7 + tier * 0.1, S, mat(subCol, { metalness: 0.1 + tier * 0.05, roughness: 0.7 - tier * 0.05 }), 0.35, 0, 0.4 + tier * 0.04, 0));
      const ihsMat = mat(tier <= 2 ? 5593182 : tier <= 5 ? 9080468 : tier <= 8 ? 12962256 : 15791352, { metalness: 0.45 + tier * 0.05, roughness: 0.55 - tier * 0.04 });
      g.add(rb(I, 1 + tier * 0.22, I, ihsMat, 0.7 + tier * 0.1, 0, 1.2 + tier * 0.15, 0));
      for (let i = 0; i < 1 + Math.min(tier, 9); i++) {
        const a = i / (1 + tier) * Math.PI * 2, r = I * 0.4;
        g.add(bx(1.1, 0.4, 1.1, dark(), Math.cos(a) * r, 2.3 + tier * 0.1, Math.sin(a) * r));
      }
      if (tier >= 5) g.add(bx(2, 0.35, 2, gold(), -I * 0.3, 2.9 + tier * 0.1, -I * 0.3));
      if (tier >= 8) {
        const lab = flatLabel(c.label || (tier >= 10 ? "NOVA X3D" : "NOVA"), I * 0.72, 6, { color: hex6(t.accent), opacity: 0.95 });
        lab.position.set(0, 3 + tier * 0.12, 0);
        g.add(lab);
      }
      if (tier >= 3) {
        const grid = tier >= 8 ? 5 : tier >= 5 ? 3 : 2;
        for (let x = -grid; x <= grid; x++) for (let z = -grid; z <= grid; z++)
          if ((x + z) % 2 === 0) g.add(bx(0.25, 0.15 + tier * 0.02, 0.25, gold(), x * 2.2, 0.1, z * 2.2));
      }
      if (tier >= 6) {
        g.add(rb(S + 6, 1, S + 6, mat(2236968, { metalness: 0.7 }), 0.7, 0, 0.8, 0));
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => g.add(cy(1.6, 2, mat(t.metal, { metalness: 0.95 }), a * S * 0.45, 1.4, b * S * 0.45, 12)));
      }
      if (tier <= 2) g.add(bx(I * 0.5, 0.3, 2, dark(), 0, 1.5, 0));
      return g;
    },
    cooler(t, o = {}) {
      const tier = Math.max(1, Math.min(10, Number(o.tier || 6)));
      const c = { height: 55 + tier * 11, fins: 16 + tier * 3, fans: tier >= 8 ? 2 : 1, ...P.cooler[o.preset] || {}, ...o };
      const h = c.height, g = new THREE2.Group();
      const cu = mat(12088115, { metalness: 0.9, roughness: 0.3 }), al = mat(13159636, { metalness: 0.85, roughness: 0.35 });
      const y0 = 12, hf = h - y0 - 8;
      g.add(rb(60, 6, 60, cu, 1, 0, 3, 0));
      for (let i = 0; i < c.fins; i++) g.add(bx(0.7, hf, 110, al, -25 + i * (50 / (c.fins - 1)), y0 + hf / 2, 0));
      [-40, -20, 0, 20, 40].forEach((z) => g.add(cy(3, hf + 10, cu, 0, y0 + hf / 2, z, 12)));
      g.add(rb(54, 4, 114, mat(t.body), 1.5, 0, h - 6, 0));
      g.add(bx(40, 0.8, 8, glow(t.accent), 0, h - 3.6, 0));
      const fs = Math.min(120, hf);
      for (let i = 0; i < c.fans; i++) {
        const f = fan(fs, t, 8, 9);
        f.rotation.z = Math.PI / 2;
        f.position.set(i === 0 ? 38 : -38, y0 + hf / 2, 0);
        g.add(f);
      }
      if (c.detail !== false) {
        const l = flatLabel(`NOVA CHILL T${tier}`, 46, 10, { color: hex6(t.accent), opacity: 0.95 });
        l.position.set(0, h - 3.9, 0);
        g.add(l);
      }
      return g;
    },
    aio(t, o = {}) {
      const k = Math.max(1, Math.round((o.radiator ?? 240) / 120)), L2 = 120 * k + 35, g = new THREE2.Group();
      g.add(rb(60, 6, 60, mat(12088115, { metalness: 0.9, roughness: 0.3 }), 1, 0, 3, 0));
      g.add(cy(38, 38, mat(t.body), 0, 25, 0, 48));
      g.add(cy(30, 1, glow(t.accent), 0, 44.5, 0, 48));
      const rx = 150 + L2 / 2, ry = 35;
      g.add(rb(L2, 27, 120, mat(2829104, { metalness: 0.7, roughness: 0.5 }), 3, rx, ry, 0));
      for (let i = 0; i < k; i++) {
        const f = fan(120, t, 8, 9);
        f.position.set(rx + (i - (k - 1) / 2) * 120, ry + 26, 0);
        g.add(f);
      }
      [-18, 18].forEach((z) => g.add(cable([[36, 25, z], [90, 25, z * 1.6], [rx - L2 / 2, ry, z]], 1118484, 5)));
      return g;
    },
    ram(t, o = {}) {
      const tier = Math.max(1, Math.min(10, Number(o.tier || 6))), n = o.sticks ?? (tier >= 6 ? 2 : 1), pitch = o.pitch ?? (tier >= 8 ? 14 : 17), g = new THREE2.Group();
      const length = 104 + tier * 4, height = 22 + tier * 1.2;
      for (let i = 0; i < n; i++) {
        const s = new THREE2.Group();
        s.position.z = (i - (n - 1) / 2) * pitch;
        s.add(bx(length, height, 1.6, mat(t.pcb), 0, height / 2, 0));
        s.add(rb(length - 2, height - 2, 3, mat(t.body, { metalness: 0.35 + tier * 0.04 }), 1.5, 0, height / 2 + 1, 2.4), rb(length - 2, height - 2, 3, mat(t.body, { metalness: 0.35 + tier * 0.04 }), 1.5, 0, height / 2 + 1, -2.4));
        s.add(rb(length - 9, 5, 7.4, glow(t.accent, 0.8 + tier * 0.08), 1.5, 0, height + 9, 0));
        s.add(bx(length - 3, 3, 1.7, gold(), 0, 1.5, 0));
        g.add(s);
      }
      return g;
    },
    motherboard(t, o = {}) {
      const tier = Math.max(1, Math.min(10, Number(o.tier || 6))), m = mbLayout(o.form), { L: L2, W: W2 } = m, top = 1.6, g = new THREE2.Group();
      g.scale.setScalar(0.92 + tier * 0.012);
      const body = mat(t.body, { metalness: 0.45, roughness: 0.5 });
      const pcb = mat(t.pcb, { metalness: 0.18, roughness: 0.62 });
      const alu = mat(11054260, { metalness: 0.75, roughness: 0.4 });
      g.add(bx(L2, 1.6, W2, pcb, 0, 0.8, 0));
      g.add(bx(L2 * 0.92, 22, 6, mat(1315864, { metalness: 0.6 }), 0, top + 11, W2 / 2 - 3));
      for (let i = 0; i < 6; i++) g.add(bx(10, 8, 4, dark(), -L2 * 0.35 + i * 22, top + 10, W2 / 2 - 1));
      const [sx, sz] = m.socket;
      g.add(bx(54, 3.2, 54, dark(), sx, top + 1.6, sz));
      g.add(bx(44, 2.8, 44, mat(12106948, { metalness: 0.85, roughness: 0.25 }), sx, top + 3.2, sz));
      g.add(bx(38, 1, 38, mat(1842208), sx, top + 4, sz));
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => g.add(bx(7, 3.5, 7, mat(t.metal, { metalness: 0.9 }), sx + a * 23, top + 2.5, sz + b * 23)));
      const ramN = Math.max(m.ram.n, 4);
      for (let i = 0; i < ramN; i++) {
        const rx = m.ram.x0 + i * Math.max(m.ram.pitch, 11.5);
        g.add(bx(5.5, 11, 138, dark(), rx, top + 5.5, m.ram.z));
        g.add(bx(3.5, 2.2, 134, mat(1184280), rx, top + 11.2, m.ram.z));
        g.add(bx(5, 3, 6, mat(2763314), rx, top + 12, m.ram.z + 62));
        g.add(bx(5, 3, 6, mat(2763314), rx, top + 12, m.ram.z - 62));
      }
      const pcieSlots = o.form === "itx" ? [[89, 0]] : [[100, 8], [100, -22], [55, -50], [55, -76]];
      pcieSlots.forEach(([len2, dz], idx) => {
        const th = idx < 2 ? 12 : 8;
        g.add(bx(len2, th, 7.2, dark(), m.pcie[0] - 50 + len2 / 2, top + th / 2, m.pcie[1] + dz));
        g.add(bx(len2 - 6, 1, 5, mat(1712176), m.pcie[0] - 50 + len2 / 2, top + th + 0.4, m.pcie[1] + dz));
      });
      g.add(rb(54 + tier * 3, 5 + tier * 0.2, 22, body, 1.2, sx + 10, top + 4, -W2 * 0.08));
      g.add(bx(70, 0.8, 16, alu, sx + 10, top + 6.8, -W2 * 0.08));
      g.add(rb(20, 16, 78, body, 2, sx - 50, top + 9, sz + 5));
      g.add(rb(78, 14, 18, body, 2, sx, top + 8, W2 / 2 - 28));
      g.add(rb(52, 10, 48, body, 2.5, L2 / 2 - 70, top + 5.5, -W2 * 0.32));
      g.add(cy(6, 0.7, glow(t.accent), L2 / 2 - 70, top + 11, -W2 * 0.32, 24));
      g.add(bx(8, 12, 30, dark(), m.atx24[0], top + 6, m.atx24[1]));
      g.add(bx(18, 9, 11, dark(), m.cpu8[0], top + 4.5, m.cpu8[1]));
      g.add(bx(22, 4, 8, dark(), -L2 / 2 + 40, top + 2.5, -W2 / 2 + 14));
      g.add(bx(14, 4, 8, dark(), -L2 / 2 + 70, top + 2.5, -W2 / 2 + 14));
      for (let i = 0; i < 4; i++) g.add(bx(12, 6, 5, dark(), L2 / 2 - 20, top + 4, -W2 * 0.05 - i * 12));
      [[-L2 / 2 + 8, -W2 / 2 + 8], [L2 / 2 - 8, -W2 / 2 + 8], [-L2 / 2 + 8, W2 / 2 - 8], [L2 / 2 - 8, W2 / 2 - 8]].forEach(([x, z]) => g.add(cy(2.2, 1.2, mat(t.metal, { metalness: 0.9 }), x, top + 0.6, z, 16)));
      if (tier >= 7) g.add(bx(28, 1.8, 16, glow(t.accent, 0.8), sx - 34, top + 8, sz - 38));
      if (o.detail !== false) boardDetail(g, t, m);
      return g;
    },
    gpu(t, o = {}) {
      const tier = Number(o.tier || (String(o.preset || "").match(/t?(\d+)/) || [0, 6])[1]);
      const pk = o.preset && P.gpu[o.preset] ? o.preset : "t" + (tier || 6);
      const c = {
        length: 300,
        width: 115,
        slots: 2.5,
        fans: 3,
        rgb: true,
        backplate: true,
        plastic: false,
        premium: false,
        ...P.gpu[pk] || P.gpu.t6,
        ...o
      };
      const gpuLabel = c.label || ["Quanta Lite 1030", "Ember Blaze 640", "Quanta Core 1650", "Ember Blaze 660", "Quanta Pro 3060", "Ember Blaze 760", "Quanta Pro 4070", "Ember Blaze 780 XT", "Quanta Elite 4080", "Quanta Titan 4090"][Math.max(0, Math.min(9, tier - 1))];
      const L2 = c.length, Wd = c.width, T3 = Math.max(c.slots * 20.3, 28), n = Math.max(1, c.fans | 0);
      const g = new THREE2.Group();
      const body = mat(c.plastic ? 3026484 : t.body, {
        metalness: c.plastic ? 0.08 : c.premium ? 0.55 : 0.32,
        roughness: c.plastic ? 0.82 : 0.48
      });
      const metal3 = mat(t.metal, { metalness: 0.9, roughness: 0.28 });
      const alu = mat(11054260, { metalness: 0.75, roughness: 0.4 });
      if (n === 1) {
        const H2 = Math.max(T3 - 4, 22);
        g.add(bx(L2 - 10, 1.4, Wd - 8, mat(t.pcb), 2, 2, 0));
        g.add(bx(L2 - 20, 0.8, Wd - 16, mat(1710622), 0, 0.6, 0));
        g.add(bx(1.8, H2 + 8, Wd + 6, metal3, -L2 / 2 - 1, H2 / 2, 0));
        g.add(bx(3, 11, 20, dark(), -L2 / 2 - 2, H2 * 0.4, -Wd / 2 + 22));
        g.add(bx(2.5, 8, 14, dark(), -L2 / 2 - 2, H2 * 0.4, -Wd / 2 + 42));
        g.add(bx(Math.min(70, L2 * 0.45), 1.4, 5.5, gold(), -L2 / 2 + 40, 2.2, -Wd / 2 + 4));
        const shroudL = L2 * 0.72, shroudW = Wd - 4, sx1 = -L2 * 0.05, plateT = 3.2, wallH = H2 - plateT;
        const fSz = Math.min(shroudW - 14, shroudL * 0.55, 85);
        g.add(
          rb(shroudL, wallH, 3, body, 1.2, sx1, 2 + wallH / 2, shroudW / 2 - 1.5),
          rb(shroudL, wallH, 3, body, 1.2, sx1, 2 + wallH / 2, -shroudW / 2 + 1.5),
          rb(3, wallH, shroudW, body, 1.2, sx1 - shroudL / 2 + 1.5, 2 + wallH / 2, 0),
          rb(3, wallH, shroudW, body, 1.2, sx1 + shroudL / 2 - 1.5, 2 + wallH / 2, 0)
        );
        const plate1 = shadow(new THREE2.Mesh(gpuPlate(shroudL, shroudW, plateT, [0], fSz / 2 + 1.1, 1.5), body));
        plate1.position.set(sx1, 2 + wallH, 0);
        g.add(plate1);
        g.add(bx(shroudL - 6, 0.8, shroudW - 6, dark(), sx1, 2 + wallH - 7, 0));
        const f = gpuFan(fSz, t, 7, 7);
        f.position.set(sx1, 2 + H2 - 5.5, 0);
        g.add(f);
        for (let i = 0; i < 4; i++) {
          g.add(bx(8, H2 * 0.55, 1.5, dark(), sx1 + (i - 1.5) * 16, 2 + H2 / 2, shroudW / 2 - 1));
          g.add(bx(8, H2 * 0.55, 1.5, dark(), sx1 + (i - 1.5) * 16, 2 + H2 / 2, -shroudW / 2 + 1));
        }
        const finX0 = L2 * 0.28;
        for (let i = 0; i < 14; i++) {
          g.add(bx(1.1, H2 * 0.7, Wd * 0.55, alu, finX0 + i * 3.2, 2 + H2 * 0.4, 0));
        }
        g.add(rb(L2 * 0.22, 3, Wd * 0.7, body, 2, L2 * 0.38, 2 + H2 * 0.85, 0));
        for (let i = 0; i < 5; i++)
          g.add(bx(4, 1.2, 4, dark(), L2 * 0.32 + i * 7, 3.5, i % 2 * 14 - 7));
      } else {
        const H2 = Math.max(T3 - 5, 18);
        if (c.backplate) g.add(rb(L2 - 8, 2, Wd, metal3, 1, 0, 1, 0));
        else g.add(bx(L2 - 16, 1, Wd - 10, mat(1710622), 0, 0.8, 0));
        g.add(bx(L2 - 18, 1.5, Wd - 6, mat(t.pcb), 0, 3, 0));
        const conn = c.conn ?? (tier >= 5 && c.detail !== false ? 2 : tier >= 4 ? 1 : 0);
        gpuShroud(g, t, { L: L2, Wd, T: T3, n, body, metal: metal3, tier, conn, plastic: c.plastic, premium: c.premium, rgb: c.rgb });
        for (let i = 0; i < (tier <= 5 ? 3 : 4); i++)
          g.add(bx(3, 7, 15, dark(), -L2 / 2 - 1, T3 * 0.5, -Wd / 2 + 18 + i * 20));
        if (c.rgb) g.add(bx(L2 - 40, 1, 1.2, glow(t.accent), 0, T3, Wd / 2 - 2));
        g.add(bx(Math.min(89, L2 * 0.35), 1.6, 6, gold(), -L2 / 2 + 11.5 + Math.min(89, L2 * 0.35) / 2, 3, -Wd / 2 + 5));
        g.add(bx(1.6, T3, Wd + 4, metal3, -L2 / 2 - 0.8, T3 / 2, 0));
        if (conn >= 1) {
          g.add(bx(22, 9, 12, dark(), L2 / 2 - 40, 9, Wd / 2 - 8));
          g.add(bx(18, 1, 2.2, gold(), L2 / 2 - 40, 13.7, Wd / 2 - 8));
        }
        if (c.premium) {
          g.add(bx(L2 - 60, 0.8, 0.5, gold(), 0, T3 - 3, -Wd / 2 - 0.1));
          g.add(bx(70, 1.6, 0.5, glow(t.accent, 1.2), -20, T3 * 0.22, Wd / 2 + 0.3));
        }
        if (c.detail !== false && tier >= 5) gpuDetail(g, t, L2, Wd, T3, H2, gpuLabel);
      }
      g.userData.dims = { L: L2, Wd, T: T3, tier };
      return g;
    },
    ssd_sata(t, o = {}) {
      const tier = Math.max(1, Math.min(10, Number(o.tier || 6)));
      const g = new THREE2.Group();
      g.add(rb(100, 7 + tier * 0.25, 69.85, mat(t.metal, { metalness: 0.75 + tier * 0.02, roughness: 0.3 }), 1.5, 0, 3.5, 0));
      g.add(bx(80, 0.3, 50, mat(t.body), 0, 7.1 + tier * 0.25, 0));
      g.add(bx(60 + tier * 2, 0.35, 3, glow(t.accent), 0, 7.2 + tier * 0.25, 14));
      g.add(bx(6, 2.4, 17, dark(), 52, 3.5, -22), bx(6, 2.4, 40, dark(), 52, 3.5, 12));
      return g;
    },
    ssd_m2(t, o = {}) {
      const tier = Math.max(1, Math.min(10, Number(o.tier || 6)));
      const g = new THREE2.Group();
      g.add(bx(62 + tier * 3, 0.9, 22, mat(t.pcb), 0, 0.45, 0));
      for (let i = 0; i < 4; i++) g.add(bx(i === 0 ? 12 : 14, 1.1, i === 0 ? 12 : 14, dark(), -22 + i * 15, 1.4, 0));
      g.add(bx(7, 0.9, 18, gold(), -36.5, 0.45, 0));
      if (o.heatsink ?? tier >= 3) {
        g.add(rb(50 + tier * 3, 6 + tier * 0.35, 21, mat(t.body, { metalness: 0.4 + tier * 0.05 }), 1.5, 4, 5.4, 0));
        g.add(bx(50, 0.5, 2, glow(t.accent), 4, 9.5, 0));
      }
      return g;
    },
    hdd(t) {
      const g = new THREE2.Group();
      g.add(rb(147, 26.1, 101.6, mat(t.metal, { metalness: 0.85, roughness: 0.35 }), 2, 0, 13.05, 0));
      g.add(bx(110, 0.3, 80, mat(t.body), 0, 26.2, 0));
      g.add(bx(110, 0.35, 6, glow(t.accent), 0, 26.3, 30));
      g.add(bx(6, 3.5, 17.5, dark(), 73.5, 8, -35), bx(6, 3.5, 40, dark(), 73.5, 8, 15));
      return g;
    },
    psu(t, o = {}) {
      const tier = Math.max(1, Math.min(10, Number(o.tier || 6)));
      const d = o.form === "sfx" ? { w: 125, h: 63.5, l: 100 } : { w: 150, h: 76 + tier, l: 145 + tier * 2 };
      const { w: w2, h, l } = d, down = o.fan === "down", s = down ? -1 : 1, g = new THREE2.Group();
      const body = mat(t.body, { metalness: 0.5, roughness: 0.5 });
      const shellY = down ? 6 + (h - 6) / 2 : (h - 6) / 2, rimY = down ? 3 : h - 3, faceY = down ? 0 : h;
      g.add(rb(w2, h - 6, l, body, 3, 0, shellY, 0));
      g.add(
        rb(w2, 6, 12, body, 1.5, 0, rimY, l / 2 - 6),
        rb(w2, 6, 12, body, 1.5, 0, rimY, -l / 2 + 6),
        rb(12, 6, l - 24, body, 1.5, w2 / 2 - 6, rimY, 0),
        rb(12, 6, l - 24, body, 1.5, -w2 / 2 + 6, rimY, 0)
      );
      const f = fan(Math.min(w2, l) - 28, t, 5, 9);
      f.scale.y = 0.25;
      f.position.y = faceY - s * 3;
      g.add(f);
      g.add(bx(w2 * 0.5, h * 0.5, 1, dark(), 0, h / 2, -l / 2 - 0.3));
      for (let r = 0; r < (tier >= 6 ? 3 : 2); r++) for (let c = 0; c < 4 + Math.floor(tier / 4); c++) g.add(bx(12, 7, 2, dark(), (c - 2) * 20, h * (0.22 + 0.28 * r), l / 2 + 0.5));
      g.add(bx(0.6, 1.2, l * 0.6, glow(t.accent), w2 / 2 + 0.2, h / 2, 0));
      return g;
    },
    case(t, o = {}) {
      const tier = Math.max(1, Math.min(10, Number(o.tier || 6)));
      const size = o.size || (tier <= 3 ? "mini" : tier >= 8 ? "full" : "mid");
      const { W: W2, H: H2, D, trayX } = caseDims(size), g = new THREE2.Group();
      const body = mat(t.body, { metalness: 0.5, roughness: 0.55 });
      g.add(rb(W2, 3, D, body, 1, 0, -H2 / 2 + 1.5, 0), rb(W2, 3, D, body, 1, 0, H2 / 2 - 1.5, 0));
      g.add(bx(W2, H2, 3, body, 0, 0, -D / 2 + 1.5), bx(3, H2, D, body, W2 / 2 - 1.5, 0, 0));
      g.add(bx(1.5, H2 - 60, D - 100, mat(2105382), trayX, 0, -45));
      g.add(bx(2, H2, D, mat(8956620, { transparent: true, opacity: 0.15, metalness: 0.9, roughness: 0.05, depthWrite: false }), -W2 / 2 + 1, 0, 0));
      g.add(
        bx(W2, 100, 4, body, 0, -H2 / 2 + 50, D / 2 - 2),
        bx(W2, 20, 4, body, 0, H2 / 2 - 10, D / 2 - 2),
        bx(30, H2, 4, body, -W2 / 2 + 15, 0, D / 2 - 2),
        bx(14, H2, 4, body, W2 / 2 - 7, 0, D / 2 - 2)
      );
      g.add(bx(1.2, H2 - 60, 1.2, glow(t.accent), W2 / 2 - 7, 0, D / 2 + 0.4));
      const nf = size === "mini" ? tier >= 3 ? 2 : 1 : tier >= 7 ? 3 : 2;
      for (let i = 0; i < nf; i++) {
        const f = fan(120, t, 6, 9);
        f.rotation.x = Math.PI / 2;
        f.position.set(8, 40 + (i - (nf - 1) / 2) * 120, D / 2 - 17);
        g.add(f);
      }
      const rf = fan(120, t, 6, 9);
      rf.rotation.x = Math.PI / 2;
      rf.position.set(8, 140, -D / 2 + 16);
      g.add(rf);
      const len2 = D - 130, sx = (trayX + 1 + W2 / 2 - 2) / 2;
      g.add(bx(W2 / 2 - 3 - trayX, 3, len2, mat(2105382), sx, -H2 / 2 + 110, -D / 2 + 3 + len2 / 2));
      g.add(bx(W2 / 2 - 3 - trayX, 1, 1.2, glow(t.accent), sx, -H2 / 2 + 110, -D / 2 + 3 + len2));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(rb(24, 12, 40, mat(1118483), 2, a * (W2 / 2 - 25), -H2 / 2 - 6, b * (D / 2 - 60))));
      if (o.detail !== false) caseDetail(g, t, { W: W2, H: H2, D });
      return g;
    },
    /** Kompletter Rechner, eingebaut nach den Konventionen oben. */
    system(t, o = {}) {
      const g = new THREE2.Group(), cd = caseDims(o.case), mb = mbLayout(o.form), { H: H2, D } = cd;
      g.add(B.case(t, { size: o.case, detail: o.detail }));
      const mob = new THREE2.Group();
      mob.quaternion.setFromRotationMatrix(new THREE2.Matrix4().set(0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1));
      const mobZ = -D / 2 + 14 + mb.L / 2;
      mob.position.set(cd.trayX + 7.75, 40, mobZ);
      mob.add(B.motherboard(t, { form: o.form, detail: o.detail }));
      const [sx, sz] = mb.socket;
      const cpu2 = B.cpu(t);
      cpu2.position.set(sx, 3.5, sz);
      mob.add(cpu2);
      const cool = B.cooler(t, { detail: o.detail, ...o.cooler || {} });
      cool.position.set(sx, 7.1, sz);
      mob.add(cool);
      const n = o.ram ?? 2, ram2 = B.ram(t, { sticks: n, pitch: n === 4 ? 8.5 : 17 });
      ram2.rotation.y = Math.PI / 2;
      ram2.position.set(mb.ram.x0 + (n === 4 ? 12.75 : 17), 4.6, mb.ram.z);
      mob.add(ram2);
      let gpuDims = null;
      if (o.gpu !== false) {
        const gp = B.gpu(t, { detail: o.detail, ...o.gpu || {} }), { L: Lg, Wd } = gp.userData.dims;
        gpuDims = gp.userData.dims;
        gp.rotation.x = -Math.PI / 2;
        gp.position.set(-mb.L / 2 + Lg / 2, 1.6 + Wd / 2 - 3, mb.pcie[1]);
        mob.add(gp);
      }
      const m22 = B.ssd_m2(t);
      m22.position.set(mb.m2[0], 1.6, mb.m2[1]);
      mob.add(m22);
      g.add(mob);
      const psu2 = B.psu(t, { fan: "down" });
      psu2.position.set(13, -H2 / 2 + 15, -D / 2 + 83);
      g.add(psu2);
      const sata2 = B.ssd_sata(t);
      sata2.rotation.y = Math.PI / 2;
      sata2.position.set(40, cd.shroudY + 1.5, 40);
      g.add(sata2);
      const zf = -D / 2 + 163, xe = cd.trayX + 7.75 + 13.6, ye = 40 + mb.atx24[1], ze = mobZ + mb.atx24[0];
      if (o.detail === false) g.add(cable([
        [40, -182, zf - 10],
        [40, -182, zf + 80],
        [30, -165, D / 2 - 105],
        [-20, -90, D / 2 - 95],
        [xe + 10, 10, ze + 35],
        [xe, ye - 8, ze + 10],
        [xe, ye, ze]
      ], 1381656, 4));
      else systemCables(g, t, { cd, mb, mobZ, gdim: o.gpu === false ? null : gpuDims });
      return g;
    }
  };
  var PARTS = B;
  var KINDS = Object.keys(B);

  // kit.js
  var cache = /* @__PURE__ */ new Map();
  var M = (c, o = {}) => {
    const k = c + "|" + JSON.stringify(o);
    let m = cache.get(k);
    if (!m) {
      m = new THREE3.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.45, ...o });
      cache.set(k, m);
    }
    return m;
  };
  var G = (c, i = 1.2) => {
    const k = "g" + c + "|" + i;
    let m = cache.get(k);
    if (!m) {
      m = new THREE3.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i });
      cache.set(k, m);
    }
    return m;
  };
  var plastic = (c = 1447450, r = 0.62) => M(c, { metalness: 0.08, roughness: r });
  var metal = (c = 11449275, r = 0.32) => M(c, { metalness: 0.92, roughness: r });
  var brushed = (c = 10133416) => M(c, { metalness: 0.85, roughness: 0.5 });
  var coat = (c = 1710623, m = 0.55, r = 0.5) => M(c, { metalness: m, roughness: r });
  var GOLD = () => M(14267466, { metalness: 1, roughness: 0.28 });
  var BLACK = () => M(723725, { metalness: 0.2, roughness: 0.7 });
  var glass = (c = 10466504, o = 0.18) => M(c, { transparent: true, opacity: o, metalness: 0.9, roughness: 0.05, depthWrite: false });
  var grp = (...kids) => {
    const g = new THREE3.Group();
    kids.flat().forEach((k) => k && g.add(k));
    return g;
  };
  var at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    o.position.set(x, y, z);
    o.rotation.set(rx, ry, rz);
    return o;
  };
  var R = (deg) => deg * Math.PI / 180;
  function flat(text, w2, h, x, y, z, o = {}) {
    const l = label(text, w2, h, { color: o.color || "#ffffff", opacity: o.opacity ?? 0.9, bg: o.bg });
    l.rotation.x = -Math.PI / 2;
    if (o.rot) l.rotation.z = o.rot;
    l.position.set(x, y, z);
    return l;
  }
  function wall(text, w2, h, x, y, z, face = "+z", o = {}) {
    const l = label(text, w2, h, { color: o.color || "#ffffff", opacity: o.opacity ?? 0.9, bg: o.bg });
    l.rotation.y = { "+z": 0, "-z": Math.PI, "+x": Math.PI / 2, "-x": -Math.PI / 2 }[face];
    l.position.set(x, y, z);
    return l;
  }
  var ring = (r, tube, m, x = 0, y = 0, z = 0, seg = 48) => {
    const o = new THREE3.Mesh(new THREE3.TorusGeometry(r, tube, 10, seg), m);
    o.rotation.x = Math.PI / 2;
    o.position.set(x, y, z);
    o.castShadow = true;
    return o;
  };
  var cone = (rt, rb22, h, m, x = 0, y = 0, z = 0, seg = 40) => {
    const o = new THREE3.Mesh(new THREE3.CylinderGeometry(rt, rb22, h, seg), m);
    o.position.set(x, y, z);
    o.castShadow = o.receiveShadow = true;
    return o;
  };
  var cyx = (r, len2, m, x = 0, y = 0, z = 0, seg = 20) => {
    const o = cy(r, len2, m, x, y, z, seg);
    o.rotation.z = Math.PI / 2;
    return o;
  };
  var cyz = (r, len2, m, x = 0, y = 0, z = 0, seg = 20) => {
    const o = cy(r, len2, m, x, y, z, seg);
    o.rotation.x = Math.PI / 2;
    return o;
  };
  function plate(pts, depth, m, x = 0, y = 0, z = 0, holes = []) {
    const s = new THREE3.Shape();
    pts.forEach(([px, pz], i) => i ? s.lineTo(px, -pz) : s.moveTo(px, -pz));
    holes.forEach((h) => {
      const p = new THREE3.Path();
      if (Array.isArray(h)) h.forEach(([px, pz], i) => i ? p.lineTo(px, -pz) : p.moveTo(px, -pz));
      else p.absarc(h.x, -h.z, h.r, 0, Math.PI * 2, true);
      s.holes.push(p);
    });
    const geo = new THREE3.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 48 });
    geo.rotateX(-Math.PI / 2);
    const o = new THREE3.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = o.receiveShadow = true;
    return o;
  }
  function profile(pts, t, m, x = 0, y = 0, z = 0) {
    const s = new THREE3.Shape();
    pts.forEach(([px, py], i) => i ? s.lineTo(px, py) : s.moveTo(px, py));
    const geo = new THREE3.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
    geo.translate(0, 0, -t / 2);
    const o = new THREE3.Mesh(geo, m);
    o.position.set(x, y, z);
    o.castShadow = o.receiveShadow = true;
    return o;
  }
  function rrect(w2, d, r, n = 6, cx = 0, cz = 0) {
    const p = [], k = Math.min(r, w2 / 2, d / 2);
    [[w2 / 2 - k, d / 2 - k, 0], [-w2 / 2 + k, d / 2 - k, 90], [-w2 / 2 + k, -d / 2 + k, 180], [w2 / 2 - k, -d / 2 + k, 270]].forEach(([ox, oz, a0]) => {
      for (let i = 0; i <= n; i++) {
        const a = R(a0 + 90 * i / n);
        p.push([cx + ox + k * Math.cos(a), cz + oz + k * Math.sin(a)]);
      }
    });
    return p;
  }
  var rectPts = (w2, d, cx = 0, cz = 0) => [[cx - w2 / 2, cz - d / 2], [cx + w2 / 2, cz - d / 2], [cx + w2 / 2, cz + d / 2], [cx - w2 / 2, cz + d / 2]];
  function frameFan(size, th = 25, o = {}) {
    const g = new THREE3.Group();
    const body = o.body ?? 1447707, acc = o.accent ?? 58879, hole = size / 2 - 2.5;
    g.add(plate(rrect(size, size, 4), th, plastic(body, 0.55), 0, 0, 0, [{ x: 0, z: 0, r: hole }]));
    const f = gpuFan(hole * 2 - 1, { accent: acc, blade: o.blade, hub: o.hub }, o.speed ?? 8, o.blades ?? 9);
    f.position.y = th * 0.5;
    g.add(f);
    if (o.rgb) {
      g.add(ring(hole - 1.5, 1.3, G(acc, o.rgbPower ?? 1), 0, th - 0.6, 0, 64));
    }
    if (o.corners !== false) [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => g.add(cy(1.7, 0.8, M(657932, { metalness: 0.2 }), a * (size / 2 - 4.2), th + 0.1, b * (size / 2 - 4.2), 10)));
    if (o.tint) g.add(ring(hole + 1, 0.8, M(o.tint, { metalness: 0.7, roughness: 0.3 }), 0, th, 0, 64));
    return g;
  }
  function grille(r, m, x, y, z, rings = 5, spokes = 12, wire = 0.9) {
    const g = new THREE3.Group();
    g.position.set(x, y, z);
    for (let i = 1; i <= rings; i++) g.add(ring(r * i / rings, wire, m, 0, 0, 0, 56));
    for (let i = 0; i < spokes; i++) {
      const b = bx(r * 2, wire * 1.6, wire * 1.6, m);
      b.rotation.y = i * Math.PI / spokes;
      g.add(b);
    }
    return g;
  }
  function slots(n, w2, h, d, m, x0, dx, y, z) {
    const g = new THREE3.Group();
    for (let i = 0; i < n; i++) g.add(bx(w2, h, d, m, x0 + i * dx, y, z));
    return g;
  }
  function rng(seed = 1) {
    let s = seed >>> 0 || 1;
    return () => (s = s * 1664525 + 1013904223 >>> 0) / 4294967296;
  }
  function smd(nx, nz, px, pz, cx, y, cz, m = M(8022602, { metalness: 0.2, roughness: 0.6 }), sz = [1.6, 0.8, 0.9]) {
    const g = new THREE3.Group();
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) g.add(bx(sz[0], sz[1], sz[2], m, cx + (i - (nx - 1) / 2) * px, y + sz[1] / 2, cz + (j - (nz - 1) / 2) * pz));
    return g;
  }
  var screw = (x, y, z, r = 2.2, m = metal(12172998)) => grp(cy(r, 1.2, m, x, y + 0.6, z, 12), bx(r * 1.4, 0.3, 0.5, BLACK(), x, y + 1.25, z));
  function finish(g, meta = {}) {
    g.userData.meta = meta;
    return g;
  }

  // catalog.js
  var CATS = {
    cpu: "CPU",
    gpu: "Grafikkarte",
    ram: "Arbeitsspeicher",
    ssd: "SSD",
    psu: "Netzteil",
    mobo: "Mainboard",
    cooler: "K\xFChler",
    case: "Geh\xE4use"
  };
  var L = (cat, rows) => rows.map(([game, real], i) => ({ id: `${cat}-${i + 1}`, cat, tier: i + 1, game, real }));
  var CATALOG = [
    ...L("cpu", [
      ["Axiom Pulse G2", "Intel Celeron / Pentium G"],
      ["Ember Spark 3K", "AMD Athlon 3000G"],
      ["Axiom Flux 3-1210", "Intel Core i3-12100"],
      ["Ember Pyra 5 5600", "AMD Ryzen 5 5600"],
      ["Axiom Flux 5-1340F", "Intel Core i5-13400F"],
      ["Ember Pyra 7 5700", "AMD Ryzen 7 5700"],
      ["Axiom Flux 7-1370K", "Intel Core i7-13700K"],
      ["Ember Pyra 9 7900", "AMD Ryzen 9 7900"],
      ["Axiom Flux 9-1490K", "Intel Core i9-14900K"],
      ["Ember Pyra 9 7950 3D", "AMD Ryzen 9 7950X3D"]
    ]),
    ...L("gpu", [
      ["Quanta Lite 1030", "NVIDIA GT 1030"],
      ["Ember Blaze 640", "AMD RX 6400"],
      ["Quanta Core 1650", "NVIDIA GTX 1650"],
      ["Ember Blaze 660", "AMD RX 6600"],
      ["Quanta Pro 3060", "NVIDIA RTX 3060"],
      ["Ember Blaze 760", "AMD RX 7600"],
      ["Quanta Pro 4070", "NVIDIA RTX 4070"],
      ["Ember Blaze 780 XT", "AMD RX 7800 XT"],
      ["Quanta Elite 4080", "NVIDIA RTX 4080"],
      ["Quanta Titan 4090", "NVIDIA RTX 4090"]
    ]),
    ...L("ram", [
      ["Generic DDR4 8GB 2666", "DDR4-2666 8 GB"],
      ["Kinetic Value 16GB 3200", "Budget DDR4-3200 16 GB"],
      ["Stormbyte Raider 16GB", "Gaming DDR4 16 GB"],
      ["Kinetic Blade 32GB", "Performance 32 GB"],
      ["Stormbyte Overlord 32GB", "High-End 32 GB"],
      ["Kinetic Tempest 32GB", "DDR5 32 GB"],
      ["Stormbyte Overlord 64GB", "64 GB Kit"],
      ["Kinetic Tempest 5 64GB", "DDR5 64 GB"],
      ["Stormbyte Overlord RGB 64GB", "RGB 64 GB"],
      ["Kinetic Tempest 5 RGB 96GB", "DDR5 RGB ~96 GB"]
    ]),
    ...L("ssd", [
      ["Generic SATA 256GB", "SATA 256 GB"],
      ["Kinetic N2 500GB", "NVMe Entry 500 GB"],
      ["Lumen L870 1TB", "Samsung 870 EVO-Stil"],
      ["Stratum S570 1TB", "WD SN570-Stil"],
      ["Lumen L980 1TB", "Samsung 980-Stil"],
      ["Stratum S770 2TB", "WD SN770-Stil"],
      ["Lumen L980 Pro 2TB", "Samsung 980 PRO-Stil"],
      ["Stratum FireDrake 2TB", "FireCuda-Stil"],
      ["Lumen L990 Pro 2TB", "Samsung 990 PRO-Stil"],
      ["Stratum S850X 4TB", "WD SN850X-Stil"]
    ]),
    ...L("psu", [
      ["Generic 450W Bronze", "450 W Bronze"],
      ["Ampera A550", "~550 W Budget"],
      ["Hushwatt Silent Core 450", "be quiet! Pure Power"],
      ["Seraph Focus 650", "Seasonic Focus 650 W"],
      ["Ampera R750", "750 W Gold"],
      ["Hushwatt Silent Pro 750", "be quiet! Straight Power"],
      ["Seraph Prime 850", "Seasonic Prime 850 W"],
      ["Ampera H1000", "1000 W"],
      ["Seraph Prime 1000", "Seasonic Prime 1000 W"],
      ["Ampera X1600", "~1600 W Extreme"]
    ]),
    ...L("mobo", [
      ["Generic H6 Board", "H610"],
      ["Basalt B5M Pro", "B550M / B560M"],
      ["Nebulon B6 Hawk", "B660 Gaming"],
      ["Forgeline B6 Gaming", "B650 / B760 Gaming"],
      ["Titanix Rugged B7", "B760 / B650"],
      ["Nebulon X6 Max", "X670 / Z690"],
      ["Titanix Phantom B6", "B650 Phantom"],
      ["Forgeline X6E Falcon", "X670E"],
      ["Titanix Apex Z7", "Z790 Apex"],
      ["Titanix Summit X6E", "X670E / Z790 Flagship"]
    ]),
    ...L("cooler", [
      ["Stock Boxed Cooler", "Stock-K\xFChler"],
      ["Icewing FK400", "Tower ~400"],
      ["Hushwatt Pure Stone 2", "be quiet! Pure Rock 2"],
      ["Nocturne U12S", "Noctua NH-U12S"],
      ["Hushwatt Dark Stone 4", "be quiet! Dark Rock 4"],
      ["Nocturne T15", "Noctua NH-D15"],
      ["Icewing Cryo Flow II 240", "240 mm AIO"],
      ["Abyssal AIO 240 RGB", "240 mm AIO RGB"],
      ["Abyssal Leviathan 360", "360 mm AIO"],
      ["Abyssal AIO 360 Elite", "360 mm AIO Elite"]
    ]),
    ...L("case", [
      ["Generic Mini Tower", "Mini-Tower Budget"],
      ["Fjordic Core 1", "Fractal Core"],
      ["Prisma H5", "NZXT H5"],
      ["Corvus 4K Airflow", "Corsair 4000D Airflow"],
      ["Fjordic Meshline C", "Fractal Meshify C"],
      ["Lumio Coolant 2", "Lian Li Lancool"],
      ["Corvus 5K Airflow", "Corsair 5000D Airflow"],
      ["Lumio Orbit Dynamic", "Lian Li O11 Dynamic"],
      ["Fjordic Torrento", "Fractal Torrent"],
      ["Lumio Orbit Evo RGB", "Lian Li O11 Evo RGB"]
    ])
  ];
  var byId = (id) => CATALOG.find((e) => e.id === id);
  var brandOf = (e) => e.game.split(" ")[0];

  // ports.js
  var ports_exports = {};
  __export(ports_exports, {
    I4: () => I4,
    P: () => P2,
    dir: () => dir,
    frame: () => frame,
    inv: () => inv,
    mate: () => mate,
    mul: () => mul,
    place: () => place,
    point: () => point,
    portOf: () => portOf,
    portsOf: () => portsOf
  });
  var THREE4 = __toESM(require_three_global(), 1);
  var P2 = (id, role, kind, pos, up, fwd, meta = {}, extra = {}) => ({ id, role, kind, pos, up, fwd, meta, ...extra });
  var dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  var cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  var len = (a) => Math.hypot(a[0], a[1], a[2]);
  var norm = (a) => {
    const l = len(a);
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  var I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  var mul = (a, b) => {
    const o = new Array(16).fill(0);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 4; k++) o[r * 4 + c] += a[r * 4 + k] * b[k * 4 + c];
    return o;
  };
  var point = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3], m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7], m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11]];
  var dir = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[4] * v[0] + m[5] * v[1] + m[6] * v[2], m[8] * v[0] + m[9] * v[1] + m[10] * v[2]];
  function inv(m) {
    const o = [m[0], m[4], m[8], 0, m[1], m[5], m[9], 0, m[2], m[6], m[10], 0, 0, 0, 0, 1];
    const t = [-(o[0] * m[3] + o[1] * m[7] + o[2] * m[11]), -(o[4] * m[3] + o[5] * m[7] + o[6] * m[11]), -(o[8] * m[3] + o[9] * m[7] + o[10] * m[11])];
    o[3] = t[0];
    o[7] = t[1];
    o[11] = t[2];
    return o;
  }
  var SY = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  var FLIP = [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1];
  function frame(p, mirror = false) {
    const f = (v) => mirror ? [v[0], -v[1], v[2]] : v;
    const pos = f(p.pos), x = norm(f(p.fwd)), y = norm(f(p.up));
    if (Math.abs(dot(x, y)) > 1e-6) throw new Error(`Port ${p.id}: fwd und up stehen nicht senkrecht aufeinander`);
    const z = cross(x, y);
    return [x[0], y[0], z[0], pos[0], x[1], y[1], z[1], pos[1], x[2], y[2], z[2], pos[2], 0, 0, 0, 1];
  }
  function mate(hostWorld, hostPort, guestPort) {
    const W2 = mul(mul(hostWorld, frame(hostPort)), FLIP);
    return guestPort.mirror === "y" ? mul(mul(W2, inv(frame(guestPort, true))), SY) : mul(W2, inv(frame(guestPort)));
  }
  function place(obj, m) {
    const c0 = [m[0], m[4], m[8]], c1 = [m[1], m[5], m[9]], c2 = [m[2], m[6], m[10]];
    const det = dot(cross(c0, c1), c2), flip = det < 0;
    const r = new THREE4.Matrix4().set(m[0], flip ? -m[1] : m[1], m[2], 0, m[4], flip ? -m[5] : m[5], m[6], 0, m[8], flip ? -m[9] : m[9], m[10], 0, 0, 0, 0, 1);
    obj.quaternion.setFromRotationMatrix(r);
    obj.position.set(m[3], m[7], m[11]);
    obj.scale.set(1, flip ? -1 : 1, 1);
    obj.updateMatrix && obj.updateMatrix();
    return obj;
  }
  var portOf = (part, id) => {
    const p = (part.userData.ports || []).find((q) => q.id === id);
    if (!p) throw new Error(`Port "${id}" fehlt`);
    return p;
  };
  var portsOf = (part, role, kind) => (part.userData.ports || []).filter((p) => (!role || p.role === role) && (!kind || p.kind === kind));

  // parts-cpu.js
  var SPEC = {
    1: { plat: "lga", ihs: 9409691, rough: 0.5, tint: 29125 },
    2: { plat: "am4", ihs: 10198950, rough: 0.46, tint: 15225642 },
    3: { plat: "lga", ihs: 11777982, rough: 0.34, tint: 29125 },
    4: { plat: "am4", ihs: 11909568, rough: 0.32, tint: 15225642 },
    5: { plat: "lga", ihs: 12567497, rough: 0.3, tint: 29125 },
    6: { plat: "am4", ihs: 12764876, rough: 0.28, tint: 15225642 },
    7: { plat: "lga", ihs: 13488342, rough: 0.24, tint: 29125, lines: true },
    8: { plat: "am5", ihs: 13225427, rough: 0.26, tint: 15225642 },
    9: { plat: "lga", ihs: 14277857, rough: 0.2, tint: 29125, lines: true },
    10: { plat: "am5", ihs: 14277857, rough: 0.2, tint: 15225642, lines: true, x3d: true }
  };
  var chamfered = (w2, d, c) => [[-w2 / 2 + c, -d / 2], [w2 / 2 - c, -d / 2], [w2 / 2, -d / 2 + c], [w2 / 2, d / 2 - c], [w2 / 2 - c, d / 2], [-w2 / 2 + c, d / 2], [-w2 / 2, d / 2 - c], [-w2 / 2, -d / 2 + c]];
  function octo(S, nw, nd, ch) {
    const h = S / 2, a = nw / 2;
    return [
      [-h + ch, -h],
      [-a, -h],
      [-a, -h + nd],
      [a, -h + nd],
      [a, -h],
      [h - ch, -h],
      [h, -h + ch],
      [h, -a],
      [h - nd, -a],
      [h - nd, a],
      [h, a],
      [h, h - ch],
      [h - ch, h],
      [a, h],
      [a, h - nd],
      [-a, h - nd],
      [-a, h],
      [-h + ch, h],
      [-h, h - ch],
      [-h, a],
      [-h + nd, a],
      [-h + nd, -a],
      [-h, -a],
      [-h, -h + ch]
    ];
  }
  function cpu(tier, e) {
    const s = SPEC[tier], g = new THREE3.Group();
    const [brand, ...rest] = e.game.toUpperCase().split(" "), model = rest.join(" ");
    const ihsM = M(s.ihs, { metalness: 0.95, roughness: s.rough });
    const sub = (col) => M(col, { metalness: 0.1, roughness: 0.72 });
    let top = 0, tw = 30;
    if (s.plat === "lga") {
      g.add(rb(45, 1.15, 37.5, sub(2911048), 0.4, 0, 0.575, 0));
      g.add(plate(chamfered(37.2, 33.6, 3.2), 3.2, ihsM, 0, 1.15, 0));
      g.add(plate([[-23.2, 17.6], [-19.4, 17.6], [-23.2, 13.8]], 0.12, GOLD(), 0, 1.15, 0));
      [-1, 1].forEach((sx) => g.add(smd(2, 7, 1.7, 3.8, sx * 20.9, 1.15, 0)));
      [-1, 1].forEach((sz) => g.add(smd(6, 1, 3.6, 1, 0, 1.15, sz * 18.4, M(7233608, { metalness: 0.2 }), [1.3, 0.6, 0.8])));
      top = 4.35;
      tw = 28;
      if (s.lines) [-14.5, 14.5].forEach((z) => g.add(bx(30, 0.05, 0.25, M(10396587, { metalness: 1, roughness: 0.15 }), 0, top + 0.02, z)));
    } else if (s.plat === "am4") {
      const pin = M(12099426, { metalness: 0.95, roughness: 0.3 });
      for (let i = -7; i <= 7; i++) for (let j = -7; j <= 7; j++) {
        if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue;
        if (i === -7 && j === 7) continue;
        g.add(cy(0.3, 2, pin, i * 2.54, 1, j * 2.54, 6));
      }
      g.add(rb(40, 1.4, 40, sub(3498047), 0.5, 0, 2.7, 0));
      g.add(plate(rrect(34.6, 34.6, 8), 2.7, ihsM, 0, 3.4, 0));
      g.add(plate([[-20, 20], [-16.2, 20], [-20, 16.2]], 0.12, GOLD(), 0, 3.4, 0));
      [-1, 1].forEach((sx) => g.add(smd(1, 4, 1, 2.8, sx * 18.8, 3.4, -2, M(7233608, { metalness: 0.2 }), [1.3, 0.6, 0.8])));
      top = 6.1;
      tw = 26;
    } else {
      g.add(rb(40, 1.2, 40, sub(2911048), 0.4, 0, 0.6, 0));
      g.add(plate(octo(37, 14, 6.2, 2.2), 3, ihsM, 0, 1.2, 0));
      g.add(plate([[-20, 20], [-16.2, 20], [-20, 16.2]], 0.12, GOLD(), 0, 1.2, 0));
      [[0, -1], [0, 1]].forEach(([, sz]) => g.add(smd(4, 2, 2.4, 2.2, 0, 1.2, sz * 17.4)));
      [[-1], [1]].forEach(([sx]) => g.add(smd(2, 4, 2.2, 2.4, sx * 17.4, 1.2, 0)));
      top = 4.2;
      tw = 24;
      if (s.lines) g.add(plate(octo(33, 14.8, 5, 2), 0.04, M(9409692, { metalness: 1, roughness: 0.12 }), 0, top, 0));
    }
    g.add(flat(brand, tw * 0.62, 3.4, 0, top + 0.06, -(s.plat === "am4" ? 2.6 : 3.2), { color: hex6(s.tint), opacity: 0.95 }));
    g.add(flat(model || brand, tw, 3.8, 0, top + 0.06, s.plat === "am4" ? 2.4 : 2.2, { color: "#2b2f36", opacity: 0.95 }));
    if (s.x3d) g.add(flat("3D V-CACHE", 12, 2.2, 0, top + 0.06, 8, { color: "#2b2f36", opacity: 0.9 }));
    const land = s.plat === "am4" ? 2 : 0;
    g.userData.ports = [
      P2("socket", "guest", "cpu-socket", [0, land, 0], [0, -1, 0], [1, 0, 0], { socket: s.plat }),
      P2("ihs", "host", "cooler-contact", [0, top, 0], [0, 1, 0], s.plat === "lga" ? [0, 0, -1] : [1, 0, 0], { socket: s.plat })
    ];
    g.userData.dims = { L: 45, W: 40, H: top, socket: s.plat };
    return g;
  }

  // parts-gpu.js
  var QUANTA = { body: 1710879, accent: 7780608, pcb: 1316891, metal: 11120309 };
  var EMBER = { body: 1644571, accent: 14886446, pcb: 1708821, metal: 10725294 };
  var SPEC2 = {
    1: { th: QUANTA, L: 145, Wd: 69, slots: 1.9, fans: 0, plastic: true, backplate: false, rgb: false, conn: 0 },
    // passiv, Low-Profile
    2: { th: EMBER, L: 172, Wd: 111, slots: 2, fans: 1, plastic: true, backplate: false, rgb: false, conn: 0 },
    3: { th: QUANTA, L: 204, Wd: 118, slots: 2, fans: 2, plastic: true, backplate: false, rgb: false, conn: 0 },
    4: { th: EMBER, L: 243, Wd: 125, slots: 2.1, fans: 2, plastic: false, backplate: true, rgb: false, conn: 1 },
    5: { th: QUANTA, L: 242, Wd: 125, slots: 2, fans: 2, plastic: false, backplate: true, rgb: false, conn: 1 },
    6: { th: EMBER, L: 243, Wd: 126, slots: 2.2, fans: 2, plastic: false, backplate: true, rgb: false, conn: 1 },
    7: { th: QUANTA, L: 267, Wd: 126, slots: 2.5, fans: 2, plastic: false, backplate: true, rgb: false, conn: 1 },
    8: { th: EMBER, L: 320, Wd: 132, slots: 3, fans: 3, plastic: false, backplate: true, rgb: true, conn: 2 },
    9: { th: QUANTA, L: 336, Wd: 140, slots: 3.4, fans: 3, plastic: false, backplate: true, rgb: true, premium: true, conn: 1 },
    10: { th: QUANTA, L: 357, Wd: 150, slots: 3.5, fans: 3, plastic: false, backplate: true, rgb: true, premium: true, conn: 1 }
  };
  function passive(s, e) {
    const { L: L2, Wd } = s, T3 = Math.round(s.slots * 20.3), g = new THREE3.Group();
    const sink = M(2764598, { metalness: 0.75, roughness: 0.42 }), al = M(3817544, { metalness: 0.8, roughness: 0.38 });
    g.add(bx(L2 - 8, 1.6, Wd - 4, M(1316891, { metalness: 0.15, roughness: 0.6 }), 2, 2.4, 0));
    g.add(bx(Math.min(39, L2 * 0.3), 1.4, 6, GOLD(), -L2 / 2 + 11.5 + Math.min(39, L2 * 0.3) / 2, 2.2, -Wd / 2 + 5));
    g.add(bx(L2 - 30, 3.4, Wd - 12, sink, 8, 6, 0));
    const n = 13, span = Wd - 16;
    for (let i = 0; i < n; i++) g.add(bx(L2 - 34, T3 - 10, 1.3, al, 8, 7.7 + (T3 - 10) / 2, -span / 2 + i * span / (n - 1)));
    g.add(bx(L2 - 34, 2, Wd - 14, sink, 8, T3 - 2.2, -0));
    g.add(rb(46, 1, 22, M(1843495, { metalness: 0.4 }), 3, 8, T3 - 0.6, 0));
    g.add(bx(30, 0.3, 2, G(s.th.accent, 0.8), 8, T3 - 0.05, 0));
    g.add(bx(1.8, T3 + 4, 79, metal(11844032), -L2 / 2 - 1, (T3 + 4) / 2, 4));
    g.add(rb(2.2, 6.5, 15.5, BLACK(), 1, -L2 / 2 - 1.1, 14, 28));
    g.add(rb(2.2, 11, 36, M(15330286, { metalness: 0.1, roughness: 0.6 }), 1, -L2 / 2 - 1.1, 17, -2));
    g.add(wall(e.game, 60, 6, 0, T3 * 0.5, 0, "+z", { color: hex6(s.th.accent) }));
    g.userData.dims = { L: L2, Wd, T: T3, tier: 1 };
    return g;
  }
  function withPort(g, s, tier) {
    const { L: L2, Wd } = s;
    const xs = -L2 / 2 + 11.5, y = tier === 1 ? 2.4 : 3, z = tier === 1 ? -Wd / 2 + 2 : -Wd / 2 + 3;
    g.userData.ports = [P2("pcie", "guest", "pcie", [xs, y, z], [0, 0, -1], [1, 0, 0], { phys: 16, watt: tier }, { mirror: "y" })];
    g.userData.plugs = [];
    for (let i = 0; i < (s.conn || 0); i++) g.userData.plugs.push(P2("power" + i, "plug", "pcie8", [L2 / 2 - 40 - i * 30, 11, Wd / 2 - 2], [0, 0, 1], [1, 0, 0], { pins: 8 }));
    return g;
  }
  function gpu(tier, e) {
    const s = SPEC2[tier];
    if (tier === 1) {
      const g2 = passive(s, e);
      g2.userData.dims.W = s.Wd;
      g2.userData.dims.H = g2.userData.dims.T;
      return withPort(g2, s, 1);
    }
    const g = PARTS.gpu(s.th, {
      preset: "t" + tier,
      tier,
      label: e.game,
      length: s.L,
      width: s.Wd,
      slots: s.slots,
      fans: s.fans,
      plastic: s.plastic,
      backplate: s.backplate,
      rgb: s.rgb,
      premium: !!s.premium,
      conn: s.conn
    });
    const { L: L2, Wd, T: T3 } = g.userData.dims;
    g.traverse((o) => {
      if (o.isMesh && o.material && o.material.map) o.rotation.z = 0;
    });
    const acc = s.th.accent;
    if (tier < 5) g.add(wall(e.game, Math.min(L2 * 0.5, 100), 9, -L2 * 0.1, T3 * 0.5, Wd / 2 + 0.3, "+z", { color: hex6(acc) }));
    if (s.fans > 1) {
      const endM = 8, pitch = (L2 - 2 * endM) / s.fans;
      for (let i = 1; i < s.fans; i++) {
        const b = bx(1.4, 0.5, Wd * 0.5, s.rgb ? G(acc, 0.9) : M(acc, { metalness: 0.3, roughness: 0.4 }), -L2 / 2 + endM + pitch * i, T3 + 0.2, 0);
        b.rotation.y = 0.35;
        g.add(b);
      }
    }
    if (s.conn === 2) {
      g.add(bx(22, 9, 12, BLACK(), L2 / 2 - 70, 9, Wd / 2 - 8));
      g.add(bx(18, 1, 2.2, GOLD(), L2 / 2 - 70, 13.7, Wd / 2 - 8));
    }
    g.userData.dims = { L: L2, W: Wd, H: T3 };
    return withPort(g, s, tier);
  }

  // parts-ram.js
  var RED = 14883127;
  var YEL = 16106496;
  var SPEC3 = {
    1: { gen: 4, n: 1, style: "bare", pcb: 2911039, sticker: 15264494, acc: 8423056, note: "DDR4-2666  8GB" },
    2: { gen: 4, n: 1, style: "bare", pcb: 2911039, sticker: 14672874, acc: RED, note: "DDR4-3200  16GB" },
    3: { gen: 4, n: 2, style: "lpx", plate: 1447706, acc: YEL },
    4: { gen: 4, n: 2, style: "beast", plate: 1776673, acc: RED },
    5: { gen: 4, n: 2, style: "dom", plate: 2500910, acc: YEL, fins: 12172998 },
    6: { gen: 5, n: 2, style: "reneg", plate: 2039844, acc: RED, bar: 10133672 },
    7: { gen: 5, n: 2, style: "dom", plate: 2105894, acc: YEL, fins: 9409949 },
    8: { gen: 5, n: 2, style: "reneg", plate: 2303273, acc: RED, bar: 12830927, tall: 4 },
    9: { gen: 5, n: 2, style: "dom", plate: 2105894, acc: YEL, fins: 12830927, rgb: [2158847, 16723920] },
    10: { gen: 5, n: 2, style: "reneg", plate: 2303273, acc: RED, bar: 12830927, tall: 6, rgb: [16723920, 2158847] }
  };
  var LEN = 133.35;
  var PH = 31.25;
  var T = 1.27;
  function stick(s, e, k) {
    const g = new THREE3.Group();
    const bare = s.style === "bare";
    g.add(bx(LEN, PH, T, M(bare ? s.pcb : 1316378, { metalness: 0.1, roughness: 0.55 }), 0, PH / 2, 0));
    const nx = -LEN / 2 + (s.gen === 4 ? 72 : 82);
    g.add(bx(LEN - 2, 3.2, T + 0.08, GOLD(), 0, 1.7, 0));
    g.add(bx(1.6, 3.4, T + 0.12, M(789518), nx, 1.7, 0));
    if (s.gen === 5) g.add(bx(7, 5, 1.1, BLACK(), -LEN / 2 + 14, 9, T / 2 + 0.55));
    if (bare) {
      const chip = M(1710878, { metalness: 0.2, roughness: 0.5 }), z = T / 2 + 0.55;
      for (let i = 0; i < 8; i++) {
        const x = -LEN / 2 + 11 + i * 15.6 + (i > 3 ? 2 : 0);
        g.add(bx(11.2, 9.2, 1.1, chip, x, 19, z));
      }
      g.add(smd(10, 1, 6, 1, 0, 6.2, z - 0.1, M(8022602, { metalness: 0.2 })));
      g.add(bx(4, 3, 0.9, chip, nx + 9, 6.5, z));
      g.add(bx(62, 11, 0.12, M(s.sticker, { metalness: 0.05, roughness: 0.7 }), 8, 11.5, z + 0.6));
      g.add(bx(62, 1.2, 0.14, M(s.acc, { metalness: 0.2 }), 8, 17.6, z + 0.62));
      g.add(wall(e.game.toUpperCase(), 58, 4.2, 8, 12.8, z + 0.72, "+z", { color: "#20242b", opacity: 1 }));
      g.add(wall(s.note, 50, 3.4, 8, 8.8, z + 0.72, "+z", { color: "#3a4048", opacity: 1 }));
      return g;
    }
    const pm = M(s.plate, { metalness: 0.78, roughness: s.style === "dom" ? 0.34 : 0.46 }), zo = T / 2 + 1.5 + 0.02;
    const extra = s.tall || 0;
    let prof;
    if (s.style === "lpx") prof = [[-66, 4], [66, 4], [66, 31], [64, 33.4], [-64, 33.4], [-66, 31]];
    else if (s.style === "beast") prof = [[-66.2, 4], [66.2, 4], [66.2, 29], [58, 35], [-58, 35], [-66.2, 29]];
    else if (s.style === "reneg") prof = [[-66.2, 4], [66.2, 4], [66.2, 30], [48, 35 + extra], [-66.2, 35 + extra]];
    else prof = [[-66.2, 4], [66.2, 4], [66.2, 36], [-66.2, 36]];
    [-1, 1].forEach((sd) => g.add(profile(prof, 3, pm, 0, 0, sd * zo)));
    const front = zo + 1.55;
    if (s.style === "lpx") {
      for (let i = 0; i < 12; i++) g.add(bx(5.2, 3.2, 6.4, M(2763825, { metalness: 0.7, roughness: 0.4 }), -49.5 + i * 9, 34.6, 0));
      g.add(bx(26, 6, 0.1, M(s.acc, { metalness: 0.2 }), -44, 22, front));
      g.add(bx(2, 6, 0.1, M(789518), -29.5, 22, front));
    }
    if (s.style === "beast") {
      const sl = bx(2.2, 34, 0.12, M(s.acc, { metalness: 0.3, roughness: 0.4 }), -22, 19, front);
      sl.rotation.z = -0.62;
      g.add(sl);
      g.add(bx(46, 8, 0.1, M(789776, { metalness: 0.4 }), 28, 15, front));
    }
    if (s.style === "dom") {
      const fm = M(s.fins, { metalness: 0.9, roughness: 0.28 }), lit = s.rgb ? G(s.rgb[k % 2], 1.3) : M(3159098, { metalness: 0.4 });
      g.add(bx(124, 3, 7.2, M(1447706, { metalness: 0.5 }), 0, 37.5, 0));
      g.add(bx(112, 2.2, 5.2, lit, 0, 36.6, 0));
      for (let i = 0; i < 13; i++) g.add(bx(4.6, 15, 6.4, fm, -54 + i * 9, 46.5, 0));
      g.add(bx(110, 1, 6.6, fm, 0, 54.3, 0));
      g.add(bx(60, 8, 0.1, M(s.acc, { metalness: 0.3 }), 20, 22, front));
    }
    if (s.style === "reneg") {
      const barM = s.rgb ? G(s.rgb[k % 2], 1.4) : M(s.bar, { metalness: 0.9, roughness: 0.3 });
      g.add(bx(112, 3.2, 5, barM, -4, 36.4 + extra, 0));
      const sl = bx(2.2, 36, 0.12, M(s.acc, { metalness: 0.3, roughness: 0.4 }), 14, 19, front);
      sl.rotation.z = -0.55;
      g.add(sl);
      g.add(bx(40, 7, 0.1, M(789776, { metalness: 0.4 }), -34, 17, front));
    }
    g.add(wall(e.game.toUpperCase(), s.style === "dom" ? 56 : 48, 4.2, s.style === "dom" ? -26 : 22, 12, front + 0.05, "+z", { color: "#e8eaee", opacity: 0.95 }));
    return g;
  }
  function ram(tier, e) {
    const s = SPEC3[tier], g = new THREE3.Group(), pitch = s.style === "bare" ? 14 : 15;
    const members = [];
    for (let i = 0; i < s.n; i++) {
      const st = stick(s, e, i);
      st.position.z = (i - (s.n - 1) / 2) * pitch;
      g.add(st);
      members.push({ obj: st, ports: [P2("stick", "guest", "dimm", [0, 0, 0], [0, -1, 0], [1, 0, 0], { ddr: s.gen })] });
    }
    g.userData.members = members;
    g.userData.dims = { L: LEN, W: pitch * s.n, H: s.style === "dom" ? 55 : 36 + (s.tall || 0) };
    return g;
  }

  // parts-ssd.js
  var SAM = 1321120;
  var RED2 = 14883127;
  var SPEC4 = {
    1: { kind: "sata", body: 8159883, plastic: true, top: 14672874, band: 4878245, txt: "#1c222b" },
    2: { kind: "m2", pcb: 1447964, label: 1381914, band: RED2, txt: "#e8eaee", nand: 1, dram: false },
    3: { kind: "sata", body: 1447706, plastic: false, top: 1447706, band: 13225686, txt: "#e8eaee", diag: true },
    4: { kind: "m2", pcb: 1316378, label: 1723791, band: 14542578, txt: "#f2f6fb", nand: 1, dram: false },
    5: { kind: "m2", pcb: 1316378, label: 855569, band: SAM, txt: "#e8eaee", nand: 1, dram: true },
    6: { kind: "m2", pcb: 1316378, label: 2060213, band: 15330802, txt: "#f2f6fb", nand: 2, dram: false },
    7: { kind: "m2", pcb: 1316378, hs: { h: 6, color: 1710879, stripe: SAM, ridges: 0 }, txt: "#e8eaee", nand: 2, dram: true },
    8: { kind: "m2", pcb: 1316378, hs: { h: 10.5, color: 1513499, stripe: RED2, ridges: 9, wide: true }, txt: "#e8eaee", nand: 2, dram: true },
    9: { kind: "m2", pcb: 1316378, hs: { h: 6.8, color: 2105896, stripe: SAM, ridges: 0, grid: true }, txt: "#e8eaee", nand: 2, dram: true },
    10: { kind: "m2", pcb: 1316378, hs: { h: 8.4, color: 1447706, stripe: RED2, ridges: 6, wide: true, logo: true }, txt: "#f2f4f7", nand: 2, dram: true }
  };
  function sata(s, e) {
    const g = new THREE3.Group(), H2 = 7;
    const body = s.plastic ? M(s.body, { metalness: 0.15, roughness: 0.55 }) : M(s.body, { metalness: 0.75, roughness: 0.42 });
    g.add(rb(100, H2, 69.85, body, 2.2, 0, H2 / 2, 0));
    g.add(rb(98.4, 0.4, 68.2, M(s.top, { metalness: s.plastic ? 0.1 : 0.55, roughness: 0.5 }), 1.5, 0, H2 + 0.1, 0));
    g.add(bx(98, 0.9, 1.1, M(723725, { metalness: 0.3 }), 0, H2 * 0.5, 69.85 / 2 + 0.02));
    if (s.diag) {
      g.add(plate([[-6, 34], [20, 34], [-12, -34], [-38, -34]], 0.3, M(2303274, { metalness: 0.7, roughness: 0.4 }), 0, H2 + 0.3, 0));
      g.add(plate([[22, 34], [26, 34], [-6, -34], [-10, -34]], 0.32, M(s.band, { metalness: 0.9, roughness: 0.3 }), 0, H2 + 0.3, 0));
    } else {
      g.add(plate([[-47, -33], [47, -33], [47, -26], [-47, -26]], 0.3, M(s.band, { metalness: 0.4, roughness: 0.5 }), 0, H2 + 0.3, 0));
    }
    g.add(flat(e.game.toUpperCase(), 56, 8, -14, H2 + 0.7, s.diag ? -6 : 6, { color: s.txt, opacity: 1 }));
    g.add(flat('SATA 6Gb/s \xB7 2.5"', 38, 3.2, -14, H2 + 0.7, s.diag ? 3 : 15, { color: s.txt, opacity: 0.75 }));
    const pb = M(789776, { metalness: 0.2, roughness: 0.6 });
    g.add(bx(5.5, 4.4, 8.2, pb, 52.7, 2.9, -26.5), bx(5.5, 4.4, 22.4, pb, 52.7, 2.9, 3.6), bx(5.5, 1.6, 5.6, pb, 52.7, 1.8, -13.3));
    g.add(bx(0.4, 1, 6.4, GOLD(), 55.6, 2.9, -26.5), bx(0.4, 1, 18.6, GOLD(), 55.6, 2.9, 3.6));
    g.userData.ports = [P2("bay", "guest", "sata25", [0, 0, 0], [0, -1, 0], [1, 0, 0], { size: "2.5" })];
    g.userData.plugs = [P2("data", "plug", "sata_data", [55.6, 2.9, -26.5], [1, 0, 0], [0, 0, 1], { pins: 7 }), P2("pwr", "plug", "sata_pwr", [55.6, 2.9, 3.6], [1, 0, 0], [0, 0, 1], { pins: 15 })];
    g.userData.dims = { L: 105, W: 69.85, H: H2 + 0.5, iface: "sata" };
    return g;
  }
  function m2(s, e) {
    const g = new THREE3.Group(), L2 = 80, W2 = 22, zt = 0.8;
    const pts = [[-40, -11], [40, -11], [40, -2.1]];
    for (let k = 1; k <= 7; k++) {
      const a = (-90 + 180 * (k / 8)) * Math.PI / 180;
      pts.push([40 - 2.1 * Math.cos(a), 2.1 * Math.sin(a)]);
    }
    pts.push([40, 2.1], [40, 11], [-40, 11]);
    g.add(plate(pts, zt, M(s.pcb, { metalness: 0.15, roughness: 0.5 }), 0, 0, 0));
    g.add(bx(4.8, 0.9, 20.4, GOLD(), -37.4, 0.45, 0));
    g.add(bx(4.8, 1, 1.3, BLACK(), -37.4, 0.5, 3.4));
    const chip = M(1381914, { metalness: 0.25, roughness: 0.45 }), lid = M(7041146, { metalness: 0.9, roughness: 0.3 });
    const yT = zt;
    const bare = !s.hs;
    if (bare || true) {
      g.add(bx(12, 0.9, 12, chip, -25, yT + 0.45, 0), bx(9, 0.1, 9, lid, -25, yT + 0.92, 0));
      if (s.dram) g.add(bx(7, 0.8, 9, chip, -13, yT + 0.4, -2));
      const xs = s.nand === 2 ? [5, 26] : [20];
      xs.forEach((x) => g.add(bx(14, 1, 18, chip, x, yT + 0.5, 0)));
      g.add(smd(5, 2, 2.6, 2.2, -8, yT, 7.5));
    }
    if (bare) {
      const lx = s.nand === 2 ? 15.5 : 20, lw = s.nand === 2 ? 38 : 24;
      g.add(bx(lw, 0.12, 19.6, M(s.label, { metalness: 0.2, roughness: 0.55 }), lx, yT + 1.05, 0));
      g.add(bx(lw, 0.14, 2.2, M(s.band, { metalness: 0.3, roughness: 0.45 }), lx, yT + 1.07, -8.2));
      g.add(flat(e.game.toUpperCase(), lw - 3, 5, lx, yT + 1.2, 0.8, { color: s.txt, opacity: 1 }));
      g.add(flat("PCIe NVMe M.2 2280", lw - 8, 2.6, lx, yT + 1.2, 6, { color: s.txt, opacity: 0.7 }));
      g.userData.dims = { L: L2, W: W2, H: yT + 1.4, iface: "m2" };
      g.userData.ports = [P2("m2", "guest", "m2", [-37.4, 0, 0], [0, -1, 0], [1, 0, 0], { size: 2280, heatsink: false })];
      return g;
    }
    const hs = s.hs, hx = 6.5, hl = hs.wide ? 66 : 62, hw = hs.wide ? 24 : 22.6, y0 = yT + 1.1;
    const hm = M(hs.color, { metalness: 0.78, roughness: 0.4 });
    g.add(rb(hl, hs.h, hw, hm, 1.2, hx, y0 + hs.h / 2, 0));
    g.add(bx(hl - 4, 0.3, 2.6, M(hs.stripe, { metalness: 0.3, roughness: 0.4 }), hx, y0 + hs.h + 0.05, -hw / 2 + 4));
    for (let i = 0; i < hs.ridges; i++) g.add(bx(2.4, 1.6, hw - 3, M(2763826, { metalness: 0.7, roughness: 0.4 }), hx - hl / 2 + 10 + i * ((hl - 20) / Math.max(1, hs.ridges - 1)), y0 + hs.h + 0.7, 0));
    if (hs.grid) for (let i = 0; i < 12; i++) g.add(bx(0.5, 0.2, hw - 5, M(3422014, { metalness: 0.8, roughness: 0.3 }), hx - 24 + i * 4.4, y0 + hs.h + 0.12, 0));
    g.add(flat(e.game.toUpperCase(), hl * 0.62, 5, hx - 6, y0 + hs.h + (hs.ridges ? 1.6 : 0.25), 3, { color: s.txt, opacity: 1 }));
    if (hs.logo) g.add(cy(3.2, 0.3, G(hs.stripe, 1.1), hx + 22, y0 + hs.h + 1.6, 3, 24));
    [[-1, 1], [1, 1]].forEach(([a]) => g.add(bx(1.2, hs.h * 0.7, hw + 0.8, M(9080728, { metalness: 0.95, roughness: 0.25 }), hx + a * (hl / 2 - 4), y0 + hs.h * 0.4, 0)));
    g.userData.dims = { L: L2, W: W2, H: y0 + hs.h, iface: "m2" };
    g.userData.ports = [P2("m2", "guest", "m2", [-37.4, 0, 0], [0, -1, 0], [1, 0, 0], { size: 2280, heatsink: true })];
    return g;
  }
  function ssd(tier, e) {
    const s = SPEC4[tier];
    return s.kind === "sata" ? sata(s, e) : m2(s, e);
  }

  // parts-psu.js
  var EFF = { BRONZE: 13467442, GOLD: 14267466, PLATINUM: 14278115, TITANIUM: 11449533 };
  var SPEC5 = {
    1: { l: 140, w: 450, eff: "BRONZE", mod: "fixed", fan: 120, body: 3158840, top: 2763825, acc: 10133672, rough: 0.6, label: "GENERIC", sticker: 15330286 },
    2: { l: 140, w: 550, eff: "BRONZE", mod: "fixed", fan: 120, body: 1710878, top: 1710878, acc: 16106496, rough: 0.55, label: "AMPERA", sticker: 2237738 },
    3: { l: 140, w: 450, eff: "BRONZE", mod: "fixed", fan: 120, body: 1908515, top: 1908515, acc: 15233818, rough: 0.5, label: "HUSHWATT", sticker: 2237738 },
    4: { l: 140, w: 650, eff: "GOLD", mod: "full", fan: 120, body: 1513499, top: 1513499, acc: 14234158, rough: 0.5, label: "SERAPH", sticker: 1974308 },
    5: { l: 160, w: 750, eff: "GOLD", mod: "full", fan: 135, body: 1579292, top: 1579292, acc: 16106496, rough: 0.45, label: "AMPERA", sticker: 1974308 },
    6: { l: 160, w: 750, eff: "PLATINUM", mod: "full", fan: 135, body: 2764082, top: 2764082, acc: 15233818, rough: 0.42, label: "HUSHWATT", sticker: 1776929 },
    7: { l: 170, w: 850, eff: "PLATINUM", mod: "full", fan: 135, body: 1118740, top: 1118740, acc: 14234158, rough: 0.28, label: "SERAPH", sticker: 1711136, gloss: true },
    8: { l: 180, w: 1e3, eff: "PLATINUM", mod: "full", fan: 140, body: 1316120, top: 1316120, acc: 16106496, rough: 0.4, label: "AMPERA", sticker: 1711136 },
    9: { l: 170, w: 1e3, eff: "TITANIUM", mod: "full", fan: 135, body: 987154, top: 987154, acc: 14234158, rough: 0.26, label: "SERAPH", sticker: 1579550, gloss: true },
    10: { l: 200, w: 1600, eff: "TITANIUM", mod: "full", fan: 140, body: 1776929, top: 1776929, acc: 16106496, rough: 0.4, label: "AMPERA", sticker: 1447963, display: true }
  };
  var W = 150;
  var H = 86;
  function sleeved(pts, n, off, r, col = 1315863) {
    const g = new THREE3.Group();
    for (let i = 0; i < n; i++) {
      const k = i - (n - 1) / 2;
      g.add(cable(pts.map(([x, y, z]) => [x + off[0] * k, y + off[1] * k, z + off[2] * k]), col, r));
    }
    return g;
  }
  function psu(tier, e) {
    const s = SPEC5[tier], l = s.l, g = new THREE3.Group();
    const bodyM = M(s.body, { metalness: s.gloss ? 0.7 : 0.55, roughness: s.rough }), topM = M(s.top, { metalness: s.gloss ? 0.7 : 0.55, roughness: s.rough });
    const accM = M(s.acc, { metalness: 0.35, roughness: 0.45 });
    g.add(rb(W, 80, l, bodyM, 3, 0, 40, 0));
    [[W - 5, 6, 1.5, 0, 83, l / 2 - 1.5], [W - 5, 6, 1.5, 0, 83, -l / 2 + 1.5]].forEach(([w2, h, d, x, y, z]) => g.add(bx(w2, h, d, bodyM, x, y, z)));
    [[1.5, 6, l - 3, W / 2 - 1.5, 83, 0], [1.5, 6, l - 3, -W / 2 + 1.5, 83, 0]].forEach(([w2, h, d, x, y, z]) => g.add(bx(w2, h, d, bodyM, x, y, z)));
    const fz = (l - 24) / 2 - l / 2 + 12 + 12;
    const fr = s.fan / 2;
    g.add(plate(rrect(W, l, 3), 3, topM, 0, 83, 0, [{ x: 0, z: fz, r: fr - 2 }]));
    g.add(bx(W - 10, 0.1, l - 10, BLACK(), 0, 80.2, 0));
    const fan2 = gpuFan(s.fan - 8, { accent: s.acc }, 5, 9);
    fan2.position.set(0, 82, fz);
    g.add(fan2);
    g.add(grille(fr - 2, M(723725, { metalness: 0.4, roughness: 0.5 }), 0, 86.4, fz, 5, 14, 0.9));
    g.add(ring(fr - 1, 1.1, accM, 0, 86.3, fz, 64));
    if (s.display) g.add(bx(30, 0.5, 8, G(2158847, 0.7), 0, 86.2, l / 2 - 12));
    const sx = W / 2 + 0.1, sw = Math.min(l - 24, 130);
    g.add(bx(0.3, 56, sw, M(s.sticker, { metalness: 0.1, roughness: 0.6 }), sx, 42, 0));
    g.add(bx(0.34, 6, sw, accM, sx + 0.02, 66, 0));
    g.add(wall(s.label, sw * 0.5, 9, sx + 0.3, 56, -sw * 0.16, "+x", { color: hex6(s.acc), opacity: 1 }));
    g.add(wall(e.game.toUpperCase(), sw * 0.9, 6, sx + 0.3, 46, 0, "+x", { color: "#e8eaee", opacity: 1 }));
    g.add(wall(s.w + " W", sw * 0.34, 10, sx + 0.3, 30, -sw * 0.28, "+x", { color: "#ffffff", opacity: 1 }));
    g.add(cyx(10, 0.4, M(EFF[s.eff], { metalness: 0.8, roughness: 0.3 }), sx + 0.1, 31, sw * 0.28, 24));
    const rz = -l / 2 - 0.05;
    g.add(bx(96, 52, 0.3, M(526602, { metalness: 0.3 }), 14, 44, rz));
    for (let i = 0; i < 7; i++) g.add(bx(92, 2.6, 0.5, M(3817029, { metalness: 0.8, roughness: 0.4 }), 14, 24 + i * 7, rz - 0.15));
    g.add(bx(27, 20, 5, M(789775, { metalness: 0.2 }), -52, 16, rz - 2), bx(12, 14, 1.2, M(2763825, { metalness: 0.8 }), -52, 16, rz - 4.6));
    g.add(bx(14, 20, 7, M(789775, { metalness: 0.2 }), -52, 54, rz - 3), bx(10, 14, 2, M(14234158, { metalness: 0.1, roughness: 0.5 }), -52, 54, rz - 6.4));
    const fz2 = l / 2 + 0.05, blk = 1315863;
    const pbk = M(658189, { metalness: 0.2, roughness: 0.6 });
    const stubs = new THREE3.Group();
    if (s.mod === "full") {
      g.add(bx(W - 14, 66, 0.4, M(526602, { metalness: 0.25 }), 0, 41, fz2));
      const rows = [[-52, 54, 16, 7], [-24, 54, 16, 7], [4, 54, 16, 7], [32, 54, 16, 7], [-52, 36, 16, 7], [-24, 36, 16, 7], [4, 36, 16, 7], [32, 36, 16, 7], [56, 54, 10, 7], [56, 36, 10, 7], [-52, 18, 16, 7], [-24, 18, 16, 7], [4, 18, 16, 7], [32, 18, 16, 7]];
      rows.forEach(([x, y, w2, h]) => {
        g.add(bx(w2, h + 6, 3.2, pbk, x, y, fz2 + 1));
        g.add(bx(w2 - 3, h, 3.4, M(1908258, { metalness: 0.3 }), x, y, fz2 + 1.1));
      });
      g.add(bx(W - 14, 1.4, 0.8, accM, 0, 70.5, fz2 + 0.5));
      stubs.add(sleeved([[-52, 54, fz2 + 3], [-52, 50, fz2 + 20], [-70, 20, fz2 + 40], [-92, 3, fz2 + 65], [-100, 3, fz2 + 95]], 5, [3.6, 0, 0], 1.7));
      stubs.add(bx(26, 8, 52, M(blk, { metalness: 0.2 }), -100, 5, fz2 + 108));
      stubs.add(sleeved([[4, 54, fz2 + 3], [4, 48, fz2 + 18], [20, 22, fz2 + 37], [44, 3, fz2 + 60], [52, 3, fz2 + 85]], 3, [3, 0, 0], 1.7));
      stubs.add(bx(20, 8, 14, M(blk, { metalness: 0.2 }), 52, 5, fz2 + 90));
    } else {
      g.add(rb(34, 24, 4, bodyM, 2, 0, 42, fz2 + 1));
      g.add(bx(30, 16, 1, pbk, 0, 42, fz2 + 3.1));
      stubs.add(sleeved([[0, 46, fz2 + 4], [0, 40, fz2 + 17], [-22, 18, fz2 + 37], [-60, 3, fz2 + 65], [-66, 3, fz2 + 95]], 5, [3.6, 0, 0], 1.7));
      stubs.add(bx(26, 8, 52, M(blk, { metalness: 0.2 }), -66, 5, fz2 + 108));
      stubs.add(sleeved([[0, 38, fz2 + 4], [10, 30, fz2 + 20], [40, 6, fz2 + 50], [48, 3, fz2 + 75]], 3, [3, 0, 0], 1.7));
      stubs.add(bx(20, 8, 14, M(blk, { metalness: 0.2 }), 48, 5, fz2 + 80));
    }
    g.add(stubs);
    g.userData.stubs = stubs;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(cy(5, 1.2, M(789518, { metalness: 0.1, roughness: 0.9 }), a * (W / 2 - 14), 0.6, b * (l / 2 - 14), 16)));
    g.userData.ports = [P2("body", "guest", "psu", [0, 0, -l / 2], [0, -1, 0], [0, 0, 1], { form: "atx", watt: s.w })];
    const full = s.mod === "full", fz3 = l / 2 + 0.05;
    const out = (id, kind, x, y, fw, pins) => P2(id, "plug", kind, [x, y, fz3 + (full ? 3 : 4)], [0, 0, 1], fw, { pins });
    g.userData.plugs = full ? [
      out("out_atx24", "atx24", -52, 54, [1, 0, 0], 24),
      out("out_eps0", "eps8", -24, 54, [1, 0, 0], 8),
      out("out_eps1", "eps8", 4, 54, [1, 0, 0], 8),
      out("out_pcie0", "pcie8", -52, 36, [1, 0, 0], 8),
      out("out_pcie1", "pcie8", -24, 36, [1, 0, 0], 8),
      out("out_sata", "sata_pwr", 4, 36, [1, 0, 0], 15)
    ] : [
      out("out_atx24", "atx24", 0, 46, [1, 0, 0], 24),
      out("out_eps0", "eps8", 0, 40, [1, 0, 0], 8),
      out("out_eps1", "eps8", 8, 38, [1, 0, 0], 8),
      out("out_pcie0", "pcie8", -8, 36, [1, 0, 0], 8),
      out("out_pcie1", "pcie8", 12, 36, [1, 0, 0], 8),
      out("out_sata", "sata_pwr", 0, 32, [1, 0, 0], 15)
    ];
    g.userData.body = { min: [-W / 2, 0, -l / 2], max: [W / 2, H, l / 2] };
    g.userData.dims = { L: W, W: l, H, form: "atx", watt: s.w };
    return g;
  }

  // parts-mobo.js
  var { THREE: THREE5, M: M2, G: G2, grp: grp2, metal: metal2, BLACK: BLACK2, GOLD: GOLD2, hex6: hex62, rectPts: rectPts2 } = kit_exports;
  var bx2 = (w2, h, d, m, x, y, z) => bx(w2, h, d, m, x, y, -z);
  var rb2 = (w2, h, d, m, r, x, y, z) => rb(w2, h, d, m, r, x, y, -z);
  var cy2 = (r, h, m, x, y, z, seg) => cy(r, h, m, x, y, -z, seg);
  var cyx2 = (r, l, m, x, y, z, seg) => cyx(r, l, m, x, y, -z, seg);
  var cyz2 = (r, l, m, x, y, z, seg) => cyz(r, l, m, x, y, -z, seg);
  var screw2 = (x, y, z, r, m) => screw(x, y, -z, r, m);
  var smd2 = (nx, nz, px, pz, cx, y, cz, m, sz) => smd(nx, nz, px, pz, cx, y, -cz, m, sz);
  var flat2 = (t, w2, h, x, y, z, o) => flat(t, w2, h, x, y, -z, o);
  var plate2 = (pts, d, m, x, y, z, holes = []) => plate(pts.map(([a, b]) => [a, -b]), d, m, x, y, -z, holes.map((h) => Array.isArray(h) ? h.map(([a, b]) => [a, -b]) : { ...h, z: -h.z }));
  var BR = { gray: 8028297, steel: 9413567, red: 14824239, orange: 15886881, yellow: 15902976, violet: 10128624, rog: 15007762 };
  var SPEC6 = {
    1: { form: "mini", plat: "lga", ddr: 4, dimm: 2, pcb: 1985075, col: 3158842, acc: BR.gray, vrm: 0, armor: 0, slots: ["x16", "x1"], m2: 1, shield: 0, sata: 4, chip: 0, code: "H6", io: { usb: 2, usbc: 0, hdmi: 1, dp: 0, rj45: 1, audio: 3, wifi: 0 } },
    2: { form: "matx", plat: "am4", ddr: 4, dimm: 4, pcb: 1381914, col: 2829876, acc: BR.steel, vrm: 1, armor: 0, slots: ["x16", "x1", "x4"], m2: 2, shield: 1, sata: 4, chip: 1, code: "B5M", io: { usb: 3, usbc: 0, hdmi: 1, dp: 1, rj45: 1, audio: 3, wifi: 0 } },
    3: { form: "atx", plat: "lga", ddr: 4, dimm: 4, pcb: 1184535, col: 2434860, acc: BR.red, vrm: 1, armor: 0, slots: ["x16", "x1", "x16", "x1"], m2: 2, shield: 2, sata: 6, chip: 2, code: "B6", io: { usb: 4, usbc: 1, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 0 } },
    4: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 1184535, col: 2763826, acc: BR.orange, vrm: 2, armor: 1, slots: ["x16r", "x1", "x16", "x1"], m2: 3, shield: 3, sata: 4, chip: 2, code: "B6", io: { usb: 4, usbc: 1, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 } },
    5: { form: "atx", plat: "lga", ddr: 5, dimm: 4, pcb: 1184535, col: 2961462, acc: BR.yellow, vrm: 2, armor: 2, slots: ["x16r", "x1", "x16", "x1"], m2: 3, shield: 3, sata: 4, chip: 2, code: "B7", io: { usb: 4, usbc: 1, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 } },
    6: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 987155, col: 2369067, acc: BR.red, vrm: 3, armor: 2, slots: ["x16r", "m2", "x16", "x1"], m2: 4, shield: 4, sata: 6, chip: 3, code: "X6", io: { usb: 6, usbc: 2, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 }, rgb: true },
    7: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 1381914, col: 3685186, acc: BR.violet, vrm: 2, armor: 2, slots: ["x16r", "x1", "x16", "x1"], m2: 3, shield: 3, sata: 4, chip: 2, code: "B6", io: { usb: 4, usbc: 1, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 } },
    8: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 987155, col: 2040101, acc: BR.orange, vrm: 3, armor: 2, slots: ["x16r", "m2", "x16r", "x1"], m2: 4, shield: 4, sata: 6, chip: 3, code: "X6E", io: { usb: 6, usbc: 2, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 }, rgb: true },
    9: { form: "atx", plat: "lga", ddr: 5, dimm: 2, pcb: 789776, col: 1842722, acc: BR.rog, vrm: 4, armor: 3, slots: ["x16r", "x16r", "x1"], m2: 3, shield: 4, sata: 4, chip: 3, code: "Z7", io: { usb: 6, usbc: 2, hdmi: 1, dp: 1, rj45: 1, audio: 5, wifi: 2 }, rgb: true },
    10: { form: "atx", plat: "am5", ddr: 5, dimm: 4, pcb: 789776, col: 1711136, acc: BR.rog, vrm: 4, armor: 3, slots: ["x16r", "m2", "x16r", "x16"], m2: 5, shield: 5, sata: 6, chip: 4, code: "X6E", io: { usb: 8, usbc: 2, hdmi: 1, dp: 1, rj45: 2, audio: 5, wifi: 2 }, rgb: true }
  };
  var FORM = { mini: [226, 185], matx: [244, 244], atx: [305, 244] };
  var Y = 1.6;
  var PITCH = 20.32;
  function socket(g, plat, x, z) {
    const frame2 = M2(11449275, { metalness: 0.95, roughness: 0.3 }), dk = M2(855568, { metalness: 0.2, roughness: 0.6 });
    if (plat === "lga") {
      g.add(plate2(rectPts2(60, 75), 6.2, frame2, x, Y, z, [rectPts2(40.5, 47.5)]));
      g.add(bx2(45, 2.2, 52, dk, x, Y + 0.6, z));
      g.add(bx2(37.5, 2.4, 45, M2(2829619, { metalness: 0.1, roughness: 0.5 }), x, Y + 2.3, z));
      g.add(cyz2(1.4, 68, frame2, x + 31, Y + 4, z + 0), bx2(3, 2, 7, frame2, x + 31, Y + 6, z + 34));
      g.add(bx2(5, 3, 8, frame2, x - 31, Y + 4.4, z - 33));
    } else if (plat === "am4") {
      g.add(rb2(52, 7, 52, M2(1447706, { metalness: 0.2, roughness: 0.55 }), 1.5, x, Y + 3.5, z));
      g.add(bx2(40.5, 0.6, 40.5, M2(2829619, { metalness: 0.3, roughness: 0.5 }), x, Y + 7.2, z));
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) g.add(bx2(1.2, 0.3, 1.2, GOLD2(), x - 15 + i * 4.3, Y + 7.6, z - 15 + j * 4.3));
      g.add(cyz2(1.5, 44, frame2, x + 27, Y + 8, z), bx2(2.6, 10, 2.6, frame2, x + 27, Y + 12.4, z + 20));
    } else {
      g.add(plate2(rectPts2(66, 66), 6.4, frame2, x, Y, z, [rectPts2(46, 46)]));
      g.add(bx2(52, 2.2, 52, dk, x, Y + 0.6, z));
      g.add(bx2(40, 2.4, 40, M2(2829619, { metalness: 0.1, roughness: 0.5 }), x, Y + 2.3, z));
      g.add(cyz2(1.4, 58, frame2, x + 33, Y + 4.6, z), bx2(3, 2, 7, frame2, x + 33, Y + 6.4, z + 29));
    }
  }
  function slotBody(g, len2, x0, z, reinforce, col, acc) {
    const sh = reinforce ? 12.4 : 11, blk = M2(1381914, { metalness: 0.2, roughness: 0.6 }), mt = M2(col === 0 ? 11580861 : col, { metalness: 0.9, roughness: 0.32 });
    g.add(bx2(len2, sh, 7.6, blk, x0 + len2 / 2, Y + sh / 2, z));
    g.add(bx2(len2 - 4, 0.3, 1.8, M2(2763826), x0 + len2 / 2, Y + sh + 0.1, z));
    if (reinforce) {
      g.add(bx2(len2, 0.9, 9.4, mt, x0 + len2 / 2, Y + sh + 0.5, z));
      [-1, 1].forEach((s) => g.add(bx2(len2, sh + 0.6, 0.9, mt, x0 + len2 / 2, Y + (sh + 0.6) / 2, z + s * 4.3)));
    }
    g.add(bx2(7, 4, 9, M2(1776672), x0 + len2 + 3.5, Y + 2, z), bx2(3, 2, 3, M2(acc, { metalness: 0.4 }), x0 + len2 + 3.5, Y + 4.4, z));
  }
  function dimmSlots(g, s, x0, z) {
    const L2 = 135, pitch = 9.2, ddr5 = s.ddr === 5;
    for (let i = 0; i < s.dimm; i++) {
      const x = x0 + i * pitch, arm = s.vrm >= 2 && ddr5;
      g.add(bx2(5.4, 11, L2, M2(i % 2 ? 1381914 : 1710880, { metalness: 0.25, roughness: 0.55 }), x, Y + 5.5, z));
      if (arm) g.add(bx2(0.8, 10, L2 - 2, M2(11449275, { metalness: 0.9, roughness: 0.3 }), x - 2.8, Y + 5.2, z));
      g.add(bx2(1.2, 0.3, L2 - 6, M2(2763826), x + 0.6, Y + 11.1, z));
      [-1, 1].forEach((sd) => g.add(bx2(5.4, 8, 5, M2(14212064, { metalness: 0.1, roughness: 0.6 }), x, Y + 4, z + sd * (L2 / 2 + 2.5))));
      g.add(bx2(1, 3, 12, BLACK2(), x, Y + 5.5, z + (ddr5 ? 15.3 : 5.3)));
    }
  }
  function m2slot(g, s, x, z, n) {
    g.add(bx2(8, 3.4, 22, BLACK2(), x - 37.2, Y + 1.7, z));
    g.add(cy2(2.8, 2.4, M2(13214282, { metalness: 1, roughness: 0.3 }), x + 40.2, Y + 1.2, z, 16));
    const sh = s.shield, grpShield = new THREE5.Group();
    if (sh > 0) {
      const h = [0, 2.2, 3.6, 5.2, 7.2, 10][sh], m = M2(s.col, { metalness: 0.8, roughness: 0.38 });
      grpShield.add(rb2(80, h, 22.6, m, 1, x, Y + 3.2 + h / 2, z));
      grpShield.add(bx2(60, 0.3, 2.2, M2(s.acc, { metalness: 0.3, roughness: 0.4 }), x - 4, Y + 3.2 + h + 0.05, z - 8));
      for (let i = 0; i < Math.max(0, sh - 2) * 3; i++) grpShield.add(bx2(1.2, 0.5, 18, M2(3816772, { metalness: 0.7 }), x - 22 + i * 4.4, Y + 3.2 + h + 0.2, z));
      grpShield.add(screw2(x + 38, Y + 3.2 + h - 0.5, z, 2, metal2(13685720)));
      g.add(grpShield);
    } else g.add(screw2(x + 40.2, Y + 2.4, z, 1.9, metal2(13214282)));
    return grpShield;
  }
  function io(g, s, xi, zt) {
    const cfg = s.io, shell = M2(9343899, { metalness: 0.9, roughness: 0.4 }), blk = M2(723982, { metalness: 0.2, roughness: 0.6 }), x0 = xi + 11;
    let z = zt - 10;
    const next = (d) => {
      const c = z - d / 2;
      z -= d + 1.2;
      return c;
    };
    if (cfg.hdmi) g.add(bx2(14.5, 6.6, 15.5, shell, x0 + 0, Y + 4.2, next(15.5))), g.add(bx2(1, 4, 12, blk, xi - 0.1, Y + 4.2, z + 7));
    if (cfg.dp) g.add(bx2(14.5, 6.6, 17, shell, x0, Y + 4.2, next(17)));
    for (let i = 0; i < cfg.usb; i++) {
      const c = next(14.4);
      g.add(bx2(17, 15.2, 14.4, shell, x0 + 1, Y + 7.8, c));
      g.add(bx2(0.8, 4.6, 12.6, i % 2 ? M2(2780113) : blk, xi - 0.3, Y + 4.4, c), bx2(0.8, 4.6, 12.6, i % 2 ? M2(2780113) : blk, xi - 0.3, Y + 10.4, c));
    }
    for (let i = 0; i < cfg.usbc; i++) {
      const c = next(10);
      g.add(bx2(14, 7, 10, shell, x0 - 0.5, Y + 3.8, c), bx2(0.8, 2.6, 8.6, blk, xi - 0.1, Y + 3.8, c));
    }
    for (let i = 0; i < cfg.rj45; i++) {
      const c = next(16.5);
      g.add(bx2(21, 13.5, 16.5, shell, x0 + 2.5, Y + 7.5, c));
      g.add(bx2(0.8, 8, 13, blk, xi + 0.1, Y + 7.2, c));
    }
    const jc = [8115038, 15043268, 7317736, 15774794, 11580861];
    for (let i = 0; i < cfg.audio; i++) {
      const c = next(7.4);
      g.add(cyx2(3.6, 14, shell, x0 - 2, Y + 4.2, c, 18), cyx2(3.7, 0.4, M2(jc[i % 5], { metalness: 0.4 }), xi + 5.1, Y + 4.2, c, 18));
    }
    for (let i = 0; i < cfg.wifi; i++) g.add(cyx2(3.2, 9, GOLD2(), xi + 1, Y + 4, zt - 150 + i * 14, 14));
  }
  function mobo(tier, e) {
    const s = SPEC6[tier], [L2, W2] = FORM[s.form], g = new THREE5.Group();
    const xi = -L2 / 2, zt = W2 / 2, zb = -W2 / 2, small = s.form === "mini";
    const pcb = M2(s.pcb, { metalness: 0.2, roughness: 0.55 }), col = M2(s.col, { metalness: 0.7, roughness: 0.42 }), acc = M2(s.acc, { metalness: 0.35, roughness: 0.4 });
    const sink = M2(s.col, { metalness: 0.75, roughness: 0.4 }), alu = M2(11054260, { metalness: 0.8, roughness: 0.35 });
    g.add(bx2(L2, 1.6, W2, pcb, 0, 0.8, 0));
    const sx = xi + 104, sz = zt - (small ? 62 : 80);
    socket(g, s.plat, sx, sz);
    const vh = [0, 9, 16, 22, 30][s.vrm];
    if (s.vrm === 0) {
      for (let i = 0; i < 6; i++) g.add(bx2(6.4, 4.4, 6.4, BLACK2(), xi + 54, Y + 2.2, sz - 25 + i * 9));
      g.add(bx2(30, 7, 12, alu, xi + 60, Y + 3.5, zt - 14));
      g.add(bx2(14, 5, 22, alu, xi + 48, Y + 2.6, sz + 2));
      g.add(smd2(6, 1, 9, 1, xi + 90, Y, zt - 12, M2(2106154, { metalness: 0.6 }), [6.4, 4, 6.4]));
    } else {
      g.add(rb2(s.vrm >= 3 ? 22 : 16, vh, s.vrm >= 3 ? 96 : 84, sink, 2, xi + 52, Y + vh / 2, sz + 2));
      g.add(rb2(s.vrm >= 3 ? 100 : 82, vh * 0.85, s.vrm >= 3 ? 26 : 20, sink, 2, xi + 100, Y + vh * 0.42, zt - 16));
      for (let i = 0; i < (s.vrm >= 2 ? 10 : 4); i++) {
        g.add(bx2(16, 0.6, 1.6, M2(3816772, { metalness: 0.7 }), xi + 52, Y + vh + 0.05, sz - 34 + i * 8.2));
        g.add(bx2(1.6, 0.6, 20, M2(3816772, { metalness: 0.7 }), xi + 64 + i * 7.2, Y + vh * 0.85 + 0.05, zt - 16));
      }
      g.add(bx2(s.vrm >= 3 ? 70 : 50, 0.3, 2.4, acc, xi + 100, Y + vh * 0.85 + 0.1, zt - 10));
      if (s.vrm >= 3) {
        const hp = cyz2(3, 88, M2(13208139, { metalness: 0.95, roughness: 0.3 }), xi + 78, Y + vh + 2.5, zt - 54, 14);
        g.add(hp, cyx2(3, 40, M2(13208139, { metalness: 0.95, roughness: 0.3 }), xi + 78, Y + vh + 2.5, zt - 98, 14));
      }
    }
    g.add(bx2(22, 11, 10, BLACK2(), xi + 36, Y + 5.5, zt - 7));
    g.add(bx2(18, 0.8, 2, GOLD2(), xi + 36, Y + 11.2, zt - 7));
    if (s.vrm >= 3) {
      g.add(bx2(22, 11, 10, BLACK2(), xi + 62, Y + 5.5, zt - 7));
    }
    g.add(bx2(18, 6, 6, BLACK2(), xi + 200, Y + 3, zt - 8), bx2(14, 0.8, 1.2, GOLD2(), xi + 200, Y + 6.2, zt - 8));
    io(g, s, xi, zt);
    if (s.armor > 0) {
      const ah = [0, 22, 28, 34][s.armor], aw = [0, 38, 44, 54][s.armor];
      g.add(rb2(aw, ah, 124, col, 3, xi + 24 + aw / 2, Y + 17 + ah / 2, zt - 72));
      g.add(bx2(aw - 6, 0.4, 3.2, s.rgb ? G2(s.acc, 1) : acc, xi + 24 + aw / 2, Y + 17 + ah + 0.1, zt - 30));
      g.add(flat2(e.game.toUpperCase(), 100, 8, xi + 24 + aw / 2, Y + 17 + ah + 0.25, zt - 80, { color: "#e8eaee", opacity: 0.95, rot: Math.PI / 2 }));
    }
    dimmSlots(g, s, sx + 54, sz - 2);
    const z0 = zt - (small ? 142 : 160), m2s = [], pcies = [];
    s.slots.forEach((t, k) => {
      const z = z0 - k * PITCH;
      if (t === "m2") {
        m2s.push({ x: xi + 76, z, shield: m2slot(g, s, xi + 76, z, k) });
        return;
      }
      const len2 = t === "x1" ? 27 : t === "x4" ? 56 : 99;
      slotBody(g, len2, xi + 14, z, t.endsWith("r"), t.endsWith("r") ? s.acc === BR.rog ? 12896463 : s.col + 3158064 : 0, s.acc);
      pcies.push({ x: xi + 14, z, lanes: len2 === 99 ? 16 : len2 === 56 ? 4 : 1 });
    });
    m2s.unshift({ x: xi + 112, z: sz - (small ? 46 : 54), shield: m2slot(g, s, xi + 112, sz - (small ? 46 : 54), 0) });
    g.add(bx2(11, 14, 52, BLACK2(), xi + L2 - 9, Y + 7, sz - 20));
    g.add(bx2(8, 0.8, 46, GOLD2(), xi + L2 - 9, Y + 14.2, sz - 20));
    for (let i = 0; i < s.sata; i++) {
      g.add(bx2(18, 7.5, 7.4, BLACK2(), xi + L2 - 18, Y + 3.8, zb + 96 + i * 8.8));
      g.add(bx2(2, 1, 4.4, GOLD2(), xi + L2 - 12, Y + 5.6, zb + 96 + i * 8.8));
    }
    const cs = [[34, 8, 34], [40, 9, 40], [46, 12, 46], [54, 15, 50], [66, 20, 60]][s.chip], cx = xi + L2 - 70, cz = zb + (small ? 48 : 58);
    g.add(rb2(cs[0], cs[1], cs[2], col, 2, cx, Y + cs[1] / 2, cz));
    if (s.chip >= 2) for (let i = 0; i < 6; i++) g.add(bx2(0.8, 0.5, cs[2] - 6, M2(3816772, { metalness: 0.7 }), cx - cs[0] / 2 + 6 + i * (cs[0] - 12) / 5, Y + cs[1] + 0.1, cz));
    g.add(bx2(cs[0] - 8, 0.4, 2.2, s.rgb ? G2(s.acc, 1) : acc, cx, Y + cs[1] + 0.4, cz + cs[2] / 2 - 4));
    g.add(flat2(s.code, cs[0] * 0.5, 5, cx, Y + cs[1] + 0.5, cz - 2, { color: hex62(s.acc), opacity: 1 }));
    g.add(bx2(22, 8, 6, BLACK2(), xi + L2 - 52, Y + 4, zb + 8), bx2(26, 8, 6, BLACK2(), xi + L2 - 90, Y + 4, zb + 8), bx2(20, 7, 6, BLACK2(), xi + L2 - 124, Y + 3.5, zb + 8));
    g.add(cy2(10, 3.2, metal2(13685720), cx - 38, Y + 1.6, cz + (small ? 8 : 4), 32));
    g.add(rb2(72, 4, 32, M2(s.col, { metalness: 0.4, roughness: 0.5 }), 1.5, xi + 50, Y + 2, zb + 24));
    g.add(bx2(60, 0.4, 2.2, s.rgb ? G2(s.acc, 1.1) : acc, xi + 50, Y + 4.1, zb + 36));
    for (let i = 0; i < 6; i++) g.add(cy2(3, 7, M2(13214282, { metalness: 0.9, roughness: 0.4 }), xi + 22 + i * 7, Y + 3.5, zb + 8, 16));
    [[xi + 10, zt - 10], [xi + 10, zb + 10], [xi + 104, zb + 10], [xi + L2 - 10, zt - 10], [xi + L2 - 10, zb + 10], [xi + 150, zt - 10], [xi + L2 - 10, sz - 60]].forEach(([x, z]) => g.add(screw2(x, Y, z, 3.1, metal2(12172998))));
    g.add(flat2(s.code + " \xB7 " + e.game.toUpperCase(), 100, 5, xi + L2 / 2 + 10, Y + 0.12, zb + 22, { color: "#9aa0a8", opacity: 0.5 }));
    for (let i = 0; i < 8; i++) g.add(cy2(3.1, 9, BLACK2(), xi + 150 + i * 8, Y + 4.5, zb + 82, 14));
    const seatCpu = s.plat === "am4" ? Y + 7.5 : Y + 3.5;
    const ports = [
      P2("board", "guest", "mobo", [-L2 / 2, 0, -W2 / 2], [0, -1, 0], [1, 0, 0], { form: s.form, L: L2, W: W2, socket: s.plat, ddr: s.ddr }),
      // hintere obere Ecke der Unterseite
      P2("cpu", "host", "cpu-socket", [sx, seatCpu, -sz], [0, 1, 0], s.plat === "lga" ? [0, 0, 1] : [1, 0, 0], { socket: s.plat })
    ];
    for (let i = 0; i < s.dimm; i++) ports.push(P2("dimm" + i, "host", "dimm", [sx + 54 + i * 9.2, Y + 7, -(sz - 2)], [0, 1, 0], [0, 0, -1], { ddr: s.ddr, index: i }));
    let primary = true;
    pcies.forEach((p, k) => {
      ports.push(P2("pcie" + k, "host", "pcie", [p.x, Y + 5, -p.z], [0, 1, 0], [1, 0, 0], { lanes: p.lanes, phys: p.lanes, primary: p.lanes === 16 && primary }));
      if (p.lanes === 16) primary = false;
    });
    m2s.forEach((m, k) => ports.push(P2("m2_" + k, "host", "m2", [m.x - 37.2, Y + 2.4, -m.z], [0, 1, 0], [1, 0, 0], { size: 2280, slot: k }, { shield: m.shield })));
    g.userData.ports = ports;
    const plugs = [
      P2("atx24", "plug", "atx24", [xi + L2 - 9, Y + 14.2, -(sz - 20)], [0, 1, 0], [0, 0, -1], { pins: 24 }),
      P2("eps0", "plug", "eps8", [xi + 36, Y + 11.2, -(zt - 7)], [0, 1, 0], [1, 0, 0], { pins: 8 }),
      P2("cpu_fan", "plug", "fan4", [xi + 200, Y + 6.2, -(zt - 8)], [0, 1, 0], [1, 0, 0], { pins: 4 }),
      P2("sata_data0", "plug", "sata_data", [xi + L2 - 18 + 9, Y + 3.8, -(zb + 96)], [1, 0, 0], [0, 0, 1], { pins: 7 }),
      P2("fpanel", "plug", "fpanel", [xi + L2 - 124, Y + 7, -(zb + 8)], [0, 1, 0], [1, 0, 0], { pins: 10 })
      // Front-Panel-Header (unten, vorne)
    ];
    if (s.vrm >= 3) plugs.push(P2("eps1", "plug", "eps8", [xi + 62, Y + 11.2, -(zt - 7)], [0, 1, 0], [1, 0, 0], { pins: 8 }));
    g.userData.plugs = plugs;
    g.userData.dims = { L: L2, W: W2, H: Y + 40, form: s.form, socket: s.plat, ddr: s.ddr, dimm: s.dimm, m2: m2s.length, pcie: pcies.length, sata: s.sata };
    return g;
  }

  // parts-cooler.js
  var CU = () => M(12088115, { metalness: 0.95, roughness: 0.3 });
  var NI = () => M(13620185, { metalness: 0.95, roughness: 0.28 });
  var SPEC7 = {
    1: { kind: "stock" },
    2: { kind: "tower", W: 120, h: 152, d: 46, pipes: 4, fin: 2829618, cap: 1710879, trim: 4175871, fans: [{ s: 120, body: 1513499, blade: 2369067, hub: 1842722, acc: 4175871 }] },
    3: { kind: "tower", W: 120, h: 155, d: 46, pipes: 4, fin: 1776672, cap: 921362, trim: 15233818, fans: [{ s: 120, body: 1381914, blade: 2105894, hub: 1447707, acc: 15233818 }], gloss: true },
    4: { kind: "tower", W: 125, h: 158, d: 45, pipes: 5, fin: 13620185, cap: 12172998, trim: 7031342, fans: [{ s: 120, body: 14009249, blade: 5979942, hub: 4862752, acc: 7031342, blades: 7, tint: 9071942 }], nickel: true },
    5: { kind: "tower", W: 132, h: 160, d: 50, pipes: 6, fin: 1513499, cap: 723982, trim: 15233818, fans: [{ s: 135, body: 1250327, blade: 2040101, hub: 1316122, acc: 15233818, blades: 7 }], gloss: true, bigTop: true },
    6: { kind: "dual", W: 150, h: 165, d: 45, gap: 36, pipes: 6, fin: 13620185, cap: 12172998, trim: 7031342, fan: { s: 140, body: 14009249, blade: 5979942, hub: 4862752, acc: 7031342, blades: 7, tint: 9071942 }, nickel: true },
    7: { kind: "aio", rad: 240, block: { r: 36, cap: 1381914, acc: 4175871, style: "plain" }, fan: { body: 1513499, blade: 2369067, hub: 1842722, acc: 4175871 } },
    8: { kind: "aio", rad: 240, block: { r: 37, cap: 1052948, acc: 16723920, style: "mirror" }, fan: { body: 1381914, blade: 2369067, hub: 1842722, acc: 16723920, rgb: true } },
    9: { kind: "aio", rad: 360, block: { r: 38, cap: 987155, acc: 2158847, style: "mirror" }, fan: { body: 1250327, blade: 2369067, hub: 1842722, acc: 2158847, rgb: true } },
    10: { kind: "aio", rad: 360, block: { r: 39, cap: 723983, acc: 2158847, style: "lcd" }, fan: { body: 1118742, blade: 2369067, hub: 1842722, acc: 16723920, rgb: true } }
  };
  function fanX(o, x0, y, z = 0) {
    const f = frameFan(o.s, 25, { body: o.body, blade: o.blade, hub: o.hub, accent: o.acc, blades: o.blades ?? 9, tint: o.tint, rgb: o.rgb, speed: 7 });
    f.rotation.z = -Math.PI / 2;
    f.position.set(x0, y, z);
    return f;
  }
  function finStack(g, s, x, W2, d, h, y0 = 16) {
    const fm = M(s.fin, { metalness: s.nickel ? 0.95 : 0.7, roughness: s.nickel ? 0.28 : 0.42 }), n = Math.round(W2 / 2.6);
    for (let i = 0; i < n; i++) g.add(bx(d, h - y0 - 3, 0.55, fm, x, y0 + (h - y0 - 3) / 2, -W2 / 2 + 1 + i * ((W2 - 2) / (n - 1))));
    g.add(rb(d + 1, 2.4, W2 + 1, M(s.cap, { metalness: s.gloss ? 0.8 : 0.85, roughness: s.gloss ? 0.18 : 0.3 }), 1, x, h - 1.2, 0));
    g.add(bx(d - 6, 0.25, 2, G(s.trim, 0.7), x, h + 0.05, -W2 / 2 + 6));
  }
  function pipes(g, s, x, n, W2, h) {
    const pm = NI(), xs = Array.from({ length: n }, (_, i) => x - (n - 1) / 2 * 7 + i * 7);
    xs.forEach((px, i) => {
      const zl = 24 + i % 2 * 22 + (i > 3 ? 6 : 0);
      g.add(cyz(3, zl * 2 + 6, pm, px, 11, 0, 14));
      [-1, 1].forEach((sd) => {
        g.add(cy(3, h - 11, pm, px, 11 + (h - 11) / 2, sd * zl, 14));
        g.add(cy(3.2, 2.6, pm, px, h + 1.2, sd * zl, 14));
      });
    });
  }
  function tower(g, s, e) {
    g.add(rb(40, 6, 52, NI(), 1.5, 0, 3, 0));
    g.add(bx(60, 4, 62, M(2763825, { metalness: 0.7 }), 0, 8, 0));
    g.add(cyz(2.2, 74, metal(12172998), 0, 11.5, 0));
    pipes(g, s, 0, s.pipes, s.W, s.h);
    finStack(g, s, 0, s.W, s.d, s.h);
    const f = s.fans[0], fy = Math.max(f.s / 2 + 16, 76);
    g.add(fanX(f, s.d / 2 + 0.5, fy));
    [-1, 1].forEach((sd) => g.add(bx(1.2, 0.9, f.s * 0.9, metal(12172998), s.d / 2 + 0.6 + 12, fy + sd * (f.s / 2 - 3), 0)));
    g.add(wall(e.game.toUpperCase(), s.d * 0.9, 6, 0, s.h + 0.3, 0, "+x", { color: "#e8eaee", opacity: 0 }));
    g.add(flat(e.game.toUpperCase(), s.W * 0.55, 7, 0, s.h + 0.4, 0, { color: s.nickel ? "#2b2f36" : hex6(s.trim), opacity: 0.95, rot: Math.PI / 2 }));
    g.userData.dims = { L: s.d + 30, W: s.W, H: s.h };
    g.userData.plugs = [P2("fan", "plug", "fan4", [s.d / 2 + 13, fy - f.s / 2 + 1, 0], [0, -1, 0], [1, 0, 0], { pins: 4 })];
  }
  function dual(g, s, e) {
    const x1 = -(s.gap / 2 + s.d / 2), x2 = s.gap / 2 + s.d / 2;
    g.add(rb(42, 6, 54, NI(), 1.5, 0, 3, 0));
    g.add(bx(110, 4, 64, M(2763825, { metalness: 0.7 }), 0, 8, 0));
    pipes(g, s, x1, 3, s.W, s.h);
    pipes(g, s, x2, 3, s.W, s.h);
    finStack(g, s, x1, s.W, s.d, s.h);
    finStack(g, s, x2, s.W, s.d, s.h, 38);
    const f = s.fan, fy = f.s / 2 + 38;
    g.add(fanX(f, -s.gap / 2 + 0.5 - 25 + 25, fy));
    g.add(fanX(f, x2 + s.d / 2 + 0.5, fy));
    g.add(flat(e.game.toUpperCase(), s.W * 0.5, 7, x2, s.h + 0.4, 0, { color: "#2b2f36", opacity: 0.95, rot: Math.PI / 2 }));
    g.userData.dims = { L: x2 + s.d / 2 + 30 - x1 + s.d / 2, W: s.W, H: s.h };
    g.userData.plugs = [P2("fan", "plug", "fan4", [-s.gap / 2 + 13, fy - f.s / 2 + 1, 0], [0, -1, 0], [1, 0, 0], { pins: 4 })];
  }
  function stock(g, e) {
    const al = M(12172998, { metalness: 0.85, roughness: 0.4 }), pl = M(1776672, { metalness: 0.1, roughness: 0.6 });
    g.add(cy(14, 40, CU(), 0, 20, 0, 32));
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2, b = bx(28, 34, 0.9, al, Math.cos(a) * 28, 22, Math.sin(a) * 28);
      b.rotation.y = -a;
      g.add(b);
    }
    g.add(cone(46, 46, 3, al, 0, 8, 0, 48));
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => {
      g.add(cy(3.4, 12, M(15330286, { metalness: 0.1, roughness: 0.6 }), a * 38, 14, b * 38, 14), cy(4.2, 5, pl, a * 38, 21, b * 38, 14));
    });
    g.add(plate(rrect(94, 94, 8), 6, pl, 0, 38, 0, [{ x: 0, z: 0, r: 43 }]));
    const f = frameFan(92, 20, { body: 1776672, accent: 10133672, blades: 9, speed: 7 });
    f.position.y = 33;
    g.add(f);
    g.add(flat(e.game.toUpperCase(), 40, 4, 0, 44.4, 36, { color: "#c9ced6", opacity: 0.8 }));
    g.userData.dims = { L: 94, W: 94, H: 58 };
    g.userData.plugs = [P2("fan", "plug", "fan4", [0, 36, 46], [0, 0, 1], [1, 0, 0], { pins: 4 })];
  }
  var RADH = 56.5;
  function aioBlock(s, e) {
    const g = new THREE3.Group(), b = s.block;
    g.add(bx(64, 5, 64, CU(), 0, 2.5, 0));
    g.add(cy(b.r, 38, M(1250327, { metalness: 0.5, roughness: 0.45 }), 0, 24, 0, 56));
    g.add(cy(b.r - 4, 5, M(b.cap, { metalness: 0.6, roughness: 0.3 }), 0, 45.5, 0, 56));
    g.add(ring(b.r - 3, 1.1, G(b.acc, 1), 0, 48.4, 0, 64));
    if (b.style === "mirror") {
      g.add(cy(b.r - 9, 0.6, M(1711138, { metalness: 1, roughness: 0.05 }), 0, 48.2, 0, 56));
      g.add(ring(b.r - 14, 0.8, G(b.acc, 1.4), 0, 48.8, 0, 64));
      g.add(ring(b.r - 20, 0.6, G(b.acc, 1.4), 0, 48.8, 0, 64));
    }
    if (b.style === "lcd") {
      g.add(cy(b.r - 8, 0.7, M(397340, { metalness: 0.4, roughness: 0.1 }), 0, 48.3, 0, 56));
      g.add(cy(b.r - 14, 0.2, G(748497, 0.9), 0, 48.8, 0, 56));
      g.add(flat(e.game.toUpperCase(), 40, 6, 0, 49.1, 0, { color: "#e8fbff", opacity: 1 }));
    } else g.add(flat(e.game.toUpperCase(), 44, 5, 0, 48.7, 0, { color: "#e8eaee", opacity: 0.9 }));
    g.userData.tubeGroup = new THREE3.Group();
    g.userData.tubeGroup.userData.flex = true;
    g.add(g.userData.tubeGroup);
    return g;
  }
  function aioRad(s, e) {
    const g = new THREE3.Group(), rl = s.rad === 360 ? 397 : 274, nf = s.rad === 360 ? 3 : 2;
    g.add(rb(120, 27, rl - 30, M(2829619, { metalness: 0.75, roughness: 0.45 }), 2, 0, 17, 0));
    for (let i = 0; i < 38; i++) g.add(bx(110, 0.5, 1.1, M(4014152, { metalness: 0.8, roughness: 0.35 }), 0, 30.6, -(rl - 100) / 2 + i * ((rl - 100) / 37)));
    [-1, 1].forEach((sd) => g.add(rb(120, 27, 24, M(1579293, { metalness: 0.4, roughness: 0.5 }), 3, 0, 17, sd * (rl / 2 - 12))));
    RAD_FIT.forEach(([dx]) => g.add(cy(7, 9, metal(10133674), dx, 35, -(rl / 2 - 12), 20)));
    const f = s.fan;
    for (let i = 0; i < nf; i++) {
      const ff = frameFan(120, 25, { ...f, accent: f.acc, rgb: f.rgb, speed: 7 });
      ff.position.set(0, 30.5, (i - (nf - 1) / 2) * 120);
      g.add(ff);
    }
    g.add(wall(e.game.toUpperCase(), 100, 6, 0, 14, -(rl / 2) + 70, "+x", { color: "#c9ced6", opacity: 0.7 }));
    g.userData.fit = RAD_FIT.map(([dx]) => [dx, 40, -(rl / 2 - 12)]);
    g.userData.dims = { L: 120, W: rl, H: RADH, rad: s.rad };
    return g;
  }
  var RAD_FIT = [[-22], [22]];
  function connectAio(blockObj, blockWorld, radObj, radWorld, mulFn, pointFn, invFn) {
    const tg = blockObj.userData.tubeGroup;
    while (tg.children.length) tg.remove(tg.children[0]);
    const toBlock = mulFn(invFn(blockWorld), radWorld), b = blockObj.userData.block;
    radObj.userData.fit.forEach((fp, i) => {
      const q = pointFn(toBlock, fp), side = i ? 1 : -1, d = Math.hypot(q[0], q[2]) || 1, ux = q[0] / d, uz = q[2] / d;
      const s0 = [ux * (b.r - 2) - uz * side * 9, 30, uz * (b.r - 2) + ux * side * 9];
      const out = [s0[0] + ux * 24, 44 + i * 6, s0[2] + uz * 24];
      const lift = [q[0] - ux * 10, Math.max(q[1] + 30, 70) + i * 4, q[2] - uz * 10];
      tg.add(cable([s0, out, [(out[0] + lift[0]) / 2, Math.max(out[1], lift[1]) + 6, (out[2] + lift[2]) / 2], lift, [q[0], q[1] + 8, q[2]], [q[0], q[1], q[2]]], 921361, 6.5));
    });
  }
  function aio(g, s, e) {
    const blk = aioBlock(s, e), rad = aioRad(s, e), rl = rad.userData.dims.W;
    blk.userData.block = s.block;
    blk.userData.plugs = [P2("pump", "plug", "fan4", [s.block.r + 1, 22, 0], [1, 0, 0], [0, 0, 1], { pins: 4 })];
    rad.position.set(188, 0, 0);
    g.add(blk, rad);
    g.userData.nominalConnect = true;
    g.userData.members = [
      { id: "block", obj: blk, ports: [P2("base", "guest", "cooler-contact", [0, 0, 0], [0, -1, 0], [1, 0, 0], { sockets: ["lga", "am4", "am5"], aio: true })] },
      { id: "rad", obj: rad, ports: [P2("rad", "guest", "rad", [0, RADH, 0], [0, 1, 0], [0, 0, 1], { size: s.rad, thick: RADH, width: 120, length: rl })] }
    ];
    g.userData.connect = (bw, rw) => connectAio(blk, bw, rad, rw, mul, point, inv);
    connectAio(blk, I4(), rad, [1, 0, 0, 188, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], mul, point, inv);
    g.userData.dims = { L: 188 + 60 + 36, W: rl + 46, H: 56, kind: "aio", rad: s.rad };
  }
  function cooler(tier, e) {
    const s = SPEC7[tier], g = new THREE3.Group();
    if (s.kind === "stock") stock(g, e);
    else if (s.kind === "tower") tower(g, s, e);
    else if (s.kind === "dual") dual(g, s, e);
    else aio(g, s, e);
    const d = g.userData.dims || {};
    if (s.kind !== "aio") {
      g.userData.ports = [P2("base", "guest", "cooler-contact", [0, 0, 0], [0, -1, 0], [1, 0, 0], { sockets: ["lga", "am4", "am5"] })];
      g.userData.dims = { ...d, kind: s.kind, height: s.h ?? 58 };
    } else g.userData.dims = { ...g.userData.dims, height: 56 };
    return g;
  }

  // parts-case.js
  var SPEC8 = {
    1: { w: 175, h: 355, d: 380, col: 1974308, front: "solid", glass: false, fans: [], rear: 0, feet: 14, io: "min", note: "Mini-Tower" },
    2: { w: 210, h: 395, d: 400, col: 1776671, front: "mesh", glass: false, fans: [1], rear: 1, feet: 14, io: "std", note: "mATX" },
    3: { w: 225, h: 464, d: 410, col: 1710878, front: "solid", glass: true, fans: [], rear: 1, feet: 16, io: "std", shroud: true, acc: 15330286 },
    4: { w: 230, h: 453, d: 466, col: 1118740, front: "mesh", glass: true, fans: [2], rear: 1, feet: 16, io: "std", shroud: true, acc: 14883127 },
    5: { w: 212, h: 440, d: 452, col: 1447706, front: "mesh", glass: true, fans: [2], rear: 1, feet: 16, io: "std", shroud: true, acc: 10133672, hex: true },
    6: { w: 230, h: 495, d: 478, col: 1381914, front: "glass", glass: true, fans: [3], rear: 1, feet: 16, io: "std", shroud: true, acc: 2158847, rgbFans: true },
    7: { w: 245, h: 520, d: 520, col: 1052947, front: "mesh", glass: true, fans: [3], rear: 1, feet: 18, io: "std", shroud: true, acc: 14883127, big: true },
    8: { w: 285, h: 465, d: 459, col: 987154, front: "glassfront", glass: true, fans: [], rear: 1, feet: 18, io: "side", shroud: false, acc: 15330286, dual: true, sideFans: 3 },
    9: { w: 242, h: 530, d: 544, col: 1381914, front: "mesh", glass: true, fans: [3], rear: 1, feet: 18, io: "std", shroud: true, acc: 10133672, hex: true, big: true },
    10: { w: 285, h: 465, d: 459, col: 15330286, front: "glassfront", glass: true, fans: [], rear: 1, feet: 18, io: "side", shroud: false, acc: 2158847, dual: true, sideFans: 3, rgbFans: true, white: true }
  };
  var T2 = 1.8;
  function meshPanel(g, w2, h, x, y, z, col, hex) {
    const dark2 = M(526602, { metalness: 0.3, roughness: 0.7 });
    g.add(bx(w2, h, 1.2, dark2, x, y, z));
    const nx = Math.floor(w2 / 9), ny = Math.floor(h / 9), hm = M(2961462, { metalness: 0.6, roughness: 0.5 });
    for (let i = 0; i < nx; i++) g.add(bx(1.2, h - 6, 1.6, hm, x - w2 / 2 + 6 + i * ((w2 - 12) / (nx - 1)), y, z + 0.4));
    if (!hex) for (let j = 0; j < ny; j++) g.add(bx(w2 - 6, 1.2, 1.6, hm, x, y - h / 2 + 6 + j * ((h - 12) / (ny - 1)), z + 0.4));
  }
  function pcCase(tier, e) {
    const s = SPEC8[tier], g = new THREE3.Group(), { w: w2, h, d } = s, f0 = s.feet;
    const sheet = M(s.col, { metalness: s.white ? 0.3 : 0.55, roughness: s.white ? 0.45 : 0.5 }), inner = M(855568, { metalness: 0.4, roughness: 0.7 });
    const y0 = f0, X = w2 / 2, Z = d / 2;
    g.add(bx(w2, T2, d, sheet, 0, y0 + T2 / 2, 0));
    g.add(bx(w2, T2, d, s.dual ? sheet : sheet, 0, y0 + h - T2 / 2, 0));
    g.add(bx(w2, h, T2, sheet, 0, y0 + h / 2, -Z + T2 / 2));
    g.add(bx(T2, h, d, sheet, X - T2 / 2, y0 + h / 2, 0));
    for (let i = 0; i < 12; i++) g.add(bx(w2 * 0.58, 0.3, 4, BLACK(), -w2 * 0.05, y0 + h + 0.15, -Z * 0.55 + i * 11));
    if (s.glass) {
      g.add(bx(1, h - 14, d - 14, glass(9085108, 0.2), -X + 0.5, y0 + h / 2, -2));
      g.add(bx(0.5, h - 10, 3, BLACK(), -X + 0.2, y0 + h / 2, -Z + 7));
    } else {
      g.add(bx(T2, h, d, sheet, -X + T2 / 2, y0 + h / 2, 0));
      for (let i = 0; i < 10; i++) g.add(bx(0.4, h * 0.5, 2, BLACK(), -X - 0.1, y0 + h * 0.5, -Z * 0.5 + i * 12));
    }
    const fz = Z - 0.6, fh = h - 2 * T2 - 4;
    if (s.front === "solid") {
      g.add(rb(w2 - 2, fh, 12, sheet, 2, 0, y0 + h / 2, Z - 6));
      g.add(bx(w2 * 0.45, 1.2, 1, M(s.acc ?? 10133672, { metalness: 0.5 }), 0, y0 + h * 0.2, Z + 0.1));
    } else if (s.front === "mesh") {
      g.add(bx(w2, h, 12, sheet, 0, y0 + h / 2, Z - 6));
      meshPanel(g, w2 - 12, h - 16, 0, y0 + h / 2, Z + 0.4, s.col, s.hex);
    } else if (s.front === "glass") {
      g.add(bx(w2, h, 12, sheet, 0, y0 + h / 2, Z - 6));
      g.add(bx(w2 - 14, h - 14, 1.2, glass(9085108, 0.2), 0, y0 + h / 2, Z + 0.4));
    } else {
      g.add(bx(w2, h, 8, sheet, 0, y0 + h / 2, Z - 4));
      g.add(bx(w2 - 10, h - 10, 1.2, glass(9085108, 0.2), 0, y0 + h / 2, Z + 0.4));
    }
    const fanCol = s.rgbFans ? s.acc : 2764084;
    const mk = (sz) => frameFan(sz, 25, { body: 1447707, blade: 2369067, hub: 1842722, accent: s.acc ?? 58879, rgb: s.rgbFans, speed: 6 });
    g.add(bx(w2 - 2 * T2 - 4, 1.2, d - 40, inner, 0, y0 + T2 + 0.6, -10));
    g.add(bx(1.4, h - 2 * T2 - 6, d - 40, M(1316120, { metalness: 0.5, roughness: 0.6 }), X - T2 - 0.7, y0 + h / 2, -14));
    if (s.rear) {
      const f = mk(120);
      f.rotation.x = Math.PI / 2;
      f.position.set(X - 100, y0 + h - 100, -Z + T2 + 25);
      g.add(f);
    }
    const nf = s.fans[0] ?? 0;
    for (let i = 0; i < nf; i++) {
      const f = mk(120);
      f.rotation.x = Math.PI / 2;
      f.position.set(0, y0 + 50 + 125 * i + 45, Z - 30 + 25 - 2);
      g.add(f);
    }
    if (s.dual) {
      for (let i = 0; i < 3; i++) {
        const f = mk(120);
        f.position.set(-X + T2 + 62, y0 + T2, -Z + T2 + 66 + i * 126);
        f.rotation.z = 0;
        g.add(f);
      }
      g.add(bx(20, h - 40, 6, M(s.acc, { metalness: 0.4 }), X - T2 - 12, y0 + h / 2, Z - 18));
    }
    const SHROUD_H = 92, shroudTop = y0 + T2 + SHROUD_H, shroudEnd = -Z + 14 + d * 0.62;
    if (s.shroud) {
      const sg = new THREE3.Group(), sm = M(1118740, { metalness: 0.4, roughness: 0.55 });
      sg.add(bx(w2 - 2 * T2 - 10, 2.4, d * 0.62, sm, 0, shroudTop - 1.2, -Z + d * 0.31 + 14));
      sg.add(bx(w2 - 2 * T2 - 10, SHROUD_H, 2.4, sm, 0, y0 + T2 + SHROUD_H / 2, shroudEnd - 1.2));
      sg.add(bx(2.4, SHROUD_H, d * 0.62, sm, -(w2 - 2 * T2 - 10) / 2 + 1.2, y0 + T2 + SHROUD_H / 2, -Z + d * 0.31 + 14));
      sg.add(bx(w2 - 2 * T2 - 10, 2, 3, M(s.acc ?? 8947848, { metalness: 0.4 }), 0, shroudTop + 0.4, shroudEnd - 4));
      g.add(sg);
      g.userData.shroud = sg;
    }
    const ioY = y0 + h + 0.1;
    if (s.io === "std") {
      g.add(bx(w2 * 0.45, 3, 18, M(658189, { metalness: 0.3 }), 0, ioY, Z - 22));
      [-24, -8, 8, 24].forEach((x) => g.add(bx(11, 1.4, 6, M(2775706, { metalness: 0.2 }), x, ioY + 1.4, Z - 22)));
      g.add(cy(5, 1.6, G(2158847, 0.5), w2 * 0.2, ioY + 1, Z - 22, 20));
    }
    if (s.io === "min") g.add(bx(22, 1.4, 6, M(2775706, { metalness: 0.2 }), 0, ioY + 0.7, Z - 18));
    if (s.io === "side") {
      g.add(bx(50, 100, 4, M(658189, { metalness: 0.3 }), X + 0.1 - 25, y0 + h * 0.5, Z - 2));
      [[-15, 0], [0, 0], [15, 0]].forEach(([dy], i) => g.add(bx(8, 4, 2, M(2775706, { metalness: 0.2 }), X - 25, y0 + h * 0.5 + 30 - i * 14, Z + 0.4)));
    }
    g.add(wall(e.game.toUpperCase(), w2 * 0.42, 6, 0, y0 + 18, Z + 0.7, "+z", { color: "#e8eaee", opacity: 0.85 }));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(bx(w2 * 0.12, f0, 30, M(657932, { metalness: 0.2, roughness: 0.8 }), a * (X - w2 * 0.14), f0 / 2, b * (Z - 40))));
    const psuX = s.dual ? X - T2 - 80 : 0, zr = -Z + T2;
    const yTop = y0 + h - T2 - 25;
    const trayFace = X - T2 - 1.4, standoff = 6.5;
    const FORMS2 = tier === 1 ? ["mini"] : tier === 2 ? ["mini", "matx"] : ["mini", "matx", "atx"];
    const radMax = [0, 0, 240, 240, 360, 360, 360, 360, 360, 360, 360][tier];
    const ports = [
      // Mainboard: Auflageflaeche an den Standoffs, hintere obere Ecke; x-Achse der Platine zeigt zur Front (+z), Oberkante nach oben (+y)
      P2("mobo", "host", "mobo", [trayFace - standoff, yTop, zr + 3], [-1, 0, 0], [0, 0, 1], { forms: FORMS2, standoff }),
      // Netzteil: liegt auf dem Boden, Rueckseite (Kaltgeraetebuchse) an der Rueckwand
      P2("psu", "host", "psu", [psuX, y0 + T2, zr + 7.5], [0, 1, 0], [0, 0, 1], { forms: ["atx"], shroud: !!s.shroud })
    ];
    for (let k = 0; k < 2; k++) {
      const zk = s.shroud ? shroudEnd - 52 - k * 86 : Z - 12 - 55 - k * 86, yk = s.shroud ? shroudTop : y0 + T2;
      g.add(bx(106, 1.6, 76, M(2763825, { metalness: 0.6, roughness: 0.5 }), psuX, yk + 0.8, zk));
      ports.push(P2("sata" + k, "host", "sata25", [psuX, yk + 1.6, zk], [0, 1, 0], [1, 0, 0], { slot: k }));
    }
    if (radMax) ports.push(P2("rad-top", "host", "rad", [X - 135, y0 + h - T2, zr + 28], [0, -1, 0], [0, 0, 1], { max: radMax, width: 120 }));
    g.userData.ports = ports;
    g.userData.plugs = [P2("fp", "plug", "fpanel", [0, y0 + h - T2 - 24, Z - 32], [0, -1, 0], [1, 0, 0], { pins: 10 })];
    const keep = [];
    if (s.rear) keep.push({ n: "rear-fan", min: [X - 160, y0 + h - 160, -Z + T2], max: [X - 40, y0 + h - 40, -Z + T2 + 27] });
    for (let i = 0; i < nf; i++) keep.push({ n: "front-fan" + i, min: [-60, y0 + 50 + 125 * i + 45 - 60, Z - 33], max: [60, y0 + 50 + 125 * i + 45 + 60, Z - 4] });
    if (s.dual) for (let i = 0; i < 3; i++) keep.push({ n: "floor-fan" + i, min: [-X + T2 + 2, y0 + T2, -Z + T2 + 6 + i * 126], max: [-X + T2 + 122, y0 + T2 + 27, -Z + T2 + 126 + i * 126] });
    g.userData.keepout = keep;
    g.userData.interior = { min: [-X + (s.glass ? 1.2 : T2), y0 + T2, -Z + T2], max: [trayFace, y0 + h - T2, Z - 12] };
    g.userData.dims = { L: w2, W: d, H: h + f0, forms: FORMS2, radMax, shroud: !!s.shroud, tier };
    return g;
  }

  // parts.js
  var GEN = { cpu, gpu, ram, ssd, psu, mobo, cooler, case: pcCase };
  function buildPartRaw(id) {
    const e = byId(id), g = GEN[e.cat](e.tier, e);
    g.userData.entry = e;
    g.userData.id = id;
    return g;
  }
  function buildPart(id) {
    const inner = buildPartRaw(id), g = new THREE3.Group();
    g.add(inner);
    g.scale.setScalar(0.01);
    g.userData.entry = inner.userData.entry;
    g.userData.dims = inner.userData.dims;
    g.userData.ports = inner.userData.ports;
    g.userData.id = id;
    return g;
  }

  // assemble.js
  var THREE6 = __toESM(require_three_global(), 1);

  // cables.js
  var BLK = 1315863;
  var BLK2 = 1908002;
  var RED3 = 12597547;
  var GREY = 2763312;
  var HEAD = { atx24: [52, 20, 14], eps8: [22, 18, 13], pcie8: [26, 18, 12], fan4: [13, 10, 6], fpanel: [24, 10, 7], sata_data: [10, 12, 4], sata_pwr: [24, 12, 4] };
  var STYLE = {
    mainPower: { n: 4, r: 2.1, spacing: 5.2, col: [BLK, BLK, BLK, BLK2] },
    cpuPower: { n: 2, r: 2.2, spacing: 5.4, col: [BLK, BLK2] },
    gpuPower: { n: 2, r: 2.3, spacing: 5.6, col: [BLK, BLK2] },
    fanCable: { n: 1, r: 1.1, spacing: 0, col: [GREY] },
    frontPanel: { n: 3, r: 0.9, spacing: 2.6, col: [GREY, GREY, 3816002] },
    ssdPower: { n: 2, r: 1.5, spacing: 3.6, col: [BLK, BLK2] },
    ssdData: { n: 1, r: 1.6, spacing: 0, col: [RED3] }
  };
  function plugWorld(obj, id) {
    const pl = (obj && obj.userData.plugs || []).find((q) => q.id === id);
    if (!pl) return null;
    const W2 = obj.userData.world || [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const n = (v) => {
      const l = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / l, v[1] / l, v[2] / l];
    };
    return { p: point(W2, pl.pos), d: n(dir(W2, pl.up)), f: n(dir(W2, pl.fwd)), kind: pl.kind, id, part: obj.userData.partId || obj.userData.id };
  }
  function planCables(sys) {
    const r = sys.byRole, out = [];
    const add = (key, kind, a, b, extra = {}) => {
      if (a && b && a.kind === b.kind) out.push({ key, kind, a, b, ...extra });
    };
    const mb = r.mobo, ps = r.psu, gp = r.gpu, co = r.cooler, ca = r.case;
    if (mb && ps) {
      add("mainPower", "atx24", plugWorld(ps, "out_atx24"), plugWorld(mb, "atx24"));
      add("cpuPower", "eps8", plugWorld(ps, "out_eps0"), plugWorld(mb, "eps0"));
      const e1 = plugWorld(mb, "eps1");
      if (e1) add("cpuPower", "eps8", plugWorld(ps, "out_eps1"), e1, { second: true });
    }
    if (ps && gp) {
      const n = (gp.userData.plugs || []).length;
      for (let i = 0; i < n; i++) add("gpuPower", "pcie8", plugWorld(ps, "out_pcie" + i), plugWorld(gp, "power" + i), { index: i });
    }
    if (mb && co) add("fanCable", "fan4", plugWorld(co, co.userData.plugs && co.userData.plugs[0] && co.userData.plugs[0].id), plugWorld(mb, "cpu_fan"));
    if (mb && ca) add("frontPanel", "fpanel", plugWorld(ca, "fp"), plugWorld(mb, "fpanel"));
    const ss = r.ssd;
    if (ss && (ss.userData.plugs || []).length) {
      if (ps) add("ssdPower", "sata_pwr", plugWorld(ps, "out_sata"), plugWorld(ss, "pwr"));
      if (mb) add("ssdData", "sata_data", plugWorld(mb, "sata_data0"), plugWorld(ss, "data"));
    }
    return out;
  }
  var add3 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
  var lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  function routeContext(sys) {
    const ca = sys.byRole.case, it = ca ? ca.userData.interior : { min: [-120, 0, -230], max: [110, 480, 220] };
    const front = it.max[2];
    let zc = 20, zg = -1e9;
    const mb = sys.byRole.mobo, gp = sys.byRole.gpu;
    if (mb) {
      const b = mb.userData.dims, W2 = mb.userData.world;
      const zs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => point(W2, [sx * b.L / 2, 0, sz * b.W / 2])[2]));
      zc = Math.max(...zs);
    }
    if (gp) {
      const L2 = gp.userData.dims.L, W2 = gp.userData.world;
      zg = Math.max(...[-1, 1].map((s) => point(W2, [s * L2 / 2, 0, 0])[2]));
    }
    const channelZ = Math.min(front - 16, Math.max(zc + 26, zg + 26));
    return { top: it.max[1], bottom: it.min[1], front, channelZ, xMin: it.min[0], xMax: it.max[0] };
  }
  function routePoints(c, ctx, k = 0) {
    const A = c.a, B2 = c.b, off = k * 9;
    const a0 = A.p, a1 = add3(A.p, A.d, 34), b0 = B2.p, b1 = add3(B2.p, B2.d, 28);
    const topFacing = Math.abs(B2.d[1]) > 0.6, sideFacing = Math.abs(B2.d[0]) > 0.6;
    const xr = sideFacing ? B2.p[0] + Math.sign(B2.d[0]) * (30 + off) : B2.p[0] + (topFacing ? 0 : B2.d[0] * 20) + off * 0.4;
    const zc = Math.max(ctx.channelZ + off * 0.6, a1[2] + 14);
    const yB = Math.min(ctx.top - 9, b0[1] + (topFacing ? 42 + off : sideFacing ? b0[1] > ctx.top * 0.72 ? 26 : 0 : 14));
    const tail = sideFacing ? [xr, yB, b1[2]] : [b1[0], yB, b1[2]];
    const pts = [a0, a1, [(a1[0] + xr) / 2, a1[1] + 10, a1[2] + 24]];
    if (Math.abs(B2.p[1] - a1[1]) > 60 || Math.abs(zc - b1[2]) > 40) {
      pts.push([xr, a1[1] + (yB - a1[1]) * 0.25, zc], [xr, yB - (yB - a1[1]) * 0.25, zc], [xr, yB, zc - Math.min(30, Math.abs(zc - b1[2]) * 0.3)]);
    }
    pts.push(tail);
    if (!sideFacing && !topFacing) pts.push(lerp3(tail, b1, 0.5));
    pts.push(b1, b0);
    return pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) > 1.5);
  }
  function head(kind, pl) {
    const [lw, hh, dd] = HEAD[kind] || [14, 10, 8];
    const g = new THREE3.Group(), m = M(921362, { metalness: 0.15, roughness: 0.65 });
    const b = bx(lw, hh, dd, m, 0, hh / 2 - 1, 0);
    g.add(b);
    g.add(bx(lw * 0.86, 0.5, dd * 0.7, M(13938487, { metalness: 1, roughness: 0.3 }), 0, -0.9, 0));
    place(g, frame({ pos: pl.p, up: pl.d, fwd: pl.f }));
    return g;
  }
  function buildCable(c, ctx, k = 0) {
    const g = new THREE3.Group(), st = STYLE[c.key] || STYLE.mainPower;
    const pts = routePoints(c, ctx, k), side = [0, 0, 1];
    for (let i = 0; i < st.n; i++) {
      const o = (i - (st.n - 1) / 2) * st.spacing;
      const p2 = pts.map((p, j) => j === 0 || j === pts.length - 1 ? [p[0] + side[0] * o * 0.4, p[1] + side[1] * o * 0.4, p[2] + side[2] * o * 0.4] : [p[0] + side[0] * o, p[1] + side[1] * o, p[2] + side[2] * o]);
      g.add(cable(p2, st.col[i % st.col.length], st.r));
    }
    g.add(head(c.kind, c.a), head(c.kind, c.b));
    g.userData.cableKey = c.key;
    g.userData.points = pts;
    return g;
  }
  function buildCables(sys) {
    const plan = planCables(sys), ctx = routeContext(sys), group = new THREE3.Group(), items = [], used = {};
    plan.forEach((c) => {
      const k = used[c.key] = (used[c.key] ?? -1) + 1, kk = c.key === "cpuPower" ? k : c.key === "gpuPower" ? k : 0;
      const order = { mainPower: 0, cpuPower: 1, gpuPower: 2, fanCable: 3, frontPanel: 4, ssdPower: 5, ssdData: 6 }[c.key] ?? 0;
      const obj = buildCable(c, ctx, order * 0.7 + kk * 0.4);
      group.add(obj);
      items.push({ ...c, obj });
    });
    group.userData.items = items;
    return { group, items, ctx };
  }

  // assemble.js
  function mountPart(hostObj, hostPortId, guestObj, guestPortId, guestPort) {
    const hostPort = portOf(hostObj, hostPortId), gp = guestPort || portOf(guestObj, guestPortId);
    let hp = hostPort;
    if (hostPort.kind === "rad") hp = { ...hostPort, pos: hostPort.pos.map((v, i) => v + hostPort.fwd[i] * (gp.meta.length || 0) / 2) };
    const W2 = mate(hostObj.userData.world || I4(), hp, gp);
    guestObj.userData.world = W2;
    place(guestObj, W2);
    return W2;
  }
  var DIMM_PICK = { 1: { 2: [0], 4: [1] }, 2: { 2: [0, 1], 4: [1, 3] }, 4: { 4: [0, 1, 2, 3] } };
  var RAW = {};
  function compat(spec, opts = {}) {
    const errors = [], warnings = [];
    const get = (id) => RAW[id] ||= buildPartRaw(id);
    const err = (part, msg) => errors.push({ part, msg });
    const c = spec.case && get(spec.case), mb = spec.mobo && get(spec.mobo), cp = spec.cpu && get(spec.cpu), co = spec.cooler && get(spec.cooler);
    const rm = spec.ram && get(spec.ram), gp = spec.gpu && get(spec.gpu), ps = spec.psu && get(spec.psu);
    if (mb && cp) {
      const a = portOf(mb, "cpu").meta.socket, b = portOf(cp, "socket").meta.socket;
      if (a !== b) err(spec.cpu, `CPU-Sockel ${b.toUpperCase()} passt nicht auf Mainboard-Sockel ${a.toUpperCase()}`);
    }
    if (cp && co) {
      const b = portOf(cp, "ihs").meta.socket, base = co.userData.members ? co.userData.members[0].ports[0] : portOf(co, "base");
      if (!base.meta.sockets.includes(b)) err(spec.cooler, `Kuehler unterstuetzt Sockel ${b.toUpperCase()} nicht`);
    }
    if (mb && rm) {
      const n = rm.userData.members.length, st = rm.userData.members[0].ports[0].meta.ddr, d = mb.userData.dims;
      if (st !== d.ddr) err(spec.ram, `DDR${st}-Speicher passt nicht in DDR${d.ddr}-Slots`);
      else if (!DIMM_PICK[n] || !DIMM_PICK[n][d.dimm]) err(spec.ram, `${n} Riegel passen nicht auf ${d.dimm} Slots`);
    }
    if (c && mb) {
      const f = portOf(mb, "board").meta.form;
      if (!portOf(c, "mobo").meta.forms.includes(f)) err(spec.mobo, `Formfaktor ${f} passt nicht ins Gehaeuse`);
    }
    if (c && ps && !portOf(c, "psu").meta.forms.includes("atx")) err(spec.psu, "Netzteil-Formfaktor passt nicht");
    if (c && co && co.userData.dims.kind === "aio") {
      const mx = c.userData.dims.radMax, r = co.userData.dims.rad;
      if (!mx) err(spec.cooler, "Gehaeuse hat keinen Radiatorplatz");
      else if (r > mx) err(spec.cooler, `${r} mm Radiator passt nicht (max. ${mx} mm)`);
    }
    if (mb && gp && !portsOf(mb, "host", "pcie").some((p) => p.meta.primary)) err(spec.gpu, "Mainboard hat keinen x16-Slot");
    const ss = [].concat(spec.ssd || []);
    if (mb && ss.length) {
      let m22 = 0, sata2 = 0;
      ss.forEach((id) => get(id).userData.ports[0].kind === "m2" ? m22++ : sata2++);
      if (m22 > mb.userData.dims.m2) err(ss.find((id) => get(id).userData.ports[0].kind === "m2"), `Nur ${mb.userData.dims.m2} M.2-Slots vorhanden`);
      if (sata2 > 2) err(ss.find((id) => get(id).userData.ports[0].kind !== "m2"), "Nur 2 SATA-Schaechte im Gehaeuse");
    }
    if (opts.maxSsd && ss.length > opts.maxSsd) err(ss[opts.maxSsd], `Nur ${opts.maxSsd} SSD im Spiel verbaubar`);
    return { errors, warnings, ok: errors.length === 0 };
  }
  var box = (o) => {
    const b = new THREE6.Box3().setFromObject(o);
    return { min: [b.min.x, b.min.y, b.min.z], max: [b.max.x, b.max.y, b.max.z] };
  };
  var overlap = (a, b, tol = 0) => [0, 1, 2].map((i) => Math.min(a.max[i], b.max[i]) - Math.max(a.min[i], b.min[i]) - tol);
  function partBox(p) {
    const bd = p.obj.userData.body;
    if (!bd) return box(p.obj);
    const m = p.obj.userData.world, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    for (let k = 0; k < 8; k++) {
      const q = point(m, [k & 1 ? bd.max[0] : bd.min[0], k & 2 ? bd.max[1] : bd.min[1], k & 4 ? bd.max[2] : bd.min[2]]);
      for (let i = 0; i < 3; i++) {
        lo[i] = Math.min(lo[i], q[i]);
        hi[i] = Math.max(hi[i], q[i]);
      }
    }
    return { min: lo, max: hi };
  }
  function meshBoxes(o) {
    o.updateMatrixWorld(true);
    const out = [], v = new THREE6.Vector3();
    o.traverse((m) => {
      if (!m.isMesh || !m.visible) return;
      for (let a = m.parent; a; a = a.parent) if (a.userData && a.userData.flex) return;
      const p = m.geometry.attributes ? m.geometry.attributes.position.array : m.geometry.position;
      const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      for (let i = 0; i < p.length; i += 3) {
        v.set(p[i], p[i + 1], p[i + 2]).applyMatrix4(m.matrixWorld);
        lo[0] = Math.min(lo[0], v.x);
        lo[1] = Math.min(lo[1], v.y);
        lo[2] = Math.min(lo[2], v.z);
        hi[0] = Math.max(hi[0], v.x);
        hi[1] = Math.max(hi[1], v.y);
        hi[2] = Math.max(hi[2], v.z);
      }
      out.push({ min: lo, max: hi });
    });
    return out;
  }
  function buildSystem(spec, opts = {}) {
    const root = new THREE6.Group(), parts = [], at2 = {}, byRole = {};
    const add = (role, id, obj, host) => {
      obj.userData.role = role;
      obj.userData.partId = id;
      root.add(obj);
      parts.push({ role, id, obj, host });
      byRole[role] = obj;
      return obj;
    };
    const c = spec.case ? add("case", spec.case, buildPartRaw(spec.case)) : null;
    if (c) {
      c.userData.world = I4();
      place(c, I4());
      if (opts.shroud === false && c.userData.shroud) c.userData.shroud.visible = false;
    }
    const mb = spec.mobo ? add("mobo", spec.mobo, buildPartRaw(spec.mobo)) : null;
    if (mb) {
      if (c) mountPart(c, "mobo", mb, "board");
      else {
        mb.userData.world = I4();
        place(mb, I4());
      }
    }
    const need = (o, port) => o && (o.userData.ports || []).some((p) => p.id === port);
    const cp = mb && spec.cpu ? add("cpu", spec.cpu, buildPartRaw(spec.cpu)) : null;
    if (cp) mountPart(mb, "cpu", cp, "socket");
    if (cp && spec.cooler) {
      const raw = buildPartRaw(spec.cooler);
      if (raw.userData.members) {
        const [bm, rm] = raw.userData.members, blk = add("cooler", spec.cooler + ":block", bm.obj), rad = add("radiator", spec.cooler + ":rad", rm.obj);
        mountPart(cp, "ihs", blk, "base", bm.ports[0]);
        if (c && need(c, "rad-top")) mountPart(c, "rad-top", rad, "rad", rm.ports[0]);
        else {
          rad.userData.world = mul(blk.userData.world, [1, 0, 0, 188, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
          place(rad, rad.userData.world);
        }
        raw.userData.connect(blk.userData.world, rad.userData.world);
        blk.userData.raw = raw;
      } else {
        const co = add("cooler", spec.cooler, raw);
        mountPart(cp, "ihs", co, "base");
      }
    }
    if (mb && spec.ram) {
      const raw = buildPartRaw(spec.ram), mem = raw.userData.members, slots2 = (DIMM_PICK[mem.length] || {})[mb.userData.dims.dimm] || [];
      mem.forEach((m, i) => {
        if (slots2[i] === void 0) return;
        const o = add("ram", spec.ram + "#" + i, m.obj);
        mountPart(mb, "dimm" + slots2[i], o, "stick", m.ports[0]);
      });
    }
    if (mb && spec.gpu) {
      const gp = add("gpu", spec.gpu, buildPartRaw(spec.gpu)), slot = portsOf(mb, "host", "pcie").find((p) => p.meta.primary);
      if (slot) mountPart(mb, slot.id, gp, "pcie");
    }
    if (spec.psu && c) {
      const p = add("psu", spec.psu, buildPartRaw(spec.psu));
      mountPart(c, "psu", p, "body");
    }
    let m22 = 0, sata2 = 0;
    [].concat(spec.ssd || []).forEach((id, i) => {
      const d = buildPartRaw(id), isM2 = d.userData.ports[0].kind === "m2", o = add("ssd", id + "#" + i, d);
      if (isM2 && mb && m22 < mb.userData.dims.m2) {
        const hp = portOf(mb, "m2_" + m22);
        mountPart(mb, hp.id, o, "m2");
        if (hp.shield) hp.shield.visible = false;
        m22++;
      } else if (!isM2 && c) mountPart(c, "sata" + sata2++, o, "bay");
    });
    const group = new THREE6.Group();
    group.add(root);
    group.scale.setScalar(0.01);
    const sys = { root, group, parts, byRole, spec };
    if (opts.cables !== false && c) {
      const cb = buildCables(sys);
      root.add(cb.group);
      sys.cables = cb;
      if (byRole.psu && byRole.psu.userData.stubs) byRole.psu.userData.stubs.visible = false;
    }
    sys.report = checkBuild(sys);
    return sys;
  }
  function checkBuild(sys, tol = 0.6) {
    const errors = [], warnings = [], c = sys.byRole.case, boxes = sys.parts.map((p) => ({ ...p, b: partBox(p) }));
    const name = (p) => p.id;
    if (c) {
      const it = c.userData.interior;
      boxes.filter((p) => p.role !== "case").forEach((p) => {
        const o = [0, 1, 2].map((i) => Math.max(it.min[i] - p.b.min[i], p.b.max[i] - it.max[i]));
        if (o.some((v) => v > tol)) errors.push({ part: name(p), msg: `ragt ${o.map((v, i) => v > tol ? "xyz"[i] + " " + v.toFixed(1) + " mm" : null).filter(Boolean).join(", ")} aus dem Gehaeuse-Innenraum` });
      });
      (c.userData.keepout || []).forEach((k) => boxes.forEach((p) => {
        if (p.role === "case" || p.role === "mobo") return;
        if (!overlap(p.b, k).every((v) => v > 1)) return;
        if (meshBoxes(p.obj).some((x) => overlap(x, k).every((v) => v > 1))) errors.push({ part: name(p), msg: `kollidiert mit ${k.n}` });
      }));
    }
    const skip = (a, b) => a.role === "case" || b.role === "case" || a.role === "mobo" || b.role === "mobo" || a.role === "ram" && b.role === "ram" || a.role === "cooler" && b.role === "radiator" || a.role === "radiator" && b.role === "cooler";
    const mb = /* @__PURE__ */ new Map();
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (skip(a, b)) continue;
      const o = overlap(a.b, b.b);
      if (!o.every((v) => v > 0.5)) continue;
      const ma = mb.get(a) || (mb.set(a, meshBoxes(a.obj)), mb.get(a)), mbb = mb.get(b) || (mb.set(b, meshBoxes(b.obj)), mb.get(b));
      let worst = null;
      for (const x of ma) {
        if (!overlap(x, b.b).every((v) => v > 0.5)) continue;
        for (const y of mbb) {
          const q = overlap(x, y);
          if (q.every((v) => v > 0.5)) {
            const dep = Math.min(...q);
            if (!worst || dep > worst.dep) worst = { dep, q };
          }
        }
      }
      if (worst) errors.push({ part: name(a) + " / " + name(b), msg: `Ueberschneidung ${worst.q.map((v) => v.toFixed(1)).join(" x ")} mm` });
    }
    return { ok: errors.length === 0, errors, warnings };
  }

  // entry.js
  var w = typeof window !== "undefined" ? window : globalThis;
  w.Parts3D = w.Parts3D || {};
  w.Parts3D.Claude = {
    version: "2026-10-28",
    buildPartRaw,
    buildPart,
    CATALOG,
    CATS,
    byId,
    brandOf,
    buildSystem,
    compat,
    checkBuild,
    mountPart,
    planCables,
    buildCables,
    buildCable,
    routeContext,
    routePoints,
    plugWorld,
    ...ports_exports
  };
})();
