import * as PIXI from 'pixi.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const GRAVITY = 800;
const MAX_PARTICLES = 50000;

// ─── Weapon Definitions ──────────────────────────────────────────────────────
const WEAPONS = {
  revolver: {
    name: 'REVOLVER',
    fireRate: 400,
    auto: false,
    bulletsPerShot: 1,
    spread: 0,
    screenShake: 10,
    muzzleFlashScale: 1.5,
    glowRadius: 40,
    glowIntensity: 1.0,
    trailWidth: 2.5,
    trailColor: 0xFFCC44,
    trailDecay: 4,
    impact: {
      craterRadius: 30,
      craterCount: 3,
      scorchRadius: 60,
      crackCount: 7,
      crackLenMin: 80,
      crackLenMax: 220,
      crackWidth: 3.5,
      debrisCount: 55,
      sparkCount: 40,
      smokeCount: 18,
      shrapnelCount: 12,
      debrisSpeedMin: 200,
      debrisSpeedMax: 700,
      sparkSpeedMin: 300,
      sparkSpeedMax: 900,
      colors: [0xFF6600, 0xFF4400, 0xFF8800, 0xFFAA00, 0xFFCC00, 0xFFFFFF],
      sparkColors: [0xFFFF00, 0xFFDD00, 0xFFFFFF, 0xFFAA00],
    }
  },
  chaingun: {
    name: 'CHAINGUN',
    fireRate: 25,
    auto: true,
    bulletsPerShot: 2,
    spread: 80,
    gaussianSpread: true,
    screenShake: 2,
    muzzleFlashScale: 0.6,
    glowRadius: 10,
    glowIntensity: 0.5,
    trailWidth: 1,
    trailColor: 0xFFFF88,
    trailDecay: 15,
    impact: {
      craterRadius: 7,
      craterCount: 1,
      scorchRadius: 14,
      crackCount: 0,
      debrisCount: 6,
      sparkCount: 3,
      smokeCount: 2,
      shrapnelCount: 1,
      debrisSpeedMin: 100,
      debrisSpeedMax: 350,
      sparkSpeedMin: 150,
      sparkSpeedMax: 400,
      colors: [0xAAAAAA, 0x999999, 0x888888, 0x777777, 0xBBBBBB, 0xCCCCCC],
      sparkColors: [0xDDDDDD, 0xFFFFFF, 0xBBBBBB],
    }
  },
  flameshot: {
    name: 'FLAMESHOT',
    fireRate: 350,
    auto: true,
    bulletsPerShot: 7,          // shotgun spread
    spread: 80,                 // wide cone
    screenShake: 14,
    muzzleFlashScale: 2.0,
    glowRadius: 50,
    glowIntensity: 1.0,
    trailWidth: 3,
    trailColor: 0xFF6600,
    trailDecay: 6,
    impact: {
      craterRadius: 10,
      craterCount: 1,
      scorchRadius: 30,
      crackCount: 0,
      debrisCount: 5,
      sparkCount: 8,
      smokeCount: 4,
      shrapnelCount: 0,
      debrisSpeedMin: 80,
      debrisSpeedMax: 250,
      sparkSpeedMin: 100,
      sparkSpeedMax: 300,
      // Fire palette
      colors: [0xFF4400, 0xFF6600, 0xFF8800, 0xFFAA00, 0xFFCC00],
      sparkColors: [0xFFFF00, 0xFFDD00, 0xFFAA00, 0xFFFFFF],
      // Flameshot-specific
      fireCount: 3,             // lasting fires per pellet
      fireDuration: 4.0,        // seconds the main fire burns
      fireRadius: 12,           // visual size of main fire
      wandererInterval: 0.8,    // seconds between spawning wandering flames
      wandererCount: 1,         // wanderers spawned per interval
    }
  },
  missile: {
    name: 'MISSILE',
    fireRate: 1500,             // slow fire rate
    auto: false,
    bulletsPerShot: 1,
    spread: 0,
    screenShake: 25,
    muzzleFlashScale: 1.0,
    glowRadius: 80,
    glowIntensity: 1.0,
    trailWidth: 0,              // no instant trail — missile has its own smoke trail
    trailColor: 0,
    trailDecay: 0,
    impact: {
      craterRadius: 60,
      craterCount: 5,
      scorchRadius: 120,
      crackCount: 8,
      crackLenMin: 60,
      crackLenMax: 200,
      crackWidth: 3,
      debrisCount: 60,
      sparkCount: 50,
      smokeCount: 25,
      shrapnelCount: 15,
      debrisSpeedMin: 300,
      debrisSpeedMax: 900,
      sparkSpeedMin: 400,
      sparkSpeedMax: 1200,
      colors: [0xFF6600, 0xFF4400, 0xFF8800, 0xFFAA00, 0xFFCC00, 0xFFFFFF, 0xCCCCCC, 0x888888],
      sparkColors: [0xFFFF00, 0xFFDD00, 0xFFFFFF, 0xFFAA00, 0xFF8800],
      // Missile-specific
      fireCount: 6,
      fireDuration: 2.5,
      fireRadius: 8,
      ringParticles: 40,        // particles in the expanding ring
      ringSpeed: 600,           // ring expansion speed
    }
  },
  laser: {
    name: 'LASER',
    fireRate: 16,               // ~60 Hz continuous beam
    auto: true,
    bulletsPerShot: 1,
    spread: 0,
    screenShake: 0.3,
    muzzleFlashScale: 0.3,
    glowRadius: 18,
    glowIntensity: 1.0,
    trailWidth: 0,
    trailColor: 0,
    trailDecay: 0,
    impact: {
      craterRadius: 0,
      craterCount: 0,
      scorchRadius: 0,
      crackCount: 0,
      debrisCount: 0,
      sparkCount: 2,
      smokeCount: 0,
      shrapnelCount: 0,
      debrisSpeedMin: 0,
      debrisSpeedMax: 0,
      sparkSpeedMin: 100,
      sparkSpeedMax: 250,
      colors: [],
      sparkColors: [0x00FFFF, 0x44FFFF, 0xFFFFFF, 0x00CCFF],
      // Laser-specific
      beamWidth: 3,
      beamColor: 0x00DDFF,
      beamGlowWidth: 12,
      beamGlowColor: 0x0066FF,
    }
  },
  paintball: {
    name: 'PAINTBALL',
    fireRate: 120,              // medium-high rate
    auto: true,
    bulletsPerShot: 1,
    spread: 15,
    screenShake: 3,
    muzzleFlashScale: 0.4,
    glowRadius: 0,              // no glow
    glowIntensity: 0,
    trailWidth: 3,
    trailColor: 0xFFFFFF,       // overridden per shot
    trailDecay: 10,
    impact: {
      craterRadius: 0,
      craterCount: 0,
      scorchRadius: 0,
      crackCount: 0,
      debrisCount: 0,
      sparkCount: 0,
      smokeCount: 0,
      shrapnelCount: 0,
      debrisSpeedMin: 0,
      debrisSpeedMax: 0,
      sparkSpeedMin: 0,
      sparkSpeedMax: 0,
      colors: [],
      sparkColors: [],
      // Paintball-specific
      splatRadius: 60,          // base radius of the paint blob
      dripCount: 4,             // drips that slide down
      blobCount: 5,             // jiggling expansion blobs
    }
  }
};

// ─── Bright Color Generator ──────────────────────────────────────────────────
function randomBrightColor() {
  const hue = Math.random() * 360;
  const s = 0.8 + Math.random() * 0.2;  // 80-100% saturation
  const l = 0.5 + Math.random() * 0.15; // 50-65% lightness
  // HSL to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;
  if (hue < 60) { r = c; g = x; b = 0; }
  else if (hue < 120) { r = x; g = c; b = 0; }
  else if (hue < 180) { r = 0; g = c; b = x; }
  else if (hue < 240) { r = 0; g = x; b = c; }
  else if (hue < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);
  return (ri << 16) | (gi << 8) | bi;
}

// ─── State ───────────────────────────────────────────────────────────────────
let app, decalTexture, decalSprite;
let glowTexture, glowSprite;
let glowCoolOverlay;
let currentWeapon = 'revolver';
let lastFireTime = 0;
let mouseDown = false;
let mouseX = 0, mouseY = 0;
let shakeX = 0, shakeY = 0;
let shakeDecay = 0;
let gameContainer;
let crosshairGfx;
let hudText, particleCountText;
let muzzleFlashGfx;
let muzzleFlashTimer = 0;
let bulletTrailGfx;
let bulletTrails = [];
let missiles = [];     // active guided missiles [{x, y, vx, vy, age, trailTimer}]
let missileGfx;        // Graphics object for drawing missiles
let screenW, screenH;

// Particle data (SoA for performance)
// Types: d=debris, s=spark, m=smoke, f=flash, e=ember, x=shrapnel
//        F=lasting fire, w=wandering flame, B=paint blob, P=paint drip
//        R=ring particle (missile explosion ring)
let pType = [];
let pX = [];
let pY = [];
let pVx = [];
let pVy = [];
let pSize = [];
let pColor = [];
let pAlpha = [];
let pLife = [];
let pAge = [];
let pGravity = [];
let pTrail = [];    // multipurpose timer (shrapnel trail, fire spawn, wander direction change)
let pExtra = [];    // extra data (wanderer: current heading angle)
let pCount = 0;

// PixiJS particle system
let particleContainer;
let dotTexture;
let pixiParticles = [];

// ─── Boot ────────────────────────────────────────────────────────────────────
async function init() {
  const displayInfo = await window.electronAPI.getDisplayInfo();
  const screenshotDataUrl = await window.electronAPI.getScreenshot();
  screenW = displayInfo.width;
  screenH = displayInfo.height;

  app = new PIXI.Application();
  await app.init({
    width: screenW,
    height: screenH,
    backgroundColor: 0x000000,
    antialias: false,
    resolution: 1,
    autoDensity: true,
  });

  document.getElementById('loading').remove();
  document.body.appendChild(app.canvas);

  gameContainer = new PIXI.Container();
  app.stage.addChild(gameContainer);

  // Desktop screenshot background
  const bgTexture = await PIXI.Assets.load(screenshotDataUrl);
  const screenshotSprite = new PIXI.Sprite(bgTexture);
  screenshotSprite.width = screenW;
  screenshotSprite.height = screenH;
  gameContainer.addChild(screenshotSprite);

  // Decal layer (permanent scorch/crater/crack/ash marks)
  decalTexture = PIXI.RenderTexture.create({ width: screenW, height: screenH, resolution: 1 });
  decalSprite = new PIXI.Sprite(decalTexture);
  gameContainer.addChild(decalSprite);

  // Glow layer (hot marks that cool to black, rendered additively)
  glowTexture = PIXI.RenderTexture.create({ width: screenW, height: screenH, resolution: 1 });
  glowSprite = new PIXI.Sprite(glowTexture);
  glowSprite.blendMode = 'add';
  gameContainer.addChild(glowSprite);

  glowCoolOverlay = new PIXI.Graphics();

  // Dot texture for particles
  const dotGfx = new PIXI.Graphics();
  dotGfx.circle(0, 0, 8);
  dotGfx.fill({ color: 0xFFFFFF });
  dotTexture = app.renderer.generateTexture(dotGfx);
  dotGfx.destroy();

  // Bullet trail graphics
  bulletTrailGfx = new PIXI.Graphics();
  bulletTrailGfx.blendMode = 'add';
  gameContainer.addChild(bulletTrailGfx);

  // Missile graphics (drawn each frame)
  missileGfx = new PIXI.Graphics();
  gameContainer.addChild(missileGfx);

  // Particle container (GPU-batched)
  particleContainer = new PIXI.ParticleContainer({
    dynamicProperties: {
      position: true,
      scale: true,
      tint: true,
      alpha: true,
      rotation: true,
    },
  });
  gameContainer.addChild(particleContainer);

  // Muzzle flash (on stage so it doesn't shake)
  muzzleFlashGfx = new PIXI.Graphics();
  muzzleFlashGfx.visible = false;
  app.stage.addChild(muzzleFlashGfx);

  // Crosshair
  crosshairGfx = new PIXI.Graphics();
  drawCrosshair();
  app.stage.addChild(crosshairGfx);

  // HUD
  hudText = new PIXI.Text({
    text: getHudString(),
    style: {
      fontFamily: 'Consolas, monospace',
      fontSize: 20,
      fill: 0xFFFFFF,
      stroke: { color: 0x000000, width: 4 },
    }
  });
  hudText.x = 20;
  hudText.y = screenH - 50;
  app.stage.addChild(hudText);

  particleCountText = new PIXI.Text({
    text: '',
    style: {
      fontFamily: 'Consolas, monospace',
      fontSize: 14,
      fill: 0xAAAAAA,
      stroke: { color: 0x000000, width: 3 },
    }
  });
  particleCountText.x = 20;
  particleCountText.y = screenH - 25;
  app.stage.addChild(particleCountText);

  setupInput();
  app.ticker.add(gameLoop);
}

// ─── Input ───────────────────────────────────────────────────────────────────
function setupInput() {
  app.canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { mouseDown = true; tryFire(); }
  });
  app.canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouseDown = false;
  });
  app.canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  app.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (e.key === '1') { currentWeapon = 'revolver'; updateHud(); drawCrosshair(); }
    if (e.key === '2') { currentWeapon = 'chaingun'; updateHud(); drawCrosshair(); }
    if (e.key === '3') { currentWeapon = 'flameshot'; updateHud(); drawCrosshair(); }
    if (e.key === '4') { currentWeapon = 'paintball'; updateHud(); drawCrosshair(); }
    if (e.key === '5') { currentWeapon = 'missile'; updateHud(); drawCrosshair(); }
    if (e.key === '6') { currentWeapon = 'laser'; updateHud(); drawCrosshair(); }
    if (e.key === 'Escape') window.close();
  });
}

// ─── Crosshair ───────────────────────────────────────────────────────────────
function drawCrosshair() {
  crosshairGfx.clear();
  if (currentWeapon === 'revolver') {
    crosshairGfx.circle(0, 0, 16);
    crosshairGfx.stroke({ width: 2, color: 0xFF3300 });
    for (const [x1, y1, x2, y2] of [[-22,0,-8,0],[8,0,22,0],[0,-22,0,-8],[0,8,0,22]]) {
      crosshairGfx.moveTo(x1, y1);
      crosshairGfx.lineTo(x2, y2);
      crosshairGfx.stroke({ width: 2, color: 0xFF3300 });
    }
    crosshairGfx.circle(0, 0, 2);
    crosshairGfx.fill({ color: 0xFF3300 });
  } else if (currentWeapon === 'chaingun') {
    crosshairGfx.circle(0, 0, 10);
    crosshairGfx.stroke({ width: 1.5, color: 0x00FF66 });
    crosshairGfx.circle(0, 0, 25);
    crosshairGfx.stroke({ width: 1, color: 0x00FF66, alpha: 0.3 });
    crosshairGfx.circle(0, 0, 1.5);
    crosshairGfx.fill({ color: 0x00FF66 });
  } else if (currentWeapon === 'flameshot') {
    // Flameshot: wide shotgun cone crosshair
    crosshairGfx.circle(0, 0, 6);
    crosshairGfx.fill({ color: 0xFF6600, alpha: 0.6 });
    crosshairGfx.circle(0, 0, 40);
    crosshairGfx.stroke({ width: 1.5, color: 0xFF6600, alpha: 0.4 });
    crosshairGfx.circle(0, 0, 60);
    crosshairGfx.stroke({ width: 1, color: 0xFF4400, alpha: 0.2 });
    // Pellet dots
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      crosshairGfx.circle(Math.cos(a) * 30, Math.sin(a) * 30, 2);
      crosshairGfx.fill({ color: 0xFF8800, alpha: 0.5 });
    }
  } else if (currentWeapon === 'laser') {
    // Laser: small bright dot with faint rings
    crosshairGfx.circle(0, 0, 2);
    crosshairGfx.fill({ color: 0x00FFFF });
    crosshairGfx.circle(0, 0, 8);
    crosshairGfx.stroke({ width: 1, color: 0x00DDFF, alpha: 0.5 });
    crosshairGfx.circle(0, 0, 14);
    crosshairGfx.stroke({ width: 0.5, color: 0x0088FF, alpha: 0.25 });
  } else if (currentWeapon === 'missile') {
    // Missile: targeting reticle
    crosshairGfx.circle(0, 0, 20);
    crosshairGfx.stroke({ width: 2, color: 0xFF0000, alpha: 0.6 });
    crosshairGfx.circle(0, 0, 30);
    crosshairGfx.stroke({ width: 1, color: 0xFF0000, alpha: 0.3 });
    // Targeting lines
    for (const [x1, y1, x2, y2] of [[-35,0,-22,0],[22,0,35,0],[0,-35,0,-22],[0,22,0,35]]) {
      crosshairGfx.moveTo(x1, y1);
      crosshairGfx.lineTo(x2, y2);
      crosshairGfx.stroke({ width: 1.5, color: 0xFF0000, alpha: 0.5 });
    }
    // Diamond center
    crosshairGfx.moveTo(0, -5);
    crosshairGfx.lineTo(5, 0);
    crosshairGfx.lineTo(0, 5);
    crosshairGfx.lineTo(-5, 0);
    crosshairGfx.closePath();
    crosshairGfx.stroke({ width: 1.5, color: 0xFF3300 });
  } else {
    // Paintball: colorful splat crosshair
    crosshairGfx.circle(0, 0, 12);
    crosshairGfx.fill({ color: 0xFF00FF, alpha: 0.4 });
    crosshairGfx.circle(0, 0, 12);
    crosshairGfx.stroke({ width: 2, color: 0xFFFFFF, alpha: 0.6 });
    crosshairGfx.circle(3, -3, 5);
    crosshairGfx.fill({ color: 0x00FFFF, alpha: 0.3 });
    crosshairGfx.circle(-4, 4, 4);
    crosshairGfx.fill({ color: 0xFFFF00, alpha: 0.3 });
    crosshairGfx.circle(0, 0, 2);
    crosshairGfx.fill({ color: 0xFFFFFF });
  }
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function getHudString() {
  return `[1] REVOLVER  [2] CHAINGUN  [3] FLAMESHOT  [4] PAINTBALL  [5] MISSILE  [6] LASER  |  ${WEAPONS[currentWeapon].name}  |  [ESC] Quit`;
}
function updateHud() {
  if (hudText) hudText.text = getHudString();
}

// ─── Firing ──────────────────────────────────────────────────────────────────
function tryFire() {
  const now = performance.now();
  const weapon = WEAPONS[currentWeapon];
  if (now - lastFireTime < weapon.fireRate) return;
  lastFireTime = now;

  for (let b = 0; b < weapon.bulletsPerShot; b++) {
    let offX, offY;
    if (weapon.gaussianSpread) {
      // Box-Muller gaussian — most shots cluster near center, occasional wild outliers
      const u1 = Math.random() || 1e-10;
      const u2 = Math.random();
      const mag = Math.sqrt(-2 * Math.log(u1));
      offX = mag * Math.cos(2 * Math.PI * u2) * weapon.spread * 0.5;
      offY = mag * Math.sin(2 * Math.PI * u2) * weapon.spread * 0.5;
    } else {
      offX = (Math.random() - 0.5) * weapon.spread * 2;
      offY = (Math.random() - 0.5) * weapon.spread * 2;
    }
    fireOneRound(mouseX + offX, mouseY + offY, weapon);
  }

  // Flameshot: lava spray from muzzle (once per trigger, not per pellet)
  if (weapon === WEAPONS.flameshot) {
    spawnLavaSpray(screenW / 2, screenH, mouseX, mouseY);
  }
}

function fireOneRound(x, y, weapon) {
  const shakeAngle = Math.random() * Math.PI * 2;
  shakeX += Math.cos(shakeAngle) * weapon.screenShake;
  shakeY += Math.sin(shakeAngle) * weapon.screenShake;
  shakeDecay = Math.max(shakeDecay, weapon.screenShake);

  const originX = screenW / 2;
  const originY = screenH;

  const isPaintball = weapon === WEAPONS.paintball;
  const isMissile = weapon === WEAPONS.missile;
  const isLaser = weapon === WEAPONS.laser;
  const shotColor = isPaintball ? randomBrightColor() : 0;

  if (isLaser) {
    // Stamp glowing beam line from origin to target
    stampLaserBeam(originX, originY, x, y, weapon);
    // Bright glow at impact point
    stampGlow(x, y, weapon);
    const imp = weapon.impact;
    // Bright spark shower at impact
    const sparkCount = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < sparkCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 120 + Math.random() * 280;
      const col = imp.sparkColors[(Math.random() * imp.sparkColors.length) | 0];
      addP('s', x, y,
        Math.cos(a) * spd, Math.sin(a) * spd - 60,
        1.5 + Math.random() * 2, col, 1,
        0.1 + Math.random() * 0.2, 0.4, 0);
    }
    // Bright white flash at impact point
    addP('f', x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20,
      3 + Math.random() * 3, 0xFFFFFF, 1, 0.04 + Math.random() * 0.06, 0, 0);
    // Occasional brighter burst
    if (Math.random() < 0.15) {
      for (let i = 0; i < 8; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 200 + Math.random() * 400;
        addP('s', x, y,
          Math.cos(a) * spd, Math.sin(a) * spd - 80,
          1 + Math.random() * 1.5, 0xFFFFFF, 1,
          0.08 + Math.random() * 0.12, 0.3, 0);
      }
    }
    // Faint smoke wisp at impact
    if (Math.random() < 0.2) {
      addP('m', x + (Math.random() - 0.5) * 4, y,
        (Math.random() - 0.5) * 15, -20 - Math.random() * 20,
        2 + Math.random() * 3, 0x555555, 0.15,
        0.3 + Math.random() * 0.3, -0.2, 0);
    }
    return;
  }

  if (isMissile) {
    // Spawn a guided missile — no instant hit
    const dx = x - originX;
    const dy = y - originY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 250;
    missiles.push({
      x: originX,
      y: originY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      age: 0,
      trailTimer: 0,
    });
    // Launch muzzle flash
    showMuzzleFlash(originX, originY - 30, weapon, 0);
    return;
  }

  showMuzzleFlash(x, y, weapon, shotColor);
  spawnBulletTrail(originX, originY, x, y, weapon, shotColor);
  stampImpact(x, y, weapon, shotColor);
  if (!isPaintball) stampGlow(x, y, weapon);
  spawnExplosion(x, y, weapon, shotColor);
}

// ─── Muzzle Flash ────────────────────────────────────────────────────────────
function showMuzzleFlash(x, y, weapon, shotColor) {
  muzzleFlashGfx.clear();
  muzzleFlashGfx.visible = true;
  const s = weapon.muzzleFlashScale;

  // Impact flash
  const ri = 15 * s;
  muzzleFlashGfx.circle(x, y, ri * 0.5);
  muzzleFlashGfx.fill({ color: 0xFFFFFF, alpha: 0.9 });
  muzzleFlashGfx.circle(x, y, ri);
  muzzleFlashGfx.fill({ color: 0xFFAA00, alpha: 0.4 });

  // Muzzle flash at gun origin
  const ox = screenW / 2;
  const oy = screenH;
  const isFlameGun = weapon === WEAPONS.flameshot;

  if (isFlameGun) {
    // Massive lava muzzle blast
    const rm = 70;
    muzzleFlashGfx.circle(ox, oy, rm * 0.3);
    muzzleFlashGfx.fill({ color: 0xFFFFFF, alpha: 0.9 });
    muzzleFlashGfx.circle(ox, oy, rm * 0.5);
    muzzleFlashGfx.fill({ color: 0xFFCC00, alpha: 0.6 });
    muzzleFlashGfx.circle(ox, oy, rm);
    muzzleFlashGfx.fill({ color: 0xFF6600, alpha: 0.35 });
    muzzleFlashGfx.circle(ox, oy, rm * 1.4);
    muzzleFlashGfx.fill({ color: 0xFF2200, alpha: 0.15 });

    // Lava splatter rays — thick, blobby
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
      const len = rm * (0.8 + Math.random() * 2.0);
      const w = 4 + Math.random() * 8;
      muzzleFlashGfx.moveTo(ox, oy);
      muzzleFlashGfx.lineTo(ox + Math.cos(angle) * len, oy + Math.sin(angle) * len);
      muzzleFlashGfx.stroke({ width: w, color: 0xFFAA00, alpha: 0.5 + Math.random() * 0.3 });
      // Blob at tip
      const tipX = ox + Math.cos(angle) * len;
      const tipY = oy + Math.sin(angle) * len;
      muzzleFlashGfx.circle(tipX, tipY, w * 0.8);
      muzzleFlashGfx.fill({ color: 0xFFCC00, alpha: 0.6 });
    }
    muzzleFlashTimer = 90;
  } else if (weapon === WEAPONS.paintball) {
    // Paintball: colored splash at muzzle
    const rm = 20;
    muzzleFlashGfx.circle(ox, oy, rm * 0.3);
    muzzleFlashGfx.fill({ color: 0xFFFFFF, alpha: 0.7 });
    muzzleFlashGfx.circle(ox, oy, rm);
    muzzleFlashGfx.fill({ color: shotColor, alpha: 0.4 });
    // Small colored splatter rays
    for (let i = 0; i < 4; i++) {
      const angle = -Math.PI * 0.2 - Math.random() * Math.PI * 0.6;
      const len = rm * (0.8 + Math.random() * 1.2);
      muzzleFlashGfx.moveTo(ox, oy);
      muzzleFlashGfx.lineTo(ox + Math.cos(angle) * len, oy + Math.sin(angle) * len);
      muzzleFlashGfx.stroke({ width: 3, color: shotColor, alpha: 0.5 });
      // Blob at tip
      muzzleFlashGfx.circle(ox + Math.cos(angle) * len, oy + Math.sin(angle) * len, 3);
      muzzleFlashGfx.fill({ color: shotColor, alpha: 0.6 });
    }
    // Impact flash — colored
    muzzleFlashGfx.circle(x, y, 8);
    muzzleFlashGfx.fill({ color: shotColor, alpha: 0.5 });
    muzzleFlashTimer = 50;
  } else {
    const rm = 25 * s;
    muzzleFlashGfx.circle(ox, oy, rm * 0.4);
    muzzleFlashGfx.fill({ color: 0xFFFFFF, alpha: 0.8 });
    muzzleFlashGfx.circle(ox, oy, rm);
    muzzleFlashGfx.fill({ color: 0xFFAA00, alpha: 0.3 });

    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI * 0.3 - Math.random() * Math.PI * 0.4;
      const len = rm * (1 + Math.random() * 1.5);
      muzzleFlashGfx.moveTo(ox, oy);
      muzzleFlashGfx.lineTo(ox + Math.cos(angle) * len, oy + Math.sin(angle) * len);
      muzzleFlashGfx.stroke({ width: 2 * s, color: 0xFFDD44, alpha: 0.6 });
    }
    muzzleFlashTimer = 60;
  }
}

// ─── Bullet Trail ────────────────────────────────────────────────────────────
function spawnBulletTrail(x1, y1, x2, y2, weapon, shotColor) {
  bulletTrails.push({
    x1, y1, x2, y2,
    alpha: 0.8,
    decay: weapon.trailDecay,
    width: weapon.trailWidth,
    color: shotColor || weapon.trailColor,
  });
}

// ─── Lava Spray (flameshot muzzle effect) ────────────────────────────────────
function spawnLavaSpray(ox, oy, targetX, targetY) {
  // Direction towards target
  const dx = targetX - ox;
  const dy = targetY - oy;
  const baseAngle = Math.atan2(dy, dx);

  // Large molten lava blobs — high velocity towards target
  for (let i = 0; i < 20; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * 0.8;
    const spd = 800 + Math.random() * 1200;
    const sz = 4 + Math.random() * 10;
    const col = [0xFFFF00, 0xFFCC00, 0xFFAA00, 0xFF8800, 0xFF6600, 0xFFFFFF][(Math.random() * 6) | 0];
    addP('L', ox + (Math.random() - 0.5) * 20, oy,
      Math.cos(angle) * spd,
      Math.sin(angle) * spd,
      sz, col, 1, 0.3 + Math.random() * 0.5, 0.3, 0);
  }

  // Smaller fast droplets — even faster, tighter cone
  for (let i = 0; i < 15; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * 1.0;
    const spd = 1200 + Math.random() * 800;
    const col = [0xFFFF00, 0xFFDD00, 0xFFAA00][(Math.random() * 3) | 0];
    addP('L', ox + (Math.random() - 0.5) * 15, oy,
      Math.cos(angle) * spd,
      Math.sin(angle) * spd,
      2 + Math.random() * 4, col, 1, 0.15 + Math.random() * 0.3, 0.3, 0);
  }
}

// ─── Glow Stamp (hot bullet mark) ───────────────────────────────────────────
function stampGlow(x, y, weapon) {
  const stamp = new PIXI.Graphics();
  const r = weapon.glowRadius;
  const I = weapon.glowIntensity;

  if (weapon === WEAPONS.laser) {
    // Laser glow: bright cyan/blue with hot white center
    stamp.circle(x, y, r * 0.15);
    stamp.fill({ color: 0xFFFFFF, alpha: I });
    stamp.circle(x, y, r * 0.35);
    stamp.fill({ color: 0xAAFFFF, alpha: I * 0.8 });
    stamp.circle(x, y, r * 0.6);
    stamp.fill({ color: 0x00DDFF, alpha: I * 0.5 });
    stamp.circle(x, y, r);
    stamp.fill({ color: 0x0066FF, alpha: I * 0.25 });
  } else if (weapon === WEAPONS.flameshot) {
    // Fire glow: larger, more orange
    stamp.circle(x, y, r * 0.15);
    stamp.fill({ color: 0xFFFFFF, alpha: I * 0.8 });
    stamp.circle(x, y, r * 0.35);
    stamp.fill({ color: 0xFFCC00, alpha: I * 0.6 });
    stamp.circle(x, y, r * 0.6);
    stamp.fill({ color: 0xFF6600, alpha: I * 0.4 });
    stamp.circle(x, y, r);
    stamp.fill({ color: 0xFF2200, alpha: I * 0.2 });
  } else {
    stamp.circle(x, y, r * 0.2);
    stamp.fill({ color: 0xFFFFFF, alpha: I });
    stamp.circle(x, y, r * 0.45);
    stamp.fill({ color: 0xFFAA00, alpha: I * 0.7 });
    stamp.circle(x, y, r * 0.75);
    stamp.fill({ color: 0xFF4400, alpha: I * 0.4 });
    stamp.circle(x, y, r);
    stamp.fill({ color: 0xCC1100, alpha: I * 0.2 });
  }

  app.renderer.render({ container: stamp, target: glowTexture, clear: false });
  stamp.destroy();
}

// Stamp glowing laser beam line into the glow texture
function stampLaserBeam(x1, y1, x2, y2, weapon) {
  const imp = weapon.impact;
  const stamp = new PIXI.Graphics();

  // Outer glow — wide, soft
  stamp.moveTo(x1, y1);
  stamp.lineTo(x2, y2);
  stamp.stroke({ width: imp.beamGlowWidth, color: imp.beamGlowColor, alpha: 0.25 });

  // Mid glow
  stamp.moveTo(x1, y1);
  stamp.lineTo(x2, y2);
  stamp.stroke({ width: imp.beamGlowWidth * 0.5, color: imp.beamColor, alpha: 0.5 });

  // Core beam — bright white-cyan
  stamp.moveTo(x1, y1);
  stamp.lineTo(x2, y2);
  stamp.stroke({ width: imp.beamWidth, color: 0xFFFFFF, alpha: 0.8 });

  app.renderer.render({ container: stamp, target: glowTexture, clear: false });
  stamp.destroy();
}

// Stamp a small fire glow (used by lasting fires periodically)
function stampFireGlow(x, y, radius, intensity) {
  const stamp = new PIXI.Graphics();
  stamp.circle(x, y, radius * 0.3);
  stamp.fill({ color: 0xFFCC00, alpha: intensity * 0.5 });
  stamp.circle(x, y, radius * 0.7);
  stamp.fill({ color: 0xFF6600, alpha: intensity * 0.3 });
  stamp.circle(x, y, radius);
  stamp.fill({ color: 0xFF2200, alpha: intensity * 0.15 });
  app.renderer.render({ container: stamp, target: glowTexture, clear: false });
  stamp.destroy();
}

// Stamp paint drip mark
function stampPaintDrip(x, y, radius, color) {
  const stamp = new PIXI.Graphics();
  stamp.circle(x, y, radius);
  stamp.fill({ color, alpha: 0.7 + Math.random() * 0.2 });
  // Slight wet highlight
  stamp.circle(x - radius * 0.2, y - radius * 0.2, radius * 0.3);
  stamp.fill({ color: 0xFFFFFF, alpha: 0.08 });
  app.renderer.render({ container: stamp, target: decalTexture, clear: false });
  stamp.destroy();
}

// Stamp ash mark from wandering flame
function stampAsh(x, y, radius) {
  const stamp = new PIXI.Graphics();
  stamp.circle(x, y, radius);
  stamp.fill({ color: 0x333333, alpha: 0.06 + Math.random() * 0.06 });
  stamp.circle(x, y, radius * 0.5);
  stamp.fill({ color: 0x1a1a1a, alpha: 0.04 });
  app.renderer.render({ container: stamp, target: decalTexture, clear: false });
  stamp.destroy();
}

// Stamp glowing cracks into both the glow layer and the decal layer
function stampCracks(x, y, weapon) {
  const imp = weapon.impact;
  if (!imp.crackCount) return;

  const crackDecal = new PIXI.Graphics();
  const crackGlow = new PIXI.Graphics();

  for (let i = 0; i < imp.crackCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const len = imp.crackLenMin + Math.random() * (imp.crackLenMax - imp.crackLenMin);
    const segments = 3 + Math.floor(Math.random() * 4);
    const w = imp.crackWidth * (0.6 + Math.random() * 0.8);

    let cx = x, cy = y;

    for (let s = 0; s < segments; s++) {
      const segLen = len / segments * (0.6 + Math.random() * 0.8);
      const wobble = (Math.random() - 0.5) * 0.6;
      const segAngle = angle + wobble;
      const nx = cx + Math.cos(segAngle) * segLen;
      const ny = cy + Math.sin(segAngle) * segLen;

      crackDecal.moveTo(cx, cy);
      crackDecal.lineTo(nx, ny);
      crackDecal.stroke({ width: w + 1, color: 0x000000, alpha: 0.9 });

      crackGlow.moveTo(cx, cy);
      crackGlow.lineTo(nx, ny);
      crackGlow.stroke({ width: w + 2, color: 0xFF2200, alpha: 0.6 });
      crackGlow.moveTo(cx, cy);
      crackGlow.lineTo(nx, ny);
      crackGlow.stroke({ width: w * 0.5, color: 0xFFCC00, alpha: 0.8 });

      cx = nx;
      cy = ny;
    }

    if (Math.random() < 0.5) {
      const branchAngle = angle + (Math.random() - 0.5) * 1.5;
      const branchLen = len * 0.3 * Math.random();
      const bx = x + Math.cos(angle) * len * 0.4;
      const by = y + Math.sin(angle) * len * 0.4;
      const bnx = bx + Math.cos(branchAngle) * branchLen;
      const bny = by + Math.sin(branchAngle) * branchLen;

      crackDecal.moveTo(bx, by);
      crackDecal.lineTo(bnx, bny);
      crackDecal.stroke({ width: w * 0.6, color: 0x000000, alpha: 0.8 });

      crackGlow.moveTo(bx, by);
      crackGlow.lineTo(bnx, bny);
      crackGlow.stroke({ width: w * 0.8, color: 0xFF4400, alpha: 0.4 });
    }
  }

  app.renderer.render({ container: crackDecal, target: decalTexture, clear: false });
  app.renderer.render({ container: crackGlow, target: glowTexture, clear: false });
  crackDecal.destroy();
  crackGlow.destroy();
}

// ─── Decals ──────────────────────────────────────────────────────────────────
function stampImpact(x, y, weapon, shotColor) {
  const imp = weapon.impact;
  const stamp = new PIXI.Graphics();
  const isRev = weapon === WEAPONS.revolver;
  const isFlame = weapon === WEAPONS.flameshot;
  const isPaint = weapon === WEAPONS.paintball;
  const isMis = weapon === WEAPONS.missile;

  if (isMis) {
    // ── Missile: massive glowing crater ──
    // Outer blast ring scorch
    stamp.circle(x, y, imp.scorchRadius * 1.2);
    stamp.fill({ color: 0x080808, alpha: 0.4 });
    stamp.circle(x, y, imp.scorchRadius);
    stamp.fill({ color: 0x060606, alpha: 0.6 });
    stamp.circle(x, y, imp.scorchRadius * 0.7);
    stamp.fill({ color: 0x040404, alpha: 0.7 });
    // Multiple overlapping craters for irregular shape
    for (let i = 0; i < imp.craterCount; i++) {
      const ox = (Math.random() - 0.5) * imp.craterRadius * 0.6;
      const oy = (Math.random() - 0.5) * imp.craterRadius * 0.6;
      const cr = imp.craterRadius * (0.5 + Math.random() * 0.5);
      stamp.circle(x + ox, y + oy, cr);
      stamp.fill({ color: 0x000000, alpha: 0.95 });
      // Rim highlight
      stamp.circle(x + ox - cr * 0.15, y + oy - cr * 0.15, cr * 1.05);
      stamp.fill({ color: 0x222222, alpha: 0.15 });
    }
    // Heavy spatter ring
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = imp.scorchRadius * (0.7 + Math.random() * 1.5);
      const sr = 2 + Math.random() * 6;
      stamp.circle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, sr);
      stamp.fill({ color: 0x0a0a0a, alpha: 0.5 + Math.random() * 0.4 });
    }
    app.renderer.render({ container: stamp, target: decalTexture, clear: false });
    stamp.destroy();
    stampCracks(x, y, weapon);
    return;
  } else if (isPaint) {
    // ── Paintball splat: large opaque wet-looking paint blob ──
    const r = imp.splatRadius * (0.8 + Math.random() * 0.4);

    // Main blob — irregular shape from overlapping circles
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r * 0.35;
      const cr = r * (0.5 + Math.random() * 0.4);
      stamp.circle(x + Math.cos(a) * d, y + Math.sin(a) * d, cr);
      stamp.fill({ color: shotColor, alpha: 0.85 + Math.random() * 0.15 });
    }

    // Wet highlight — lighter center blob
    const highlightR = r * 0.25;
    const hOff = r * 0.15;
    stamp.circle(x - hOff, y - hOff, highlightR);
    stamp.fill({ color: 0xFFFFFF, alpha: 0.15 });

    // Satellite splatter dots — smaller blobs flung outward
    const splatCount = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < splatCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = r * (0.8 + Math.random() * 1.5);
      const sr = 2 + Math.random() * 5;
      stamp.circle(x + Math.cos(a) * dist, y + Math.sin(a) * dist, sr);
      stamp.fill({ color: shotColor, alpha: 0.7 + Math.random() * 0.3 });
    }

    // Fine spray dots
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const dist = r * (1.2 + Math.random() * 2.0);
      const sr = 0.5 + Math.random() * 2;
      stamp.circle(x + Math.cos(a) * dist, y + Math.sin(a) * dist, sr);
      stamp.fill({ color: shotColor, alpha: 0.4 + Math.random() * 0.4 });
    }
  } else if (isFlame) {
    // Charred burn mark
    stamp.circle(x, y, imp.scorchRadius);
    stamp.fill({ color: 0x0c0800, alpha: 0.5 });
    stamp.circle(x, y, imp.scorchRadius * 0.5);
    stamp.fill({ color: 0x060400, alpha: 0.6 });
    // Blackened center
    stamp.circle(x, y, imp.craterRadius);
    stamp.fill({ color: 0x020100, alpha: 0.7 });
  } else {
    // Outer scorch
    stamp.circle(x, y, imp.scorchRadius);
    stamp.fill({ color: 0x080808, alpha: 0.6 });
    // Inner scorch
    stamp.circle(x, y, imp.scorchRadius * 0.6);
    stamp.fill({ color: 0x040404, alpha: 0.5 });
    // Craters
    for (let i = 0; i < imp.craterCount; i++) {
      const ox = (Math.random() - 0.5) * imp.craterRadius * 0.5;
      const oy = (Math.random() - 0.5) * imp.craterRadius * 0.5;
      const cr = imp.craterRadius * (0.5 + Math.random() * 0.5);
      stamp.circle(x + ox, y + oy, cr);
      stamp.fill({ color: 0x000000, alpha: 0.9 });
      if (isRev) {
        stamp.circle(x + ox - cr * 0.2, y + oy - cr * 0.2, cr * 1.05);
        stamp.fill({ color: 0x222222, alpha: 0.2 });
      }
    }
    // Spatter
    const spatterCount = isRev ? 6 + Math.floor(Math.random() * 5) : 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < spatterCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = imp.scorchRadius * (0.8 + Math.random() * 1.5);
      const sr = isRev ? 2 + Math.random() * 4 : 1 + Math.random() * 2;
      stamp.circle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, sr);
      stamp.fill({ color: 0x0a0a0a, alpha: 0.5 + Math.random() * 0.4 });
    }
  }

  app.renderer.render({ container: stamp, target: decalTexture, clear: false });
  stamp.destroy();

  if (isRev) stampCracks(x, y, weapon);
}

// ─── Particle Spawning ───────────────────────────────────────────────────────
function addP(type, x, y, vx, vy, size, color, alpha, life, gravity, trail, extra) {
  if (pCount >= MAX_PARTICLES) return;
  const i = pCount++;
  pType[i] = type;
  pX[i] = x;
  pY[i] = y;
  pVx[i] = vx;
  pVy[i] = vy;
  pSize[i] = size;
  pColor[i] = color;
  pAlpha[i] = alpha;
  pLife[i] = life;
  pAge[i] = 0;
  pGravity[i] = gravity;
  pTrail[i] = trail || 0;
  pExtra[i] = extra || 0;
}

function spawnExplosion(x, y, weapon, shotColor) {
  const imp = weapon.impact;
  const isRev = weapon === WEAPONS.revolver;
  const isFlame = weapon === WEAPONS.flameshot;
  const isPaint = weapon === WEAPONS.paintball;
  const isMis = weapon === WEAPONS.missile;

  // ── Paintball: splatter particles instead of debris/sparks ──
  if (isPaint) {
    const r = imp.splatRadius;

    // Jiggle/expansion blobs — short-lived, subtle settle around edges
    for (let i = 0; i < imp.blobCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 5 + Math.random() * 12;
      addP('B', x + (Math.random() - 0.5) * r * 0.4, y + (Math.random() - 0.5) * r * 0.4,
        Math.cos(a) * spd, Math.sin(a) * spd,
        3 + Math.random() * 4, shotColor, 0.6, 0.2 + Math.random() * 0.25, 0, 0);
    }

    // Paint drips — gravity-affected, leave paint trail
    for (let i = 0; i < imp.dripCount; i++) {
      const dripX = x + (Math.random() - 0.5) * r * 0.6;
      const dripY = y + Math.random() * r * 0.3;
      addP('P', dripX, dripY,
        (Math.random() - 0.5) * 10,
        20 + Math.random() * 40,
        3 + Math.random() * 4, shotColor, 0.9,
        2.0 + Math.random() * 3.0,  // drips last 2-5 seconds
        0.15,                         // light gravity — slow drip
        0,                            // trail timer
        0);
    }

    // Small splatter particles flying outward
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * 180;
      addP('d', x, y,
        Math.cos(a) * spd, Math.sin(a) * spd - 40,
        2 + Math.random() * 3, shotColor, 0.9,
        0.3 + Math.random() * 0.5, 0.6, 0);
    }

    return;
  }

  // Debris chunks
  for (let i = 0; i < imp.debrisCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = imp.debrisSpeedMin + Math.random() * (imp.debrisSpeedMax - imp.debrisSpeedMin);
    const col = imp.colors[(Math.random() * imp.colors.length) | 0];
    const sz = isMis ? 4 + Math.random() * 8 : isRev ? 3 + Math.random() * 5 : isFlame ? 2 + Math.random() * 4 : 1.5 + Math.random() * 3;
    addP('d', x, y,
      Math.cos(a) * spd * (0.7 + Math.random() * 0.6),
      Math.sin(a) * spd * (0.7 + Math.random() * 0.6) - 100 - Math.random() * (isMis ? 400 : 200),
      sz, col, 1, isMis ? 1.2 + Math.random() * 1.5 : 0.8 + Math.random() * 1.2, 1, 0);
  }

  // Sparks
  for (let i = 0; i < imp.sparkCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = imp.sparkSpeedMin + Math.random() * (imp.sparkSpeedMax - imp.sparkSpeedMin);
    const col = imp.sparkColors[(Math.random() * imp.sparkColors.length) | 0];
    const sz = isMis ? 2.5 + Math.random() * 3 : isRev ? 2 + Math.random() * 2 : 1 + Math.random() * 1.5;
    addP('s', x, y,
      Math.cos(a) * spd, Math.sin(a) * spd - 50 - Math.random() * (isMis ? 200 : 100),
      sz, col, 1, isMis ? 0.3 + Math.random() * 0.6 : 0.2 + Math.random() * 0.4, 0.5, 0);
  }

  // Smoke / dust
  for (let i = 0; i < imp.smokeCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 20 + Math.random() * 80;
    const sz = isMis ? 8 + Math.random() * 12 : isRev ? 8 + Math.random() * 15 : isFlame ? 10 + Math.random() * 12 : 4 + Math.random() * 8;
    let col;
    if (isMis) col = [0x333333, 0x444444, 0x222222, 0x555555][(Math.random() * 4) | 0];
    else if (isFlame) col = [0x222222, 0x333333, 0x111111][(Math.random() * 3) | 0]; // dark fire smoke
    else if (isRev) col = 0x444444;
    else col = [0x999999, 0xAAAAAA, 0x888888, 0xBBBBBB][(Math.random() * 4) | 0];
    addP('m', x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10,
      Math.cos(a) * spd, -30 - Math.random() * 60,
      sz, col, isFlame ? 0.6 : isRev ? 0.5 + Math.random() * 0.3 : 0.3 + Math.random() * 0.3,
      0.6 + Math.random() * 1.0, -0.3, 0);
  }

  // Shrapnel
  for (let i = 0; i < imp.shrapnelCount; i++) {
    const a = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8;
    const spd = 300 + Math.random() * 500;
    const col = isRev ? 0xCCCCCC : [0xAAAAAA, 0x999999, 0xBBBBBB][(Math.random() * 3) | 0];
    addP('x', x, y,
      Math.cos(a + (Math.random() - 0.5)) * spd * (isMis ? 1.5 : 1),
      Math.sin(a) * spd - (isMis ? 350 : 200),
      isMis ? 3 + Math.random() * 3 : isRev ? 2 + Math.random() * 2 : 1.5 + Math.random() * 1.5,
      col, 1, isMis ? 2.0 + Math.random() * 2.5 : 1.5 + Math.random() * 2.0, 1, 0);
  }

  // Hot flash core
  const flashCount = isMis ? 20 : isRev ? 10 : isFlame ? 8 : 3;
  for (let i = 0; i < flashCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 50 + Math.random() * 150;
    const sz = isMis ? 6 + Math.random() * 8 : isRev ? 6 + Math.random() * 8 : isFlame ? 5 + Math.random() * 7 : 3 + Math.random() * 4;
    addP('f', x, y,
      Math.cos(a) * spd, Math.sin(a) * spd,
      sz, isFlame ? 0xFFAA00 : 0xFFFFFF, 1, 0.05 + Math.random() * 0.1, 0, 0);
  }

  // Ember rain for revolver only
  if (isRev) {
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 80;
      addP('e', x, y,
        Math.cos(a) * spd, -100 - Math.random() * 200,
        1 + Math.random() * 2, 0xFF6600, 0.8, 1.5 + Math.random() * 2.0, 0.4, 0);
    }
    // Rising smoke trail from impact — stationary emitter
    addP('T', x, y, 0, 0,
      0, 0x444444, 1,
      3.0 + Math.random() * 2.0,  // smoke rises for 3-5 seconds
      0, 0, 0);
  }

  // ── Flameshot: spawn lasting fires ──
  if (isFlame && imp.fireCount) {
    for (let i = 0; i < imp.fireCount; i++) {
      const fx = x + (Math.random() - 0.5) * imp.scorchRadius * 0.8;
      const fy = y + (Math.random() - 0.5) * imp.scorchRadius * 0.8;
      const duration = imp.fireDuration * (0.7 + Math.random() * 0.6);
      // 'F' = lasting fire: stationary, flickers, spawns wandering flames
      // trail = timer for next wanderer spawn
      addP('F', fx, fy, 0, 0,
        imp.fireRadius * (0.8 + Math.random() * 0.4),
        0xFF6600, 1, duration, 0,
        imp.wandererInterval * Math.random(), // stagger initial spawn
        0);
    }
  }
}

// ─── Game Loop ───────────────────────────────────────────────────────────────
function gameLoop(ticker) {
  const dt = ticker.deltaMS / 1000;

  if (mouseDown && WEAPONS[currentWeapon].auto) tryFire();

  // Screen shake
  if (shakeDecay > 0.1) {
    shakeDecay *= 0.85;
    gameContainer.x = shakeX * (Math.random() - 0.5) * 0.5;
    gameContainer.y = shakeY * (Math.random() - 0.5) * 0.5;
    shakeX *= 0.85;
    shakeY *= 0.85;
  } else {
    gameContainer.x = 0;
    gameContainer.y = 0;
    shakeDecay = 0;
  }

  // Muzzle flash
  if (muzzleFlashTimer > 0) {
    muzzleFlashTimer -= ticker.deltaMS;
    if (muzzleFlashTimer <= 0) muzzleFlashGfx.visible = false;
  }

  // Crosshair
  crosshairGfx.x = mouseX;
  crosshairGfx.y = mouseY;

  // Cool the glow texture
  const coolAlpha = 0.04;
  glowCoolOverlay.clear();
  glowCoolOverlay.rect(0, 0, screenW, screenH);
  glowCoolOverlay.fill({ color: 0x000000, alpha: coolAlpha });
  app.renderer.render({ container: glowCoolOverlay, target: glowTexture, clear: false });

  updateMissiles(dt);
  updateBulletTrails(dt);
  updateParticles(dt);
  syncParticlesToPixi();

  particleCountText.text = `Particles: ${pCount}`;
}

// ─── Missile Update ──────────────────────────────────────────────────────────
function updateMissiles(dt) {
  missileGfx.clear();

  let i = missiles.length;
  while (i--) {
    const m = missiles[i];
    m.age += dt;

    // Steer toward mouse cursor
    const dx = mouseX - m.x;
    const dy = mouseY - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const desiredVx = (dx / dist) * 280;
    const desiredVy = (dy / dist) * 280;
    // Smooth steering — lerp toward desired velocity
    const steer = 3.0 * dt;
    m.vx += (desiredVx - m.vx) * steer;
    m.vy += (desiredVy - m.vy) * steer;
    // Clamp speed
    const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
    const maxSpeed = 300;
    if (speed > maxSpeed) {
      m.vx = (m.vx / speed) * maxSpeed;
      m.vy = (m.vy / speed) * maxSpeed;
    }

    m.x += m.vx * dt;
    m.y += m.vy * dt;

    // Smoke trail
    m.trailTimer -= dt;
    if (m.trailTimer <= 0) {
      m.trailTimer = 0.02;
      addP('m', m.x + (Math.random() - 0.5) * 6, m.y + (Math.random() - 0.5) * 6,
        -m.vx * 0.1 + (Math.random() - 0.5) * 30,
        -m.vy * 0.1 + (Math.random() - 0.5) * 30,
        4 + Math.random() * 6, 0x888888, 0.5, 0.4 + Math.random() * 0.4, -0.15, 0);
      // Fire trail from thruster
      const angle = Math.atan2(m.vy, m.vx);
      addP('d', m.x - Math.cos(angle) * 10, m.y - Math.sin(angle) * 10,
        -m.vx * 0.4 + (Math.random() - 0.5) * 40,
        -m.vy * 0.4 + (Math.random() - 0.5) * 40,
        2 + Math.random() * 3,
        [0xFFFF00, 0xFFAA00, 0xFF6600][(Math.random() * 3) | 0],
        0.9, 0.1 + Math.random() * 0.15, 0, 0);
    }

    // Detonate when close to cursor (within 15px) and has traveled a bit,
    // or if it goes off-screen, or after 10 seconds
    const closeToCursor = dist < 15 && m.age > 0.3;
    const offScreen = m.x < -50 || m.x > screenW + 50 || m.y < -50 || m.y > screenH + 50;
    const timeout = m.age > 10;

    if (closeToCursor || offScreen || timeout) {
      detonateMissile(m.x, m.y);
      missiles.splice(i, 1);
      continue;
    }

    // Draw the missile body
    const angle = Math.atan2(m.vy, m.vx);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const len = 12;
    const w = 3;

    // Body
    missileGfx.moveTo(m.x + cos * len, m.y + sin * len);
    missileGfx.lineTo(m.x - cos * len - sin * w, m.y - sin * len + cos * w);
    missileGfx.lineTo(m.x - cos * len + sin * w, m.y - sin * len - cos * w);
    missileGfx.closePath();
    missileGfx.fill({ color: 0xCCCCCC, alpha: 0.9 });

    // Nose tip glow
    missileGfx.circle(m.x + cos * len, m.y + sin * len, 3);
    missileGfx.fill({ color: 0xFF4400, alpha: 0.8 });

    // Thruster glow
    missileGfx.circle(m.x - cos * 10, m.y - sin * 10, 5);
    missileGfx.fill({ color: 0xFFAA00, alpha: 0.4 + Math.random() * 0.3 });
    missileGfx.circle(m.x - cos * 10, m.y - sin * 10, 3);
    missileGfx.fill({ color: 0xFFFF00, alpha: 0.6 + Math.random() * 0.3 });
  }
}

function detonateMissile(x, y) {
  const weapon = WEAPONS.missile;

  // Massive screen shake
  const shakeAngle = Math.random() * Math.PI * 2;
  shakeX += Math.cos(shakeAngle) * weapon.screenShake;
  shakeY += Math.sin(shakeAngle) * weapon.screenShake;
  shakeDecay = Math.max(shakeDecay, weapon.screenShake);

  // Stamp crater, glow, cracks
  stampImpact(x, y, weapon, 0);
  stampGlow(x, y, weapon);

  // Ring explosion particles — expand outward in a ring
  const imp = weapon.impact;
  for (let i = 0; i < imp.ringParticles; i++) {
    const a = (i / imp.ringParticles) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const spd = imp.ringSpeed * (0.8 + Math.random() * 0.4);
    const col = imp.colors[(Math.random() * imp.colors.length) | 0];
    addP('R', x, y,
      Math.cos(a) * spd, Math.sin(a) * spd,
      6 + Math.random() * 8, col, 1,
      0.6 + Math.random() * 0.4,
      0, 0, 0);
  }
  // Inner bright ring
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const spd = imp.ringSpeed * 0.5 * (0.8 + Math.random() * 0.4);
    addP('R', x, y,
      Math.cos(a) * spd, Math.sin(a) * spd,
      4 + Math.random() * 5, 0xFFFFFF, 1,
      0.3 + Math.random() * 0.3,
      0, 0, 0);
  }

  // Standard explosion particles (debris, sparks, smoke, shrapnel, flash)
  spawnExplosion(x, y, weapon, 0);

  // Small fires that burn out
  for (let i = 0; i < imp.fireCount; i++) {
    const fx = x + (Math.random() - 0.5) * imp.scorchRadius * 0.8;
    const fy = y + (Math.random() - 0.5) * imp.scorchRadius * 0.8;
    const duration = imp.fireDuration * (0.6 + Math.random() * 0.8);
    addP('F', fx, fy, 0, 0,
      imp.fireRadius * (0.7 + Math.random() * 0.6),
      0xFF6600, 1, duration, 0,
      0.5 * Math.random(),
      0);
  }
}

// ─── Bullet Trail Update ─────────────────────────────────────────────────────
function updateBulletTrails(dt) {
  bulletTrailGfx.clear();

  let i = bulletTrails.length;
  while (i--) {
    const t = bulletTrails[i];
    t.alpha -= t.decay * dt;
    if (t.alpha <= 0) {
      bulletTrails.splice(i, 1);
      continue;
    }
    bulletTrailGfx.moveTo(t.x1, t.y1);
    bulletTrailGfx.lineTo(t.x2, t.y2);
    bulletTrailGfx.stroke({ width: t.width, color: t.color, alpha: t.alpha });
    bulletTrailGfx.moveTo(t.x1, t.y1);
    bulletTrailGfx.lineTo(t.x2, t.y2);
    bulletTrailGfx.stroke({ width: t.width * 0.3, color: 0xFFFFFF, alpha: t.alpha * 0.7 });
  }
}

// ─── Particle Update ─────────────────────────────────────────────────────────
function updateParticles(dt) {
  let writeIdx = 0;
  const flameImp = WEAPONS.flameshot.impact;

  for (let i = 0; i < pCount; i++) {
    const age = pAge[i] + dt;
    if (age >= pLife[i]) continue;

    const lifeRatio = age / pLife[i];
    let vy = pVy[i] + GRAVITY * pGravity[i] * dt;
    let vx = pVx[i] * (1 - 0.5 * dt);
    let x = pX[i] + vx * dt;
    let y = pY[i] + vy * dt;
    let size = pSize[i];
    let alpha = pAlpha[i];
    let trail = pTrail[i];
    let extra = pExtra[i];
    let color = pColor[i];
    const type = pType[i];

    switch (type) {
      case 'm': // smoke/dust
        size += dt * 15;
        alpha = (1 - lifeRatio) * 0.4;
        break;

      case 's': // spark
        alpha = 1 - lifeRatio;
        break;

      case 'd': // debris
        alpha = 1 - lifeRatio * 0.7;
        break;

      case 'f': // flash
        alpha = 1 - lifeRatio;
        size += dt * 30;
        break;

      case 'e': // ember (revolver only)
        alpha = (1 - lifeRatio) * 0.8;
        alpha *= 0.7 + Math.random() * 0.3;
        break;

      case 'L': // lava blob (flameshot muzzle spray)
        alpha = 1 - lifeRatio * 0.8;
        // Flicker between hot colors
        if (Math.random() < 0.3) {
          color = [0xFFFF00, 0xFFCC00, 0xFFAA00, 0xFF8800][(Math.random() * 4) | 0];
        }
        // Drip trail
        if (Math.random() < dt * 8 && pCount < MAX_PARTICLES) {
          addP('d', x, y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20,
            1 + Math.random() * 2,
            [0xFF6600, 0xFF8800, 0xFFAA00][(Math.random() * 3) | 0],
            0.7, 0.1 + Math.random() * 0.2, 0.5, 0);
        }
        break;

      case 'x': // shrapnel
        alpha = 1 - lifeRatio * 0.5;
        trail -= dt;
        if (trail <= 0 && pCount < MAX_PARTICLES) {
          trail = 0.03;
          addP('m', x, y, 0, -10, 2 + Math.random() * 2, 0x666666, 0.3, 0.3 + Math.random() * 0.3, -0.1, 0);
        }
        if (y > screenH - 5) {
          y = screenH - 5;
          vy *= -0.4;
          vx *= 0.7;
          if (Math.abs(vy) > 30) {
            for (let s = 0; s < 2; s++) {
              const ang = -Math.PI * Math.random();
              addP('s', x, y, Math.cos(ang) * 100, Math.sin(ang) * 80 - 50,
                1, 0xFFAA00, 1, 0.1 + Math.random() * 0.15, 0.5, 0);
            }
          }
        }
        break;

      // ── Lasting Fire ──
      case 'F': {
        // Stationary — flickers in size and color
        vx = 0;
        vy = 0;
        x = pX[i]; // don't move
        y = pY[i];

        const burnIntensity = 1 - lifeRatio * lifeRatio; // slow initial fade, quick at end
        alpha = burnIntensity * (0.6 + Math.random() * 0.4);
        size = pSize[i] * (0.7 + Math.random() * 0.6) * burnIntensity;

        // Flicker color between yellow, orange, red
        const flicker = Math.random();
        if (flicker < 0.2) color = 0xFFFF00;
        else if (flicker < 0.5) color = 0xFFCC00;
        else if (flicker < 0.8) color = 0xFF6600;
        else color = 0xFF4400;

        // Periodically re-stamp glow to keep it hot
        if (Math.random() < dt * 3 && burnIntensity > 0.3) {
          stampFireGlow(x, y, pSize[i] * 1.2, burnIntensity * 0.4);
        }

        // Spawn smoke rising from fire
        if (Math.random() < dt * 4) {
          addP('m', x + (Math.random() - 0.5) * 8, y,
            (Math.random() - 0.5) * 15, -40 - Math.random() * 40,
            5 + Math.random() * 8, 0x222222, 0.4 * burnIntensity,
            0.5 + Math.random() * 0.5, -0.2, 0);
        }

        // Spawn small flame particles flickering upward
        if (Math.random() < dt * 8 && burnIntensity > 0.2) {
          const fa = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
          const fspd = 20 + Math.random() * 40;
          addP('d', x + (Math.random() - 0.5) * size, y,
            Math.cos(fa) * fspd, Math.sin(fa) * fspd,
            2 + Math.random() * 3,
            [0xFFFF00, 0xFFAA00, 0xFF6600][(Math.random() * 3) | 0],
            0.8 * burnIntensity, 0.2 + Math.random() * 0.3, -0.2, 0);
        }

        // Spawn wandering flames
        trail -= dt;
        if (trail <= 0 && burnIntensity > 0.25 && pCount < MAX_PARTICLES - 5) {
          trail = flameImp.wandererInterval * (0.7 + Math.random() * 0.6);
          for (let w = 0; w < flameImp.wandererCount; w++) {
            const heading = Math.random() * Math.PI * 2;
            const wanderSpeed = 60 + Math.random() * 40;
            addP('w', x, y,
              Math.cos(heading) * wanderSpeed,
              Math.sin(heading) * wanderSpeed,
              10 + Math.random() * 8,                         // large size
              0xFF6600,
              1.0,
              5.0 + Math.random() * 4.0,                     // long life: 5-9 seconds
              0,
              0,
              heading);
          }
        }
        break;
      }

      // ── Wandering Flame (fire tentacle) ──
      case 'w': {
        const wanderIntensity = 1 - lifeRatio;
        const headStrength = 0.3 + wanderIntensity * 0.7; // fades movement at end of life

        // Smooth sweeping curves — slow drift in heading for tentacle look
        extra += (Math.random() - 0.5) * 1.8 * dt;
        // Occasional gentle curve shift (not sharp — tentacles, not sparks)
        if (Math.random() < dt * 0.8) {
          extra += (Math.random() - 0.5) * 0.8;
        }

        const wanderSpeed = (70 + Math.random() * 30) * headStrength;
        vx = Math.cos(extra) * wanderSpeed;
        vy = Math.sin(extra) * wanderSpeed;

        alpha = wanderIntensity * (0.6 + Math.random() * 0.4);
        size = pSize[i] * (0.7 + Math.random() * 0.4) * (0.4 + wanderIntensity * 0.6);

        // Flicker color
        const wf = Math.random();
        if (wf < 0.15) color = 0xFFFF00;
        else if (wf < 0.4) color = 0xFFCC00;
        else if (wf < 0.7) color = 0xFF8800;
        else color = 0xFF4400;

        // Stamp ash trail — larger marks for tentacle path
        trail -= dt;
        if (trail <= 0) {
          trail = 0.05 + Math.random() * 0.04;
          stampAsh(x, y, 3 + Math.random() * 5);
        }

        // Stamp fire glow along path — keeps the tentacle visibly hot
        if (Math.random() < dt * 5 && wanderIntensity > 0.2) {
          stampFireGlow(x, y, 15 * wanderIntensity, wanderIntensity * 0.35);
        }

        // Smoke wisps rising off the tentacle
        if (Math.random() < dt * 4) {
          addP('m', x + (Math.random() - 0.5) * 6, y,
            (Math.random() - 0.5) * 12, -25 - Math.random() * 30,
            4 + Math.random() * 5, 0x222222, 0.3 * wanderIntensity,
            0.4 + Math.random() * 0.4, -0.2, 0);
        }

        break;
      }

      // ── Smoke trail emitter (revolver impact) ──
      case 'T': {
        // Stationary invisible emitter — spawns rising smoke
        vx = 0;
        vy = 0;
        x = pX[i];
        y = pY[i];
        alpha = 0; // emitter itself is invisible
        size = 0;
        const intensity = 1 - lifeRatio * lifeRatio; // fades out over time

        trail -= dt;
        if (trail <= 0 && intensity > 0.1) {
          trail = 0.06 + Math.random() * 0.06;
          const drift = (Math.random() - 0.5) * 20;
          const smokeSize = (4 + Math.random() * 8) * intensity;
          const smokeAlpha = (0.25 + Math.random() * 0.2) * intensity;
          const col = [0x444444, 0x555555, 0x3a3a3a, 0x4a4a4a][(Math.random() * 4) | 0];
          addP('m', x + (Math.random() - 0.5) * 8, y,
            drift, -50 - Math.random() * 60,
            smokeSize, col, smokeAlpha,
            0.8 + Math.random() * 0.8, -0.15, 0);
        }
        break;
      }

      // ── Ring particle (missile explosion) ──
      case 'R': {
        alpha = (1 - lifeRatio) * 0.9;
        // Slight drag to make ring feel weighty
        vx *= (1 - 1.0 * dt);
        vy *= (1 - 1.0 * dt);
        // No size growth — keep original size
        // Flicker between hot colors
        if (Math.random() < 0.2) {
          color = [0xFFFF00, 0xFFCC00, 0xFFAA00, 0xFF6600, 0xFFFFFF][(Math.random() * 5) | 0];
        }
        // Leave sparks behind
        if (Math.random() < dt * 6 && pCount < MAX_PARTICLES) {
          addP('s', x, y,
            (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50,
            1.5 + Math.random() * 2, 0xFFAA00, 0.8,
            0.15 + Math.random() * 0.2, 0.5, 0);
        }
        break;
      }

      // ── Paint blob jiggle/expansion ──
      case 'B': {
        const expandRatio = lifeRatio;
        size = pSize[i] * (1 + expandRatio * 0.15); // very subtle expansion
        alpha = (1 - lifeRatio) * 0.5;
        // Slow down quickly — settling feel
        vx *= (1 - 5 * dt);
        vy *= (1 - 5 * dt);
        // Tiny wobble
        vx += (Math.random() - 0.5) * 8 * dt;
        vy += (Math.random() - 0.5) * 8 * dt;
        break;
      }

      // ── Paint drip ──
      case 'P': {
        alpha = (1 - lifeRatio * 0.6) * 0.85;
        // Drips move mostly downward, slow horizontal
        vx *= (1 - 2 * dt);
        // Slow accelerating drip
        vy += 30 * dt;
        vy = Math.min(vy, 80); // terminal velocity for drip

        // Stamp paint trail periodically
        trail -= dt;
        if (trail <= 0) {
          trail = 0.06 + Math.random() * 0.04;
          stampPaintDrip(x, y, size * 0.8, color);
        }

        // Shrink slightly as paint runs out
        size = pSize[i] * (0.5 + 0.5 * (1 - lifeRatio));
        break;
      }
    }

    // Compact surviving particles
    pType[writeIdx] = type;
    pX[writeIdx] = x;
    pY[writeIdx] = y;
    pVx[writeIdx] = vx;
    pVy[writeIdx] = vy;
    pSize[writeIdx] = size;
    pColor[writeIdx] = color;
    pAlpha[writeIdx] = alpha;
    pLife[writeIdx] = pLife[i];
    pAge[writeIdx] = age;
    pGravity[writeIdx] = pGravity[i];
    pTrail[writeIdx] = trail;
    pExtra[writeIdx] = extra;
    writeIdx++;
  }

  pCount = writeIdx;
}

// ─── Sync to PixiJS ParticleContainer ────────────────────────────────────────
function syncParticlesToPixi() {
  while (pixiParticles.length < pCount) {
    const p = new PIXI.Particle({
      texture: dotTexture,
      anchorX: 0.5,
      anchorY: 0.5,
    });
    pixiParticles.push(p);
    particleContainer.addParticle(p);
  }

  for (let i = 0; i < pCount; i++) {
    const pp = pixiParticles[i];
    pp.x = pX[i];
    pp.y = pY[i];
    pp.alpha = pAlpha[i];
    pp.tint = pColor[i];

    const scale = pSize[i] / 8;

    if (pType[i] === 's') {
      const speed = Math.sqrt(pVx[i] * pVx[i] + pVy[i] * pVy[i]);
      const stretch = Math.min(speed * 0.005 + 1, 4);
      pp.scaleX = scale * stretch;
      pp.scaleY = scale * 0.5;
      pp.rotation = Math.atan2(pVy[i], pVx[i]);
    } else {
      pp.scaleX = scale;
      pp.scaleY = scale;
      pp.rotation = 0;
    }
  }

  for (let i = pCount; i < pixiParticles.length; i++) {
    pixiParticles[i].alpha = 0;
    pixiParticles[i].x = -100;
    pixiParticles[i].y = -100;
  }

  particleContainer._childrenDirty = true;
}

// ─── Start ───────────────────────────────────────────────────────────────────
init().catch(err => {
  console.error('Failed to initialize:', err);
  const el = document.getElementById('loading');
  if (el) el.textContent = 'Error: ' + err.message;
});
