/**
 * IMMUNE - Microscopic Procedural Action Game
 * 100% Vanilla JavaScript & HTML5 Canvas
 */

// ============================================================================
// 1. SOUND SYNTHESIS ENGINE (Web Audio API)
// ============================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  playAttack() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(460, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(280, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  playHit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.16);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.17);

    this.playNoise(0.09, 650, 160, 0.25);
  }

  playDash() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.11);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.26);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.26);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.27);

    this.playNoise(0.18, 1400, 320, 0.18);
  }

  playEnemyDeath() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.24);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);

    this.playNoise(0.24, 2000, 90, 0.35);
  }

  playPlayerDamage() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(55, t + 0.3);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.31);
  }

  playWaveComplete() {
    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  playNoise(duration, startFreq, endFreq, volume) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const t = this.ctx.currentTime;
    filter.frequency.setValueAtTime(startFreq, t);
    filter.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + duration);
  }
}

// ============================================================================
// 2. VECTOR & PROCEDURAL DRAWING UTILITIES
// ============================================================================
class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) { this.x = x; this.y = y; return this; }
  add(v) { this.x += v.x; this.y += v.y; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; return this; }
  mult(s) { this.x *= s; this.y *= s; return this; }
  div(s) { if (s !== 0) { this.x /= s; this.y /= s; } return this; }
  magSq() { return this.x * this.x + this.y * this.y; }
  mag() { return Math.sqrt(this.magSq()); }
  norm() { const m = this.mag(); if (m > 0) this.div(m); return this; }
  copy() { return new Vec2(this.x, this.y); }
  dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
  angle() { return Math.atan2(this.y, this.x); }
  lerp(v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; return this; }
}

function drawSmoothClosedCurve(ctx, points) {
  if (points.length < 3) return;
  ctx.beginPath();
  const len = points.length;
  const firstMidX = (points[0].x + points[1].x) / 2;
  const firstMidY = (points[0].y + points[1].y) / 2;
  ctx.moveTo(firstMidX, firstMidY);

  for (let i = 1; i < len; i++) {
    const nextIdx = (i + 1) % len;
    const midX = (points[i].x + points[nextIdx].x) / 2;
    const midY = (points[i].y + points[nextIdx].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  ctx.quadraticCurveTo(points[0].x, points[0].y, firstMidX, firstMidY);
  ctx.closePath();
}

// ============================================================================
// 3. PARTICLE ENGINE
// ============================================================================
class Particle {
  constructor(opt = {}) {
    this.pos = opt.pos ? opt.pos.copy() : new Vec2();
    this.vel = opt.vel ? opt.vel.copy() : new Vec2();
    this.acc = opt.acc ? opt.acc.copy() : new Vec2();
    this.friction = opt.friction || 0.96;
    this.life = opt.life || 1.0;
    this.maxLife = this.life;
    this.size = opt.size || 6;
    this.endSize = opt.endSize !== undefined ? opt.endSize : 0;
    this.color = opt.color || '#ffffff';
    this.alpha = opt.alpha !== undefined ? opt.alpha : 1.0;
    this.rot = opt.rot || Math.random() * Math.PI * 2;
    this.rotSpeed = opt.rotSpeed || (Math.random() - 0.5) * 4;
    this.type = opt.type || 'circle'; // circle, blob, ring, rbc
    this.radiusX = opt.radiusX || this.size;
    this.radiusY = opt.radiusY || this.size * 0.6;
    this.dead = false;
  }

  update(dt) {
    this.vel.add(this.acc);
    this.vel.mult(this.friction);
    this.pos.x += this.vel.x * dt * 60;
    this.pos.y += this.vel.y * dt * 60;
    this.rot += this.rotSpeed * dt;
    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
    }
  }

  draw(ctx) {
    const progress = 1 - Math.max(0, this.life / this.maxLife);
    const currentAlpha = Math.max(0, this.alpha * (1 - progress));
    const currentSize = Math.max(0.1, this.size + (this.endSize - this.size) * progress);

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = currentAlpha;

    if (this.type === 'ring') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1, 4 * (1 - progress));
      ctx.beginPath();
      ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === 'blob') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, currentSize, currentSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'rbc') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radiusX * 0.45, this.radiusY * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(opt) {
    this.particles.push(new Particle(opt));
  }

  emitBurst(x, y, count, options = {}) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (options.minSpeed || 1.5) + Math.random() * ((options.maxSpeed || 7.0) - (options.minSpeed || 1.5));
      this.emit({
        pos: new Vec2(x, y),
        vel: new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        size: options.size || (3 + Math.random() * 5),
        endSize: options.endSize || 0,
        color: options.color || '#ffffff',
        life: options.life || (0.3 + Math.random() * 0.5),
        friction: options.friction || 0.94,
        type: options.type || 'circle'
      });
    }
  }

  emitShockwave(x, y, maxRadius, color = '#ffffff', duration = 0.35) {
    this.emit({
      pos: new Vec2(x, y),
      size: 4,
      endSize: maxRadius,
      color: color,
      life: duration,
      type: 'ring',
      friction: 1.0
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.dead) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
  }
}

// ============================================================================
// 4. CAMERA SYSTEM
// ============================================================================
class Camera {
  constructor() {
    this.pos = new Vec2(0, 0);
    this.target = new Vec2(0, 0);
    this.shakeMag = 0;
    this.shakeDuration = 0;
    this.shakeOffset = new Vec2(0, 0);
    this.smoothness = 0.12;
  }

  shake(magnitude = 8, duration = 0.25) {
    this.shakeMag = Math.max(this.shakeMag, magnitude);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  update(dt, targetPos, viewportW, viewportH, worldBounds) {
    this.target.set(targetPos.x - viewportW / 2, targetPos.y - viewportH / 2);
    this.pos.lerp(this.target, this.smoothness);

    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const angle = Math.random() * Math.PI * 2;
      const dist = this.shakeMag * (this.shakeDuration / 0.25);
      this.shakeOffset.set(Math.cos(angle) * dist, Math.sin(angle) * dist);
      if (this.shakeDuration <= 0) {
        this.shakeMag = 0;
        this.shakeOffset.set(0, 0);
      }
    } else {
      this.shakeOffset.set(0, 0);
    }

    const minX = worldBounds.x;
    const minY = worldBounds.y;
    const maxX = worldBounds.x + worldBounds.w - viewportW;
    const maxY = worldBounds.y + worldBounds.h - viewportH;

    this.pos.x = Math.max(minX, Math.min(this.pos.x, maxX));
    this.pos.y = Math.max(minY, Math.min(this.pos.y, maxY));
  }

  applyTransform(ctx) {
    ctx.translate(-Math.round(this.pos.x + this.shakeOffset.x), -Math.round(this.pos.y + this.shakeOffset.y));
  }
}

// ============================================================================
// 5. INPUT MANAGER
// ============================================================================
class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouse = new Vec2(window.innerWidth / 2, window.innerHeight / 2);
    this.mouseWorld = new Vec2(0, 0);
    this.attackPressed = false;
    this.attackHeld = false;
    this.dashPressed = false;

    this.isTouchDevice = false;
    this.touchMoveDir = new Vec2(0, 0);
    this.touchJoystickActive = false;
    this.touchJoystickOrigin = new Vec2(0, 0);

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code) this.keys[e.code] = true;
      if (e.key) {
        this.keys[e.key] = true;
        this.keys[e.key.toLowerCase()] = true;
      }
      if (e.code === 'Space' || e.key === ' ') {
        this.dashPressed = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code) this.keys[e.code] = false;
      if (e.key) {
        this.keys[e.key] = false;
        this.keys[e.key.toLowerCase()] = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.set(e.clientX, e.clientY);
    });

    window.addEventListener('mousedown', (e) => {
      this.mouse.set(e.clientX, e.clientY);
      if (e.button === 0) {
        this.attackPressed = true;
        this.attackHeld = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.attackHeld = false;
      }
    });

    this.initTouchControls();
  }

  initTouchControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickKnob = document.getElementById('joystick-knob');
    const dashBtn = document.getElementById('touch-dash-btn');
    const attackBtn = document.getElementById('touch-attack-btn');
    const touchLayer = document.getElementById('touch-controls');

    const checkTouch = () => {
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        this.isTouchDevice = true;
        touchLayer.classList.remove('hidden');
      }
    };
    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });

    let joystickTouchId = null;
    const maxRadius = 45;

    const handleJoystickStart = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const rect = joystickBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        joystickTouchId = touch.identifier;
        this.touchJoystickActive = true;
        this.touchJoystickOrigin.set(centerX, centerY);
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    };

    const updateJoystickPos = (clientX, clientY) => {
      const dx = clientX - this.touchJoystickOrigin.x;
      const dy = clientY - this.touchJoystickOrigin.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);

      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
      this.touchMoveDir.set(knobX / maxRadius, knobY / maxRadius);
    };

    const handleJoystickMove = (e) => {
      if (!this.touchJoystickActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
          updateJoystickPos(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleJoystickEnd = (e) => {
      if (!this.touchJoystickActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
          this.touchJoystickActive = false;
          joystickTouchId = null;
          this.touchMoveDir.set(0, 0);
          joystickKnob.style.transform = 'translate(0px, 0px)';
          break;
        }
      }
    };

    joystickZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleJoystickStart(e);
    }, { passive: false });

    window.addEventListener('touchmove', handleJoystickMove, { passive: true });
    window.addEventListener('touchend', handleJoystickEnd, { passive: true });
    window.addEventListener('touchcancel', handleJoystickEnd, { passive: true });

    attackBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.attackPressed = true;
      this.attackHeld = true;
    }, { passive: false });

    attackBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.attackHeld = false;
    });

    dashBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.dashPressed = true;
    }, { passive: false });
  }

  getMovementVector() {
    const v = new Vec2(0, 0);
    if (this.keys['KeyW'] || this.keys['w'] || this.keys['ArrowUp'] || this.keys['Up']) v.y -= 1;
    if (this.keys['KeyS'] || this.keys['s'] || this.keys['ArrowDown'] || this.keys['Down']) v.y += 1;
    if (this.keys['KeyA'] || this.keys['a'] || this.keys['ArrowLeft'] || this.keys['Left']) v.x -= 1;
    if (this.keys['KeyD'] || this.keys['d'] || this.keys['ArrowRight'] || this.keys['Right']) v.x += 1;

    if (this.touchJoystickActive && this.touchMoveDir.magSq() > 0.05) {
      v.add(this.touchMoveDir);
    }

    if (v.magSq() > 1) {
      v.norm();
    }
    return v;
  }

  updateWorldMouse(camera) {
    this.mouseWorld.set(
      this.mouse.x + camera.pos.x + camera.shakeOffset.x,
      this.mouse.y + camera.pos.y + camera.shakeOffset.y
    );
  }

  consumeAttack() {
    const p = this.attackPressed;
    this.attackPressed = false;
    return p;
  }

  consumeDash() {
    const d = this.dashPressed;
    this.dashPressed = false;
    return d;
  }
}

// ============================================================================
// 6. WHITE BLOOD CELL (PLAYER)
// ============================================================================
class Player {
  constructor(x, y) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(0, 0);
    this.targetVel = new Vec2(0, 0);
    this.baseRadius = 42;
    this.radius = this.baseRadius;
    this.speed = 340;
    this.dashSpeed = 980;

    this.maxHp = 100;
    this.hp = this.maxHp;
    this.invulnerableTime = 0;
    this.invulnerableDuration = 0.8;
    this.dead = false;

    // Cooldowns
    this.dashCooldown = 1.5;
    this.dashTimer = 0;
    this.dashDuration = 0.22;
    this.isDashing = false;
    this.dashTimeRemaining = 0;
    this.dashDir = new Vec2(1, 0);

    this.attackCooldown = 0.32;
    this.attackTimer = 0;
    this.attackDamage = 35;
    this.isAttacking = false;
    this.attackProgress = 0;
    this.attackDuration = 0.26;
    this.attackTarget = new Vec2(0, 0);
    this.attackHitboxTriggered = false;

    // Soft-body procedural mesh points (28 vertices)
    this.numPoints = 28;
    this.points = [];
    this.pointOffsets = [];
    this.pointSprings = [];
    for (let i = 0; i < this.numPoints; i++) {
      this.points.push(new Vec2());
      this.pointOffsets.push(0);
      this.pointSprings.push(0);
    }

    // Pseudopods (soft organic reaching tentacles)
    this.pseudopods = [
      { baseAngleOffset: -0.4, length: 0, targetLen: 0, wobbleSpeed: 2.2, phase: 0 },
      { baseAngleOffset: 0.0, length: 0, targetLen: 0, wobbleSpeed: 2.8, phase: 1.5 },
      { baseAngleOffset: 0.4, length: 0, targetLen: 0, wobbleSpeed: 2.5, phase: 3.0 },
      { baseAngleOffset: 0.8, length: 0, targetLen: 0, wobbleSpeed: 1.9, phase: 4.5 }
    ];

    this.squashX = 1.0;
    this.squashY = 1.0;
    this.targetSquashX = 1.0;
    this.targetSquashY = 1.0;
    this.aimAngle = 0;
    this.bodyRotation = 0;
    this.timeAlive = 0;
  }

  takeDamage(amount, soundFx, particleSys, camera) {
    if (this.invulnerableTime > 0 || this.dead) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTime = this.invulnerableDuration;

    for (let i = 0; i < this.numPoints; i++) {
      this.pointSprings[i] -= 18 + Math.random() * 12;
    }

    soundFx.playPlayerDamage();
    camera.shake(12, 0.3);

    particleSys.emitBurst(this.pos.x, this.pos.y, 16, {
      color: '#ff6b8b',
      size: 5,
      minSpeed: 3,
      maxSpeed: 8,
      life: 0.4
    });

    if (this.hp <= 0) {
      this.dead = true;
      particleSys.emitBurst(this.pos.x, this.pos.y, 60, {
        color: '#ffffff',
        size: 7,
        minSpeed: 4,
        maxSpeed: 14,
        life: 1.2
      });
      particleSys.emitShockwave(this.pos.x, this.pos.y, 160, '#ff4b6e', 0.6);
    }
    return true;
  }

  dash(moveDir, soundFx, particleSys, camera) {
    if (this.dashTimer > 0 || this.dead) return;
    this.dashTimer = this.dashCooldown;
    this.isDashing = true;
    this.dashTimeRemaining = this.dashDuration;

    if (moveDir.magSq() > 0.01) {
      this.dashDir = moveDir.copy().norm();
    } else {
      this.dashDir = new Vec2(Math.cos(this.aimAngle), Math.sin(this.aimAngle));
    }

    this.squashX = 2.4;
    this.squashY = 0.45;

    soundFx.playDash();
    camera.shake(7, 0.22);

    particleSys.emitBurst(this.pos.x, this.pos.y, 20, {
      color: '#7dd3fc',
      size: 6,
      minSpeed: 2,
      maxSpeed: 8,
      friction: 0.92,
      life: 0.5,
      type: 'blob'
    });
    particleSys.emitShockwave(this.pos.x, this.pos.y, 70, '#38bdf8', 0.25);
  }

  attack(targetWorldPos, soundFx, particleSys, camera) {
    if (this.attackTimer > 0 || this.dead) return;
    this.attackTimer = this.attackCooldown;
    this.isAttacking = true;
    this.attackProgress = 0;
    this.attackHitboxTriggered = false;
    this.attackTarget = targetWorldPos.copy();

    const diff = targetWorldPos.copy().sub(this.pos);
    this.aimAngle = diff.angle();

    this.squashX = 0.65;
    this.squashY = 1.4;

    soundFx.playAttack();
  }

  update(dt, input, soundFx, particleSys, camera, worldBounds) {
    this.timeAlive += dt;

    if (this.dashTimer > 0) this.dashTimer -= dt;
    if (this.attackTimer > 0) this.attackTimer -= dt;
    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;

    const aimDiff = input.mouseWorld.copy().sub(this.pos);
    this.aimAngle = aimDiff.angle();

    const moveInput = input.getMovementVector();
    if (input.consumeDash()) {
      this.dash(moveInput, soundFx, particleSys, camera);
    }

    if (this.isDashing) {
      this.dashTimeRemaining -= dt;
      this.vel.set(this.dashDir.x * this.dashSpeed, this.dashDir.y * this.dashSpeed);

      if (Math.random() < 0.8) {
        particleSys.emit({
          pos: this.pos.copy().add(new Vec2((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20)),
          vel: new Vec2(-this.dashDir.x * 2 + (Math.random() - 0.5) * 2, -this.dashDir.y * 2 + (Math.random() - 0.5) * 2),
          size: 8 + Math.random() * 8,
          endSize: 0,
          color: 'rgba(235, 245, 255, 0.65)',
          life: 0.35,
          type: 'blob'
        });
      }

      if (this.dashTimeRemaining <= 0) {
        this.isDashing = false;
      }
    } else {
      this.targetVel.set(moveInput.x * this.speed, moveInput.y * this.speed);
      this.vel.lerp(this.targetVel, 0.2);

      if (this.vel.magSq() > 1000 && Math.random() < 0.3) {
        particleSys.emit({
          pos: this.pos.copy().add(new Vec2((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15)),
          vel: new Vec2(-this.vel.x * 0.1, -this.vel.y * 0.1),
          size: 4 + Math.random() * 4,
          endSize: 0,
          color: 'rgba(255, 255, 255, 0.4)',
          life: 0.25,
          type: 'blob'
        });
      }
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    const margin = this.baseRadius + 20;
    this.pos.x = Math.max(worldBounds.x + margin, Math.min(this.pos.x, worldBounds.x + worldBounds.w - margin));
    this.pos.y = Math.max(worldBounds.y + margin, Math.min(this.pos.y, worldBounds.y + worldBounds.h - margin));

    if (input.consumeAttack() || (input.attackHeld && this.attackTimer <= 0)) {
      this.attack(input.mouseWorld, soundFx, particleSys, camera);
    }

    if (this.isAttacking) {
      this.attackProgress += dt / this.attackDuration;
      if (this.attackProgress >= 1.0) {
        this.isAttacking = false;
        this.attackProgress = 0;
      }
    }

    const speedFraction = this.vel.mag() / this.speed;
    const moveAngle = this.vel.angle();
    if (this.isDashing) {
      this.bodyRotation = this.dashDir.angle();
      this.targetSquashX = 1.9;
      this.targetSquashY = 0.55;
    } else if (speedFraction > 0.1) {
      this.bodyRotation = moveAngle;
      this.targetSquashX = 1 + speedFraction * 0.28;
      this.targetSquashY = 1 - speedFraction * 0.22;
    } else {
      this.bodyRotation = this.aimAngle;
      this.targetSquashX = 1.0;
      this.targetSquashY = 1.0;
    }

    this.squashX += (this.targetSquashX - this.squashX) * 0.18;
    this.squashY += (this.targetSquashY - this.squashY) * 0.18;

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const wobble = Math.sin(this.timeAlive * 3.5 + i * 0.9) * 3.5 +
                     Math.cos(this.timeAlive * 5.2 - i * 1.4) * 2.0 +
                     Math.sin(this.timeAlive * 1.8 + i * 2.5) * 2.5;

      this.pointSprings[i] += (0 - this.pointOffsets[i]) * 0.22;
      this.pointSprings[i] *= 0.82;
      this.pointOffsets[i] += this.pointSprings[i];

      const r = this.baseRadius + wobble + this.pointOffsets[i];
      this.points[i].set(Math.cos(angle) * r, Math.sin(angle) * r);
    }

    this.pseudopods.forEach((pod) => {
      let targetLength = 12 + Math.sin(this.timeAlive * pod.wobbleSpeed + pod.phase) * 8;
      if (this.isAttacking) {
        const strikeExtension = Math.sin(this.attackProgress * Math.PI) * 95;
        targetLength += strikeExtension;
      }
      pod.length += (targetLength - pod.length) * 0.25;
    });
  }

  getAttackHitCircle() {
    if (!this.isAttacking) return null;
    if (this.attackProgress < 0.2 || this.attackProgress > 0.8) return null;

    const reach = this.baseRadius + 65 + Math.sin(this.attackProgress * Math.PI) * 60;
    const hitX = this.pos.x + Math.cos(this.aimAngle) * reach;
    const hitY = this.pos.y + Math.sin(this.aimAngle) * reach;
    return { x: hitX, y: hitY, radius: 52, damage: this.attackDamage };
  }

  draw(ctx) {
    if (this.dead) return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime * 20) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    // 1. Draw Organic Pseudopods
    this.pseudopods.forEach((pod, idx) => {
      const podAngle = this.aimAngle + pod.baseAngleOffset + Math.sin(this.timeAlive * 2 + pod.phase) * 0.15;
      const baseDist = this.baseRadius * 0.75;
      const startX = Math.cos(podAngle) * baseDist;
      const startY = Math.sin(podAngle) * baseDist;

      const tipDist = baseDist + pod.length;
      const tipX = Math.cos(podAngle) * tipDist;
      const tipY = Math.sin(podAngle) * tipDist;

      const ctrlAngle = podAngle + Math.sin(this.timeAlive * 3 + idx) * 0.3;
      const ctrlDist = baseDist + pod.length * 0.55;
      const ctrlX = Math.cos(ctrlAngle) * ctrlDist;
      const ctrlY = Math.sin(ctrlAngle) * ctrlDist;

      ctx.save();
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = Math.max(6, 18 - (pod.length / 10));
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(tipX, tipY, ctx.lineWidth * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 2. Body Outer Soft Glow
    ctx.save();
    ctx.rotate(this.bodyRotation);
    ctx.scale(this.squashX, this.squashY);

    const glowGrad = ctx.createRadialGradient(0, 0, this.baseRadius * 0.5, 0, 0, this.baseRadius * 1.5);
    glowGrad.addColorStop(0, 'rgba(235, 248, 255, 0.45)');
    glowGrad.addColorStop(0.7, 'rgba(186, 230, 253, 0.2)');
    glowGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.baseRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Primary Soft-Body Membrane
    const bodyGrad = ctx.createRadialGradient(-10, -12, 6, 0, 0, this.baseRadius * 1.1);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.45, '#f0f9ff');
    bodyGrad.addColorStop(0.8, '#dbeafe');
    bodyGrad.addColorStop(1, '#93c5fd');

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 4;
    drawSmoothClosedCurve(ctx, this.points);
    ctx.fill();
    ctx.stroke();

    // 4. Internal Organelles / Nucleus Lobes
    ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
    const lobeTime = this.timeAlive * 1.5;
    for (let l = 0; l < 3; l++) {
      const lobeAngle = (l / 3) * Math.PI * 2 + Math.sin(lobeTime + l) * 0.2;
      const lx = Math.cos(lobeAngle) * 12;
      const ly = Math.sin(lobeAngle) * 12;
      const lr = 9 + Math.sin(lobeTime * 2 + l * 1.5) * 2;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Cytoplasmic Granules
    ctx.fillStyle = 'rgba(59, 130, 246, 0.55)';
    for (let g = 0; g < 7; g++) {
      const gx = Math.sin(g * 12.3 + lobeTime) * 20;
      const gy = Math.cos(g * 7.7 - lobeTime) * 18;
      ctx.beginPath();
      ctx.arc(gx, gy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 6. Draw Attack Strike Impact Visual
    if (this.isAttacking && this.attackProgress > 0.2 && this.attackProgress < 0.8) {
      const reach = this.baseRadius + 60 + Math.sin(this.attackProgress * Math.PI) * 55;
      const strikeX = Math.cos(this.aimAngle) * reach;
      const strikeY = Math.sin(this.aimAngle) * reach;

      ctx.save();
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(strikeX, strikeY, 24 * Math.sin(this.attackProgress * Math.PI), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(strikeX, strikeY, 10 * Math.sin(this.attackProgress * Math.PI), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}

// ============================================================================
// 7. ENEMY ARCHETYPES (Procedural Pathogens)
// ============================================================================
class Enemy {
  constructor(x, y, type) {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(0, 0);
    this.type = type;
    this.dead = false;
    this.radius = 24;
    this.speed = 120;
    this.hp = 50;
    this.maxHp = 50;
    this.damage = 15;
    this.timeAlive = Math.random() * 100;
    this.hitStunTimer = 0;
    this.flashTimer = 0;

    this.squashX = 1.0;
    this.squashY = 1.0;
    this.bodyAngle = 0;
    this.numPoints = 16;
    this.initPoints();
  }

  initPoints() {
    this.points = [];
    this.pointOffsets = [];
    for (let i = 0; i < this.numPoints; i++) {
      this.points.push(new Vec2());
      this.pointOffsets.push(0);
    }
  }

  takeDamage(amount, hitDir, soundFx, particleSys, camera) {
    this.hp -= amount;
    this.flashTimer = 0.15;
    this.hitStunTimer = 0.18;

    this.vel.x += hitDir.x * 220;
    this.vel.y += hitDir.y * 220;

    this.squashX = 0.6;
    this.squashY = 1.5;

    soundFx.playHit();
    camera.shake(6, 0.18);

    particleSys.emitBurst(this.pos.x, this.pos.y, 8, {
      color: this.getBloodColor(),
      size: 4,
      minSpeed: 2,
      maxSpeed: 6,
      life: 0.35
    });

    if (this.hp <= 0) {
      this.dead = true;
      this.onDeath(soundFx, particleSys, camera);
    }
  }

  onDeath(soundFx, particleSys, camera) {
    soundFx.playEnemyDeath();
    camera.shake(9, 0.22);
    particleSys.emitShockwave(this.pos.x, this.pos.y, this.radius * 2.5, this.getAccentColor(), 0.35);
    particleSys.emitBurst(this.pos.x, this.pos.y, 24, {
      color: this.getBloodColor(),
      size: 5,
      minSpeed: 3,
      maxSpeed: 9,
      life: 0.65,
      type: 'blob'
    });
  }

  getBloodColor() { return '#ffffff'; }
  getAccentColor() { return '#ffffff'; }

  updateBase(dt) {
    this.timeAlive += dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.hitStunTimer > 0) this.hitStunTimer -= dt;

    this.squashX += (1.0 - this.squashX) * 0.15;
    this.squashY += (1.0 - this.squashY) * 0.15;
  }

  drawHealthBar(ctx) {
    if (this.hp < this.maxHp && this.hp > 0) {
      const barW = this.radius * 2;
      const barH = 5;
      const barX = this.pos.x - barW / 2;
      const barY = this.pos.y - this.radius - 14;
      const pct = Math.max(0, this.hp / this.maxHp);

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, barW * pct, barH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.restore();
    }
  }
}

/**
 * 7.1 BACTERIA: Large oval organism with waving cilia/flagella
 */
class Bacteria extends Enemy {
  constructor(x, y) {
    super(x, y, 'bacteria');
    this.radius = 32;
    this.speed = 105;
    this.hp = 70;
    this.maxHp = 70;
    this.damage = 18;
    this.numPoints = 20;
    this.initPoints();

    this.flagellaCount = 6;
    this.flagella = [];
    for (let f = 0; f < this.flagellaCount; f++) {
      this.flagella.push({
        baseAngle: (f / this.flagellaCount) * Math.PI * 2,
        length: 18 + Math.random() * 12,
        phase: Math.random() * Math.PI * 2,
        speed: 4 + Math.random() * 3
      });
    }
  }

  getBloodColor() { return '#86efac'; }
  getAccentColor() { return '#22c55e'; }

  update(dt, player, worldBounds) {
    this.updateBase(dt);

    if (this.hitStunTimer <= 0) {
      const toPlayer = player.pos.copy().sub(this.pos);
      const dist = toPlayer.mag();
      if (dist > 5) {
        toPlayer.norm();
        const wander = Math.sin(this.timeAlive * 3) * 0.35;
        const moveAngle = toPlayer.angle() + wander;
        const targetVel = new Vec2(Math.cos(moveAngle) * this.speed, Math.sin(moveAngle) * this.speed);
        this.vel.lerp(targetVel, 0.08);
      }
    } else {
      this.vel.mult(0.9);
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.bodyAngle = this.vel.angle();

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const rx = this.radius * 1.35;
      const ry = this.radius * 0.85;
      const wobble = Math.sin(this.timeAlive * 4 + i * 1.2) * 2.5;

      const px = Math.cos(angle) * (rx + wobble);
      const py = Math.sin(angle) * (ry + wobble);
      this.points[i].set(px, py);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.bodyAngle);
    ctx.scale(this.squashX, this.squashY);

    // Flagella appendages
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.5;
    this.flagella.forEach((flag) => {
      const fx = Math.cos(flag.baseAngle) * this.radius * 0.9;
      const fy = Math.sin(flag.baseAngle) * this.radius * 0.7;
      const wave = Math.sin(this.timeAlive * flag.speed + flag.phase) * 8;
      const tx = fx - Math.cos(flag.baseAngle) * flag.length + wave * 0.5;
      const ty = fy + wave;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx - flag.length * 0.5, fy + wave * 1.2, tx, ty);
      ctx.stroke();
    });

    // Body Fill & Membrane
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius * 1.4);
    if (this.flashTimer > 0) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#ef4444');
    } else {
      grad.addColorStop(0, '#bbf7d0');
      grad.addColorStop(0.5, '#4ade80');
      grad.addColorStop(1, '#15803d');
    }

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    drawSmoothClosedCurve(ctx, this.points);
    ctx.fill();
    ctx.stroke();

    // Nucleoid DNA strand
    ctx.strokeStyle = 'rgba(21, 128, 61, 0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let s = -18; s <= 18; s += 6) {
      const sy = Math.sin(s * 0.3 + this.timeAlive * 3) * 6;
      if (s === -18) ctx.moveTo(s, sy);
      else ctx.lineTo(s, sy);
    }
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * 7.2 VIRUS: Sphere with 8-12 wobbling spikes + surge dash
 */
class Virus extends Enemy {
  constructor(x, y) {
    super(x, y, 'virus');
    this.radius = 26;
    this.speed = 135;
    this.hp = 50;
    this.maxHp = 50;
    this.damage = 22;
    this.numSpikes = 10;
    this.spikes = [];
    for (let s = 0; s < this.numSpikes; s++) {
      this.spikes.push({
        baseAngle: (s / this.numSpikes) * Math.PI * 2,
        length: 14 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        wobbleRate: 3 + Math.random() * 2
      });
    }

    this.dashTimer = 2.0 + Math.random() * 1.5;
    this.isSurging = false;
    this.surgeDuration = 0.35;
    this.surgeTimeRemaining = 0;
    this.surgeDir = new Vec2();
  }

  getBloodColor() { return '#e879f9'; }
  getAccentColor() { return '#c084fc'; }

  update(dt, player, worldBounds) {
    this.updateBase(dt);

    if (this.dashTimer > 0) this.dashTimer -= dt;

    if (this.isSurging) {
      this.surgeTimeRemaining -= dt;
      this.vel.set(this.surgeDir.x * 480, this.surgeDir.y * 480);
      if (this.surgeTimeRemaining <= 0) {
        this.isSurging = false;
        this.dashTimer = 2.8 + Math.random() * 1.5;
      }
    } else {
      if (this.hitStunTimer <= 0) {
        const toPlayer = player.pos.copy().sub(this.pos);
        const dist = toPlayer.mag();
        if (dist > 5) {
          toPlayer.norm();
          if (dist < 320 && this.dashTimer <= 0) {
            this.isSurging = true;
            this.surgeTimeRemaining = this.surgeDuration;
            this.surgeDir = toPlayer.copy();
            this.squashX = 1.6;
            this.squashY = 0.6;
          } else {
            this.vel.lerp(new Vec2(toPlayer.x * this.speed, toPlayer.y * this.speed), 0.1);
          }
        }
      } else {
        this.vel.mult(0.88);
      }
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.bodyAngle = this.vel.angle();

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const r = this.radius + Math.sin(this.timeAlive * 5 + i * 1.5) * 2;
      this.points[i].set(Math.cos(angle) * r, Math.sin(angle) * r);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.bodyAngle);
    ctx.scale(this.squashX, this.squashY);

    // Glycoprotein Spikes
    this.spikes.forEach((spike) => {
      const wobble = Math.sin(this.timeAlive * spike.wobbleRate + spike.phase) * 0.2;
      const angle = spike.baseAngle + wobble;
      const sx = Math.cos(angle) * (this.radius * 0.8);
      const sy = Math.sin(angle) * (this.radius * 0.8);
      const tx = Math.cos(angle) * (this.radius + spike.length);
      const ty = Math.sin(angle) * (this.radius + spike.length);

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Central Capsid
    const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, this.radius);
    if (this.flashTimer > 0) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#f43f5e');
    } else {
      grad.addColorStop(0, '#f5d0fe');
      grad.addColorStop(0.5, '#c084fc');
      grad.addColorStop(1, '#7e22ce');
    }

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 3;
    drawSmoothClosedCurve(ctx, this.points);
    ctx.fill();
    ctx.stroke();

    // RNA Core Glow
    ctx.fillStyle = '#fae8ff';
    ctx.beginPath();
    ctx.arc(0, 0, 7 + Math.sin(this.timeAlive * 4) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * 7.3 PARASITE: Small, fast, flexible organism that stretches with velocity
 */
class Parasite extends Enemy {
  constructor(x, y) {
    super(x, y, 'parasite');
    this.radius = 18;
    this.speed = 240;
    this.hp = 30;
    this.maxHp = 30;
    this.damage = 12;
    this.segments = 5;
    this.history = [];
    for (let i = 0; i < 15; i++) {
      this.history.push(this.pos.copy());
    }
  }

  getBloodColor() { return '#fde047'; }
  getAccentColor() { return '#f59e0b'; }

  update(dt, player, worldBounds) {
    this.updateBase(dt);

    if (this.hitStunTimer <= 0) {
      const toPlayer = player.pos.copy().sub(this.pos);
      const dist = toPlayer.mag();
      if (dist > 5) {
        toPlayer.norm();
        const slither = Math.sin(this.timeAlive * 8) * 0.55;
        const angle = toPlayer.angle() + slither;
        const targetVel = new Vec2(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
        this.vel.lerp(targetVel, 0.18);
      }
    } else {
      this.vel.mult(0.85);
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.bodyAngle = this.vel.angle();

    const curSpeed = this.vel.mag();
    this.squashX = 1 + (curSpeed / this.speed) * 0.7;
    this.squashY = Math.max(0.4, 1 - (curSpeed / this.speed) * 0.4);

    this.history.unshift(this.pos.copy());
    if (this.history.length > 15) {
      this.history.pop();
    }
  }

  draw(ctx) {
    ctx.save();

    for (let s = this.history.length - 1; s >= 0; s -= 3) {
      const p = this.history[s];
      const frac = 1 - s / this.history.length;
      const segRadius = Math.max(3, this.radius * frac * 0.8);

      ctx.fillStyle = this.flashTimer > 0 ? '#ffffff' : (s === 0 ? '#fde047' : '#d97706');
      ctx.beginPath();
      ctx.arc(p.x, p.y, segRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.bodyAngle);
    ctx.scale(this.squashX, this.squashY);

    const grad = ctx.createRadialGradient(-3, 0, 2, 0, 0, this.radius);
    if (this.flashTimer > 0) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#ef4444');
    } else {
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#b45309');
    }

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Biting mouth hooks
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(this.radius * 0.9, -4);
    ctx.lineTo(this.radius * 1.4, 0);
    ctx.lineTo(this.radius * 0.9, 4);
    ctx.fill();

    ctx.restore();
  }
}

// ============================================================================
// 8. WAVE & LEVEL MANAGER
// ============================================================================
class WaveManager {
  constructor(game) {
    this.game = game;
    this.currentWave = 0;
    this.totalWaves = 3;
    this.waveActive = false;
    this.waveClearDelay = 1.6;
    this.waveClearTimer = 0;
  }

  startNextWave() {
    this.currentWave++;
    this.waveActive = true;
    this.waveClearTimer = 0;

    let enemiesToSpawn = [];
    let title = `WAVE ${this.currentWave}`;
    let subtitle = '';

    if (this.currentWave === 1) {
      subtitle = 'BACTERIAL INFECTION';
      for (let i = 0; i < 5; i++) enemiesToSpawn.push('bacteria');
    } else if (this.currentWave === 2) {
      subtitle = 'VIRAL REPLICATION';
      for (let i = 0; i < 5; i++) enemiesToSpawn.push('bacteria');
      for (let i = 0; i < 2; i++) enemiesToSpawn.push('virus');
    } else if (this.currentWave === 3) {
      subtitle = 'SYSTEMIC OUTBREAK';
      for (let i = 0; i < 6; i++) enemiesToSpawn.push('bacteria');
      for (let i = 0; i < 3; i++) enemiesToSpawn.push('virus');
      for (let i = 0; i < 2; i++) enemiesToSpawn.push('parasite');
    }

    enemiesToSpawn.forEach((type) => {
      const pos = this.getRandomSpawnPosition();
      let enemy = null;
      if (type === 'bacteria') enemy = new Bacteria(pos.x, pos.y);
      else if (type === 'virus') enemy = new Virus(pos.x, pos.y);
      else if (type === 'parasite') enemy = new Parasite(pos.x, pos.y);

      if (enemy) {
        this.game.enemies.push(enemy);
      }
    });

    this.game.showWaveBanner(title, subtitle);
    this.game.updateHUD();
  }

  getRandomSpawnPosition() {
    const bounds = this.game.worldBounds;
    const padding = 120;
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;

    if (side === 0) {
      x = bounds.x + padding + Math.random() * (bounds.w - padding * 2);
      y = bounds.y + padding;
    } else if (side === 1) {
      x = bounds.x + bounds.w - padding;
      y = bounds.y + padding + Math.random() * (bounds.h - padding * 2);
    } else if (side === 2) {
      x = bounds.x + padding + Math.random() * (bounds.w - padding * 2);
      y = bounds.y + bounds.h - padding;
    } else {
      x = bounds.x + padding;
      y = bounds.y + padding + Math.random() * (bounds.h - padding * 2);
    }
    return new Vec2(x, y);
  }

  update(dt) {
    if (!this.waveActive) return;

    if (this.game.enemies.length === 0) {
      this.waveClearTimer += dt;
      if (this.waveClearTimer >= this.waveClearDelay) {
        if (this.currentWave < this.totalWaves) {
          this.game.soundFx.playWaveComplete();
          this.startNextWave();
        } else {
          this.waveActive = false;
          this.game.soundFx.playWaveComplete();
          this.game.showVictoryModal();
        }
      }
    }
  }
}

// ============================================================================
// 9. BACKGROUND ENVIRONMENT (Microscopic Blood Stream Simulation)
// ============================================================================
class Environment {
  constructor(bounds) {
    this.bounds = bounds;
    this.redBloodCells = [];
    this.floaters = [];
    this.time = 0;
    this.init();
  }

  init() {
    for (let i = 0; i < 45; i++) {
      this.redBloodCells.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        vel: new Vec2(
          (Math.random() * 25 + 15) * (Math.random() < 0.5 ? 1 : -1),
          (Math.random() * 20 - 10)
        ),
        radiusX: 20 + Math.random() * 12,
        radiusY: 14 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        color: Math.random() < 0.5 ? '#7f1d1d' : '#991b1b',
        alpha: 0.28 + Math.random() * 0.25
      });
    }

    for (let i = 0; i < 90; i++) {
      this.floaters.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        size: 1.5 + Math.random() * 3.5,
        speed: 8 + Math.random() * 18,
        alpha: 0.15 + Math.random() * 0.35
      });
    }
  }

  update(dt) {
    this.time += dt;

    this.redBloodCells.forEach((rbc) => {
      rbc.pos.x += rbc.vel.x * dt;
      rbc.pos.y += rbc.vel.y * dt;
      rbc.rot += rbc.rotSpeed * dt;

      if (rbc.pos.x < this.bounds.x - 50) rbc.pos.x = this.bounds.x + this.bounds.w + 50;
      if (rbc.pos.x > this.bounds.x + this.bounds.w + 50) rbc.pos.x = this.bounds.x - 50;
      if (rbc.pos.y < this.bounds.y - 50) rbc.pos.y = this.bounds.y + this.bounds.h + 50;
      if (rbc.pos.y > this.bounds.y + this.bounds.h + 50) rbc.pos.y = this.bounds.y - 50;
    });

    this.floaters.forEach((f) => {
      f.pos.y -= f.speed * dt;
      f.pos.x += Math.sin(this.time + f.speed) * 0.4;
      if (f.pos.y < this.bounds.y - 10) f.pos.y = this.bounds.y + this.bounds.h + 10;
    });
  }

  draw(ctx, viewport) {
    const bgGrad = ctx.createRadialGradient(
      this.bounds.x + this.bounds.w * 0.5,
      this.bounds.y + this.bounds.h * 0.5,
      this.bounds.w * 0.1,
      this.bounds.x + this.bounds.w * 0.5,
      this.bounds.y + this.bounds.h * 0.5,
      this.bounds.w * 0.8
    );
    bgGrad.addColorStop(0, '#310a10');
    bgGrad.addColorStop(0.5, '#1e0508');
    bgGrad.addColorStop(1, '#090103');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);

    this.floaters.forEach((f) => {
      ctx.fillStyle = 'rgba(255, 180, 200, ' + f.alpha + ')';
      ctx.beginPath();
      ctx.arc(f.pos.x, f.pos.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    });

    this.redBloodCells.forEach((rbc) => {
      ctx.save();
      ctx.translate(rbc.pos.x, rbc.pos.y);
      ctx.rotate(rbc.rot);
      ctx.globalAlpha = rbc.alpha;

      ctx.fillStyle = rbc.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, rbc.radiusX, rbc.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, rbc.radiusX * 0.45, rbc.radiusY * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    this.drawVesselBoundaries(ctx);
  }

  drawVesselBoundaries(ctx) {
    const b = this.bounds;
    const wallThick = 40;
    const wave = Math.sin(this.time * 2) * 5;

    ctx.save();
    ctx.fillStyle = '#4c0c14';
    ctx.strokeStyle = '#831826';
    ctx.lineWidth = 6;

    ctx.fillRect(b.x, b.y, b.w, wallThick + wave);
    ctx.fillRect(b.x, b.y + b.h - wallThick - wave, b.w, wallThick + wave);
    ctx.fillRect(b.x, b.y, wallThick + wave, b.h);
    ctx.fillRect(b.x + b.w - wallThick - wave, b.y, wallThick + wave, b.h);

    ctx.strokeRect(b.x + wallThick + wave, b.y + wallThick + wave, b.w - (wallThick + wave) * 2, b.h - (wallThick + wave) * 2);
    ctx.restore();
  }
}

// ============================================================================
// 10. MAIN GAME CONTROLLER
// ============================================================================
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.worldBounds = { x: -1200, y: -1200, w: 2400, h: 2400 };
    this.state = 'TITLE';

    this.soundFx = new SoundFX();
    this.camera = new Camera();
    this.input = new InputManager(this.canvas);
    this.particleSys = new ParticleSystem();
    this.environment = new Environment(this.worldBounds);
    this.waveManager = new WaveManager(this);

    this.player = new Player(0, 0);
    this.enemies = [];

    this.lastTime = performance.now();
    this.totalKills = 0;

    this.initDOM();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initDOM() {
    this.hudElement = document.getElementById('hud');
    this.hpFill = document.getElementById('hp-bar-fill');
    this.hpGhost = document.getElementById('hp-bar-ghost');
    this.hpText = document.getElementById('hp-text');
    this.dashFill = document.getElementById('dash-cd-fill');
    this.waveBadge = document.getElementById('wave-badge');
    this.germCount = document.getElementById('germ-count');
    this.waveBanner = document.getElementById('wave-banner');
    this.waveBannerTitle = document.getElementById('wave-banner-title');
    this.waveBannerSub = document.getElementById('wave-banner-sub');

    this.startModal = document.getElementById('start-modal');
    this.gameOverModal = document.getElementById('game-over-modal');
    this.victoryModal = document.getElementById('victory-modal');
    this.gameOverStats = document.getElementById('game-over-stats');
    this.victoryStats = document.getElementById('victory-stats');

    document.getElementById('btn-start').addEventListener('click', () => {
      this.soundFx.init();
      this.startModal.classList.remove('active');
      this.startModal.classList.add('hidden');
      this.startGame();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      this.gameOverModal.classList.add('hidden');
      this.gameOverModal.classList.remove('active');
      this.startGame();
    });

    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.victoryModal.classList.add('hidden');
      this.victoryModal.classList.remove('active');
      this.startGame();
    });
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  startGame() {
    this.state = 'PLAYING';
    this.player = new Player(0, 0);
    this.enemies = [];
    this.totalKills = 0;
    this.waveManager.currentWave = 0;
    this.hudElement.classList.remove('hidden');

    this.waveManager.startNextWave();
  }

  showWaveBanner(title, subtitle) {
    this.waveBannerTitle.textContent = title;
    this.waveBannerSub.textContent = subtitle;
    this.waveBanner.classList.add('show');
    setTimeout(() => {
      this.waveBanner.classList.remove('show');
    }, 2000);
  }

  showGameOverModal() {
    this.state = 'GAMEOVER';
    this.hudElement.classList.add('hidden');
    this.gameOverStats.innerHTML = `<span>WAVE: ${this.waveManager.currentWave}/3</span><span>KILLS: ${this.totalKills}</span>`;
    this.gameOverModal.classList.remove('hidden');
    this.gameOverModal.classList.add('active');
  }

  showVictoryModal() {
    this.state = 'VICTORY';
    this.hudElement.classList.add('hidden');
    this.victoryStats.innerHTML = `<span>STATUS: STERILIZED</span><span>TOTAL KILLS: ${this.totalKills}</span>`;
    this.victoryModal.classList.remove('hidden');
    this.victoryModal.classList.add('active');
  }

  updateHUD() {
    if (this.state !== 'PLAYING') return;

    const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
    this.hpFill.style.width = `${hpPct}%`;
    this.hpGhost.style.width = `${hpPct}%`;
    this.hpText.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;

    if (hpPct < 30) {
      this.hpFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    } else {
      this.hpFill.style.background = 'linear-gradient(90deg, #4ade80, #38ef7d)';
    }

    const dashPct = this.player.dashTimer > 0 
      ? (1 - this.player.dashTimer / this.player.dashCooldown) * 100 
      : 100;
    this.dashFill.style.width = `${dashPct}%`;

    this.waveBadge.textContent = `WAVE ${this.waveManager.currentWave}/3`;
    this.germCount.textContent = this.enemies.length;
  }

  gameLoop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    this.input.updateWorldMouse(this.camera);

    if (this.state === 'PLAYING') {
      this.player.update(dt, this.input, this.soundFx, this.particleSys, this.camera, this.worldBounds);

      const attackHit = this.player.getAttackHitCircle();
      if (attackHit && !this.player.attackHitboxTriggered) {
        let hitSomeone = false;
        this.enemies.forEach((enemy) => {
          const d = enemy.pos.dist(new Vec2(attackHit.x, attackHit.y));
          if (d < attackHit.radius + enemy.radius) {
            const hitDir = enemy.pos.copy().sub(this.player.pos).norm();
            enemy.takeDamage(attackHit.damage, hitDir, this.soundFx, this.particleSys, this.camera);
            hitSomeone = true;
          }
        });
        if (hitSomeone) {
          this.player.attackHitboxTriggered = true;
        }
      }

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        enemy.update(dt, this.player, this.worldBounds);

        if (!this.player.dead && enemy.pos.dist(this.player.pos) < enemy.radius + this.player.baseRadius * 0.75) {
          const damaged = this.player.takeDamage(enemy.damage, this.soundFx, this.particleSys, this.camera);
          if (damaged) {
            const pushDir = enemy.pos.copy().sub(this.player.pos).norm();
            enemy.vel.add(pushDir.mult(140));
          }
        }

        if (enemy.dead) {
          this.totalKills++;
          this.enemies.splice(i, 1);
        }
      }

      if (this.player.dead && this.state === 'PLAYING') {
        this.state = 'DYING';
        setTimeout(() => this.showGameOverModal(), 1200);
      }

      this.waveManager.update(dt);
      this.updateHUD();
    }

    this.environment.update(dt);
    this.particleSys.update(dt);
    this.camera.update(dt, this.player.pos, this.width, this.height, this.worldBounds);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.camera.applyTransform(this.ctx);

    this.environment.draw(this.ctx, {
      x: this.camera.pos.x,
      y: this.camera.pos.y,
      w: this.width,
      h: this.height
    });

    this.enemies.forEach((enemy) => {
      enemy.draw(this.ctx);
      enemy.drawHealthBar(this.ctx);
    });
    this.player.draw(this.ctx);
    this.particleSys.draw(this.ctx);

    this.ctx.restore();
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  window.immuneGame = new Game();
});
