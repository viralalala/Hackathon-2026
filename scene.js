/**
 * scene.js — Cognito landing page animations
 */
'use strict';

const isMobile = () => window.innerWidth <= 768;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

(function initCursor(){
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if(!dot || !ring) return;

  let mx = 0, my = 0, lagX = 0, lagY = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  (function animRing(){
    lagX += (mx - lagX) * .1;
    lagY += (my - lagY) * .1;
    ring.style.left  = lagX + 'px';
    ring.style.top   = lagY + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .svc-item, .a-card, .how-step, .why-stat').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

(function initHeroScene(){
  if(isMobile() || prefersReducedMotion()) return;

  const canvas = document.getElementById('scene-canvas');
  if(!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 14);

  const COUNT = 800;
  const positions = new Float32Array(COUNT * 3);
  const colors    = new Float32Array(COUNT * 3);
  const speeds    = new Float32Array(COUNT);

  for(let i = 0; i < COUNT; i++){
    positions[i*3]   = (Math.random() - .5) * 60;
    positions[i*3+1] = (Math.random() - .5) * 40;
    positions[i*3+2] = (Math.random() - .5) * 30;

    const t = Math.random();
    colors[i*3]   = .45 + t * .25;
    colors[i*3+1] = .58 + t * .3;
    colors[i*3+2] = .52 + t * .3;

    speeds[i] = .06 + Math.random() * .28;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: .08,
    vertexColors: true,
    transparent: true,
    opacity: .45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  const orbGeo = new THREE.SphereGeometry(2, 48, 48);
  const orbMat = new THREE.MeshPhongMaterial({
    color: 0x7A9E8A,
    emissive: 0x3D6B55,
    emissiveIntensity: .22,
    transparent: true,
    opacity: .12,
    shininess: 60,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.set(-3, .5, 0);
  scene.add(orb);

  scene.add(new THREE.AmbientLight(0xffffff, .4));
  const light1 = new THREE.PointLight(0x7A9E8A, 1.8, 30);
  light1.position.set(-3, 2, 5);
  scene.add(light1);

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientY / innerHeight - .5) * .4;
    targetY = (e.clientX / innerWidth  - .5) * .6;
  });

  window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  });

  let t = 0;
  (function loop(){
    requestAnimationFrame(loop);
    t += .005;

    const pa = pts.geometry.attributes.position.array;
    for(let i = 0; i < COUNT; i++){
      pa[i*3+1] += .0014 * speeds[i];
      if(pa[i*3+1] > 20) pa[i*3+1] = -20;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y += .0003;

    const s = 1 + .04 * Math.sin(t * .7);
    orb.scale.setScalar(s);

    currentX += (targetX - currentX) * .04;
    currentY += (targetY - currentY) * .04;
    scene.rotation.x = currentX;
    scene.rotation.y = currentY;

    renderer.render(scene, camera);
  })();
})();

(function card1Canvas(){
  const wrap = document.getElementById('vis1');
  if(!wrap) return;

  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const blobs = [
    { ox: 0,   oy: 0,   sp: .24 },
    { ox: 1.2, oy: .8,  sp: .36 },
    { ox: 2.4, oy: 1.6, sp: .2  },
    { ox: 3.6, oy: .4,  sp: .3  },
    { ox: 4.8, oy: 1.1, sp: .28 },
  ];

  let t = 0;
  (function loop(){
    requestAnimationFrame(loop);
    t += .018;

    const w = wrap.offsetWidth, h = wrap.offsetHeight;
    canvas.width = w; canvas.height = h;

    ctx.fillStyle = '#EDE8E0';
    ctx.fillRect(0, 0, w, h);

    blobs.forEach((b, i) => {
      const x = w * (.1 + i * .18) + Math.sin(t * b.sp + b.ox) * 18;
      const y = h * .5 + Math.cos(t * b.sp + b.oy) * 12;
      const r = (22 + i * 9) * (1 + .1 * Math.sin(t * .7 + i));
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(122,158,138,${.24 - i * .03})`);
      g.addColorStop(1, 'rgba(122,158,138,0)');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
  })();
})();

(function card2Canvas(){
  const wrap = document.getElementById('vis2');
  if(!wrap) return;

  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const waves = [
    { a: 20, f: .016, s: .9,  col: 'rgba(122,158,138,.5)',  lw: 2.2 },
    { a: 12, f: .024, s: .6,  col: 'rgba(168,196,180,.4)',  lw: 1.5 },
    { a: 28, f: .011, s: 1.3, col: 'rgba(90,120,100,.25)',  lw: 1.8 },
  ];

  let t = 0;
  (function loop(){
    requestAnimationFrame(loop);
    t += .02;

    const w = wrap.offsetWidth, h = wrap.offsetHeight;
    canvas.width = w; canvas.height = h;

    ctx.fillStyle = '#E8EEE8';
    ctx.fillRect(0, 0, w, h);

    waves.forEach(wv => {
      ctx.beginPath();
      for(let x = 0; x <= w; x += 2){
        const y = h/2 + wv.a * Math.sin(x * wv.f + t * wv.s) * Math.sin(x * .007 + t * .25);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = wv.col;
      ctx.lineWidth = wv.lw;
      ctx.stroke();
    });

    for(let i = 0; i < 6; i++){
      const x = w / 5 * i;
      const y = h/2 + 20 * Math.sin(x * .016 + t) * Math.sin(x * .007 + t * .25);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, 'rgba(122,158,138,.3)');
      g.addColorStop(1, 'rgba(122,158,138,0)');
      ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(92,125,108,.85)'; ctx.fill();
    }
  })();
})();

(function servicesOrb(){
  const wrap = document.getElementById('svcOrb');
  if(!wrap) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let t = 0;
  (function loop(){
    requestAnimationFrame(loop);
    t += .014;

    const w = wrap.offsetWidth, h = wrap.offsetHeight;
    canvas.width = w; canvas.height = h;

    ctx.fillStyle = 'rgba(232,240,235,.6)';
    ctx.fillRect(0, 0, w, h);

    const cx = w/2, cy = h/2;

    for(let i = 0; i < 4; i++){
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * (.3 - i * .06) + i * Math.PI / 4);
      ctx.beginPath();
      ctx.ellipse(0, 0, 48 + i * 28, (48 + i * 28) * .38, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(122,158,138,${.28 - i * .05})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    const gr = h * .15 * (1 + .06 * Math.sin(t));
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
    g.addColorStop(0, 'rgba(122,158,138,.6)');
    g.addColorStop(.5, 'rgba(168,196,180,.2)');
    g.addColorStop(1, 'rgba(122,158,138,0)');
    ctx.beginPath(); ctx.arc(cx, cy, gr, 0, Math.PI*2);
    ctx.fillStyle = g; ctx.fill();

    const sg = ctx.createRadialGradient(cx - gr*.28, cy - gr*.28, 0, cx, cy, gr*.45);
    sg.addColorStop(0, 'rgba(255,255,255,.28)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath(); ctx.arc(cx, cy, gr, 0, Math.PI*2);
    ctx.fillStyle = sg; ctx.fill();

    for(let i = 0; i < 5; i++){
      const a = t * .7 + i * (Math.PI * 2 / 5);
      const dist = h * .28;
      const dx = cx + Math.cos(a) * dist;
      const dy = cy + Math.sin(a) * dist * .48;
      const ds = 3 + 2 * Math.sin(t * 1.8 + i);
      ctx.beginPath(); ctx.arc(dx, dy, ds, 0, Math.PI*2);
      ctx.fillStyle = `rgba(122,158,138,${.5 + .25 * Math.sin(t + i)})`;
      ctx.fill();
    }
  })();
})();

const nav = document.getElementById('mainNav');
if(nav){
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 40);
  }, { passive: true });
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -36px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

['div1','div2','div3','div4'].forEach(id => {
  const d = document.getElementById(id);
  if(!d) return;
  d.style.width = '0px';
  new IntersectionObserver(([e]) => {
    if(e.isIntersecting){ d.style.width = '100%'; d.classList.add('lit'); }
  }, { threshold: .5 }).observe(d);
});

const heroCard = document.getElementById('heroCard');
if(heroCard && !isMobile()){
  heroCard.addEventListener('mousemove', e => {
    const r = heroCard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    heroCard.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 6}deg)`;
  });
  heroCard.addEventListener('mouseleave', () => {
    heroCard.style.transform = '';
  });
}

document.querySelectorAll('.svc-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.svc-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

const footerBrand = document.getElementById('footerBrand');
if(footerBrand){
  new IntersectionObserver(([e]) => {
    if(e.isIntersecting) footerBrand.classList.add('visible');
  }, { threshold: .2 }).observe(footerBrand);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if(id === '#') return;
    const el = document.querySelector(id);
    if(!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 72, behavior: 'smooth' });
  });
});
