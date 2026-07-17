(() => {
  'use strict';

  const W = 780;
  const H = 1688;
  const TAU = Math.PI * 2;
  const money = (value) => `R$${value.toFixed(2).replace('.', ',')}`;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutBack = (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
  const PANEL_X = 95;
  const PANEL_W = 590;
  const PANEL_DEFAULT_DURATION = 5200;

  const { PAYLINES, SYMBOLS, FEATURE_TRIGGER_RATE, evaluateGrid } = window.CoelhoMath;
  const REEL_LAYOUT = [
    { x: 69, y: 580, w: 202, h: 645, rows: 3, cellH: 215 },
    { x: 289, y: 522, w: 202, h: 740, rows: 4, cellH: 185 },
    { x: 509, y: 580, w: 202, h: 645, rows: 3, cellH: 215 },
  ];
  const LINE_RAILS = {
    left: [2, 3, 1, 6, 7, 4, 5, 10, 8, 9],
    right: [2, 4, 1, 6, 8, 3, 5, 10, 7, 9],
  };
  const LINE_RAIL_Y = [610, 665, 720, 805, 860, 915, 970, 1070, 1125, 1180];
  const ASSET_PATHS = {
    sky: 'assets/layout-v2/clean/ceu.jpg',
    houseLeft: 'assets/layout-v2/clean/casa_left_estatica.png',
    houseRight: 'assets/layout-v2/clean/casa_right_estatica.png',
    lanternLeft: 'assets/layout-v2/clean/lanterna_left.png',
    lanternRight: 'assets/layout-v2/clean/lanterna_right.png',
    logo: 'assets/layout-v2/clean/logo_jogo.png',
    mascot: 'assets/layout-v2/clean/mascote.png',
    menuButton: 'assets/layout-v2/clean/botao_menu.png',
    reelFrame: 'assets/layout-v2/clean/central_rolo_aposta.png',
    displayFrame: 'assets/layout-v2/clean/display.png',
    scoreFrame: 'assets/layout-v2/clean/placar.png',
    lowerOrnament: 'assets/layout-v2/clean/arrabesco_inferior.png',
    turboButton: 'assets/layout-v2/clean/botao_turbo.png',
    minusButton: 'assets/layout-v2/clean/botao_menos.png',
    spinButton: 'assets/layout-v2/clean/botao_jogar.png',
    plusButton: 'assets/layout-v2/clean/botao_mais.png',
    autoButton: 'assets/layout-v2/clean/botao_auto.png',
    symbolBag: 'assets/symbols-v2/clean/10_simbolo_saco_fortuna.png',
    symbolIngot: 'assets/symbols-v2/clean/11_simbolo_lingote.png',
    symbolCoin: 'assets/symbols-v2/clean/12_simbolo_moeda_chinesa_esquerda.png',
    symbolWhiteRabbit: 'assets/symbols-v2/clean/14_simbolo_coelho_branco.png',
    symbolCarrot: 'assets/symbols-v2/clean/15_simbolo_cenoura.png',
    symbolGoldenRabbit: 'assets/symbols-v2/clean/17_simbolo_coelho_dourado.png',
    symbolLantern: 'assets/symbols-v2/clean/18_simbolo_lanterna_fortuna.png',
    symbolWild: 'assets/symbols-v2/clean/wild.png',
    symbolPrize: 'assets/symbols-v2/clean/simbolo_premio.png',
    celebration1: 'assets/celebration/clean/animacao_ganhou1.png',
    celebration2: 'assets/celebration/clean/animacao_ganhou2.png',
    celebration3: 'assets/celebration/clean/animacao_ganhou3.png',
    celebration4: 'assets/celebration/clean/animacao_ganhou4.png',
    celebration5: 'assets/celebration/clean/animacao_ganhou5.png',
    idle1: 'assets/idle/clean/animacao_parado1.png',
    idle2: 'assets/idle/clean/animacao_parado2.png',
    idle3: 'assets/idle/clean/animacao_parado3.png',
    idle4: 'assets/idle/clean/animacao_parado4.png',
    idle5: 'assets/idle/clean/animacao_parado5.png',
    openingBackground: 'assets/opening/clean/fundo_abertura.jpg',
    openingButton: 'assets/opening/clean/fundo_botao.png',
  };
  const ASSETS = {};

  function loadAssets() {
    return Promise.all(Object.entries(ASSET_PATHS).map(([key, src]) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => { ASSETS[key] = image; resolve(); };
      image.onerror = () => resolve();
      image.src = src;
    })));
  }
  const PANEL_TIPS = [
    { text: '5 OU MAIS PRÊMIOS PAGAM TODOS!', mode: 'center', duration: 3200 },
    { text: '8 RODADAS DA FORTUNA COM SÍMBOLOS DE PRÊMIO!', mode: 'scroll' },
    { text: 'WILD SUBSTITUI SÍMBOLOS COMUNS!', mode: 'center', duration: 3200 },
    { text: 'GANHE ATÉ 5000X!', mode: 'center', duration: 3000 },
    { text: 'LINHAS ATIVAS PAGAM DA ESQUERDA PARA A DIREITA!', mode: 'scroll' },
  ];
  // Modo atual prioriza validação visual. Probabilidades finais ficam fora do escopo.
  const SHOWCASE_MULTI_LINE_RATE = 0.72;
  const SHOWCASE_PRIZE_RATE = 0.16;

  class SoundEngine {
    constructor() {
      this.musicEnabled = true;
      this.effectsEnabled = true;
      this.ctx = null;
      this.fxMaster = null;
      this.spinOsc = null;
      this.spinGain = null;
      this.spinNoise = null;
      this.musicStarted = false;
      this.music = new Audio('assets/audio/Bamboo_and_Morning_Light.mp3');
      this.music.id = 'backgroundMusic';
      this.music.hidden = true;
      this.music.loop = true;
      this.music.preload = 'auto';
      this.music.volume = 0.15;
      this.music.setAttribute('playsinline', '');
      document.body.appendChild(this.music);
    }

    ready() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.fxMaster = this.ctx.createGain();
        this.fxMaster.gain.value = 0.34;
        this.fxMaster.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (this.musicEnabled && !this.musicStarted) this.startMusic();
    }

    setMusicEnabled(enabled) {
      this.musicEnabled = enabled;
      if (enabled) this.ready();
      else this.stopMusic();
    }

    setEffectsEnabled(enabled) {
      this.effectsEnabled = enabled;
      if (enabled) this.ready();
      else this.stopSpin();
    }

    startMusic() {
      if (!this.musicEnabled || this.musicStarted) return;
      this.musicStarted = true;
      const playback = this.music.play();
      if (playback) playback.catch((error) => {
        this.musicStarted = false;
        this.musicError = error.message;
        this.music.dataset.error = error.message;
      });
    }

    stopMusic() {
      this.music.pause();
      this.musicStarted = false;
    }

    tone(freq, duration, gain = 0.045, type = 'sine', delay = 0) {
      if (!this.effectsEnabled) return;
      this.ready();
      const at = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const volume = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      volume.gain.setValueAtTime(0.0001, at);
      volume.gain.exponentialRampToValueAtTime(gain, at + 0.015);
      volume.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      osc.connect(volume).connect(this.fxMaster);
      osc.start(at);
      osc.stop(at + duration + 0.03);
    }

    noise(duration = 0.12, gain = 0.08, frequency = 1200, delay = 0) {
      if (!this.effectsEnabled) return null;
      this.ready();
      const at = this.ctx.currentTime + delay;
      const length = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const volume = this.ctx.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency, at);
      filter.Q.value = 0.75;
      volume.gain.setValueAtTime(0.0001, at);
      volume.gain.exponentialRampToValueAtTime(gain, at + 0.012);
      volume.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      source.connect(filter).connect(volume).connect(this.fxMaster);
      source.start(at);
      source.stop(at + duration + 0.02);
      return { source, volume, filter };
    }

    button(kind = 'button') {
      if (!this.effectsEnabled) return;
      const base = kind === 'spin' ? 260 : kind === 'turbo' ? 520 : 390;
      this.tone(base, 0.075, 0.16, 'triangle');
      this.tone(base * 1.5, 0.055, 0.09, 'sine', 0.018);
      this.noise(0.045, 0.055, 1800);
    }

    startSpin() {
      if (!this.effectsEnabled) return;
      this.ready();
      this.stopSpin();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(52, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(78, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(96, this.ctx.currentTime + 0.55);
      gain.gain.linearRampToValueAtTime(0.085, this.ctx.currentTime + 0.12);
      osc.connect(gain).connect(this.fxMaster);
      osc.start();
      this.spinOsc = osc;
      this.spinGain = gain;
      this.spinNoise = this.noise(3.2, 0.085, 760);
    }

    stopSpin() {
      if (!this.spinOsc || !this.ctx) return;
      const at = this.ctx.currentTime;
      this.spinGain.gain.cancelScheduledValues(at);
      this.spinGain.gain.setValueAtTime(Math.max(0.0001, this.spinGain.gain.value), at);
      this.spinGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.08);
      this.spinOsc.stop(at + 0.1);
      this.spinOsc = null;
      this.spinGain = null;
      if (this.spinNoise) {
        try { this.spinNoise.source.stop(at + 0.08); } catch (_) { /* already stopped */ }
        this.spinNoise = null;
      }
    }

    reelStop(index) {
      this.tone(125 + index * 30, 0.14, 0.19, 'square');
      this.tone(560 + index * 70, 0.11, 0.11, 'triangle', 0.025);
      this.noise(0.07, 0.08, 900 + index * 180);
    }

    lineWin(index = 0) {
      this.tone(620 + index * 36, 0.16, 0.15, 'triangle');
      this.tone(930 + index * 28, 0.13, 0.1, 'sine', 0.045);
    }

    win(big = false) {
      const base = big ? 330 : 440;
      [0, 4, 7, 12].forEach((semi, index) => this.tone(base * Math.pow(2, semi / 12), 0.38, big ? 0.17 : 0.13, 'triangle', index * 0.105));
      [0, 1, 2, 3, 4, 5].forEach((step) => this.tone(1150 + step * 135, 0.09, 0.055, 'sine', 0.08 + step * 0.07));
      this.noise(0.32, big ? 0.12 : 0.075, 2200, 0.04);
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.sound = new SoundEngine();
      this.state = 'IDLE';
      this.balance = 250;
      this.baseBet = 0.05;
      this.level = 4;
      this.lastWin = 0;
      this.turbo = false;
      this.autoRemaining = 0;
      this.autoActive = false;
      this.autoStartBalance = this.balance;
      this.autoLimits = { loss: 0, gain: 0, single: 0 };
      this.featureRemaining = 0;
      this.featureTotal = 0;
      this.featureIntroStart = 0;
      this.featureOutroStart = 0;
      this.activeFeatureSpin = false;
      this.pendingFeature = false;
      const demoMode = new URLSearchParams(window.location.search).get('demo');
      this.forceFeature = demoMode === 'feature';
      this.forceLines = demoMode === 'lines';
      this.forceLine1 = demoMode === 'line1';
      this.forceLines35 = demoMode === 'lines35';
      this.forcePrize = demoMode === 'prize';
      this.forceMax = demoMode === 'max';
      this.overlay = null;
      this.overlayScroll = 0;
      this.dragStart = null;
      this.history = [];
      this.historyFilter = 'today';
      this.customDateFrom = null;
      this.customDateTo = null;
      this.selectedHistory = null;
      this.sessionSeed = Math.random().toString(36).slice(2, 10).toUpperCase();
      this.spinStart = 0;
      this.winStart = 0;
      this.lastTime = performance.now();
      this.openingActive = true;
      this.openingStarted = performance.now();
      this.openingReadyAt = this.openingStarted + 4000;
      this.spinButtonAngle = 0;
      this.autoTotal = 0;
      this.buttonPress = null;
      this.celebrateWin = false;
      this.reels = REEL_LAYOUT.map((layout, index) => ({
        ...layout,
        index,
        offset: 0,
        speed: 0,
        stopped: true,
        bounceStart: 0,
        strip: this.randomStrip(18),
      }));
      this.grid = this.makeGrid(false);
      this.result = { total: 0, lines: [], cells: [], prizes: [] };
      this.particles = [];
      this.hitAreas = [];
      this.lineCycle = 0;
      this.lineShowAll = false;
      this.lastLineSoundIndex = -1;
      this.featurePulse = 0;
      this.message = 'BOA SORTE!';
      this.panelTipIndex = 0;
      this.panelQueue = [];
      this.tickerText = '';
      this.tickerMode = 'center';
      this.tickerStarted = performance.now();
      this.tickerDuration = PANEL_DEFAULT_DURATION;
      this.tickerAlpha = 0;
      this.tickerX = PANEL_X + PANEL_W + 12;
      this.tickerWidth = 0;
      this.paylinePreviewStart = 0;
      this.paylinePreviewUntil = 0;
      this.renderTime = performance.now();
      this.activatePanelItem(PANEL_TIPS[0], performance.now());
      this.bind();
    }

    get lineStake() {
      return this.baseBet * this.level;
    }

    get bet() {
      return this.lineStake * 10;
    }

    randomSymbol(feature = false) {
      return window.CoelhoMath.randomSymbol(feature);
    }

    randomStrip(length, feature = false) {
      return Array.from({ length }, () => this.randomSymbol(feature));
    }

    makeGrid(feature = false) {
      return window.CoelhoMath.makeGrid(feature);
    }

    makeShowcaseGrid() {
      const roll = Math.random();
      const grid = this.makeGrid(false);

      if (roll < SHOWCASE_MULTI_LINE_RATE) {
        const commonTypes = ['rabbit', 'bag', 'cards', 'coins', 'rockets', 'carrot'];
        const type = commonTypes[Math.floor(Math.random() * commonTypes.length)];
        const lineIndexes = PAYLINES.map((_, index) => index).sort(() => Math.random() - 0.5);
        const count = Math.random() < 0.14 ? 10 : 2 + Math.floor(Math.random() * 5);
        lineIndexes.slice(0, count).forEach((lineIndex) => {
          PAYLINES[lineIndex].forEach((row, column) => {
            grid[column][row] = { type, prize: 0 };
          });
        });
        return grid;
      }

      if (roll < SHOWCASE_MULTI_LINE_RATE + SHOWCASE_PRIZE_RATE) {
        const cells = [];
        grid.forEach((column, c) => column.forEach((_, r) => cells.push({ c, r })));
        cells.sort(() => Math.random() - 0.5);
        const count = 5 + Math.floor(Math.random() * 4);
        cells.slice(0, count).forEach(({ c, r }) => {
          grid[c][r] = { type: 'prize', prize: this.randomPrize() };
        });
      }
      return grid;
    }

    randomPrize() {
      return window.CoelhoMath.randomPrize();
    }

    bind() {
      const point = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        const source = event.touches ? event.touches[0] : event;
        return {
          x: (source.clientX - rect.left) * W / rect.width,
          y: (source.clientY - rect.top) * H / rect.height,
        };
      };
      this.canvas.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        const p = point(event);
        const target = [...this.hitAreas].reverse().find((area) => p.x >= area.x && p.x <= area.x + area.w && p.y >= area.y && p.y <= area.y + area.h);
        if (target) {
          this.sound.ready();
          this.buttonPress = { id: target.id || 'generic', x: p.x, y: p.y, started: performance.now(), until: performance.now() + 190 };
          if (this.autoActive) this.stopAuto('RODADA AUTOMÁTICA PARADA');
          this.sound.button(target.id === 'spin' ? 'spin' : target.id === 'turbo' ? 'turbo' : 'button');
          target.action();
        }
        else if (this.overlay) this.dragStart = { y: p.y, scroll: this.overlayScroll };
        else if (this.state === 'SPIN_LOOP') {
          if (this.autoActive) this.stopAuto('RODADA AUTOMÁTICA PARADA');
          this.fastStop();
        }
      });
      this.canvas.addEventListener('pointermove', (event) => {
        if (!this.overlay || !this.dragStart) return;
        const p = point(event);
        this.overlayScroll = clamp(this.dragStart.scroll + this.dragStart.y - p.y, 0, this.overlayMaxScroll());
      });
      window.addEventListener('pointerup', () => { this.dragStart = null; });
      this.canvas.addEventListener('wheel', (event) => {
        if (!this.overlay) return;
        event.preventDefault();
        this.overlayScroll = clamp(this.overlayScroll + event.deltaY * 1.5, 0, this.overlayMaxScroll());
      }, { passive: false });
      window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
          event.preventDefault();
          this.sound.ready();
          if (this.autoActive) this.stopAuto('RODADA AUTOMÁTICA PARADA');
          if (this.state === 'SPIN_LOOP') this.fastStop(); else this.spin();
        }
      });
    }

    start() {
      requestAnimationFrame((time) => this.frame(time));
    }

    frame(time) {
      const dt = Math.min(40, time - this.lastTime);
      this.lastTime = time;
      this.update(time, dt);
      this.draw(time);
      requestAnimationFrame((next) => this.frame(next));
    }

    update(time, dt) {
      this.featurePulse += dt * 0.004;
      if (this.state === 'SPIN_LOOP') this.spinButtonAngle = (this.spinButtonAngle + dt * (this.turbo ? 0.0095 : 0.0064)) % TAU;
      this.updateTicker(time, dt);
      this.particles = this.particles.filter((particle) => {
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 0.0008 * dt;
        particle.rotation += particle.spin * dt;
        return particle.life > 0;
      });

      if (this.state === 'SPIN_LOOP') {
        const elapsed = time - this.spinStart;
        const durationScale = this.turbo ? 0.48 : 1;
        const stops = [900, 1190, 1480].map((value) => value * durationScale);
        this.reels.forEach((reel, index) => {
          if (reel.stopped) return;
          const acceleration = clamp(elapsed / (180 * durationScale), 0, 1);
          reel.speed = lerp(0.45, this.turbo ? 3.25 : 2.35, acceleration);
          reel.offset = (reel.offset + reel.speed * dt) % reel.cellH;
          if (elapsed >= stops[index]) this.stopReel(reel, time);
        });
        if (this.reels.every((reel) => reel.stopped)) this.finishSpin(time);
      }

      if (this.state === 'WIN') {
        const phase = this.getWinLinePhase(time);
        this.lineCycle = phase.index;
        this.lineShowAll = phase.showAll;
        if (!phase.showAll && phase.index !== this.lastLineSoundIndex) {
          this.lastLineSoundIndex = phase.index;
          this.sound.lineWin(phase.index);
        }
        if (time - this.winStart > this.getWinTiming().totalDuration) {
          this.advanceAfterResult(time);
        }
      }

      if (this.state === 'NO_WIN' && time - this.winStart > (this.turbo ? 300 : 720)) {
        this.advanceAfterResult(time);
      }

      if (this.state === 'FEATURE_INTRO' && time - this.featureIntroStart > 2300) {
        this.state = 'IDLE';
        this.message = 'RODADAS DA FORTUNA 8';
        setTimeout(() => this.spin(), 220);
      }

      if (this.state === 'FEATURE_OUTRO' && time - this.featureOutroStart > 3000) {
        this.state = 'IDLE';
        this.message = 'BOA SORTE!';
      }
    }

    getWinLinePhase(time) {
      const count = this.result.lines.length;
      if (!count) return { index: 0, showAll: true };
      const timing = this.getWinTiming();
      const elapsed = time - this.winStart;
      if (elapsed < timing.allDuration) return { index: 0, showAll: true };
      return {
        index: Math.min(count - 1, Math.floor((elapsed - timing.allDuration) / timing.lineDuration)),
        showAll: false,
      };
    }

    getWinTiming() {
      const count = this.result.lines.length;
      if (!count) return { allDuration: 0, lineDuration: 0, totalDuration: this.turbo ? 1450 : 4300 };
      const allDuration = this.turbo ? 340 : 1500;
      const lineDuration = this.turbo ? 210 : clamp(6200 / count, 760, 1150);
      const holdDuration = this.turbo ? 180 : 760;
      return {
        allDuration,
        lineDuration,
        totalDuration: allDuration + lineDuration * count + holdDuration,
      };
    }

    activatePanelItem(item, time) {
      this.tickerText = item.text;
      this.tickerMode = item.mode || 'center';
      this.tickerStarted = time;
      this.tickerDuration = item.duration ? item.duration * 1.6 : PANEL_DEFAULT_DURATION;
      this.tickerAlpha = 0;
      this.tickerX = PANEL_X + PANEL_W + 12;
      this.ctx.save();
      this.ctx.font = '900 29px Arial Black, Arial';
      this.tickerWidth = this.ctx.measureText(this.tickerText).width;
      this.ctx.restore();
    }

    enqueuePanel(text, mode = 'center', duration = 3200) {
      if (!text || this.tickerText === text || this.panelQueue.some((item) => item.text === text)) return;
      this.panelQueue.push({ text, mode, duration });
    }

    advancePanel(time) {
      let next = this.panelQueue.shift();
      if (!next) {
        this.panelTipIndex = (this.panelTipIndex + 1) % PANEL_TIPS.length;
        next = PANEL_TIPS[this.panelTipIndex];
      }
      this.activatePanelItem(next, time);
    }

    updateTicker(time, dt) {
      if (this.tickerMode === 'scroll') {
        this.tickerAlpha = clamp((time - this.tickerStarted) / 300, 0, 1);
        this.tickerX -= dt * (this.turbo ? 0.192 : 0.136);
        if (this.tickerX + this.tickerWidth < PANEL_X + 8) this.advancePanel(time);
        return;
      }

      const elapsed = time - this.tickerStarted;
      const fadeIn = clamp(elapsed / 420, 0, 1);
      const fadeOut = clamp((this.tickerDuration - elapsed) / 650, 0, 1);
      this.tickerAlpha = fadeIn * fadeOut;
      if (elapsed >= this.tickerDuration) this.advancePanel(time);
    }

    showPaylinePreview() {
      const now = performance.now();
      this.paylinePreviewStart = now;
      this.paylinePreviewUntil = now + 2800;
      this.enqueuePanel(`${this.level} ${this.level === 1 ? 'LINHA ATIVA' : 'LINHAS ATIVAS'} • APOSTA ${money(this.bet)}`, 'center', 3000);
    }

    getPaylinePreview(time) {
      if (this.state !== 'IDLE' || time >= this.paylinePreviewUntil) return { active: false, alpha: 0, count: this.level };
      const elapsed = time - this.paylinePreviewStart;
      const remaining = this.paylinePreviewUntil - time;
      const alpha = clamp(elapsed / 250, 0, 1) * clamp(remaining / 550, 0, 1);
      return {
        active: true,
        alpha,
        count: this.level,
      };
    }

    advanceAfterResult(time) {
      if (this.pendingFeature) {
        this.pendingFeature = false;
        this.featureIntroStart = time;
        this.featureTotal = 0;
        this.state = 'FEATURE_INTRO';
        this.sound.win(true);
        this.burst(W / 2, 720, 100, '#ffd44d');
        return;
      }
      if (this.activeFeatureSpin && this.featureRemaining === 0) {
        this.activeFeatureSpin = false;
        this.featureOutroStart = time;
        this.state = 'FEATURE_OUTRO';
        this.message = `TOTAL ${money(this.featureTotal)}`;
        this.enqueuePanel(`TOTAL DA FORTUNA ${money(this.featureTotal)}`, 'center', 3800);
        this.sound.win(true);
        this.burst(W / 2, 780, 120, '#ffd44d');
        this.coinRain(110);
        return;
      }
      this.state = 'IDLE';
      this.message = this.featureRemaining ? `RODADAS DA FORTUNA ${this.featureRemaining}` : 'BOA SORTE!';
      if (!this.autoRemaining) this.autoActive = false;
      if (this.autoRemaining > 0 || this.featureRemaining > 0) {
        setTimeout(() => {
          if (this.featureRemaining > 0 || (this.autoActive && this.autoRemaining > 0)) this.spin();
        }, this.turbo ? 120 : 420);
      }
    }

    spin() {
      if (!['IDLE', 'WIN', 'NO_WIN'].includes(this.state)) return;
      const featureSpin = this.featureRemaining > 0;
      if (!featureSpin && this.balance < this.bet) {
        this.message = 'SALDO FICTÍCIO INSUFICIENTE';
        this.enqueuePanel(this.message, 'center', 3200);
        return;
      }
      if (!featureSpin) this.balance -= this.bet;
      else this.featureRemaining -= 1;
      this.activeFeatureSpin = featureSpin;
      if (!featureSpin && this.autoRemaining > 0) this.autoRemaining -= 1;
      this.lastWin = 0;
      this.result = { total: 0, lines: [], cells: [], prizes: [] };
      this.grid = featureSpin ? this.makeGrid(true) : this.makeShowcaseGrid();
      if (this.forceLines && !featureSpin) {
        this.grid = [3, 4, 3].map((rows) => Array.from({ length: rows }, () => ({ type: 'rockets', prize: 0 })));
      }
      if (this.forceLine1 && !featureSpin) {
        this.grid = [
          ['rockets', 'bag', 'carrot'],
          ['rockets', 'coins', 'bag', 'carrot'],
          ['rockets', 'carrot', 'coins'],
        ].map((column) => column.map((type) => ({ type, prize: 0 })));
      }
      if (this.forceLines35 && !featureSpin) {
        this.grid = [
          ['rockets', 'rockets', 'carrot'],
          ['bag', 'rockets', 'coins', 'rabbit'],
          ['carrot', 'rockets', 'bag'],
        ].map((column) => column.map((type) => ({ type, prize: 0 })));
      }
      if (this.forcePrize && !featureSpin) {
        const prizeCells = [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1]];
        prizeCells.forEach(([column, row], index) => {
          this.grid[column][row] = { type: 'prize', prize: [1, 2, 3, 5, 10][index] };
        });
      }
      if (this.forceMax && !featureSpin) {
        this.grid = [3, 4, 3].map((rows) => Array.from({ length: rows }, () => ({ type: 'prize', prize: 500 })));
      }
      const deterministicDemo = this.forceLines || this.forceLine1 || this.forceLines35 || this.forcePrize || this.forceMax;
      this.pendingFeature = !featureSpin && !deterministicDemo && (this.forceFeature || Math.random() < FEATURE_TRIGGER_RATE);
      this.forceFeature = false;
      this.forceLines = false;
      this.forceLine1 = false;
      this.forceLines35 = false;
      this.forcePrize = false;
      this.forceMax = false;
      this.reels.forEach((reel) => {
        reel.strip = this.randomStrip(22, featureSpin);
        reel.offset = 0;
        reel.speed = 0;
        reel.stopped = false;
        reel.bounceStart = 0;
      });
      this.state = 'SPIN_LOOP';
      this.spinStart = performance.now();
      this.message = featureSpin ? 'RODADA DA FORTUNA' : 'BOA SORTE!';
      this.sound.startSpin();
      this.announce(featureSpin ? 'Rodada da Fortuna iniciada' : 'Giro iniciado');
    }

    fastStop() {
      if (this.state !== 'SPIN_LOOP') return;
      const elapsed = performance.now() - this.spinStart;
      const target = this.turbo ? 430 : 820;
      if (elapsed < target) this.spinStart -= target - elapsed;
    }

    stopReel(reel, time) {
      reel.stopped = true;
      reel.offset = 0;
      reel.bounceStart = time;
      this.sound.reelStop(reel.index);
      if (this.activeFeatureSpin) {
        for (let row = 0; row < reel.rows; row += 1) {
          setTimeout(() => this.sound.tone(520 + reel.index * 45 + row * 22, 0.07, 0.022, 'triangle'), row * 85);
        }
      }
      this.burst(reel.x + reel.w / 2, reel.y + reel.h - 15, 5, '#f8c33e');
    }

    finishSpin(time) {
      this.sound.stopSpin();
      this.result = this.evaluate();
      this.lastWin = this.result.total;
      this.balance += this.result.total;
      if (this.activeFeatureSpin) this.featureTotal += this.result.total;
      this.winStart = time;
      this.lastLineSoundIndex = -1;
      this.celebrateWin = this.result.total >= this.bet * 2 || this.result.lines.length >= 3 || (this.result.prizes || []).length >= 5;

      if (this.pendingFeature && this.featureRemaining === 0) {
        this.featureRemaining = 8;
        this.message = 'COELHO DA FORTUNA — 8 RODADAS!';
      }

      this.history.unshift({
        time: new Date(),
        bet: this.activeFeatureSpin ? 0 : this.bet,
        win: this.result.total,
        feature: this.activeFeatureSpin,
        id: `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      });
      this.history = this.history.slice(0, 60);
      this.checkAutoLimits();

      if (this.result.total > 0) {
        this.state = 'WIN';
        this.message = this.pendingFeature ? '8 RODADAS DA FORTUNA!' : `GANHO ${money(this.result.total)}`;
        this.activatePanelItem({
          text: `WIN ${this.result.total.toFixed(2).replace('.', ',')}`,
          mode: 'center',
          duration: 4200,
        }, time);
        if (this.pendingFeature) this.enqueuePanel('8 RODADAS DA FORTUNA!', 'center', 3400);
        this.sound.win(this.result.total >= this.bet * 10);
        this.burst(W / 2, 1130, this.result.total >= this.bet * 10 ? 70 : 34, '#ffd44d');
        if (this.result.total >= this.bet * 500) this.coinRain(70);
        this.announce(`Você ganhou ${money(this.result.total)}`);
      } else {
        this.state = this.pendingFeature ? 'WIN' : 'NO_WIN';
        this.message = this.pendingFeature ? '8 RODADAS DA FORTUNA!' : 'TENTE NOVAMENTE';
        this.enqueuePanel(this.message, 'center', this.pendingFeature ? 3400 : 2600);
        if (this.pendingFeature) {
          this.sound.win(true);
          this.burst(W / 2, 1130, 70, '#ffd44d');
        }
        this.announce(this.pendingFeature ? 'Coelho da Fortuna ativado com oito rodadas' : 'Sem prêmio neste giro');
      }
    }

    checkAutoLimits() {
      if (!this.autoRemaining) return;
      const lossReached = this.autoLimits.loss && this.balance <= this.autoStartBalance - this.autoLimits.loss;
      const gainReached = this.autoLimits.gain && this.balance >= this.autoStartBalance + this.autoLimits.gain;
      const singleReached = this.autoLimits.single && this.lastWin >= this.autoLimits.single;
      if (lossReached || gainReached || singleReached) {
        this.stopAuto('LIMITE DA RODADA AUTOMÁTICA ATINGIDO');
      }
    }

    stopAuto(message = 'RODADA AUTOMÁTICA PARADA') {
      if (!this.autoActive) return;
      this.autoRemaining = 0;
      this.autoActive = false;
      this.autoTotal = 0;
      this.message = message;
      this.enqueuePanel(message, 'center', 3000);
    }

    evaluate() {
      return evaluateGrid(this.grid, this.bet, this.lineStake);
    }

    burst(x, y, count, color) {
      for (let index = 0; index < count; index += 1) {
        const angle = Math.random() * TAU;
        const speed = 0.05 + Math.random() * 0.18;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.1,
          life: 650 + Math.random() * 900,
          maxLife: 1550,
          size: 4 + Math.random() * 10,
          rotation: Math.random() * TAU,
          spin: (Math.random() - 0.5) * 0.012,
          color,
          kind: count >= 70 && index % 4 === 0 ? 'coin' : 'spark',
        });
      }
    }

    coinRain(count = 70) {
      for (let index = 0; index < count; index += 1) {
        this.particles.push({
          x: 45 + Math.random() * (W - 90),
          y: -60 - Math.random() * 520,
          vx: (Math.random() - 0.5) * 0.055,
          vy: 0.09 + Math.random() * 0.13,
          life: 4000 + Math.random() * 2400,
          maxLife: 6400,
          size: 9 + Math.random() * 10,
          rotation: Math.random() * TAU,
          spin: (Math.random() - 0.5) * 0.01,
          color: '#ffd84c',
          kind: 'coin',
        });
      }
    }

    draw(time) {
      const ctx = this.ctx;
      this.renderTime = time;
      ctx.clearRect(0, 0, W, H);
      this.hitAreas = [];
      this.drawBackground(time);
      this.drawHeader(time);
      this.drawReelFrame(time);
      this.drawReels(time);
      this.drawPaylinePreview(time);
      this.drawWinLayer(time);
      this.drawLineRails(time);
      this.drawTicker();
      this.drawStatus();
      this.drawControls(time);
      this.drawParticles();
      this.drawFeatureOverlay(time);
      if (this.overlay) {
        this.hitAreas = [];
        this.drawOverlay();
      }
      if (this.openingActive) {
        this.hitAreas = [];
        this.drawOpeningOverlay(time);
      }
    }

    drawBackground(time) {
      const ctx = this.ctx;
      if (ASSETS.sky) {
        const driftX = Math.sin(time * 0.000065) * 14;
        const driftY = Math.cos(time * 0.000045) * 7;
        ctx.drawImage(ASSETS.sky, -20 + driftX, -16 + driftY, W + 40, H + 32);
      }
      else {
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#167bf0');
        sky.addColorStop(0.56, '#d4b8f2');
        sky.addColorStop(1, '#6178df');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);
      }

      this.drawMovingClouds(time);
      this.drawHouseScene('left', time);
      this.drawHouseScene('right', time);
      const mascotWinning = this.state === 'WIN';
      const mascotSpinning = this.state === 'SPIN_LOOP';
      const mascotBob = Math.sin(time * (mascotWinning ? 0.008 : 0.0018)) * (mascotWinning ? 5.5 : 2.5);
      const mascotLean = mascotSpinning
        ? Math.sin(time * 0.012) * 0.025
        : Math.sin(time * 0.00125) * 0.008;
      if (mascotWinning && this.celebrateWin && time - this.winStart < 2300) {
        this.drawCelebrationMascot(time);
      } else {
        const idleFrame = this.getIdleMascotFrame(time);
        ctx.save();
        ctx.translate(390, 438 + mascotBob);
        ctx.rotate(mascotLean);
        if (mascotWinning) {
          ctx.shadowColor = '#ffd85e';
          ctx.shadowBlur = 20 + Math.sin(time * 0.012) * 7;
        }
        this.drawImageContain(idleFrame, 0, 0, 250, 250);
        ctx.restore();
      }
      this.drawImageContain(ASSETS.logo, 390, 140, 455, 255);
      this.drawAmbientWisps(time);

      if (this.activeFeatureSpin || this.featureRemaining > 0 || this.state.startsWith('FEATURE_')) {
        const fortune = ctx.createRadialGradient(390, 820, 30, 390, 820, 760);
        fortune.addColorStop(0, '#ffd74a42');
        fortune.addColorStop(0.55, '#be4b8430');
        fortune.addColorStop(1, '#39286900');
        ctx.fillStyle = fortune;
        ctx.fillRect(0, 0, W, H);
      }
    }

    drawAmbientWisps(time) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      [0, 1].forEach((side) => {
        const direction = side ? -1 : 1;
        const baseX = side ? 650 : 130;
        const baseY = 470 + Math.sin(time * 0.0007 + side * 2) * 16;
        for (let puff = 0; puff < 4; puff += 1) {
          const travel = (time * 0.008 + puff * 33 + side * 19) % 120;
          const x = baseX + direction * travel;
          const y = baseY - puff * 14 - travel * 0.12;
          const radius = 16 + puff * 7;
          const mist = ctx.createRadialGradient(x, y, 1, x, y, radius);
          mist.addColorStop(0, 'rgba(255, 245, 222, 0.075)');
          mist.addColorStop(1, 'rgba(255, 245, 222, 0)');
          ctx.fillStyle = mist;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, TAU);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    drawMovingClouds(time) {
      const ctx = this.ctx;
      const groups = [
        { y: 300, speed: 0.0032, phase: 0, scale: 1 },
        { y: 430, speed: 0.0021, phase: 410, scale: 0.72 },
        { y: 210, speed: -0.0017, phase: 720, scale: 0.58 },
      ];
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      groups.forEach((cloud, groupIndex) => {
        const span = W + 300;
        const raw = cloud.phase + time * cloud.speed;
        const x = cloud.speed > 0 ? (raw % span) - 150 : W + 150 - ((-raw) % span);
        ctx.save();
        ctx.translate(x, cloud.y + Math.sin(time * 0.0004 + groupIndex) * 7);
        ctx.scale(cloud.scale, cloud.scale);
        [[-62, 8, 52], [-16, -10, 70], [44, 5, 56], [88, 18, 36]].forEach(([px, py, radius]) => {
          const mist = ctx.createRadialGradient(px, py, 4, px, py, radius);
          mist.addColorStop(0, 'rgba(255,250,255,0.16)');
          mist.addColorStop(0.62, 'rgba(232,224,255,0.085)');
          mist.addColorStop(1, 'rgba(220,210,255,0)');
          ctx.fillStyle = mist;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, TAU);
          ctx.fill();
        });
        ctx.restore();
      });
      ctx.restore();
    }

    getIdleMascotFrame(time) {
      const frames = [ASSETS.idle1, ASSETS.idle2, ASSETS.idle3, ASSETS.idle4, ASSETS.idle5];
      const sequence = [0, 1, 2, 3, 4, 3, 2, 1];
      const frameIndex = sequence[Math.floor(time / 260) % sequence.length];
      return frames[frameIndex] || frames.find(Boolean) || ASSETS.mascot;
    }

    drawCelebrationMascot(time) {
      const elapsed = Math.max(0, time - this.winStart);
      const frames = [ASSETS.celebration1, ASSETS.celebration2, ASSETS.celebration3, ASSETS.celebration4, ASSETS.celebration5];
      const frame = frames[Math.min(frames.length - 1, Math.floor(elapsed / 190))] || this.getIdleMascotFrame(time);
      const appear = easeOutBack(clamp(elapsed / 330, 0, 1));
      const jump = -Math.sin(clamp(elapsed / 1100, 0, 1) * Math.PI) * 42;
      const sway = Math.sin(elapsed * 0.012) * 0.025;
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(390, 405 + jump);
      ctx.rotate(sway);
      ctx.scale(appear, appear);
      ctx.shadowColor = '#ffd75b';
      ctx.shadowBlur = 28 + Math.sin(time * 0.015) * 8;
      this.drawImageContain(frame, 0, 0, 310, 335);
      ctx.restore();
    }

    drawOpeningOverlay(time) {
      const ctx = this.ctx;
      if (ASSETS.openingBackground) ctx.drawImage(ASSETS.openingBackground, 0, 0, W, H);
      else {
        const fallback = ctx.createLinearGradient(0, 0, 0, H);
        fallback.addColorStop(0, '#140850');
        fallback.addColorStop(1, '#4b0c55');
        ctx.fillStyle = fallback;
        ctx.fillRect(0, 0, W, H);
      }
      const progress = clamp((time - this.openingStarted) / 4000, 0, 1);
      if (progress < 1) {
        ctx.save();
        this.roundRect(120, 1560, 540, 58, 29, '#1a0a39cc', '#ffc95e', 4);
        const shine = ctx.createLinearGradient(125, 0, 655, 0);
        shine.addColorStop(0, '#ff8b28');
        shine.addColorStop(0.55, '#ffe96b');
        shine.addColorStop(1, '#ff55ba');
        this.roundRect(128, 1568, 524 * progress, 42, 21, shine);
        ctx.fillStyle = '#fff3c2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 25px Arial Black, Arial';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#401128';
        const label = `CARREGANDO ${Math.round(progress * 100)}%`;
        ctx.strokeText(label, 390, 1510);
        ctx.fillText(label, 390, 1510);
        ctx.restore();
        return;
      }
      const readyElapsed = time - this.openingReadyAt;
      const appear = clamp(readyElapsed / 420, 0, 1);
      const pulse = 1 + Math.sin(readyElapsed * 0.005) * 0.025;
      const pressed = this.pressScale('opening', time);
      ctx.save();
      ctx.globalAlpha = appear;
      ctx.translate(390, 1565);
      ctx.scale(pulse * pressed, pulse * pressed);
      ctx.shadowColor = '#ffe55d';
      ctx.shadowBlur = 25 + Math.sin(time * 0.008) * 8;
      this.drawImageContain(ASSETS.openingButton, 0, 0, 340, 205);
      ctx.restore();
      this.hit(210, 1450, 360, 225, () => {
        this.openingActive = false;
        this.sound.startMusic();
        this.burst(390, 1565, 45, '#ffe55d');
      }, 'opening');
    }

    imageContainRect(image, cx, cy, maxW, maxH) {
      if (!image) return null;
      const scale = Math.min(maxW / image.width, maxH / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      return { x: cx - w / 2, y: cy - h / 2, w, h, scale };
    }

    drawHouseScene(side, time) {
      const ctx = this.ctx;
      const left = side === 'left';
      const house = left ? ASSETS.houseLeft : ASSETS.houseRight;
      const lantern = left ? ASSETS.lanternLeft : ASSETS.lanternRight;
      const rect = this.imageContainRect(house, left ? 74 : 706, 350, 190, 560);
      if (!rect) return;
      ctx.drawImage(house, rect.x, rect.y, rect.w, rect.h);
      if (!lantern) return;

      const source = left
        ? { x: 270, y: 450, pivotX: 140 }
        : { x: 0, y: 450, pivotX: 145 };
      const lanternX = rect.x + source.x * rect.scale;
      const lanternY = rect.y + source.y * rect.scale;
      const lanternW = lantern.width * rect.scale;
      const lanternH = lantern.height * rect.scale;
      const pivotX = lanternX + source.pivotX * rect.scale;
      const sway = Math.sin(time * 0.00115 + (left ? 0 : 1.7)) * 0.032;
      const glowPulse = 0.78 + Math.sin(time * 0.0034 + (left ? 0.4 : 2.1)) * 0.22;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const glowX = lanternX + lanternW * 0.5;
      const glowY = lanternY + lanternH * 0.47;
      const glow = ctx.createRadialGradient(glowX, glowY, 2, glowX, glowY, lanternW * 0.78);
      glow.addColorStop(0, `rgba(255, 238, 125, ${0.42 * glowPulse})`);
      glow.addColorStop(0.38, `rgba(255, 101, 41, ${0.22 * glowPulse})`);
      glow.addColorStop(1, 'rgba(255, 60, 20, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(glowX - lanternW, glowY - lanternW, lanternW * 2, lanternW * 2);
      ctx.restore();

      ctx.save();
      ctx.translate(pivotX, lanternY);
      ctx.rotate(sway);
      ctx.translate(-pivotX, -lanternY);
      ctx.shadowColor = `rgba(255, 194, 74, ${0.55 * glowPulse})`;
      ctx.shadowBlur = 10 + glowPulse * 9;
      ctx.drawImage(lantern, lanternX, lanternY, lanternW, lanternH);
      ctx.globalCompositeOperation = 'screen';
      const flicker = 0.62 + Math.sin(time * 0.007 + (left ? 0.3 : 1.8)) * 0.2 + Math.sin(time * 0.019) * 0.08;
      const inner = ctx.createRadialGradient(glowX, glowY, 1, glowX, glowY, lanternW * 0.31);
      inner.addColorStop(0, `rgba(255,255,205,${0.72 * flicker})`);
      inner.addColorStop(0.38, `rgba(255,203,65,${0.42 * flicker})`);
      inner.addColorStop(1, 'rgba(255,90,25,0)');
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.ellipse(glowX, glowY, lanternW * 0.31, lanternH * 0.25, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    drawHeader(time) {
      const scale = this.pressScale('menu', time);
      this.ctx.save();
      this.ctx.translate(55, 58);
      this.ctx.scale(scale, scale);
      this.drawImageContain(ASSETS.menuButton, 0, 0, 82, 82);
      this.ctx.restore();
      this.hit(12, 15, 86, 86, () => this.openOverlay('menu'), 'menu');
    }

    drawRabbitActor(time, x, y, scale) {
      const ctx = this.ctx;
      const feature = this.state.startsWith('FEATURE_') || this.activeFeatureSpin || this.featureRemaining > 0;
      const winning = this.state === 'WIN';
      const spinning = this.state === 'SPIN_LOOP';
      const bob = Math.sin(time * 0.004) * (winning ? 10 : 4);
      const jump = winning ? Math.abs(Math.sin((time - this.winStart) * 0.008)) * -18 : 0;
      const sway = spinning ? Math.sin(time * 0.02) * 0.08 : Math.sin(time * 0.002) * 0.025;
      const blink = Math.sin(time * 0.0017) > 0.985 ? 0.12 : 1;
      const armLift = feature ? -1.05 : winning ? -0.78 : spinning ? -0.2 : 0.35;

      ctx.save();
      ctx.translate(x, y + bob + jump);
      ctx.scale(scale, scale);
      ctx.rotate(sway);
      if (feature || winning) {
        ctx.shadowColor = feature ? '#ffd84f' : '#ff87d0';
        ctx.shadowBlur = 35;
      }

      ctx.fillStyle = feature ? '#f6c94a' : '#7e3f96';
      ctx.beginPath();
      ctx.ellipse(0, 65, 62, 67, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#ffe68b';
      ctx.lineWidth = 7;
      ctx.stroke();

      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * 48, 46);
        ctx.rotate(side * armLift);
        ctx.fillStyle = '#fff8ef';
        ctx.beginPath();
        ctx.ellipse(side * 28, 0, 39, 17, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      });

      ctx.fillStyle = '#fff8ef';
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * 34, -65);
        ctx.rotate(side * (0.08 + Math.sin(time * 0.003) * 0.05));
        ctx.beginPath();
        ctx.ellipse(0, -46, 24, 70, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#f3a2ba';
        ctx.beginPath();
        ctx.ellipse(0, -48, 9, 46, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      });

      ctx.fillStyle = '#fff8ef';
      ctx.beginPath();
      ctx.ellipse(0, -15, 79, 78, 0, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#f3a2ba';
      ctx.beginPath();
      ctx.ellipse(-50, 11, 14, 9, 0, 0, TAU);
      ctx.ellipse(50, 11, 14, 9, 0, 0, TAU);
      ctx.fill();

      ctx.strokeStyle = '#3f1e3d';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(side * 28, -22);
        ctx.lineTo(side * 28, -22 + 13 * blink);
        ctx.stroke();
      });
      ctx.fillStyle = '#dc567a';
      ctx.beginPath();
      ctx.arc(0, -4, 7, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#d64f76';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 5, winning || feature ? 28 : 22, 0.12, Math.PI - 0.12);
      ctx.stroke();

      ctx.fillStyle = '#ffe36b';
      ctx.beginPath();
      for (let index = 0; index < 10; index += 1) {
        const angle = -Math.PI / 2 + index * Math.PI / 5;
        const radius = index % 2 ? 7 : 15;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius + 64;
        if (!index) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawReelFrame(time) {
      const ctx = this.ctx;
      if (ASSETS.reelFrame) ctx.drawImage(ASSETS.reelFrame, 0, 495, W, 803);
      else REEL_LAYOUT.forEach((reel) => this.roundRect(reel.x, reel.y, reel.w, reel.h, 14, '#17195d', '#f5b95e', 6));
    }

    drawReels(time) {
      this.reels.forEach((reel) => {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.rect(reel.x + 3, reel.y + 3, reel.w - 6, reel.h - 6);
        ctx.clip();

        let bounce = 0;
        if (reel.stopped && reel.bounceStart) {
          const progress = clamp((time - reel.bounceStart) / 280, 0, 1);
          bounce = (easeOutBack(progress) - 1) * 24;
        }

        if (reel.stopped) {
          this.grid[reel.index].forEach((symbol, row) => {
            const flip = this.activeFeatureSpin
              ? clamp((time - reel.bounceStart - row * 85) / 260, 0.02, 1)
              : 1;
            this.drawSymbol(symbol, reel, row, reel.y + row * reel.cellH + bounce, 1, false, flip);
          });
        } else {
          const base = Math.floor((time - this.spinStart) / 95 + reel.index * 4);
          for (let row = -1; row <= reel.rows; row += 1) {
            const symbol = { type: reel.strip[(base + row + reel.strip.length) % reel.strip.length], prize: this.randomPrize() };
            const y = reel.y + row * reel.cellH + reel.offset - reel.cellH;
            this.drawSymbol(symbol, reel, row, y, 0.84, true);
          }
        }
        ctx.restore();
      });
    }

    drawSymbol(symbol, reel, row, y, alpha, moving = false, flip = 1, emphasis = 1) {
      const ctx = this.ctx;
      const x = reel.x + 3;
      const w = reel.w - 6;
      const h = reel.cellH - 8;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const phase = this.renderTime * 0.0022 + reel.index * 1.7 + row * 0.83;
      const bob = moving ? 0 : Math.sin(phase) * 2.2;
      const breathe = moving ? 1 : 1 + Math.sin(phase * 0.74) * 0.012;
      const tilt = moving ? 0 : Math.sin(phase * 0.61) * 0.008;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (moving) ctx.filter = 'blur(2.4px)';
      ctx.translate(cx, cy + bob);
      ctx.rotate(tilt);
      ctx.scale(Math.max(0.02, flip) * breathe * emphasis, breathe * emphasis);
      if (symbol.type === 'prize') this.drawPrize(0, 0, symbol.prize || 0.5, w, h);
      else this.drawAssetSymbol(symbol.type, 0, 0, w * 0.96, h * 0.94, reel.index);
      ctx.strokeStyle = '#f4be6822';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 8, h / 2);
      ctx.lineTo(w / 2 - 8, h / 2);
      ctx.stroke();
      ctx.restore();
    }

    drawImageContain(image, cx, cy, maxW, maxH) {
      const rect = this.imageContainRect(image, cx, cy, maxW, maxH);
      if (!rect) return false;
      this.ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
      return true;
    }

    drawAssetSymbol(type, cx, cy, maxW, maxH, reelIndex) {
      const map = {
        wild: ASSETS.symbolWild,
        rabbit: ASSETS.symbolWhiteRabbit,
        bag: ASSETS.symbolBag,
        cards: ASSETS.symbolGoldenRabbit,
        coins: ASSETS.symbolCoin,
        rockets: ASSETS.symbolLantern,
        carrot: ASSETS.symbolCarrot,
      };
      const image = map[type];
      if (!this.drawImageContain(image, cx, cy, maxW, maxH)) {
        this.drawOriginalSymbol(type, cx, cy, maxW, maxH);
        return;
      }
      const sparkle = (Math.sin(this.renderTime * 0.004 + type.length * 1.7 + reelIndex) + 1) / 2;
      if (sparkle > 0.88) this.drawSymbolSparkle(cx + maxW * 0.25, cy - maxH * 0.28, 4 + sparkle * 7, sparkle);
    }

    drawSymbolSparkle(x, y, size, alpha = 1) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#fff7b5';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#ffd85c';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
      ctx.restore();
    }

    drawFeatureOverlay(time) {
      if (!['FEATURE_INTRO', 'FEATURE_OUTRO'].includes(this.state)) return;
      this.hitAreas = [];
      const ctx = this.ctx;
      const intro = this.state === 'FEATURE_INTRO';
      const started = intro ? this.featureIntroStart : this.featureOutroStart;
      const progress = clamp((time - started) / (intro ? 2300 : 3000), 0, 1);
      const appear = clamp(progress * 4, 0, 1);
      const pulse = 1 + Math.sin(time * 0.009) * 0.04;

      ctx.save();
      ctx.fillStyle = `rgba(20, 5, 28, ${0.72 * appear})`;
      ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(390, 720, 20, 390, 720, 390);
      glow.addColorStop(0, '#ffdf67cc');
      glow.addColorStop(0.35, '#f47d3566');
      glow.addColorStop(1, '#bd185000');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 260, W, 920);

      ctx.globalAlpha = 0.45 * appear;
      ctx.strokeStyle = '#ffe58b';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#ffbf4d';
      ctx.shadowBlur = 18;
      for (let ring = 0; ring < 3; ring += 1) {
        const radius = 90 + ((progress * 420 + ring * 135) % 405);
        ctx.globalAlpha = (1 - radius / 520) * 0.42;
        ctx.beginPath();
        ctx.arc(390, 735, radius, 0, TAU);
        ctx.stroke();
      }

      ctx.restore();
      const featureMascot = this.getIdleMascotFrame(time);
      if (featureMascot) {
        ctx.save();
        ctx.translate(390, 735);
        ctx.scale(appear * pulse, appear * pulse);
        ctx.shadowColor = '#ffd95e';
        ctx.shadowBlur = 35;
        this.drawImageContain(featureMascot, 0, 0, 310, 310);
        ctx.restore();
      } else {
        this.drawRabbitActor(time, 390, 720, 1.28 * appear * pulse);
      }

      ctx.save();
      ctx.textAlign = 'center';
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#8b1d31';
      ctx.fillStyle = '#ffe570';
      ctx.font = '900 52px Arial Black, Arial';
      const heading = intro ? 'COELHO DA FORTUNA' : 'TOTAL DA FORTUNA';
      ctx.strokeText(heading, 390, 360);
      ctx.fillText(heading, 390, 360);
      if (intro) {
        ctx.font = '900 190px Arial Black, Arial';
        ctx.strokeText('8', 390, 1120);
        ctx.fillText('8', 390, 1120);
        ctx.font = '900 38px Arial Black, Arial';
        ctx.strokeText('RODADAS DA FORTUNA', 390, 1200);
        ctx.fillText('RODADAS DA FORTUNA', 390, 1200);
      } else {
        const zeroProgress = clamp((time - this.featureOutroStart) / 650, 0, 1);
        const zeroScale = easeOutBack(zeroProgress);
        ctx.save();
        ctx.translate(390, 945);
        ctx.scale(zeroScale, zeroScale);
        ctx.font = '900 68px Arial Black, Arial';
        ctx.strokeText('0 RODADAS', 0, 0);
        ctx.fillText('0 RODADAS', 0, 0);
        ctx.restore();
        ctx.font = '900 72px Arial Black, Arial';
        ctx.strokeText(money(this.featureTotal), 390, 1120);
        ctx.fillText(money(this.featureTotal), 390, 1120);
        ctx.font = '700 28px Arial';
        ctx.fillStyle = '#fff6da';
        ctx.fillText('GANHO ACUMULADO', 390, 1180);
      }
      ctx.restore();
    }

    drawOriginalSymbol(type, cx, cy, maxW, maxH) {
      const ctx = this.ctx;
      const scale = Math.min(maxW / 150, maxH / 150);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.shadowColor = SYMBOLS[type].color;
      ctx.shadowBlur = 14;

      if (type === 'wild') {
        ctx.fillStyle = '#f7c83f';
        ctx.beginPath();
        ctx.arc(0, -7, 59, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#55336e';
        ctx.beginPath();
        ctx.arc(19, -21, 52, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        this.drawMiniRabbit(-13, -16, 0.72);
        ctx.textAlign = 'center';
        ctx.font = '900 27px Arial Black, Arial';
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#7d1e3a';
        ctx.strokeText('WILD', 0, 66);
        ctx.fillStyle = '#ffe355';
        ctx.fillText('WILD', 0, 66);
      }

      if (type === 'rabbit') {
        ctx.fillStyle = '#f8c642';
        ctx.beginPath();
        ctx.moveTo(-66, 24);
        ctx.quadraticCurveTo(0, 93, 66, 24);
        ctx.quadraticCurveTo(44, 72, 0, 72);
        ctx.quadraticCurveTo(-44, 72, -66, 24);
        ctx.fill();
        ctx.strokeStyle = '#fff09a';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        this.drawMiniRabbit(0, -20, 0.85);
        ctx.fillStyle = '#9d4d2e';
        ctx.font = '900 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('☾', 0, 57);
      }

      if (type === 'bag') {
        ctx.fillStyle = '#7f3f9e';
        ctx.beginPath();
        ctx.moveTo(-50, -28);
        ctx.quadraticCurveTo(-72, 16, -55, 58);
        ctx.quadraticCurveTo(0, 82, 55, 58);
        ctx.quadraticCurveTo(72, 16, 50, -28);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffcb48';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.fillStyle = '#2ac6ae';
        this.roundRect(-54, -39, 108, 21, 10, '#2ac6ae', '#b5ffe7', 3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffe263';
        ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
          const angle = -Math.PI / 2 + i * Math.PI / 5;
          const radius = i % 2 ? 13 : 28;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius + 17;
          if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f55c78';
        ctx.beginPath();
        ctx.arc(-49, -27, 8, 0, TAU);
        ctx.arc(49, -27, 8, 0, TAU);
        ctx.fill();
      }

      if (type === 'cards') {
        ctx.save();
        ctx.rotate(-0.16);
        this.roundRect(-54, -55, 83, 112, 10, '#e94968', '#ffe06b', 5);
        ctx.restore();
        ctx.save();
        ctx.rotate(0.13);
        this.roundRect(-18, -61, 83, 112, 10, '#2bb9a5', '#ffe06b', 5);
        ctx.fillStyle = '#ffe765';
        ctx.beginPath();
        ctx.arc(23, -8, 24, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#c23f5c';
        ctx.beginPath();
        ctx.arc(32, -16, 20, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      if (type === 'coins') {
        [-26, 25].forEach((x, index) => {
          ctx.fillStyle = index ? '#f3a92e' : '#ffd956';
          ctx.beginPath();
          ctx.arc(x, index ? 3 : -8, 43, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = '#fff09a';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.strokeStyle = '#ae5b2b';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(x, index ? 3 : -8, 25, 0, TAU);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#9b4d35';
        ctx.font = '900 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('☾', 15, 17);
      }

      if (type === 'rockets') {
        this.drawRocket(-29, 10, -0.38, '#ee5ac5', '#63d7ff');
        this.drawRocket(28, -8, 0.42, '#39d39a', '#ffe15d');
      }

      if (type === 'carrot') {
        ctx.fillStyle = '#ff8b32';
        ctx.beginPath();
        ctx.moveTo(-55, -25);
        ctx.quadraticCurveTo(55, -61, 45, 19);
        ctx.quadraticCurveTo(24, 57, -39, 66);
        ctx.quadraticCurveTo(-12, 32, -55, -25);
        ctx.fill();
        ctx.strokeStyle = '#ffd261';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#df542e';
        ctx.lineWidth = 4;
        [-20, 2, 24].forEach((x) => {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + 12, 8);
          ctx.stroke();
        });
        ctx.fillStyle = '#4bd071';
        [-0.55, 0, 0.55].forEach((angle) => {
          ctx.save();
          ctx.translate(-37, -29);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -23, 11, 31, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        });
      }
      ctx.restore();
    }

    drawMiniRabbit(x, y, scale = 1) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = '#fff8ef';
      ctx.beginPath();
      ctx.ellipse(-20, -48, 12, 36, -0.12, 0, TAU);
      ctx.ellipse(20, -48, 12, 36, 0.12, 0, TAU);
      ctx.ellipse(0, 0, 44, 48, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#f3a1b8';
      ctx.beginPath();
      ctx.ellipse(-20, -49, 5, 25, -0.12, 0, TAU);
      ctx.ellipse(20, -49, 5, 25, 0.12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#45203f';
      ctx.beginPath();
      ctx.arc(-15, -4, 4, 0, TAU);
      ctx.arc(15, -4, 4, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#d64f76';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 8, 15, 0.15, Math.PI - 0.15);
      ctx.stroke();
      ctx.restore();
    }

    drawRocket(x, y, rotation, body, stripe) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(0, -58);
      ctx.quadraticCurveTo(36, -20, 27, 35);
      ctx.lineTo(-27, 35);
      ctx.quadraticCurveTo(-36, -20, 0, -58);
      ctx.fill();
      ctx.strokeStyle = '#ffe58a';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = stripe;
      ctx.fillRect(-27, -12, 54, 17);
      ctx.fillStyle = '#ffca39';
      ctx.beginPath();
      ctx.moveTo(-17, 37);
      ctx.lineTo(0, 67);
      ctx.lineTo(17, 37);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawFallbackSymbol(type, cx, cy, size) {
      const ctx = this.ctx;
      const data = SYMBOLS[type];
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = data.color;
      ctx.shadowColor = data.color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.48, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#5c1838';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${size * 0.2}px Arial`;
      ctx.fillText(data.label, 0, 0);
      ctx.restore();
    }

    drawPrize(cx, cy, value, maxW = 170, maxH = 190, options = {}) {
      const ctx = this.ctx;
      const high = value >= 100;
      const pulse = high ? 1 + Math.sin(this.renderTime * 0.009) * 0.035 : 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);
      if (high) {
        ctx.save();
        ctx.globalAlpha = 0.22 + Math.sin(this.renderTime * 0.008) * 0.08;
        ctx.rotate(this.renderTime * 0.00025);
        ctx.fillStyle = '#fff2a6';
        for (let ray = 0; ray < 12; ray += 1) {
          ctx.rotate(TAU / 12);
          ctx.fillRect(maxW * 0.12, -2, maxW * 0.34, 4);
        }
        ctx.restore();
      }
      ctx.shadowColor = high ? '#fff07a' : '#ffd54a';
      ctx.shadowBlur = high ? 34 : 19;
      this.drawImageContain(ASSETS.symbolPrize, 0, 0, maxW * 0.96, maxH * 0.93);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = options.showMultiplier
        ? `${value}×`.replace('.', ',')
        : money(value * this.bet).replace('R$', 'R$ ');
      let fontSize = Math.min(34, maxH * 0.205);
      do {
        ctx.font = `900 ${fontSize}px Georgia, serif`;
        fontSize -= 1;
      } while (fontSize > 18 && ctx.measureText(text).width > maxW * 0.67);
      ctx.lineWidth = Math.max(4, fontSize * 0.18);
      ctx.strokeStyle = '#661530';
      ctx.strokeText(text, 0, maxH * 0.035);
      ctx.fillStyle = value >= 100 ? '#fff07c' : '#fff7d5';
      ctx.fillText(text, 0, maxH * 0.035);
      if (high) this.drawSymbolSparkle(maxW * 0.28, -maxH * 0.28, 9, 0.8);
      ctx.restore();
    }

    getPaylineRailPoint(lineNumber, side) {
      const railIndex = LINE_RAILS[side].indexOf(lineNumber);
      return {
        x: side === 'left' ? 40 : 740,
        y: LINE_RAIL_Y[railIndex],
      };
    }

    tracePayline(lineNumber) {
      const line = PAYLINES[lineNumber - 1];
      const left = this.getPaylineRailPoint(lineNumber, 'left');
      const right = this.getPaylineRailPoint(lineNumber, 'right');
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      line.forEach((row, column) => {
        const reel = REEL_LAYOUT[column];
        ctx.lineTo(reel.x + reel.w / 2, reel.y + row * reel.cellH + reel.cellH / 2);
      });
      ctx.lineTo(right.x, right.y);
    }

    drawPaylinePreview(time) {
      const preview = this.getPaylinePreview(time);
      if (!preview.active) return;
      const ctx = this.ctx;
      const visibleLines = PAYLINES.slice(0, preview.count);

      ctx.save();
      ctx.globalAlpha = preview.alpha * 0.82;
      ctx.strokeStyle = '#ffe86b';
      ctx.lineWidth = preview.count > 5 ? 5 : 7;
      ctx.shadowColor = '#ff8b2e';
      ctx.shadowBlur = 18;
      visibleLines.forEach((line, index) => {
        this.tracePayline(index + 1);
        ctx.stroke();
      });
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = preview.alpha;
      this.roundRect(305, 1142, 170, 48, 20, '#67164bdc', '#ffe071', 4);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 22px Arial Black, Arial';
      ctx.fillStyle = '#fff3a2';
      ctx.fillText(`${preview.count} ${preview.count === 1 ? 'LINHA' : 'LINHAS'}`, 390, 1167);
      ctx.restore();
    }

    drawWinLayer(time) {
      if (this.state !== 'WIN') return;
      const ctx = this.ctx;
      const pulse = 0.55 + 0.45 * Math.sin((time - this.winStart) * 0.014);
      const activeLines = this.result.lines.length
        ? (this.lineShowAll ? this.result.lines : [this.result.lines[this.lineCycle]])
        : [];
      const activeCells = activeLines.length
        ? [...new Map(activeLines.flatMap((line) => line.cells).map((cell) => [`${cell.c}-${cell.r}`, cell])).values()]
        : this.result.cells;
      const activeKeys = new Set(activeCells.map(({ c, r }) => `${c}-${r}`));

      REEL_LAYOUT.forEach((reel, c) => {
        for (let r = 0; r < reel.rows; r += 1) {
          if (activeKeys.has(`${c}-${r}`)) continue;
          ctx.save();
          ctx.fillStyle = '#100a2fac';
          this.roundRect(reel.x + 5, reel.y + r * reel.cellH + 4, reel.w - 10, reel.cellH - 8, 12, '#100a2fac');
          ctx.restore();
        }
      });

      activeCells.forEach(({ c, r }) => {
        const reel = REEL_LAYOUT[c];
        const x = reel.x + 5;
        const y = reel.y + r * reel.cellH + 3;
        const emphasis = 1.055 + pulse * 0.035;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const aura = ctx.createRadialGradient(x + reel.w / 2, y + reel.cellH / 2, 10, x + reel.w / 2, y + reel.cellH / 2, reel.w * 0.72);
        aura.addColorStop(0, `rgba(255,247,135,${0.36 + pulse * 0.18})`);
        aura.addColorStop(0.62, `rgba(255,133,24,${0.16 + pulse * 0.12})`);
        aura.addColorStop(1, 'rgba(255,70,10,0)');
        ctx.fillStyle = aura;
        ctx.fillRect(x - 22, y - 22, reel.w + 34, reel.cellH + 38);
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.rect(reel.x + 4, reel.y + 4, reel.w - 8, reel.h - 8);
        ctx.clip();
        this.drawSymbol(this.grid[c][r], reel, r, reel.y + r * reel.cellH, 1, false, 1, emphasis);
        ctx.shadowColor = '#ffef68';
        ctx.shadowBlur = 26 + pulse * 22;
        this.roundRect(x, y, reel.w - 10, reel.cellH - 7, 15, null, '#fff6a8', 7);
        ctx.shadowColor = '#ff7a1b';
        ctx.shadowBlur = 14;
        this.roundRect(x + 4, y + 4, reel.w - 18, reel.cellH - 15, 12, null, '#ff9a28', 4);
        this.drawWinnerSparkles(c, r, time);
        ctx.restore();
      });

      if (activeLines.length) {
        ctx.save();
        ctx.strokeStyle = '#ffef67';
        ctx.lineWidth = this.lineShowAll ? 6 : 8;
        ctx.globalAlpha = this.lineShowAll ? 0.88 : 1;
        ctx.shadowColor = '#ff8f25';
        ctx.shadowBlur = 16;
        activeLines.forEach((line) => {
          this.tracePayline(line.index + 1);
          ctx.stroke();
        });
        ctx.restore();
      }
      if (!this.lineShowAll && activeLines.length === 1) this.drawLinePayout(activeLines[0], time);
      this.drawWinCategory(time);
    }

    drawWinnerSparkles(c, r, time) {
      const reel = REEL_LAYOUT[c];
      const phase = (time - this.winStart) * 0.004 + c * 1.9 + r * 1.2;
      const positions = [[0.16, 0.2], [0.82, 0.25], [0.22, 0.78], [0.78, 0.74]];
      positions.forEach(([px, py], index) => {
        const alpha = Math.max(0, Math.sin(phase + index * 1.45));
        if (alpha < 0.18) return;
        this.drawSymbolSparkle(reel.x + reel.w * px, reel.y + r * reel.cellH + reel.cellH * py, 4 + alpha * 8, alpha);
      });
    }

    drawLinePayout(line, time) {
      const ctx = this.ctx;
      const timing = this.getWinTiming();
      const local = Math.max(0, time - this.winStart - timing.allDuration - this.lineCycle * timing.lineDuration);
      const cycle = local % 760;
      const alpha = cycle < 130
        ? cycle / 130
        : cycle < 480
          ? 1
          : cycle < 680
            ? (680 - cycle) / 200
            : 0;
      if (alpha <= 0.02) return;
      const centerCell = line.cells.find((cell) => cell.c === 1) || line.cells[1];
      const reel = REEL_LAYOUT[1];
      const x = reel.x + reel.w / 2;
      const y = reel.y + centerCell.r * reel.cellH + reel.cellH / 2 + 24;
      const text = line.amount.toFixed(2).replace('.', ',');
      const scale = 0.96 + alpha * 0.06;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 82);
      glow.addColorStop(0, '#fff79aaa');
      glow.addColorStop(0.38, '#ffbb4544');
      glow.addColorStop(1, '#ff852500');
      ctx.fillStyle = glow;
      ctx.fillRect(-90, -70, 180, 140);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 35px Georgia, serif';
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#7a2130';
      ctx.shadowColor = '#ffcf58';
      ctx.shadowBlur = 16;
      ctx.strokeText(text, 0, 0);
      ctx.fillStyle = '#fff1a0';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    drawWinCategory(time) {
      if (!this.lastWin || !this.bet) return;
      const ratio = this.lastWin / this.bet;
      const elapsed = time - this.winStart;
      const category = ratio >= 5000
        ? { label: 'GANHO MÁXIMO 5000×', color: '#fff37a' }
        : ratio >= 500
          ? { label: 'MEGA GANHO', color: '#ff85d5' }
          : ratio >= 100
            ? { label: 'GRANDE GANHO', color: '#ffd45f' }
            : ratio >= 20
              ? { label: 'BOM GANHO', color: '#ffe88a' }
              : ratio >= 5
                ? { label: 'GANHO MÉDIO', color: '#fff0a3' }
                : { label: 'GANHO', color: '#fff5c4' };
      if ((!this.lineShowAll && ratio < 20) || elapsed < 250 || elapsed > Math.min(2300, this.getWinTiming().totalDuration - 300)) return;
      const appear = clamp(elapsed / 500, 0, 1) * clamp((2400 - elapsed) / 420, 0, 1);
      const pulse = 1 + Math.sin(time * 0.009) * 0.035;
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = appear;
      ctx.translate(390, 1230);
      ctx.scale(pulse, pulse);
      if (ratio >= 100 && ASSETS.symbolIngot) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.rotate(-0.12);
        this.drawImageContain(ASSETS.symbolIngot, -210, -62, 110, 80);
        ctx.scale(-1, 1);
        ctx.rotate(-0.24);
        this.drawImageContain(ASSETS.symbolIngot, -210, -62, 110, 80);
        ctx.restore();
      }
      this.roundRect(-205, -43, 410, 86, 28, '#401452e8', '#ffd75e', 6);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = ratio >= 5000 ? '900 30px Georgia, serif' : '900 34px Georgia, serif';
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#7d2036';
      ctx.shadowColor = category.color;
      ctx.shadowBlur = ratio >= 500 ? 32 : 18;
      ctx.strokeText(category.label, 0, 0);
      ctx.fillStyle = category.color;
      ctx.fillText(category.label, 0, 0);
      ctx.restore();
    }

    drawLineRails(time) {
      const ctx = this.ctx;
      const idleSelection = this.state === 'IDLE';
      const winningLines = idleSelection
        ? new Set(Array.from({ length: this.level }, (_, index) => index + 1))
        : (this.state === 'WIN' && this.result.lines.length
          ? new Set((this.lineShowAll ? this.result.lines : [this.result.lines[this.lineCycle]]).map((line) => line.index + 1))
          : new Set());
      const pulse = idleSelection ? 1 : 0.78 + Math.sin(time * 0.018) * 0.22;

      Object.entries(LINE_RAILS).forEach(([side, order]) => {
        const x = side === 'left' ? 40 : 740;
        order.forEach((number, index) => {
          const active = winningLines.has(number);
          if (!active) return;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 27px Georgia, serif';
          ctx.lineWidth = 7;
          ctx.strokeStyle = '#8c3824';
          ctx.fillStyle = '#fff5a5';
          ctx.globalAlpha = pulse;
          ctx.shadowColor = '#fff16a';
          ctx.shadowBlur = 24;
          ctx.strokeText(String(number), x, LINE_RAIL_Y[index]);
          ctx.fillText(String(number), x, LINE_RAIL_Y[index]);
          ctx.restore();
        });
      });
    }

    drawTicker() {
      const ctx = this.ctx;
      const x = PANEL_X;
      const y = 1280;
      const w = PANEL_W;
      const h = 78;
      const isWin = /^WIN\s/.test(this.tickerText);
      const winElapsed = this.renderTime - this.tickerStarted;
      ctx.save();
      if (ASSETS.displayFrame) ctx.drawImage(ASSETS.displayFrame, x, y, w, h);
      else this.roundRect(x, y, w, h, 18, '#30205d', '#f7b952', 4);

      ctx.beginPath();
      ctx.rect(x + 25, y + 11, w - 50, h - 22);
      ctx.clip();
      if (isWin) {
        const burst = clamp(winElapsed / 260, 0, 1) * clamp((this.tickerDuration - winElapsed) / 500, 0, 1);
        const panelGlow = ctx.createRadialGradient(x + w / 2, y + h / 2, 2, x + w / 2, y + h / 2, w * 0.48);
        panelGlow.addColorStop(0, `rgba(255,230,93,${0.52 * burst})`);
        panelGlow.addColorStop(0.32, `rgba(255,94,66,${0.36 * burst})`);
        panelGlow.addColorStop(0.72, `rgba(139,28,120,${0.44 * burst})`);
        panelGlow.addColorStop(1, 'rgba(40,8,74,0)');
        ctx.fillStyle = panelGlow;
        ctx.fillRect(x + 20, y + 8, w - 40, h - 16);
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(winElapsed * 0.00035);
        ctx.globalAlpha = 0.42 * burst;
        ctx.fillStyle = '#fff5a5';
        for (let ray = 0; ray < 18; ray += 1) {
          ctx.rotate(TAU / 18);
          ctx.beginPath();
          ctx.moveTo(28, -2);
          ctx.lineTo(250, -7);
          ctx.lineTo(250, 7);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = this.tickerAlpha;
      ctx.textAlign = this.tickerMode === 'center' ? 'center' : 'left';
      ctx.textBaseline = 'middle';
      const fittedSize = this.tickerMode === 'center' && this.tickerWidth > w - 70
        ? Math.max(17, 27 * (w - 70) / this.tickerWidth)
        : (isWin ? 34 : 27);
      const textScale = isWin ? 0.72 + easeOutBack(clamp(winElapsed / 360, 0, 1)) * 0.28 : 1;
      const textX = this.tickerMode === 'center' ? x + w / 2 : this.tickerX;
      ctx.translate(textX, y + h / 2 + 1);
      ctx.scale(textScale, textScale);
      ctx.font = `900 ${fittedSize}px Arial Black, Georgia, serif`;
      ctx.lineWidth = isWin ? 8 : 5;
      ctx.strokeStyle = isWin ? '#2e0d1b' : '#6b2b29';
      const winTextGradient = ctx.createLinearGradient(0, -22, 0, 22);
      winTextGradient.addColorStop(0, '#fffbd0');
      winTextGradient.addColorStop(0.45, '#ffe35c');
      winTextGradient.addColorStop(1, '#ff8a22');
      ctx.fillStyle = isWin ? winTextGradient : '#fff0a2';
      ctx.shadowColor = isWin ? '#ffde57' : 'transparent';
      ctx.shadowBlur = isWin ? 15 : 0;
      ctx.strokeText(this.tickerText, 0, 0);
      ctx.fillText(this.tickerText, 0, 0);
      ctx.restore();
    }

    drawStatus() {
      const ctx = this.ctx;
      ctx.save();
      ctx.textAlign = 'center';
      if (ASSETS.scoreFrame) ctx.drawImage(ASSETS.scoreFrame, 16, 1370, 748, 86);
      else this.roundRect(16, 1370, 748, 86, 24, '#2d205e', '#f3b862', 5);
      const countedWin = this.state === 'WIN'
        ? this.lastWin * clamp((performance.now() - this.winStart) / (this.turbo ? 500 : 1500), 0, 1)
        : this.lastWin;
      const stats = [
        { x: 157, label: 'SALDO', value: money(this.balance) },
        { x: 390, label: 'GANHO TOTAL', value: money(countedWin), gold: true },
        { x: 623, label: 'APOSTA', value: money(this.bet) },
      ];
      stats.forEach((stat) => {
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffdc62';
        ctx.font = '800 16px Arial';
        ctx.fillText(stat.label, stat.x, 1396);
        ctx.fillStyle = stat.gold ? '#ffe061' : '#fff8eb';
        ctx.font = '700 24px Arial';
        ctx.fillText(stat.value, stat.x, 1425);
      });
      this.hit(515, 1370, 249, 86, () => this.state === 'IDLE' && this.openOverlay('bet'));
      ctx.restore();
    }

    drawControls(time) {
      const ctx = this.ctx;
      const autoWasActive = this.autoActive;
      const controls = [
        { id: 'turbo', x: 102, y: 1570, r: 49, image: ASSETS.turboButton, active: this.turbo, action: () => {
          this.turbo = !this.turbo;
          this.message = this.turbo ? 'TURBO ATIVADO' : 'TURBO DESATIVADO';
          this.enqueuePanel(this.message, 'center', 2600);
        } },
        { id: 'minus', x: 212, y: 1570, r: 47, image: ASSETS.minusButton, action: () => {
          if (this.state !== 'IDLE') return;
          this.level = clamp(this.level - 1, 1, 10);
          this.showPaylinePreview();
        } },
        { id: 'plus', x: 568, y: 1570, r: 47, image: ASSETS.plusButton, action: () => {
          if (this.state !== 'IDLE') return;
          this.level = clamp(this.level + 1, 1, 10);
          this.showPaylinePreview();
        } },
        { id: 'auto', x: 678, y: 1570, r: 49, image: ASSETS.autoButton, active: this.autoActive, action: () => {
          if (autoWasActive) return;
          if (this.state === 'IDLE') this.openOverlay('auto');
        } },
      ];

      if (ASSETS.lowerOrnament) ctx.drawImage(ASSETS.lowerOrnament, 0, 1454, W, 274);
      controls.forEach((control) => {
        const pressed = this.pressScale(control.id, time);
        ctx.save();
        ctx.translate(control.x, control.y);
        ctx.scale(pressed, pressed);
        this.drawImageContain(control.image, 0, 0, control.r * 2, control.r * 2);
        if (control.active) {
          const activePulse = 0.75 + Math.sin(time * 0.008) * 0.25;
          ctx.strokeStyle = '#fff078';
          ctx.lineWidth = 5;
          ctx.shadowColor = '#ffd84f';
          ctx.shadowBlur = 16 + activePulse * 8;
          ctx.beginPath();
          ctx.arc(0, 0, control.r * 0.79, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = '#fff3a2';
          ctx.beginPath();
          ctx.arc(control.r * 0.57, -control.r * 0.57, 6, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
        this.hit(control.x - control.r, control.y - control.r, control.r * 2, control.r * 2, control.action, control.id);
      });

      const spinBusy = this.state === 'SPIN_LOOP';
      const fortuneActive = this.activeFeatureSpin || this.featureRemaining > 0;
      const fortuneCount = this.featureRemaining + (this.activeFeatureSpin && spinBusy ? 1 : 0);
      const idlePulse = spinBusy ? 1 : 1 + Math.sin(time * 0.0038) * 0.011;
      const pressedScale = this.pressScale('spin', time);
      ctx.save();
      ctx.translate(390, 1588);
      ctx.scale(idlePulse * pressedScale, idlePulse * pressedScale);
      ctx.rotate(this.spinButtonAngle);
      this.drawImageContain(ASSETS.spinButton, 0, 0, 194, 194);
      ctx.restore();
      if (this.autoActive) {
        const remaining = Math.max(1, this.autoRemaining);
        ctx.save();
        ctx.translate(455, 1518);
        const badgePulse = 1 + Math.sin(time * 0.01) * 0.035;
        ctx.scale(badgePulse, badgePulse);
        this.roundRect(-61, -28, 122, 56, 23, '#4b155fe8', '#fff090', 5);
        ctx.fillStyle = '#fff4b2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 21px Arial Black, Arial';
        ctx.fillText(`AUTO ${remaining}`, 0, 1);
        ctx.restore();
      }
      if (fortuneActive) {
        ctx.save();
        ctx.translate(390, 1588);
        this.roundRect(-48, -35, 96, 70, 22, '#411752dc', '#fff0a0', 5);
        ctx.fillStyle = '#fff4b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 52px Arial Black, Arial';
        ctx.fillText(`${fortuneCount}`, 0, 4);
        ctx.restore();
      }
      this.drawPressFeedback(time);
      this.hit(293, 1491, 194, 194, () => spinBusy ? this.fastStop() : this.spin(), 'spin');
    }

    openOverlay(name) {
      if (this.state === 'SPIN_LOOP' || this.state.startsWith('FEATURE_')) return;
      this.overlay = name;
      this.overlayScroll = 0;
    }

    closeOverlay() {
      this.overlay = null;
      this.overlayScroll = 0;
    }

    overlayMaxScroll() {
      if (this.overlay === 'rules') return 2050;
      if (this.overlay === 'paytable') return 1880;
      if (this.overlay === 'history') return Math.max(0, this.filteredHistory().length * 122 - 800);
      return 0;
    }

    editAutoLimit(key) {
      const names = { loss: 'queda do saldo', gain: 'aumento do saldo', single: 'ganho individual' };
      const current = this.autoLimits[key] ? this.autoLimits[key].toFixed(2).replace('.', ',') : '';
      const raw = window.prompt(`Valor em R$ para parar por ${names[key]}. Deixe vazio ou 0 para desativar.`, current);
      if (raw === null) return;
      let normalized = raw.trim().replace(/[^0-9,.-]/g, '');
      if (normalized.includes(',')) normalized = normalized.replace(/\./g, '').replace(',', '.');
      const value = Number(normalized || 0);
      if (!Number.isFinite(value) || value < 0) {
        this.enqueuePanel('VALOR INVÁLIDO', 'center', 2200);
        return;
      }
      this.autoLimits[key] = Math.round(value * 100) / 100;
    }

    startAuto(count) {
      this.autoRemaining = count;
      this.autoActive = true;
      this.autoTotal = count;
      this.autoStartBalance = this.balance;
      this.closeOverlay();
      this.message = `${count} RODADAS AUTOMÁTICAS`;
      this.enqueuePanel(this.message, 'center', 3000);
      if (this.state === 'IDLE') this.spin();
    }

    drawOverlay() {
      const ctx = this.ctx;
      const titles = {
        menu: 'OPÇÕES',
        auto: 'RODADA AUTOMÁTICA',
        bet: 'OPÇÕES DE APOSTA',
        paytable: 'TABELA DE PAGAMENTOS',
        rules: 'REGRAS DO JOGO',
        history: 'HISTÓRICO DO JOGO',
        historyDetail: 'DETALHES DA JOGADA',
        auth: 'AUTENTICIDADE',
      };
      ctx.save();
      ctx.fillStyle = '#161520f5';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#302f3dfd';
      ctx.fillRect(0, 0, W, 145);
      ctx.strokeStyle = '#ffffff12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 145);
      ctx.lineTo(W, 145);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '500 42px Arial';
      ctx.fillText(titles[this.overlay], W / 2, 91);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 8;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(78, 48);
      ctx.lineTo(44, 76);
      ctx.lineTo(78, 105);
      ctx.stroke();
      this.hit(20, 20, 100, 110, () => {
        if (this.overlay === 'menu') this.closeOverlay();
        else if (this.overlay === 'historyDetail') this.openOverlay('history');
        else this.openOverlay('menu');
      });

      if (this.overlay === 'menu') this.drawMenuOverlay();
      if (this.overlay === 'auto') this.drawAutoOverlay();
      if (this.overlay === 'bet') this.drawBetOverlay();
      if (this.overlay === 'paytable') this.drawPaytableOverlay();
      if (this.overlay === 'rules') this.drawRulesOverlay();
      if (this.overlay === 'history') this.drawHistoryOverlay();
      if (this.overlay === 'historyDetail') this.drawHistoryDetailOverlay();
      if (this.overlay === 'auth') this.drawAuthOverlay();
      ctx.restore();
    }

    drawMenuOverlay() {
      const ctx = this.ctx;
      const options = [
        { title: 'Opções de Aposta', detail: 'Valor-base, nível e total', icon: '$', target: 'bet' },
        { title: 'Rodada Automática', detail: 'Quantidade e limites de parada', icon: '↻', target: 'auto' },
        { title: 'Tabela de Pagamentos', detail: 'Símbolos, prêmios e linhas', icon: '⌁', target: 'paytable' },
        { title: 'Regras', detail: 'Funcionamento completo', icon: 'i', target: 'rules' },
        { title: 'Histórico', detail: 'Jogadas desta sessão', icon: 'WIN', target: 'history' },
        { title: 'Autenticidade', detail: 'Dados desta demonstração', icon: '✓', target: 'auth' },
      ];
      options.forEach((option, index) => {
        const y = 175 + index * 145;
        this.roundRect(45, y, 690, 120, 22, index % 2 ? '#292835' : '#25242f', '#ffffff12', 2);
        this.circleButton(115, y + 60, 42, '#4b4a58', '#686775', option.icon, option.icon === 'WIN' ? 18 : 37);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = '500 30px Arial';
        ctx.fillText(option.title, 185, y + 52);
        ctx.fillStyle = '#aaa9b2';
        ctx.font = '400 21px Arial';
        ctx.fillText(option.detail, 185, y + 87);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#aaa9b2';
        ctx.font = '500 42px Arial';
        ctx.fillText('›', 700, y + 75);
        this.hit(45, y, 690, 120, () => this.openOverlay(option.target));
      });

      const soundRows = [
        { y: 1040, title: 'Música de fundo', enabled: this.sound.musicEnabled, icon: '♫', action: () => this.sound.setMusicEnabled(!this.sound.musicEnabled), id: 'music' },
        { y: 1175, title: 'Efeitos do jogo', enabled: this.sound.effectsEnabled, icon: '✦', action: () => this.sound.setEffectsEnabled(!this.sound.effectsEnabled), id: 'effects' },
      ];
      soundRows.forEach((row) => {
        this.roundRect(45, row.y, 690, 118, 25, '#25242f', row.enabled ? '#ffb35c55' : '#ffffff12', 2);
        this.circleButton(125, row.y + 59, 44, row.enabled ? '#5b433b' : '#4b4a58', row.enabled ? '#ffb15b' : '#686775', row.enabled ? row.icon : '×', 38);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = '500 31px Arial';
        ctx.fillText(row.title, 205, row.y + 51);
        ctx.fillStyle = row.enabled ? '#ffb15b' : '#aaa9b2';
        ctx.font = '400 23px Arial';
        ctx.fillText(row.enabled ? 'Ligado' : 'Desligado', 205, row.y + 87);
        this.hit(45, row.y, 690, 118, row.action, row.id);
      });

      ctx.textAlign = 'center';
      ctx.fillStyle = '#8f8e99';
      ctx.font = '400 22px Arial';
      ctx.fillText('Experiência demonstrativa · saldo fictício', 390, 1360);
      ctx.fillText('Sem apostas ou pagamentos reais', 390, 1395);
    }

    drawBetOverlay() {
      const ctx = this.ctx;
      const values = [0.05, 0.10, 0.20, 0.40, 0.80, 1, 2, 4];
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '500 31px Arial';
      ctx.fillText('VALOR-BASE', 390, 220);
      values.forEach((value, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = 118 + col * 182;
        const y = 315 + row * 125;
        const active = this.baseBet === value;
        this.roundRect(x - 70, y - 42, 140, 84, 42, active ? '#614638' : '#44434f', active ? '#ffb05b' : '#666572', 4);
        ctx.fillStyle = active ? '#ffb05b' : '#fff';
        ctx.font = '700 26px Arial';
        ctx.fillText(money(value), x, y + 9);
        this.hit(x - 72, y - 45, 144, 90, () => { this.baseBet = value; });
      });
      ctx.fillStyle = '#fff';
      ctx.font = '500 31px Arial';
      ctx.fillText('NÍVEL DE APOSTA', 390, 625);
      for (let level = 1; level <= 10; level += 1) {
        const col = (level - 1) % 5;
        const row = Math.floor((level - 1) / 5);
        const x = 92 + col * 149;
        const y = 730 + row * 118;
        const active = this.level === level;
        this.circleButton(x, y, 46, active ? '#684a38' : '#454450', active ? '#ffb05b' : '#686773', `${level}`, 27);
        this.hit(x - 50, y - 50, 100, 100, () => { this.level = level; });
      }
      this.roundRect(70, 955, 640, 180, 28, '#292835', '#ffffff14', 2);
      ctx.fillStyle = '#aaa9b2';
      ctx.font = '400 24px Arial';
      ctx.fillText(`APOSTA TOTAL · ${this.level} ${this.level === 1 ? 'LINHA ATIVA' : 'LINHAS ATIVAS'}`, 390, 1015);
      ctx.fillStyle = '#ffb05b';
      ctx.font = '700 48px Arial';
      ctx.fillText(money(this.bet), 390, 1080);
      this.roundRect(220, 1190, 340, 92, 46, '#168d54', '#ffe17a', 5);
      ctx.fillStyle = '#fff';
      ctx.font = '700 28px Arial';
      ctx.fillText('CONFIRMAR', 390, 1248);
      this.hit(220, 1190, 340, 92, () => this.closeOverlay());
    }

    drawAutoOverlay() {
      const ctx = this.ctx;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '500 32px Arial';
      ctx.fillText('NÚMERO DE RODADAS', 390, 230);
      [10, 30, 50, 80, 100].forEach((count, index) => {
        const x = 82 + index * 154;
        this.circleButton(x, 330, 58, '#4a4956', '#666572', `${count}`, 30);
        this.hit(x - 64, 266, 128, 128, () => this.startAuto(count));
      });
      ctx.fillStyle = '#aaa9b2';
      ctx.font = '400 24px Arial';
      ctx.fillText('Toque num valor para começar', 390, 430);
      ctx.strokeStyle = '#ffffff16';
      ctx.beginPath();
      ctx.moveTo(50, 485);
      ctx.lineTo(730, 485);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '500 32px Arial';
      ctx.fillText('LIMITES PARA PARAR', 390, 550);

      const rows = [
        { key: 'loss', title: 'Se o saldo diminuir', detail: 'relativo ao saldo inicial' },
        { key: 'gain', title: 'Se o saldo aumentar', detail: 'relativo ao saldo inicial' },
        { key: 'single', title: 'Se um ganho exceder', detail: 'valor de um único giro' },
      ];
      rows.forEach((row, index) => {
        const y = 610 + index * 180;
        this.roundRect(55, y, 670, 145, 22, '#292835', '#ffffff14', 2);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = '500 30px Arial';
        ctx.fillText(row.title, 90, y + 53);
        ctx.fillStyle = '#9f9ea8';
        ctx.font = '400 21px Arial';
        ctx.fillText(row.detail, 90, y + 91);
        const value = this.autoLimits[row.key];
        this.roundRect(545, y + 31, 145, 78, 39, value ? '#5c4439' : '#44434f', value ? '#ffae59' : '#666572', 3);
        ctx.textAlign = 'center';
        ctx.fillStyle = value ? '#ffb15f' : '#d4d3d9';
        ctx.font = '700 25px Arial';
        ctx.fillText(value ? money(value) : 'Sem limite', 617, y + 79);
        this.hit(545, y + 25, 150, 90, () => this.editAutoLimit(row.key));
      });
      ctx.textAlign = 'center';
      ctx.fillStyle = '#aaa9b2';
      ctx.font = '400 22px Arial';
      ctx.fillText('Toque num limite para informar um valor em reais.', 390, 1210);
    }

    drawPaytableOverlay() {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 145, W, 1543);
      ctx.clip();
      ctx.translate(0, -this.overlayScroll);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '500 38px Arial';
      ctx.fillText('SÍMBOLOS', 390, 210);
      const entries = Object.entries(SYMBOLS);
      entries.forEach(([type, symbol], index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 145 + col * 245;
        const y = 355 + row * 285;
        this.drawAssetSymbol(type, x, y, 170, 160, col);
        ctx.fillStyle = '#ffad59';
        ctx.font = '700 31px Arial';
        ctx.fillText(`${symbol.payout}×`, x, y + 120);
        ctx.fillStyle = '#aaa9b2';
        ctx.font = '400 20px Arial';
        ctx.fillText(symbol.label, x, y + 150);
      });
      let y = 1190;
      y = this.sectionTitle('SÍMBOLOS DE PRÊMIO', y);
      this.drawPrize(390, y + 105, 25, 180, 150, { showMultiplier: true });
      y += 195;
      y = this.textBlock('Cada símbolo pode valer de 0,5× até 500× da aposta total. Com 5 ou mais símbolos de Prêmio em qualquer posição, todos são pagos.', 75, y, 630, 34);
      y += 35;
      y = this.sectionTitle('COELHO DA FORTUNA', y);
      y = this.textBlock('Pode ativar aleatoriamente enquanto os cilindros giram. Concede 8 rodadas. Durante a funcionalidade aparecem apenas símbolos de Prêmio.', 75, y, 630, 34);
      y += 35;
      y = this.sectionTitle('GANHO MÁXIMO', y);
      y = this.textBlock('Ganho máximo de 5.000× a aposta. A rodada termina ao atingir esse limite.', 75, y, 630, 34);
      y += 55;
      y = this.sectionTitle('10 LINHAS VENCEDORAS', y);
      PAYLINES.forEach((line, index) => {
        const col = index % 5;
        const row = Math.floor(index / 5);
        this.drawPaylineDiagram(index, 85 + col * 145, y + 95 + row * 170);
      });
      y += 440;
      this.textBlock('Somente o maior ganho por linha é pago. Linhas ganham da esquerda para a direita. Ganhos de linhas diferentes são somados.', 75, y, 630, 34);
      ctx.restore();
    }

    drawPaylineDiagram(index, x, y) {
      const ctx = this.ctx;
      const line = PAYLINES[index];
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '500 20px Arial';
      ctx.fillText(`${index + 1}`.padStart(2, '0'), x, y - 48);
      for (let column = 0; column < 3; column += 1) {
        const rows = column === 1 ? 4 : 3;
        for (let row = 0; row < rows; row += 1) {
          const px = x + (column - 1) * 32;
          const py = y + (row - (rows - 1) / 2) * 25;
          const active = line[column] === row;
          ctx.fillStyle = active ? '#ffad59' : '#575662';
          ctx.strokeStyle = active ? '#ffe0a0' : '#777681';
          ctx.lineWidth = 2;
          ctx.fillRect(px - 13, py - 10, 26, 20);
          ctx.strokeRect(px - 13, py - 10, 26, 20);
        }
      }
      ctx.restore();
    }

    drawRulesOverlay() {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 145, W, 1543);
      ctx.clip();
      ctx.translate(0, -this.overlayScroll);
      let y = 210;
      y = this.sectionTitle('FORTUNE RABBIT DELUXE', y);
      const sections = [
        ['VISÃO GERAL', 'Slot de vídeo com 3 cilindros: 3 posições nos cilindros 1 e 3 e 4 posições no cilindro 2. Usa 10 linhas de aposta fixas. Moeda R$.'],
        ['APOSTA', 'Valor-base entre R$0,05 e R$4,00. Nível entre 1 e 10. A aposta total corresponde ao valor-base multiplicado pelo nível e por 10 linhas.'],
        ['PAGAMENTOS', 'Combinações ganham da esquerda para a direita. Apenas o maior ganho por linha é pago. Ganhos simultâneos em linhas diferentes são somados e apresentados em dinheiro.'],
        ['WILD', 'Wild substitui todos os símbolos comuns, exceto o símbolo de Prêmio.'],
        ['SÍMBOLOS DE PRÊMIO', 'Podem aparecer em qualquer rodada. Cada valor vai de 0,5× a 500× da aposta total. Com 5 ou mais, são atribuídos ganhos de todos os símbolos de Prêmio.'],
        ['COELHO DA FORTUNA', 'Pode ativar aleatoriamente enquanto os cilindros giram. Concede 8 Rodadas da Fortuna. Durante a funcionalidade aparecem apenas símbolos de Prêmio.'],
        ['GANHO MÁXIMO', 'Corresponde a 5.000× a aposta. Se o total atingir o limite no jogo principal ou na funcionalidade, a rodada termina.'],
        ['RODAR E PARAR', 'Toque no botão central para girar. Durante o giro, toque novamente no botão ou na área do jogo para antecipar a parada. Turbo reduz a duração.'],
        ['RODADA AUTOMÁTICA', 'Executa o número selecionado. Pode parar quando o saldo diminuir, aumentar ou quando um ganho individual exceder o limite definido.'],
        ['RETORNO AO JOGADOR', 'RTP teórico informado: 96,75%. Representa retorno estatístico de longo prazo, não garantia de resultado em uma sessão.'],
        ['INFORMAÇÕES', 'Demonstração local com saldo fictício. Não executa apostas, depósitos, retiradas ou pagamentos reais.'],
      ];
      sections.forEach(([title, body]) => {
        y += 30;
        y = this.sectionTitle(title, y);
        y = this.textBlock(body, 72, y, 640, 36);
      });
      ctx.restore();
    }

    drawHistoryOverlay() {
      const ctx = this.ctx;
      const items = this.filteredHistory();
      ctx.save();
      const tabs = [
        { key: 'today', label: 'Hoje' },
        { key: 'week', label: 'Últimos 7 dias' },
        { key: 'custom', label: 'Personalizado' },
      ];
      tabs.forEach((tab, index) => {
        const x = index * 260;
        const active = this.historyFilter === tab.key;
        ctx.fillStyle = active ? '#ffad59' : '#aaa9b2';
        ctx.textAlign = 'center';
        ctx.font = '500 25px Arial';
        ctx.fillText(tab.label, x + 130, 205);
        if (active) {
          ctx.fillRect(x + 28, 235, 204, 4);
        }
        this.hit(x, 145, 260, 105, () => this.selectHistoryFilter(tab.key));
      });
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 250, W, 1438);
      ctx.clip();
      ctx.translate(0, -this.overlayScroll);
      ctx.fillStyle = '#292835';
      ctx.fillRect(0, 250, W, 100);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      ctx.font = '500 22px Arial';
      ctx.fillText('HORA', 42, 310);
      ctx.fillText('TRANSAÇÃO', 200, 310);
      ctx.fillText('APOSTA', 480, 310);
      ctx.textAlign = 'right';
      ctx.fillText('LUCRO', 742, 310);
      if (!items.length) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#aaa9b2';
        ctx.font = '400 30px Arial';
        ctx.fillText('Nenhum giro neste período.', 390, 470);
      }
      items.forEach((item, index) => {
        const y = 350 + index * 122;
        ctx.fillStyle = index % 2 ? '#302f3c' : '#292835';
        ctx.fillRect(0, y, W, 122);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#c4c3ca';
        ctx.font = '400 23px Arial';
        ctx.fillText(item.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 42, y + 49);
        ctx.font = '400 19px Arial';
        ctx.fillText(item.id.slice(-10), 200, y + 49);
        ctx.fillStyle = '#c58e58';
        ctx.font = '500 24px Arial';
        ctx.fillText(item.feature ? 'BÔNUS' : money(item.bet), 480, y + 49);
        ctx.textAlign = 'right';
        const profit = item.feature ? item.win : item.win - item.bet;
        ctx.fillStyle = profit > 0 ? '#ffae54' : '#a8784d';
        ctx.fillText(profit >= 0 ? money(profit) : `−${money(Math.abs(profit))}`, 742, y + 49);
        ctx.fillStyle = '#96959f';
        ctx.font = '400 19px Arial';
        ctx.fillText(item.feature ? 'Rodada da Fortuna' : 'Jogo principal', 742, y + 86);
        const screenY = y - this.overlayScroll;
        if (screenY > 245 && screenY < 1600) {
          this.hit(0, screenY, W, 122, () => {
            this.selectedHistory = item;
            this.openOverlay('historyDetail');
          });
        }
      });
      const totalY = 375 + items.length * 122;
      const totalBet = items.reduce((sum, item) => sum + item.bet, 0);
      const totalProfit = items.reduce((sum, item) => sum + item.win - item.bet, 0);
      ctx.fillStyle = '#373642';
      ctx.fillRect(0, totalY, W, 115);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff';
      ctx.font = '500 25px Arial';
      ctx.fillText(`Total de ${items.length} registro(s)`, 42, totalY + 67);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffad54';
      ctx.fillText(`${money(totalBet)}  ·  ${money(totalProfit)}`, 742, totalY + 67);
      ctx.restore();
    }

    filteredHistory() {
      const now = Date.now();
      if (this.historyFilter === 'week') return this.history.filter((item) => now - item.time.getTime() <= 7 * 86400000);
      if (this.historyFilter === 'custom' && this.customDateFrom && this.customDateTo) {
        return this.history.filter((item) => item.time >= this.customDateFrom && item.time <= this.customDateTo);
      }
      if (this.historyFilter === 'custom') return this.history;
      const today = new Date();
      return this.history.filter((item) => item.time.toDateString() === today.toDateString());
    }

    selectHistoryFilter(key) {
      if (key !== 'custom') {
        this.historyFilter = key;
        this.overlayScroll = 0;
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      const fromRaw = window.prompt('Data inicial (AAAA-MM-DD)', this.customDateFrom ? this.customDateFrom.toISOString().slice(0, 10) : today);
      if (fromRaw === null) return;
      const toRaw = window.prompt('Data final (AAAA-MM-DD)', this.customDateTo ? this.customDateTo.toISOString().slice(0, 10) : today);
      if (toRaw === null) return;
      const from = this.parseFilterDate(fromRaw, false);
      const to = this.parseFilterDate(toRaw, true);
      if (!from || !to || from > to) {
        this.enqueuePanel('PERÍODO INVÁLIDO', 'center', 2400);
        return;
      }
      this.customDateFrom = from;
      this.customDateTo = to;
      this.historyFilter = 'custom';
      this.overlayScroll = 0;
    }

    parseFilterDate(value, endOfDay) {
      const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return null;
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
      if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) return null;
      return date;
    }

    drawHistoryDetailOverlay() {
      const ctx = this.ctx;
      const item = this.selectedHistory;
      if (!item) {
        ctx.fillStyle = '#aaa9b2';
        ctx.textAlign = 'center';
        ctx.font = '400 28px Arial';
        ctx.fillText('Jogada não encontrada.', 390, 350);
        return;
      }
      const profit = item.feature ? item.win : item.win - item.bet;
      this.roundRect(55, 205, 670, 650, 28, '#292835', '#ffffff14', 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffad59';
      ctx.font = '700 38px Arial';
      ctx.fillText(profit >= 0 ? money(profit) : `−${money(Math.abs(profit))}`, 390, 300);
      ctx.fillStyle = '#aaa9b2';
      ctx.font = '400 22px Arial';
      ctx.fillText('LUCRO DA JOGADA', 390, 340);
      const rows = [
        ['Data e hora', item.time.toLocaleString('pt-BR')],
        ['Transação', item.id],
        ['Modalidade', item.feature ? 'Rodada da Fortuna' : 'Jogo principal'],
        ['Aposta', item.feature ? 'Sem custo adicional' : money(item.bet)],
        ['Ganho bruto', money(item.win)],
      ];
      rows.forEach(([label, value], index) => {
        const y = 420 + index * 82;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#aaa9b2';
        ctx.font = '400 22px Arial';
        ctx.fillText(label, 90, y);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = '500 23px Arial';
        ctx.fillText(value, 690, y);
      });
      this.roundRect(90, 930, 600, 160, 25, '#383744', '#ffffff12', 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '500 25px Arial';
      ctx.fillText('Resultado local verificável', 390, 990);
      ctx.fillStyle = '#68d47b';
      ctx.font = '400 21px Arial';
      ctx.fillText(`Sessão ${this.sessionSeed}`, 390, 1035);
    }

    drawAuthOverlay() {
      const ctx = this.ctx;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#55d278';
      ctx.beginPath();
      ctx.arc(390, 310, 86, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#fff3b0';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(350, 308);
      ctx.lineTo(379, 340);
      ctx.lineTo(435, 275);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '700 36px Arial';
      ctx.fillText('DEMONSTRAÇÃO ORIGINAL', 390, 465);
      ctx.fillStyle = '#aaa9b2';
      ctx.font = '400 26px Arial';
      let y = 535;
      y = this.textBlock('CoelhoGame usa código próprio, arte procedural própria, áudio sintetizado localmente e saldo exclusivamente fictício.', 80, y, 620, 38);
      y += 45;
      y = this.textBlock('Nenhuma aposta, depósito, saque, pagamento ou comunicação com servidores de cassino é executada.', 80, y, 620, 38);
      this.roundRect(90, 850, 600, 180, 28, '#292835', '#ffffff14', 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#aaa9b2';
      ctx.font = '400 23px Arial';
      ctx.fillText('IDENTIFICADOR DA SESSÃO', 390, 915);
      ctx.fillStyle = '#ffb05b';
      ctx.font = '700 42px Arial';
      ctx.fillText(this.sessionSeed, 390, 980);
      ctx.fillStyle = '#85848f';
      ctx.font = '400 21px Arial';
      ctx.fillText('Resultados reiniciam ao recarregar a página.', 390, 1110);
    }

    sectionTitle(text, y) {
      const ctx = this.ctx;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '500 36px Arial';
      ctx.fillText(text, 390, y);
      ctx.strokeStyle = '#ffffff12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(70, y + 35);
      ctx.lineTo(710, y + 35);
      ctx.stroke();
      return y + 90;
    }

    textBlock(text, x, y, width, lineHeight) {
      const ctx = this.ctx;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#aaa9b2';
      ctx.font = '400 27px Arial';
      const words = text.split(/\s+/);
      let line = '';
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > width && line) {
          ctx.fillText(line, x, y);
          line = word;
          y += lineHeight;
        } else line = test;
      });
      if (line) ctx.fillText(line, x, y);
      return y + lineHeight;
    }

    drawParticles() {
      const ctx = this.ctx;
      this.particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        if (particle.kind === 'coin') {
          ctx.scale(1, 0.42 + Math.abs(Math.cos(particle.rotation)) * 0.58);
          ctx.fillStyle = '#ffd84c';
          ctx.strokeStyle = '#b56a18';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size * 0.62, particle.size * 0.48, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = '#fff2a0';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size * 0.36, particle.size * 0.27, 0, 0, TAU);
          ctx.stroke();
        } else {
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * 0.66);
        }
        ctx.restore();
      });
    }

    roundRect(x, y, w, h, radius, fill, stroke = null, lineWidth = 0) {
      const ctx = this.ctx;
      const r = Math.min(radius, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke && lineWidth) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    }

    circleButton(x, y, r, fill, stroke, label, size) {
      const ctx = this.ctx;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff8e5';
      ctx.font = `900 ${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y + 2);
      ctx.textBaseline = 'alphabetic';
    }

    pressScale(id, time) {
      if (!this.buttonPress || this.buttonPress.id !== id || time >= this.buttonPress.until) return 1;
      const progress = clamp((time - this.buttonPress.started) / Math.max(1, this.buttonPress.until - this.buttonPress.started), 0, 1);
      return 1 + Math.sin(progress * Math.PI) * 0.085;
    }

    drawPressFeedback(time) {
      if (!this.buttonPress || time >= this.buttonPress.until) return;
      const progress = clamp((time - this.buttonPress.started) / Math.max(1, this.buttonPress.until - this.buttonPress.started), 0, 1);
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = (1 - progress) * 0.72;
      ctx.strokeStyle = '#fff3a1';
      ctx.lineWidth = 5 * (1 - progress) + 1;
      ctx.shadowColor = '#ffd84f';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(this.buttonPress.x, this.buttonPress.y, 12 + progress * 48, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    hit(x, y, w, h, action, id = null) {
      this.hitAreas.push({ x, y, w, h, action, id });
    }

    announce(text) {
      const live = document.getElementById('liveStatus');
      live.textContent = '';
      setTimeout(() => { live.textContent = text; }, 20);
    }
  }

  const canvas = document.getElementById('gameCanvas');
  loadAssets().finally(() => {
    const game = new Game(canvas);
    game.start();
    document.getElementById('loading').classList.add('done');
    window.coelhoGame = game;
  });
})();
