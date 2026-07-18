(() => {
  'use strict';

  const W = 780;
  const H = 1688;
  const TAU = Math.PI * 2;
  const money = (value) => `R$${value.toFixed(2).replace('.', ',')}`;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutBack = (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
  const PANEL_X = 90;
  const PANEL_W = 600;
  const DISPLAY_Y = 1208;
  const REEL_FRAME = { x: -60, y: 378, w: 900, h: 840 };
  const PANEL_DEFAULT_DURATION = 5200;
  const AUTO_STOP_MIN = 1600;
  const AUTO_STOP_MAX = 3200;
  const AUTO_STOP_STEP = 100;
  const ASSET_VERSION = '25';
  const WIN_TIER_CONFIG = Object.freeze({
    small: {
      minRatio: 0, maxRatio: 2, label: 'GANHO', settle: 220, lineDuration: 650,
      finalHold: 900, sparks: 12, coins: 0, mascotDelay: 720, mascotDuration: 650,
    },
    medium: {
      minRatio: 2, maxRatio: 10, label: 'ÓTIMO GANHO', settle: 220, lineDuration: 760,
      finalHold: 1200, sparks: 30, coins: 9, mascotDelay: 900, mascotDuration: 1600,
    },
    big: {
      minRatio: 10, maxRatio: 50, label: 'GRANDE GANHO', settle: 240, lineDuration: 820,
      finalHold: 1900, sparks: 62, coins: 38, mascotDelay: 1050, mascotDuration: 2400,
    },
    mega: {
      minRatio: 50, maxRatio: 100, label: 'MEGA GANHO', settle: 250, lineDuration: 880,
      finalHold: 2600, sparks: 90, coins: 72, mascotDelay: 1150, mascotDuration: 3200,
    },
    max: {
      minRatio: 100, maxRatio: Infinity, label: 'VITÓRIA MÁXIMA', settle: 250, lineDuration: 900,
      finalHold: 3400, sparks: 130, coins: 120, mascotDelay: 1200, mascotDuration: 4200,
    },
  });

  const { PAYLINES, SYMBOLS, FEATURE_TRIGGER_RATE, evaluateGrid, makeMixedWinGrid } = window.CoelhoMath;
  const REEL_LAYOUT = [
    { x: 31, y: 449, w: 229, h: 704, rows: 3, cellH: 234.67 },
    { x: 275, y: 403, w: 231, h: 802, rows: 4, cellH: 200.5 },
    { x: 520, y: 449, w: 229, h: 704, rows: 3, cellH: 234.67 },
  ];
  const LINE_RAILS = {
    left: [2, 3, 1, 6, 7, 4, 5, 10, 8, 9],
    right: [2, 4, 1, 6, 8, 3, 5, 10, 7, 9],
  };
  const LINE_RAIL_Y = [507, 565, 623, 713, 770, 828, 886, 992, 1050, 1108];
  const ASSET_PATHS = {
    sky: 'assets/layout-v3/fundo.png',
    roofLeft: 'assets/layout-v3/telhado_esquerda.png',
    roofRight: 'assets/layout-v3/telhado_direita.png',
    lantern: 'assets/layout-v3/balao_longo.png',
    cloud1: 'assets/layout-v3/nuvem1.png',
    cloud2: 'assets/layout-v3/nuvem2.png',
    cloud3: 'assets/layout-v3/nuvem1.png',
    cloud4: 'assets/layout-v3/nuvem2.png',
    logo: 'assets/layout-v3/logo.png',
    menuButton: 'assets/layout-v3/btn_menu.png',
    reelFrame: 'assets/layout-v3/central_rolos.png',
    displayFrame: 'assets/layout-v3/display_novo.png',
    scoreFrame: 'assets/layout-v3/saldo_aposta.png',
    lowerOrnament: 'assets/layout-v3/arabesco_baixo.png',
    turboButton: 'assets/layout-v3/btn_turbo.png',
    minusButton: 'assets/layout-v3/btn_menos.png',
    spinButton: 'assets/layout-v3/btn_jogar.png',
    plusButton: 'assets/layout-v3/btn_mais.png',
    autoButton: 'assets/layout-v3/btn_auto.png',
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
    bigWinTitle: 'assets/celebration/clean/texto_grande_ganho.png',
    megaWinTitle: 'assets/celebration/clean/texto_mega_ganho.png',
    idle1: 'assets/idle/clean/animacao_parado1.png',
    idle2: 'assets/idle/clean/animacao_parado2.png',
    idle3: 'assets/idle/clean/animacao_parado3.png',
    idle4: 'assets/idle/clean/animacao_parado4.png',
    idle5: 'assets/idle/clean/animacao_parado5.png',
    autoPanel: 'assets/automatic/tela_automatica.png',
    autoSelection: 'assets/automatic/marcacao_numeros.png',
    autoSliderKnob: 'assets/automatic/botao_spin.png',
    autoMinus: 'assets/automatic/menos.png',
    autoPlus: 'assets/automatic/mais.png',
    autoClose: 'assets/automatic/fechar_largo.png',
  };
  const ASSETS = {};

  function loadAssets(onProgress = () => { }) {
    const entries = Object.entries(ASSET_PATHS);
    let loaded = 0;
    onProgress(loaded, entries.length);
    return Promise.all(entries.map(([key, src]) => new Promise((resolve) => {
      const image = new Image();
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        loaded += 1;
        onProgress(loaded, entries.length);
        resolve();
      };
      const timeout = setTimeout(finish, 6000);
      image.onload = () => { ASSETS[key] = image; finish(); };
      image.onerror = finish;
      image.src = `${src}?v=${ASSET_VERSION}`;
    })));
  }
  const PANEL_TIPS = [
    { text: 'SÍMBOLOS DE PRÊMIO PAGAM ATÉ 500x!', mode: 'scroll', duration: 3400 },
    { text: '5 OU MAIS PRÊMIOS PAGAM TODOS!', mode: 'scroll', duration: 3200 },
    { text: '8 RODADAS DA FORTUNA COM SÍMBOLOS DE PRÊMIO!', mode: 'scroll' },
    { text: 'WILD SUBSTITUI SÍMBOLOS COMUNS!', mode: 'scroll', duration: 3200 },
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
      this.winSounds = {
        normal: this.createEffectAudio('assets/audio/01_normal_win_v2.ogg', 0.58),
        big: this.createEffectAudio('assets/audio/02_big_win_v2.ogg', 0.62),
        super: this.createEffectAudio('assets/audio/03_super_win_v2.ogg', 0.66),
        mega: this.createEffectAudio('assets/audio/04_mega_win_v2.ogg', 0.7),
      };
    }

    createEffectAudio(src, volume) {
      const audio = new Audio(`${src}?v=${ASSET_VERSION}`);
      audio.hidden = true;
      audio.preload = 'auto';
      audio.volume = volume;
      audio.setAttribute('playsinline', '');
      document.body.appendChild(audio);
      return audio;
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
      else {
        this.stopSpin();
        Object.values(this.winSounds).forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
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

    playWinTier(tier) {
      if (!this.effectsEnabled) return;
      const soundKey = tier === 'max'
        ? 'mega'
        : tier === 'mega'
          ? 'super'
          : tier === 'big'
            ? 'big'
            : 'normal';
      Object.values(this.winSounds).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      const audio = this.winSounds[soundKey];
      const playback = audio.play();
      if (playback) playback.catch(() => { /* reprodução depende de interação do usuário */ });
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
      this.spinBet = this.bet;
      this.lastWin = 0;
      this.turbo = false;
      this.autoRemaining = 0;
      this.autoActive = false;
      this.autoStartBalance = this.balance;
      this.autoLimits = { loss: AUTO_STOP_MIN, gain: 0, single: 0 };
      this.autoStopAmount = AUTO_STOP_MIN;
      this.featureRemaining = 0;
      this.featureTotal = 0;
      this.featureIntroStart = 0;
      this.featureOutroStart = 0;
      this.activeFeatureSpin = false;
      this.pendingFeature = false;
      const query = new URLSearchParams(window.location.search);
      const demoMode = query.get('demo') || '';
      this.forceFeature = demoMode === 'feature';
      this.forceLines = demoMode === 'lines';
      this.forceLine1 = demoMode === 'line1';
      this.forceLines35 = demoMode === 'lines35';
      this.forcePrize = demoMode === 'prize';
      this.forceMax = demoMode === 'max';
      this.forceMixed = demoMode === 'mixed';
      this.forceWinTier = demoMode.startsWith('tier-') ? demoMode.slice(5) : null;
      this.overlay = null;
      this.overlayScroll = 0;
      this.dragStart = null;
      this.autoSliderDrag = false;
      this.history = [];
      this.historyFilter = 'today';
      this.customDateFrom = null;
      this.customDateTo = null;
      this.selectedHistory = null;
      this.sessionSeed = Math.random().toString(36).slice(2, 10).toUpperCase();
      this.spinStart = 0;
      this.winStart = 0;
      this.lastTime = performance.now();
      this.spinButtonAngle = 0;
      this.autoTotal = 0;
      this.buttonPress = null;
      this.celebrateWin = false;
      this.winTier = 'small';
      this.winEffectsStarted = false;
      this.balancePulseStart = 0;
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
      this.moneyTransfers = [];
      this.winCredited = true;
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
      return this.freezePrizeValues(window.CoelhoMath.makeGrid(feature), this.bet);
    }

    freezePrizeValues(grid, bet = this.bet) {
      grid.forEach((column) => column.forEach((symbol) => {
        if (symbol.type !== 'prize' || Number.isFinite(symbol.prizeAmount)) return;
        symbol.prizeAmount = (symbol.prize || 0.5) * bet;
      }));
      return grid;
    }

    makeShowcaseGrid() {
      const roll = Math.random();
      const grid = this.makeGrid(false);

      if (roll < SHOWCASE_MULTI_LINE_RATE) {
        return makeMixedWinGrid();
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
        if (this.overlay === 'auto') {
          const layout = this.getAutoOverlayLayout();
          if (this.isAutoSliderPoint(p, layout)) {
            this.sound.ready();
            this.sound.button('button');
            this.autoSliderDrag = true;
            this.setAutoStopFromX(p.x, layout);
            return;
          }
          const insidePanel = p.x >= layout.panel.x && p.x <= layout.panel.x + layout.panel.w
            && p.y >= layout.panel.y && p.y <= layout.panel.y + layout.panel.h;
          if (!insidePanel) {
            this.sound.ready();
            this.sound.button('button');
            this.closeOverlay();
            return;
          }
        }
        const target = [...this.hitAreas].reverse().find((area) => p.x >= area.x && p.x <= area.x + area.w && p.y >= area.y && p.y <= area.y + area.h);
        if (target) {
          this.sound.ready();
          this.buttonPress = { id: target.id || 'generic', x: p.x, y: p.y, started: performance.now(), until: performance.now() + 190 };
          if (this.autoActive && target.id !== 'turbo') this.stopAuto('RODADA AUTOMÁTICA PARADA');
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
        if (this.overlay === 'auto' && this.autoSliderDrag) {
          event.preventDefault();
          this.setAutoStopFromX(point(event).x, this.getAutoOverlayLayout());
          return;
        }
        if (!this.overlay || !this.dragStart) return;
        const p = point(event);
        this.overlayScroll = clamp(this.dragStart.scroll + this.dragStart.y - p.y, 0, this.overlayMaxScroll());
      });
      window.addEventListener('pointerup', () => {
        this.dragStart = null;
        this.autoSliderDrag = false;
      });
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
      this.moneyTransfers = this.moneyTransfers.filter((transfer) => time - transfer.started < transfer.duration + 260);

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
        const timing = this.getWinTiming();
        const winElapsed = time - this.winStart;
        const categoryIntroActive = (this.winTier === 'big' || this.winTier === 'mega')
          && winElapsed >= timing.baseSettleDuration;
        this.lineCycle = phase.index;
        this.lineShowAll = phase.showAll;
        if (this.lastWin > 0 && (categoryIntroActive || !phase.settling) && !this.winEffectsStarted) {
          this.startWinEffects(time);
        }
        if (!phase.settling && !phase.showAll && phase.index !== this.lastLineSoundIndex) {
          this.lastLineSoundIndex = phase.index;
          this.sound.lineWin(phase.index);
          this.launchWinTransfer(this.getWinSteps()[phase.index], time);
        }
        const accounting = this.getWinAccounting(time);
        if (accounting.transferProgress >= 1) this.completeBalanceTransfer();
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
      const count = this.getWinSteps().length;
      const timing = this.getWinTiming();
      const elapsed = time - this.winStart;
      if (elapsed < timing.settleDuration) return { index: -1, showAll: false, settling: true };
      if (!count || elapsed >= timing.stepEnd) return { index: Math.max(0, count - 1), showAll: true, settling: false };
      return {
        index: Math.min(count - 1, Math.floor((elapsed - timing.settleDuration) / timing.stepDuration)),
        showAll: false,
        settling: false,
      };
    }

    getWinSteps() {
      const steps = this.result.lines.map((line) => ({
        kind: 'line',
        index: line.index,
        amount: line.amount,
        cells: line.cells,
      }));
      if ((this.result.prizes || []).length >= 5) {
        this.result.prizes.forEach((prize, index) => steps.push({
          kind: 'prize',
          index: index + 1,
          amount: prize.value * this.spinBet,
          cells: [{ c: prize.c, r: prize.r }],
        }));
      }
      return steps;
    }

    getWinTiming() {
      const config = WIN_TIER_CONFIG[this.winTier] || WIN_TIER_CONFIG.small;
      const steps = this.getWinSteps();
      const count = steps.length;
      const baseSettleDuration = this.turbo ? 90 : config.settle;
      const categoryIntroDuration = this.winTier === 'mega'
        ? (this.turbo ? 900 : 2200)
        : this.winTier === 'big'
          ? (this.turbo ? 760 : 1800)
          : 0;
      const settleDuration = baseSettleDuration + categoryIntroDuration;
      const stepDuration = count ? (this.turbo ? 240 : config.lineDuration) : 0;
      const stepEnd = settleDuration + stepDuration * count;
      const rawStepTotal = steps.reduce((sum, step) => sum + step.amount, 0);
      const extraAmount = Math.max(0, this.result.total - Math.min(this.result.total, rawStepTotal));
      const finalDuration = this.turbo ? 520 : config.finalHold;
      const transferStart = stepEnd + Math.max(this.turbo ? 120 : 320, finalDuration * 0.34);
      const transferDuration = this.turbo ? 240 : Math.min(760, finalDuration * 0.42);
      return {
        baseSettleDuration,
        categoryIntroDuration,
        settleDuration,
        stepDuration,
        stepEnd,
        rawStepTotal,
        extraAmount,
        finalDuration,
        transferStart,
        transferDuration,
        totalDuration: stepEnd + finalDuration,
      };
    }

    getWinAccounting(time = this.renderTime) {
      if (this.lastWin <= 0 || !this.result.total) {
        return { counted: 0, gain: 0, balance: this.balance, transferProgress: 1 };
      }
      if (this.winCredited) {
        return { counted: this.lastWin, gain: this.lastWin, balance: this.balance, transferProgress: 1 };
      }
      const timing = this.getWinTiming();
      const elapsed = Math.max(0, time - this.winStart);
      const steps = this.getWinSteps();
      const stepScale = timing.rawStepTotal > this.result.total ? this.result.total / timing.rawStepTotal : 1;
      const minimumWin = Math.min(
        this.result.total,
        ...steps.map((step) => step.amount * stepScale),
      );
      let countedFromZero = 0;
      steps.forEach((step, index) => {
        const start = timing.settleDuration + index * timing.stepDuration;
        const raw = timing.stepDuration ? clamp(((elapsed - start) / timing.stepDuration) * 2.6, 0, 1) : 1;
        const eased = raw * raw * (3 - 2 * raw);
        countedFromZero += step.amount * stepScale * eased;
      });
      if (timing.extraAmount > 0) {
        const raw = clamp(((elapsed - timing.stepEnd) / Math.max(1, timing.finalDuration * 0.3)) * 2.6, 0, 1);
        countedFromZero += timing.extraAmount * raw * raw * (3 - 2 * raw);
      }
      const zeroProgress = clamp(countedFromZero / this.result.total, 0, 1);
      const counted = minimumWin + (this.result.total - minimumWin) * zeroProgress;
      const transferProgress = clamp((elapsed - timing.transferStart) / timing.transferDuration, 0, 1);
      const easedTransfer = transferProgress * transferProgress * (3 - 2 * transferProgress);
      return {
        counted,
        gain: counted,
        balance: this.balance + this.result.total * easedTransfer,
        transferProgress,
      };
    }

    completeBalanceTransfer() {
      if (this.winCredited || this.lastWin <= 0) return;
      this.balance += this.lastWin;
      this.winCredited = true;
      this.balancePulseStart = performance.now();
      this.checkAutoLimits();
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

    showPanelNow(text, mode = 'center', duration = 3200) {
      if (!text) return;
      this.panelQueue = this.panelQueue.filter((item) => !item.text.startsWith('APOSTA '));
      this.activatePanelItem({ text, mode, duration }, performance.now());
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
      this.enqueuePanel(`10 LINHAS ATIVAS • APOSTA ${money(this.bet)}`, 'center', 3000);
    }

    adjustBetLevel(direction) {
      if (this.state !== 'IDLE') return;
      const nextLevel = clamp(this.level + direction, 1, 10);
      this.level = nextLevel;
      const message = nextLevel === 10
        ? `APOSTA MÁXIMA • ${money(this.bet)}`
        : nextLevel === 1
          ? `APOSTA MÍNIMA • ${money(this.bet)}`
          : `APOSTA ${nextLevel} • ${money(this.bet)}`;
      this.message = message;
      this.showPanelNow(message, 'center', 2600);
    }

    getPaylinePreview(time) {
      if (this.state !== 'IDLE' || time >= this.paylinePreviewUntil) return { active: false, alpha: 0, count: 10 };
      const elapsed = time - this.paylinePreviewStart;
      const remaining = this.paylinePreviewUntil - time;
      const alpha = clamp(elapsed / 250, 0, 1) * clamp(remaining / 550, 0, 1);
      return {
        active: true,
        alpha,
        count: 10,
      };
    }

    advanceAfterResult(time) {
      this.completeBalanceTransfer();
      if (this.lastWin > 0) this.advancePanel(time);
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
      this.completeBalanceTransfer();
      const featureSpin = this.featureRemaining > 0;
      if (!featureSpin && this.balance < this.bet) {
        this.message = 'SALDO FICTÍCIO INSUFICIENTE';
        this.enqueuePanel(this.message, 'center', 3200);
        return;
      }
      this.spinBet = this.bet;
      if (!featureSpin) this.balance -= this.spinBet;
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
      if (this.forceMixed && !featureSpin) this.grid = makeMixedWinGrid();
      if (this.forceWinTier && !featureSpin) {
        this.grid = [3, 4, 3].map((rows) => Array.from({ length: rows }, () => ({ type: 'carrot', prize: 0 })));
      }
      this.freezePrizeValues(this.grid, this.spinBet);
      const deterministicDemo = this.forceLines || this.forceLine1 || this.forceLines35 || this.forcePrize || this.forceMax || this.forceMixed || this.forceWinTier;
      this.pendingFeature = !featureSpin && !deterministicDemo && (this.forceFeature || Math.random() < FEATURE_TRIGGER_RATE);
      this.forceFeature = false;
      this.forceLines = false;
      this.forceLine1 = false;
      this.forceLines35 = false;
      this.forcePrize = false;
      this.forceMax = false;
      this.forceMixed = false;
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
      this.showPanelNow(this.message, 'center', 2600);
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
      if (this.forceWinTier && WIN_TIER_CONFIG[this.forceWinTier] && this.result.total > 0) {
        const demoRatio = { small: 1, medium: 5, big: 20, mega: 60, max: 120 }[this.forceWinTier];
        const target = this.spinBet * demoRatio;
        const scale = target / this.result.total;
        this.result.lines.forEach((line) => { line.amount *= scale; });
        this.result.total = target;
        this.forceWinTier = null;
      }
      this.lastWin = this.result.total;
      this.winCredited = this.result.total <= 0;
      if (this.activeFeatureSpin) this.featureTotal += this.result.total;
      this.winStart = time;
      this.lastLineSoundIndex = -1;
      this.winTier = this.getWinTier();
      this.winEffectsStarted = false;
      this.celebrateWin = this.winTier !== 'small';

      if (this.pendingFeature && this.featureRemaining === 0) {
        this.featureRemaining = 8;
        this.message = 'COELHO DA FORTUNA — 8 RODADAS!';
      }

      this.history.unshift({
        time: new Date(),
        bet: this.activeFeatureSpin ? 0 : this.spinBet,
        win: this.result.total,
        feature: this.activeFeatureSpin,
        id: `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      });
      this.history = this.history.slice(0, 60);
      if (this.result.total <= 0) this.checkAutoLimits();

      if (this.result.total > 0) {
        this.state = 'WIN';
        this.message = this.pendingFeature ? '8 RODADAS DA FORTUNA!' : `GANHO ${money(this.result.total)}`;
        this.activatePanelItem({
          text: `WIN ${money(this.result.total)}`,
          mode: 'center',
          duration: (this.getWinTiming().totalDuration + 1000) / 1.6,
        }, time);
        if (this.pendingFeature) this.enqueuePanel('8 RODADAS DA FORTUNA!', 'center', 3400);
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
      const lineStake = this.spinBet / 10;
      return evaluateGrid(this.grid, this.spinBet, lineStake);
    }

    getWinTier() {
      if (!this.result.total || !this.spinBet) return 'small';
      const ratio = this.result.total / this.spinBet;
      return Object.entries(WIN_TIER_CONFIG)
        .find(([, config]) => ratio >= config.minRatio && ratio < config.maxRatio)?.[0] || 'max';
    }

    startWinEffects(time) {
      if (this.winEffectsStarted) return;
      this.winEffectsStarted = true;
      const config = WIN_TIER_CONFIG[this.winTier] || WIN_TIER_CONFIG.small;
      this.sound.playWinTier(this.winTier);
      this.burst(W / 2, 1120, config.sparks, '#ffd44d');
      if (config.coins) this.coinRain(config.coins);
      if (this.winTier === 'mega' || this.winTier === 'max') this.launchCelebrationConfetti(this.winTier === 'max' ? 68 : 38);
      this.balancePulseStart = 0;
      this.winEffectStartedAt = time;
    }

    launchCelebrationConfetti(count) {
      const kinds = ['confetti', 'carrot', 'frd'];
      for (let index = 0; index < count; index += 1) {
        this.particles.push({
          x: 70 + Math.random() * (W - 140),
          y: 250 + Math.random() * 520,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.12 - Math.random() * 0.12,
          life: 1800 + Math.random() * 1800,
          maxLife: 3600,
          size: 7 + Math.random() * 9,
          rotation: Math.random() * TAU,
          spin: (Math.random() - 0.5) * 0.018,
          color: index % 2 ? '#a94ed4' : '#ffd84c',
          kind: kinds[index % kinds.length],
        });
      }
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

    launchWinTransfer(step, time) {
      if (!step || !step.cells?.length) return;
      const centerCell = step.cells.find((cell) => cell.c === 1) || step.cells[Math.floor(step.cells.length / 2)];
      const reel = REEL_LAYOUT[centerCell.c];
      this.moneyTransfers.push({
        x: reel.x + reel.w / 2,
        y: reel.y + centerCell.r * reel.cellH + reel.cellH / 2,
        amount: step.amount,
        started: time,
        duration: this.turbo ? 460 : 900,
        seed: Math.random() * TAU,
      });
      this.burst(reel.x + reel.w / 2, reel.y + centerCell.r * reel.cellH + reel.cellH / 2, 12, '#ffe86b');
    }

    drawMoneyTransfers(time) {
      const ctx = this.ctx;
      const targetX = 390;
      const targetY = 1425;
      this.moneyTransfers.forEach((transfer) => {
        const count = this.turbo ? 6 : 10;
        for (let index = 0; index < count; index += 1) {
          const delay = index * (this.turbo ? 22 : 38);
          const progress = clamp((time - transfer.started - delay) / Math.max(1, transfer.duration - delay), 0, 1);
          if (progress <= 0 || progress >= 1) continue;
          const eased = 1 - Math.pow(1 - progress, 3);
          const side = Math.sin(transfer.seed + index * 1.8) * 42 * Math.sin(progress * Math.PI);
          const x = lerp(transfer.x, targetX, eased) + side;
          const y = lerp(transfer.y, targetY, eased) - Math.sin(progress * Math.PI) * (65 + index * 3);
          const alpha = clamp(progress / 0.12, 0, 1) * clamp((1 - progress) / 0.14, 0, 1);
          const size = 8 + (index % 3) * 2;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(x, y);
          ctx.rotate(progress * TAU * 2.4 + transfer.seed + index);
          ctx.scale(1, 0.45 + Math.abs(Math.cos(progress * TAU * 3)) * 0.55);
          ctx.fillStyle = '#ffd94f';
          ctx.strokeStyle = '#9e4f0b';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#fff078';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.ellipse(0, 0, size, size * 0.78, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      });
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
      ctx.save();
      ctx.scale(1166 / 780, 2434 / 1688);
      ctx.clearRect(0, 0, 780, 1688);
      this.hitAreas = [];
      this.drawBackground(time);
      this.drawHeader(time);
      this.drawReelFrame(time);
      this.drawReels(time);
      this.drawPaylinePreview(time);
      this.drawWinLayer(time);
      this.drawLineRails(time);
      this.drawParticles();
      this.drawStatus();
      this.drawTicker();
      if (!(this.state === 'WIN' && this.winTier === 'max')) this.drawControls(time);
      this.drawMoneyTransfers(time);
      this.drawMaxWinOverlay(time);
      this.drawFeatureOverlay(time);
      if (this.overlay) {
        this.hitAreas = [];
        this.drawOverlay();
      }
      ctx.restore();
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
      const winConfig = WIN_TIER_CONFIG[this.winTier] || WIN_TIER_CONFIG.small;
      const winElapsed = time - this.winStart;
      const celebrationStart = this.getWinTiming().stepEnd + Math.min(180, winConfig.mascotDelay * 0.18);
      if (mascotWinning && this.celebrateWin && winElapsed >= celebrationStart && winElapsed < celebrationStart + winConfig.mascotDuration) {
        this.drawCelebrationMascot(time);
      } else {
        const idleFrame = this.getIdleMascotFrame(time);
        ctx.save();
        ctx.translate(390, 315 + mascotBob);
        ctx.rotate(mascotLean);
        if (mascotWinning) {
          ctx.shadowColor = '#ffd85e';
          ctx.shadowBlur = 20 + Math.sin(time * 0.012) * 7;
        }
        const mascotScale = mascotWinning && this.winTier === 'small' ? 1.035 : 1;
        ctx.scale(mascotScale, mascotScale);
        this.drawImageContain(idleFrame, 0, 0, 246, 266);
        ctx.restore();
      }
      this.drawImageContain(ASSETS.logo, 390, 91, 326, 174);
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
        const baseY = 425 + Math.sin(time * 0.0007 + side * 2) * 16;
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
      ctx.save();
      ctx.globalAlpha = 0.58;
      const driftA = Math.sin(time * 0.00012) * 24;
      const driftB = Math.sin(time * 0.00009 + 2.4) * 20;
      this.drawImageContain(ASSETS.cloud1, 184 + driftA, 135, 120, 62);
      this.drawImageContain(ASSETS.cloud2, 603 + driftB, 150, 190, 88);

      this.drawImageContain(ASSETS.cloud3, 403 + driftB, 290, 190, 128);
      this.drawImageContain(ASSETS.cloud4, 84 + driftA, 235, 120, 72);

      ctx.globalAlpha = 0.32;
      this.drawImageContain(ASSETS.cloud2, 410 - driftA * 0.45, 225, 130, 62);
      ctx.restore();
    }

    getIdleMascotFrame(time) {
      const frames = [ASSETS.idle1, ASSETS.idle2, ASSETS.idle3, ASSETS.idle4, ASSETS.idle5];
      const sequence = [0, 1, 2, 3, 4, 3, 2, 1];
      const frameIndex = sequence[Math.floor(time / 260) % sequence.length];
      return frames[frameIndex] || frames.find(Boolean) || ASSETS.mascot;
    }

    drawCelebrationMascot(time) {
      const config = WIN_TIER_CONFIG[this.winTier] || WIN_TIER_CONFIG.medium;
      const celebrationStart = this.getWinTiming().stepEnd + Math.min(180, config.mascotDelay * 0.18);
      const elapsed = Math.max(0, time - this.winStart - celebrationStart);
      const frames = [ASSETS.celebration1, ASSETS.celebration2, ASSETS.celebration3, ASSETS.celebration4, ASSETS.celebration5];
      const frame = frames[Math.min(frames.length - 1, Math.floor(elapsed / 190))] || this.getIdleMascotFrame(time);
      const appear = easeOutBack(clamp(elapsed / 330, 0, 1));
      const strength = { medium: 0.55, big: 0.82, mega: 1, max: 1.12 }[this.winTier] || 0.5;
      const jump = -Math.sin(clamp(elapsed / 1100, 0, 1) * Math.PI) * 42 * strength;
      const sway = Math.sin(elapsed * 0.012) * 0.025 * strength;
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(390, 318 + jump);
      ctx.rotate(sway);
      ctx.scale(appear * (0.96 + strength * 0.06), appear * (0.96 + strength * 0.06));
      ctx.shadowColor = '#ffd75b';
      ctx.shadowBlur = 28 + Math.sin(time * 0.015) * 8;
      this.drawImageContain(frame, 0, 0, 292, 310);
      ctx.restore();
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
      const roof = left ? ASSETS.roofLeft : ASSETS.roofRight;
      const lantern = ASSETS.lantern;
      const roofX = left ? 0 : 626;
      const roofY = 90;
      const roofW = 154;
      const roofH = 422;
      if (roof) ctx.drawImage(roof, roofX, roofY, roofW, roofH);
      if (!lantern) return;
      const lanternW = 64;
      const lanternH = 132;
      const lanternX = left ? 99 : 617;
      // Keep the rope anchored directly under the roof ornament.
      const lanternY = 204;
      const pivotX = lanternX + lanternW / 2;
      const sway = Math.sin(time * 0.00115 + (left ? 0 : 1.7)) * 0.032;
      const glowPulse = 0.78 + Math.sin(time * 0.0034 + (left ? 0.4 : 2.1)) * 0.22;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const glowX = lanternX + lanternW * 0.5;
      const glowY = lanternY + lanternH * 0.54;
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
      if (ASSETS.reelFrame) ctx.drawImage(ASSETS.reelFrame, REEL_FRAME.x, REEL_FRAME.y, REEL_FRAME.w, REEL_FRAME.h);
      else REEL_LAYOUT.forEach((reel) => this.roundRect(reel.x, reel.y, reel.w, reel.h, 14, '#17195d', '#f5b95e', 6));
    }

    drawReels(time) {
      this.reels.forEach((reel) => {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.rect(reel.x + 3, reel.y + 3, reel.w - 6, reel.h - 6);
        ctx.clip();
        ctx.fillStyle = '#09083a38';
        ctx.fillRect(reel.x + 3, reel.y + 3, reel.w - 6, reel.h - 6);

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
            const prize = this.randomPrize();
            const symbol = {
              type: reel.strip[(base + row + reel.strip.length) % reel.strip.length],
              prize,
              prizeAmount: prize * this.spinBet,
            };
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
      const bob = 0;
      const breathe = 1;
      const tilt = 0;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (moving) ctx.filter = 'blur(2.4px)';
      ctx.translate(cx, cy + bob);
      ctx.rotate(tilt);
      ctx.scale(Math.max(0.02, flip) * breathe * emphasis, breathe * emphasis);
      if (symbol.type === 'prize') {
        const amount = Number.isFinite(symbol.prizeAmount)
          ? symbol.prizeAmount
          : (symbol.prize || 0.5) * this.spinBet;
        this.drawPrize(0, 0, amount, w, h);
      }
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
      const high = options.showMultiplier ? value >= 100 : value >= Math.max(50, this.spinBet * 25);
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
        : Number(value).toFixed(2).replace('.', ',');
      let fontSize = Math.min(38, maxH * 0.225);
      do {
        ctx.font = `900 ${fontSize}px Arial Black, Arial, sans-serif`;
        fontSize -= 1;
      } while (fontSize > 18 && ctx.measureText(text).width > maxW * 0.69);
      ctx.lineWidth = Math.max(5, fontSize * 0.2);
      ctx.strokeStyle = '#54132d';
      ctx.shadowColor = '#6e2d08';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 3;
      const valueY = 0;
      ctx.strokeText(text, 0, valueY);
      ctx.fillStyle = value >= 100 ? '#fff07c' : '#fff7d5';
      ctx.fillText(text, 0, valueY);
      ctx.shadowOffsetY = 0;
      if (high) this.drawSymbolSparkle(maxW * 0.28, -maxH * 0.28, 9, 0.8);
      ctx.restore();
    }

    getPaylineRailPoint(lineNumber, side) {
      const railIndex = LINE_RAILS[side].indexOf(lineNumber);
      return {
        x: side === 'left' ? 22 : 758,
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
      const timing = this.getWinTiming();
      const elapsed = time - this.winStart;
      if (elapsed < timing.settleDuration) {
        this.drawWinCategory(time);
        return;
      }
      const ctx = this.ctx;
      const pulse = 0.55 + 0.45 * Math.sin((time - this.winStart) * 0.014);
      const steps = this.getWinSteps();
      const activeSteps = steps.length
        ? (this.lineShowAll ? steps : [steps[this.lineCycle]].filter(Boolean))
        : [];
      const activeLines = activeSteps.filter((step) => step.kind === 'line');
      const activeCells = activeSteps.length
        ? [...new Map(activeSteps.flatMap((step) => step.cells).map((cell) => [`${cell.c}-${cell.r}`, cell])).values()]
        : this.result.cells;
      const activeKeys = new Set(activeCells.map(({ c, r }) => `${c}-${r}`));

      this.drawWinAtmosphere(time);

      REEL_LAYOUT.forEach((reel, c) => {
        for (let r = 0; r < reel.rows; r += 1) {
          if (activeKeys.has(`${c}-${r}`)) continue;
          ctx.save();
          ctx.fillStyle = '#100a2f94';
          this.roundRect(reel.x + 5, reel.y + r * reel.cellH + 4, reel.w - 10, reel.cellH - 8, 12, '#100a2f94');
          ctx.restore();
        }
      });

      activeCells.forEach(({ c, r }) => {
        const reel = REEL_LAYOUT[c];
        const x = reel.x + 5;
        const y = reel.y + r * reel.cellH + 3;
        const emphasis = 1.04 + pulse * 0.035;
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
        if (!this.lineShowAll) {
          const local = elapsed - timing.settleDuration - this.lineCycle * timing.stepDuration;
          const reveal = clamp(local / Math.min(360, timing.stepDuration * 0.55), 0, 1);
          ctx.beginPath();
          ctx.rect(0, 360, W * reveal, 850);
          ctx.clip();
        }
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
      if (!this.lineShowAll && activeSteps.length === 1 && activeSteps[0].kind !== 'prize') {
        this.drawStepPayout(activeSteps[0], time);
      }
      this.drawWinCategory(time);
    }

    drawWinAtmosphere(time) {
      const ctx = this.ctx;
      const intensity = { small: 0, medium: 0.04, big: 0.16, mega: 0.22, max: 0.29 }[this.winTier] || 0;
      if (intensity <= 0) return;
      ctx.save();
      ctx.beginPath();
      REEL_LAYOUT.forEach((reel) => ctx.rect(reel.x + 4, reel.y + 4, reel.w - 8, reel.h - 8));
      ctx.clip();
      const pulse = 0.72 + Math.sin(time * 0.0045) * 0.28;
      const halo = ctx.createRadialGradient(390, 770, 80, 390, 770, this.winTier === 'max' ? 590 : 470);
      halo.addColorStop(0, `rgba(255,214,70,${(0.12 + intensity * 0.45) * pulse})`);
      halo.addColorStop(0.48, `rgba(174,61,180,${intensity * 0.42})`);
      halo.addColorStop(1, 'rgba(31,8,69,0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = halo;
      ctx.fillRect(0, 230, W, 1040);
      if (this.winTier === 'mega' || this.winTier === 'max') {
        ctx.strokeStyle = this.winTier === 'max' ? '#fff09a' : '#e890ff';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ffcf48';
        ctx.shadowBlur = 18 + pulse * 18;
        const progress = ((time - this.winStart) * 0.00038) % 1;
        ctx.globalAlpha = 0.35 + progress * 0.45;
        REEL_LAYOUT.forEach((reel) => {
          this.roundRect(reel.x + 7, reel.y + 7, reel.w - 14, reel.h - 14, 24, null, ctx.strokeStyle, 5);
        });
      }
      ctx.restore();
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

    drawStepPayout(step, time) {
      const ctx = this.ctx;
      const timing = this.getWinTiming();
      const local = Math.max(0, time - this.winStart - timing.settleDuration - this.lineCycle * timing.stepDuration);
      const cycle = local % 760;
      const alpha = cycle < 130
        ? cycle / 130
        : cycle < 480
          ? 1
          : cycle < 680
            ? (680 - cycle) / 200
            : 0;
      if (alpha <= 0.02) return;
      const centerCell = step.cells.find((cell) => cell.c === 1) || step.cells[Math.floor(step.cells.length / 2)];
      const reel = REEL_LAYOUT[centerCell.c];
      const x = reel.x + reel.w / 2;
      const y = reel.y + centerCell.r * reel.cellH + reel.cellH / 2 + 24;
      const scaleToCap = timing.rawStepTotal > this.result.total ? this.result.total / timing.rawStepTotal : 1;
      const text = (step.amount * scaleToCap).toFixed(2).replace('.', ',');
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
      if (!this.lastWin || !this.spinBet) return;
      const elapsed = time - this.winStart;
      const timing = this.getWinTiming();
      // A vitória máxima já possui uma celebração de tela inteira. Evita repetir
      // o mesmo título no banner intermediário enquanto o overlay está visível.
      if (this.winTier === 'max') return;
      if (this.winTier === 'big' || this.winTier === 'mega') {
        const introElapsed = elapsed - timing.baseSettleDuration;
        if (introElapsed < 0 || introElapsed >= timing.categoryIntroDuration) return;
        const fadeDuration = this.turbo ? 150 : 300;
        const appear = clamp(introElapsed / fadeDuration, 0, 1)
          * clamp((timing.categoryIntroDuration - introElapsed) / fadeDuration, 0, 1);
        this.drawWinCategoryArtwork(time, introElapsed, appear);
        return;
      }
      if (!this.lineShowAll || elapsed < timing.stepEnd) return;
      const finalElapsed = elapsed - timing.stepEnd;
      const appear = clamp(finalElapsed / 380, 0, 1) * clamp((timing.totalDuration - elapsed) / 320, 0, 1);
      const category = {
        small: { label: 'GANHO', color: '#fff5c4', width: 300, font: 30 },
        medium: { label: 'ÓTIMO GANHO', color: '#fff0a3', width: 390, font: 34 },
        max: { label: 'VITÓRIA MÁXIMA', color: '#fff37a', width: 620, font: 46 },
      }[this.winTier || 'small'];
      const pulse = 1 + Math.sin(time * 0.009) * (this.winTier === 'max' ? 0.065 : 0.035);
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = appear;
      if (this.winTier === 'max') {
        const veil = ctx.createRadialGradient(390, 760, 60, 390, 760, 650);
        veil.addColorStop(0, 'rgba(255,192,42,0.34)');
        veil.addColorStop(0.45, 'rgba(126,28,121,0.32)');
        veil.addColorStop(1, 'rgba(19,7,52,0.12)');
        ctx.fillStyle = veil;
        ctx.fillRect(0, 180, W, 1040);
      }
      ctx.translate(390, 1145);
      ctx.scale(pulse, pulse);
      if ((this.winTier === 'big' || this.winTier === 'mega' || this.winTier === 'max') && ASSETS.symbolIngot) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.rotate(-0.12);
        this.drawImageContain(ASSETS.symbolIngot, -210, -62, 110, 80);
        ctx.scale(-1, 1);
        ctx.rotate(-0.24);
        this.drawImageContain(ASSETS.symbolIngot, -210, -62, 110, 80);
        ctx.restore();
      }
      const bannerWidth = category.width;
      this.roundRect(-bannerWidth / 2, -48, bannerWidth, 96, 30, this.winTier === 'max' ? '#7e1749f2' : '#401452e8', '#ffd75e', this.winTier === 'max' ? 8 : 6);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${category.font}px Georgia, serif`;
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#7d2036';
      ctx.shadowColor = category.color;
      ctx.shadowBlur = this.winTier === 'max' ? 42 : this.winTier === 'mega' ? 36 : this.winTier === 'big' ? 30 : 18;
      ctx.strokeText(category.label, 0, 0);
      ctx.fillStyle = category.color;
      ctx.fillText(category.label, 0, 0);
      ctx.restore();
    }

    drawWinCategoryArtwork(time, finalElapsed, appear) {
      const isMega = this.winTier === 'mega';
      const artwork = isMega ? ASSETS.megaWinTitle : ASSETS.bigWinTitle;
      if (!artwork) return;
      const ctx = this.ctx;
      const cx = 390;
      const cy = isMega ? 790 : 825;
      const entryDuration = isMega ? 520 : 440;
      const entry = easeOutBack(clamp(finalElapsed / entryDuration, 0, 1));
      const scale = (isMega ? 0.62 : 0.7) + entry * (isMega ? 0.38 : 0.3);
      const pulse = 1 + Math.sin(time * (isMega ? 0.0075 : 0.0065)) * (isMega ? 0.022 : 0.014);
      const burst = 1 - clamp(finalElapsed / (isMega ? 1250 : 950), 0, 1);
      const artWidth = isMega ? 610 : 570;
      const artHeight = isMega ? 500 : 400;
      const artScale = scale * pulse;
      const particleCount = isMega ? 24 : 16;

      ctx.save();
      ctx.translate(cx, cy);

      // Halo orgânico local. Não existe mais retângulo preto sobre os rolos:
      // o centro escuro termina suavemente poucos pixels além da própria arte.
      const glowRadius = isMega ? 342 : 300;
      const glow = ctx.createRadialGradient(0, 0, 18, 0, 0, glowRadius);
      glow.addColorStop(0, isMega ? 'rgba(36,5,49,0.62)' : 'rgba(35,9,18,0.58)');
      glow.addColorStop(0.54, isMega ? 'rgba(24,4,42,0.42)' : 'rgba(28,7,20,0.4)');
      glow.addColorStop(0.82, isMega ? 'rgba(235,58,187,0.11)' : 'rgba(255,142,43,0.1)');
      glow.addColorStop(1, 'rgba(8,2,18,0)');
      ctx.fillStyle = glow;
      ctx.globalAlpha = appear;
      ctx.beginPath();
      ctx.ellipse(0, 2, glowRadius, isMega ? 264 : 214, 0, 0, TAU);
      ctx.fill();

      // Explosão dourada no Grande; explosão rosa/dourada mais ampla no Mega.
      ctx.save();
      ctx.rotate(time * (isMega ? 0.00009 : -0.000065));
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = appear * (0.3 + burst * 0.5);
      const rayCount = isMega ? 24 : 16;
      for (let ray = 0; ray < rayCount; ray += 1) {
        ctx.rotate(TAU / rayCount);
        const rayLength = (isMega ? 295 : 250) + burst * (isMega ? 62 : 42);
        const rayWidth = isMega && ray % 2 === 0 ? 8 : 5;
        ctx.beginPath();
        ctx.moveTo(isMega ? 92 : 80, -2);
        ctx.lineTo(rayLength, -rayWidth);
        ctx.lineTo(rayLength, rayWidth);
        ctx.closePath();
        ctx.fillStyle = isMega && ray % 3 === 0 ? '#ff79db' : ray % 2 === 0 ? '#fff2a4' : '#ffae35';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = isMega ? 18 : 12;
        ctx.fill();
      }
      ctx.restore();

      // Ondas de choque. Grande recebe um pulso; Mega recebe dois pulsos
      // alternados para comunicar uma categoria de prêmio mais rara.
      const waveCount = isMega ? 2 : 1;
      for (let wave = 0; wave < waveCount; wave += 1) {
        const delay = wave * 360;
        const waveProgress = clamp((finalElapsed - delay) / (isMega ? 1050 : 820), 0, 1);
        if (waveProgress <= 0 || waveProgress >= 1) continue;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = appear * (1 - waveProgress) * (isMega ? 0.82 : 0.68);
        ctx.strokeStyle = isMega && wave % 2 === 0 ? '#ff78db' : '#ffd45c';
        ctx.lineWidth = isMega ? 7 : 6;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = isMega ? 24 : 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, 135 + waveProgress * (isMega ? 218 : 175), 92 + waveProgress * (isMega ? 150 : 108), 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }

      // Partículas determinísticas: não tremem entre quadros. O Grande usa
      // faíscas quentes; o Mega mistura energia rosa, ouro e pequenos pétalas.
      for (let index = 0; index < particleCount; index += 1) {
        const angle = (index / particleCount) * TAU + (isMega ? 0.2 : 0.05);
        const travel = clamp(finalElapsed / (isMega ? 1050 : 820), 0, 1);
        const radius = (isMega ? 118 : 98) + travel * (isMega ? 205 : 155) + Math.sin(time * 0.004 + index) * 9;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.68;
        const size = (isMega ? 5.5 : 4.2) + Math.sin(time * 0.011 + index * 1.7) * 1.6;
        ctx.save();
        ctx.globalAlpha = appear * (0.42 + burst * 0.58);
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, size), 0, TAU);
        ctx.fillStyle = isMega && index % 3 === 0 ? '#ff91df' : index % 2 === 0 ? '#fff2a4' : '#ffb43e';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = isMega ? 16 : 11;
        ctx.fill();
        ctx.restore();
      }

      if (isMega) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = appear * (0.36 + burst * 0.42);
        for (let petal = 0; petal < 12; petal += 1) {
          const angle = petal * (TAU / 12) + time * 0.00012;
          const drift = 200 + ((petal * 37) % 95) + Math.sin(time * 0.002 + petal) * 18;
          ctx.save();
          ctx.translate(Math.cos(angle) * drift, Math.sin(angle) * drift * 0.72);
          ctx.rotate(angle + Math.PI / 2);
          ctx.fillStyle = petal % 2 ? '#ffb8e8' : '#ff6fcf';
          ctx.shadowColor = '#ff69cc';
          ctx.shadowBlur = 13;
          ctx.beginPath();
          ctx.ellipse(0, 0, 4.5, 11, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      // A sombra escura e o neon usam o canal alpha da imagem. Assim a borda
      // acompanha o arabesco da placa, sem qualquer caixa preta quadrada.
      ctx.save();
      ctx.scale(artScale * 1.045, artScale * 1.045);
      ctx.globalAlpha = appear * (isMega ? 0.74 : 0.68);
      ctx.filter = `brightness(0) blur(${isMega ? 17 : 14}px)`;
      this.drawImageContain(artwork, 0, 0, artWidth, artHeight);
      ctx.restore();

      ctx.save();
      ctx.scale(artScale, artScale);
      ctx.globalAlpha = appear * (isMega ? 0.34 : 0.26);
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = isMega ? '#ff55ce' : '#ffc341';
      ctx.shadowBlur = isMega ? 54 + burst * 34 : 40 + burst * 26;
      this.drawImageContain(artwork, 0, 0, artWidth, artHeight);
      ctx.restore();

      ctx.save();
      ctx.scale(artScale, artScale);
      ctx.globalAlpha = appear;
      ctx.shadowColor = isMega ? '#ff66d2' : '#ffc94c';
      ctx.shadowBlur = isMega ? 42 + burst * 28 : 32 + burst * 22;
      this.drawImageContain(artwork, 0, 0, artWidth, artHeight);
      ctx.restore();
      ctx.restore();
    }

    drawMaxWinOverlay(time) {
      if (this.state !== 'WIN' || this.winTier !== 'max') return;
      const elapsed = time - this.winStart;
      // Celebração curta: a apuração das linhas continua ao fundo, mas o foco
      // visual de Vitória Máxima sai sozinho após dois segundos.
      if (elapsed > 2000) return;
      const local = Math.max(0, elapsed);
      const appear = clamp(local / 220, 0, 1) * clamp((2000 - local) / 260, 0, 1);
      const ctx = this.ctx;
      ctx.save();

      ctx.save();
      ctx.translate(390, 640);
      ctx.rotate(local * 0.00018);
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = '#ffe77a';
      ctx.globalAlpha = appear * 0.38;
      for (let ray = 0; ray < 24; ray += 1) {
        ctx.rotate(TAU / 24);
        ctx.beginPath();
        ctx.moveTo(55, -5);
        ctx.lineTo(520, -13);
        ctx.lineTo(520, 13);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Escurece somente a área do sol giratório; tela e linhas seguem legíveis.
      ctx.save();
      ctx.beginPath();
      ctx.arc(390, 640, 318, 0, TAU);
      ctx.fillStyle = `rgba(5, 4, 20, ${0.62 * appear})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 222, 104, ${0.55 * appear})`;
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.restore();

      const frame = [ASSETS.celebration3, ASSETS.celebration4, ASSETS.celebration5]
      [Math.floor(local / 230) % 3] || this.getIdleMascotFrame(time);
      ctx.shadowColor = '#ffd94e';
      ctx.shadowBlur = 38;
      this.drawImageContain(frame, 390, 640 - Math.sin(local * 0.006) * 12, 360, 390);
      ctx.globalAlpha = appear;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 50px Georgia, serif';
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#63163f';
      ctx.fillStyle = '#fff18a';
      ctx.shadowColor = '#ffd132';
      ctx.shadowBlur = 24;
      ctx.strokeText('VITÓRIA MÁXIMA', 390, 870);
      ctx.fillText('VITÓRIA MÁXIMA', 390, 870);
      ctx.restore();
    }

    drawLineRails(time) {
      const ctx = this.ctx;
      const idleSelection = this.state === 'IDLE';
      const steps = this.state === 'WIN' ? this.getWinSteps() : [];
      const currentStep = steps[this.lineCycle];
      const winningLines = idleSelection
        ? new Set(PAYLINES.map((_, index) => index + 1))
        : (this.state === 'WIN' && this.result.lines.length
          ? new Set((this.lineShowAll
            ? this.result.lines
            : (currentStep?.kind === 'line' ? [currentStep] : [])).map((line) => line.index + 1))
          : new Set());
      const pulse = idleSelection ? 1 : 0.78 + Math.sin(time * 0.018) * 0.22;

      Object.entries(LINE_RAILS).forEach(([side, order]) => {
        const x = side === 'left' ? 22 : 758;
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

    getWinPanelPalette() {
      const ratio = this.spinBet ? this.lastWin / this.spinBet : 0;
      if (ratio >= WIN_TIER_CONFIG.max.minRatio) return ['#52042e', '#db1762', '#ff9b24'];
      if (ratio >= WIN_TIER_CONFIG.mega.minRatio) return ['#39105f', '#9b258c', '#f15ead'];
      if (ratio >= WIN_TIER_CONFIG.big.minRatio) return ['#5b1532', '#d34824', '#ffbf35'];
      if (ratio >= WIN_TIER_CONFIG.medium.minRatio) return ['#24134f', '#7b2d84', '#eebf35'];
      return ['#25134d', '#592875', '#b14888'];
    }

    getWinBannerText(accounting) {
      return `WIN ${money(accounting.counted)}`;
    }

    drawTicker() {
      const ctx = this.ctx;
      const x = PANEL_X;
      const y = DISPLAY_Y;
      const w = PANEL_W;
      const h = 164;
      const inner = { x: x + 28, y: y + 46, w: w - 56, h: 86, radius: 38 };
      const isWin = this.state === 'WIN' && this.lastWin > 0;
      const winElapsed = isWin ? this.renderTime - this.winStart : this.renderTime - this.tickerStarted;
      const accounting = isWin ? this.getWinAccounting(this.renderTime) : null;
      const displayText = isWin ? this.getWinBannerText(accounting) : this.tickerText;
      const centerDisplay = isWin || this.tickerMode === 'center';
      ctx.save();
      if (!ASSETS.displayFrame) this.roundRect(x, y, w, h, 18, '#251760', '#f7b952', 4);

      this.roundedRectPath(inner.x, inner.y, inner.w, inner.h, inner.radius);
      ctx.clip();
      this.roundedRectPath(inner.x, inner.y, inner.w, inner.h, inner.radius);
      ctx.fillStyle = '#251760';
      ctx.fill();
      if (isWin) {
        const palette = this.getWinPanelPalette();
        const panelFill = ctx.createLinearGradient(x + 24, y, x + w - 24, y + h);
        panelFill.addColorStop(0, palette[0]);
        panelFill.addColorStop(0.52, palette[1]);
        panelFill.addColorStop(1, palette[2]);
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = panelFill;
        ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
        ctx.globalAlpha = 1;
        const burst = clamp(winElapsed / 260, 0, 1) * clamp((this.tickerDuration - winElapsed) / 500, 0, 1);
        const panelGlow = ctx.createRadialGradient(x + w / 2, y + h / 2, 2, x + w / 2, y + h / 2, w * 0.48);
        panelGlow.addColorStop(0, `rgba(255,230,93,${0.52 * burst})`);
        panelGlow.addColorStop(0.32, `${palette[2]}88`);
        panelGlow.addColorStop(0.72, `${palette[1]}77`);
        panelGlow.addColorStop(1, 'rgba(40,8,74,0)');
        ctx.fillStyle = panelGlow;
        ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
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
      ctx.textAlign = centerDisplay ? 'center' : 'left';
      ctx.textBaseline = 'middle';
      const estimatedWidth = displayText.length * (isWin ? 25 : 19);
      const fittedSize = centerDisplay && estimatedWidth > w - 70
        ? Math.max(19, (isWin ? 43 : 34) * (w - 70) / estimatedWidth)
        : (isWin ? 43 : 34);
      const textScale = isWin ? 0.72 + easeOutBack(clamp(winElapsed / 360, 0, 1)) * 0.28 : 1;
      const textX = centerDisplay ? x + w / 2 : this.tickerX;
      ctx.translate(textX, y + h / 2 + (isWin ? 7 : 12));
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
      ctx.strokeText(displayText, 0, 0);
      ctx.fillText(displayText, 0, 0);
      ctx.restore();

      // Moldura transparente sempre por cima; conteúdo nunca invade o arabesco.
      if (ASSETS.displayFrame) ctx.drawImage(ASSETS.displayFrame, x, y, w, h);
    }

    drawWalletIcon(x, y) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = '#ffd65c';
      ctx.fillStyle = '#7b3a82';
      ctx.lineWidth = 4;
      this.roundRect(-21, -14, 42, 29, 7, '#7b3a82', '#ffd65c', 4);
      this.roundRect(5, -5, 22, 14, 6, '#4c266f', '#ffd65c', 3);
      ctx.fillStyle = '#fff4a8';
      ctx.beginPath();
      ctx.arc(12, 2, 2.5, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    drawCoinStackIcon(x, y) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(x, y);
      for (let index = 0; index < 3; index += 1) {
        const offsetY = 11 - index * 10;
        ctx.fillStyle = index === 2 ? '#ffe56b' : '#f3a72d';
        ctx.strokeStyle = '#9f4e13';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, offsetY, 18, 7, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    drawStatus() {
      const ctx = this.ctx;
      ctx.save();
      ctx.textAlign = 'center';
      const panel = { x: 64, y: 1360, w: 652, h: 103 };
      if (ASSETS.scoreFrame) ctx.drawImage(ASSETS.scoreFrame, panel.x, panel.y, panel.w, panel.h);
      else {
        const panelGradient = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
        panelGradient.addColorStop(0, '#2b1766');
        panelGradient.addColorStop(1, '#211453');
        this.roundRect(panel.x, panel.y, panel.w, panel.h, 24, panelGradient, '#f3b862', 5);
        ctx.strokeStyle = '#d89c45';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(390, 1368);
        ctx.lineTo(390, 1455);
        ctx.stroke();
      }
      const accounting = this.getWinAccounting(this.renderTime);
      ctx.textBaseline = 'middle';

      const pulseAge = this.balancePulseStart ? this.renderTime - this.balancePulseStart : Infinity;
      const balancePulse = pulseAge < 620 ? 1 + Math.sin(clamp(pulseAge / 620, 0, 1) * Math.PI) * 0.08 : 1;
      ctx.save();
      ctx.translate(226, 1428);
      ctx.scale(balancePulse, balancePulse);
      ctx.fillStyle = '#fff9e5';
      ctx.font = '900 25px Arial Black, Arial';
      ctx.fillText(money(accounting.balance), 0, 0);
      ctx.restore();

      const betCenterX = panel.x + panel.w * 0.75;
      const hasBetLevel = this.level > 1 && this.level < 10;
      if (hasBetLevel) {
        // "APOSTA" já vem no painel. O nível fica ao lado, formando um único título.
        ctx.fillStyle = '#ffe16a';
        ctx.font = '900 24px Arial Black, Arial';
        ctx.fillText(String(this.level), betCenterX + 55, 1393);
      }
      ctx.fillStyle = '#fff9e5';
      ctx.font = '900 25px Arial Black, Arial';
      // Mantém o valor na mesma linha, peso e escala do saldo.
      ctx.fillText(money(this.bet), betCenterX - (hasBetLevel ? 18 : 10), 1428);
      this.hit(390, panel.y, panel.w / 2, panel.h, () => this.state === 'IDLE' && this.openOverlay('bet'));
      ctx.restore();
    }

    drawActiveControlState(control, time) {
      const ctx = this.ctx;
      const pulse = 0.72 + Math.sin(time * 0.009) * 0.28;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const glow = ctx.createRadialGradient(0, 0, control.r * 0.48, 0, 0, control.r * 1.18);
      glow.addColorStop(0, control.id === 'turbo' ? 'rgba(255,205,55,0.34)' : 'rgba(80,224,255,0.30)');
      glow.addColorStop(0.68, control.id === 'turbo' ? `rgba(255,174,34,${0.18 + pulse * 0.12})` : `rgba(65,210,255,${0.16 + pulse * 0.12})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, control.r * 1.22, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = control.id === 'turbo' ? '#fff0a0' : '#baf7ff';
      ctx.lineWidth = 4;
      ctx.shadowColor = control.id === 'turbo' ? '#ffc52d' : '#4bdfff';
      ctx.shadowBlur = 14 + pulse * 8;
      ctx.beginPath();
      ctx.arc(0, 0, control.r * 0.94, 0, TAU);
      ctx.stroke();
      if (control.id === 'turbo') {
        ctx.fillStyle = '#fff8d6';
        ctx.strokeStyle = '#ef9b1e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(5, -34);
        ctx.lineTo(-15, -3);
        ctx.lineTo(-2, -3);
        ctx.lineTo(-12, 31);
        ctx.lineTo(18, -9);
        ctx.lineTo(4, -9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    drawControls(time) {
      const ctx = this.ctx;
      const autoWasActive = this.autoActive;
      const betControlsDisabled = this.state !== 'IDLE';
      const controls = [
        {
          id: 'turbo', x: 78, y: 1585, r: 64, image: ASSETS.turboButton, active: this.turbo, action: () => {
            this.turbo = !this.turbo;
            this.message = this.turbo ? 'RODADA TURBO ATIVADA' : 'RODADA TURBO DESATIVADA';
            this.enqueuePanel(this.message, 'center', 2600);
          }
        },
        {
          id: 'minus', x: 194, y: 1585, r: 51, image: ASSETS.minusButton, disabled: betControlsDisabled, action: () => {
            this.adjustBetLevel(-1);
          }
        },
        {
          id: 'plus', x: 582, y: 1585, r: 51, image: ASSETS.plusButton, disabled: betControlsDisabled, action: () => {
            this.adjustBetLevel(1);
          }
        },
        {
          id: 'auto', x: 699, y: 1585, r: 61, image: ASSETS.autoButton, active: this.autoActive, action: () => {
            if (autoWasActive) return;
            if (this.state === 'IDLE') this.openOverlay('auto');
          }
        },
      ];

      if (ASSETS.lowerOrnament) ctx.drawImage(ASSETS.lowerOrnament, 0, 1454, W, 274);
      controls.forEach((control) => {
        const pressed = this.pressScale(control.id, time);
        ctx.save();
        ctx.translate(control.x, control.y);
        ctx.scale(pressed, pressed);
        ctx.globalAlpha = control.disabled ? 0.43 : 1;
        this.drawImageContain(control.image, 0, 0, control.r * 2, control.r * 2);
        if (control.active) this.drawActiveControlState(control, time);
        ctx.restore();
        if (!control.disabled) {
          const hitRadius = control.r + 9;
          this.hit(control.x - hitRadius, control.y - hitRadius, hitRadius * 2, hitRadius * 2, control.action, control.id);
        }
      });

      const spinBusy = this.state === 'SPIN_LOOP';
      const fortuneActive = this.activeFeatureSpin || this.featureRemaining > 0;
      const fortuneCount = this.featureRemaining + (this.activeFeatureSpin && spinBusy ? 1 : 0);
      const idlePulse = spinBusy ? 1 : 1 + Math.sin(time * 0.0038) * 0.011;
      const pressedScale = this.pressScale('spin', time);
      if (this.autoActive) {
        this.drawAutoIndicator(time, Math.max(0, this.autoRemaining), pressedScale, spinBusy);
      } else {
        ctx.save();
        ctx.translate(390, 1588);
        ctx.scale(idlePulse * pressedScale, idlePulse * pressedScale);
        ctx.rotate(this.spinButtonAngle);
        this.drawImageContain(ASSETS.spinButton, 0, 0, 194, 194);
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
      this.hit(293, 1491, 194, 194, () => {
        if (autoWasActive) return;
        if (spinBusy) this.fastStop(); else this.spin();
      }, 'spin');
    }

    drawAutoIndicator(time, remaining, pressedScale, spinning) {
      const ctx = this.ctx;
      const pulse = 1 + Math.sin(time * 0.007) * 0.014;
      ctx.save();
      ctx.translate(390, 1588);
      ctx.scale(pulse * pressedScale, pulse * pressedScale);
      const base = ctx.createRadialGradient(-18, -26, 8, 0, 0, 90);
      base.addColorStop(0, '#6f5bdb');
      base.addColorStop(0.5, '#34258a');
      base.addColorStop(1, '#170d50');
      ctx.fillStyle = base;
      ctx.strokeStyle = '#ffc84e';
      ctx.lineWidth = 10;
      ctx.shadowColor = '#54e8ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, 84, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.rotate(this.spinButtonAngle + time * (spinning ? 0.0018 : 0.00045));
      ctx.setLineDash([18, 10]);
      ctx.lineDashOffset = -time * 0.02;
      ctx.strokeStyle = '#7ff2ff';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#73efff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, TAU);
      ctx.stroke();
      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#9ef6ff';
      ctx.font = '900 20px Arial Black, Arial';
      ctx.fillText('AUTO', 0, -35);
      ctx.fillStyle = '#fff2a3';
      ctx.font = '900 54px Arial Black, Arial';
      ctx.strokeStyle = '#20084f';
      ctx.lineWidth = 7;
      ctx.strokeText(String(remaining), 0, 5);
      ctx.fillText(String(remaining), 0, 5);
      ctx.fillStyle = '#d9fbff';
      ctx.font = '800 13px Arial, sans-serif';
      ctx.fillText(remaining === 1 ? 'RODADA' : 'RODADAS', 0, 45);
      ctx.restore();
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
      this.autoLimits.loss = this.autoStopAmount;
      this.closeOverlay();
      this.message = `${count} RODADAS AUTOMÁTICAS`;
      this.enqueuePanel(this.message, 'center', 3000);
      if (this.state === 'IDLE') this.spin();
    }

    adjustAutoStopAmount(direction) {
      this.autoStopAmount = clamp(
        this.autoStopAmount + direction * AUTO_STOP_STEP,
        AUTO_STOP_MIN,
        AUTO_STOP_MAX,
      );
      this.autoLimits.loss = this.autoStopAmount;
    }

    getAutoOverlayLayout() {
      const panel = { x: 10, y: 386, w: 760, h: 570 };
      const scale = panel.w / 1448;
      const mapX = (sourceX) => panel.x + sourceX * scale;
      const mapY = (sourceY) => panel.y + sourceY * scale;
      return {
        panel,
        scale,
        mapX,
        mapY,
        sliderStart: mapX(395),
        sliderEnd: mapX(1058),
        sliderY: mapY(778),
      };
    }

    isAutoSliderPoint(point, layout = this.getAutoOverlayLayout()) {
      return point.x >= layout.sliderStart - 22 && point.x <= layout.sliderEnd + 22
        && point.y >= layout.sliderY - 38 && point.y <= layout.sliderY + 38;
    }

    setAutoStopFromX(x, layout = this.getAutoOverlayLayout()) {
      const progress = clamp((x - layout.sliderStart) / (layout.sliderEnd - layout.sliderStart), 0, 1);
      const raw = AUTO_STOP_MIN + progress * (AUTO_STOP_MAX - AUTO_STOP_MIN);
      this.autoStopAmount = clamp(
        Math.round(raw / AUTO_STOP_STEP) * AUTO_STOP_STEP,
        AUTO_STOP_MIN,
        AUTO_STOP_MAX,
      );
      this.autoLimits.loss = this.autoStopAmount;
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
      if (this.overlay === 'auto') {
        this.drawAutoOverlay();
        ctx.restore();
        return;
      }
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
      ctx.fillText('APOSTA TOTAL · 10 LINHAS ATIVAS', 390, 1015);
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
      const time = this.renderTime;
      const layout = this.getAutoOverlayLayout();
      const { panel, mapX, mapY, sliderStart, sliderEnd, sliderY } = layout;
      ctx.fillStyle = '#050315d1';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.shadowColor = '#18022f';
      ctx.shadowBlur = 34;
      if (ASSETS.autoPanel) ctx.drawImage(ASSETS.autoPanel, panel.x, panel.y, panel.w, panel.h);
      else this.roundRect(panel.x, panel.y, panel.w, panel.h, 26, '#12113a', '#ffbe43', 6);
      ctx.restore();

      // A arte-base trazia um X no cabeçalho. Ele é neutralizado porque o
      // único controle de fechar agora fica na base do painel.
      const oldCloseX = mapX(1177);
      const oldCloseY = mapY(221);
      ctx.save();
      const patch = ctx.createRadialGradient(oldCloseX, oldCloseY, 4, oldCloseX, oldCloseY, 51);
      patch.addColorStop(0, '#151142');
      patch.addColorStop(1, '#09082b');
      ctx.fillStyle = patch;
      ctx.beginPath();
      ctx.arc(oldCloseX, oldCloseY, 45, 0, TAU);
      ctx.fill();
      ctx.restore();

      const counts = [10, 30, 50, 80, 100];
      const countCenters = [345, 537, 728, 924, 1115].map(mapX);
      const countY = mapY(454);
      counts.forEach((count, index) => {
        const id = `auto-${count}`;
        const pressedNow = this.buttonPress && this.buttonPress.id === id && time < this.buttonPress.until;
        if (pressedNow) {
          const pressed = this.pressScale(id, time);
          ctx.save();
          ctx.translate(countCenters[index], countY);
          ctx.scale(pressed, pressed);
          ctx.shadowColor = '#ffcc3d';
          ctx.shadowBlur = 14;
          this.drawImageContain(ASSETS.autoSelection, 0, 0, 104, 63);
          ctx.fillStyle = '#ffe56a';
          ctx.strokeStyle = '#6b2609';
          ctx.lineWidth = 4;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 27px Georgia, serif';
          ctx.strokeText(String(count), 0, 2);
          ctx.fillText(String(count), 0, 2);
          ctx.restore();
        }
        this.hit(countCenters[index] - 54, countY - 36, 108, 72, () => this.startAuto(count), id);
      });

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffe05d';
      ctx.strokeStyle = '#54210b';
      ctx.lineWidth = 6;
      ctx.font = '900 38px Georgia, serif';
      const formattedStop = `R$ ${this.autoStopAmount.toLocaleString('pt-BR')},00`;
      ctx.strokeText(formattedStop, 390, mapY(682));
      ctx.fillText(formattedStop, 390, mapY(682));
      ctx.restore();

      const sliderProgress = (this.autoStopAmount - AUTO_STOP_MIN) / (AUTO_STOP_MAX - AUTO_STOP_MIN);
      const knobX = lerp(sliderStart, sliderEnd, sliderProgress);
      const sliderGradient = ctx.createLinearGradient(sliderStart, sliderY, sliderEnd, sliderY);
      sliderGradient.addColorStop(0, '#ff9d16');
      sliderGradient.addColorStop(1, '#ffe868');
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = sliderGradient;
      ctx.lineWidth = 12;
      ctx.shadowColor = '#ffbe24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(sliderStart, sliderY);
      ctx.lineTo(knobX, sliderY);
      ctx.stroke();
      ctx.shadowBlur = 10;
      this.drawImageContain(ASSETS.autoSliderKnob, knobX, sliderY, 42, 42);
      ctx.restore();

      const actionButtons = [
        { id: 'auto-minus', x: mapX(321), image: ASSETS.autoMinus, action: () => this.adjustAutoStopAmount(-1) },
        { id: 'auto-plus', x: mapX(1137), image: ASSETS.autoPlus, action: () => this.adjustAutoStopAmount(1) },
      ];
      actionButtons.forEach((button) => {
        const pressed = this.pressScale(button.id, time);
        ctx.save();
        ctx.translate(button.x, sliderY);
        ctx.scale(pressed, pressed);
        this.drawImageContain(button.image, 0, 0, 72, 68);
        ctx.restore();
        this.hit(button.x - 42, sliderY - 40, 84, 80, button.action, button.id);
      });

      const closeX = 390;
      const closeY = mapY(966);
      const closeW = 238;
      const closeH = 65;
      const closePressed = this.pressScale('auto-close', time);
      ctx.save();
      ctx.translate(closeX, closeY);
      ctx.scale(closePressed, closePressed);
      ctx.shadowColor = '#ffbe43';
      ctx.shadowBlur = 12;
      this.drawImageContain(ASSETS.autoClose, 0, 0, closeW, closeH);
      ctx.restore();
      this.hit(closeX - closeW / 2 - 10, closeY - closeH / 2 - 10, closeW + 20, closeH + 20, () => this.closeOverlay(), 'auto-close');
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
        } else if (particle.kind === 'carrot') {
          ctx.fillStyle = '#ff8b2c';
          ctx.strokeStyle = '#ffe06b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, particle.size * 0.46, particle.size, 0.4, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#72d34e';
          ctx.fillRect(-2, -particle.size * 1.25, 4, particle.size * 0.48);
        } else if (particle.kind === 'frd') {
          ctx.fillStyle = '#7a236f';
          ctx.strokeStyle = '#ffd65a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#fff0a1';
          ctx.font = `900 ${Math.max(8, particle.size)}px Arial Black, Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('FRD', 0, 1);
        } else if (particle.kind === 'confetti') {
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size * 0.3, -particle.size, particle.size * 0.6, particle.size * 2);
        } else {
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * 0.66);
        }
        ctx.restore();
      });
    }

    roundedRectPath(x, y, w, h, radius) {
      const ctx = this.ctx;
      const r = Math.min(radius, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    roundRect(x, y, w, h, radius, fill, stroke = null, lineWidth = 0) {
      const ctx = this.ctx;
      this.roundedRectPath(x, y, w, h, radius);
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
  const loading = document.getElementById('loading');
  const loadingProgress = document.getElementById('loadingProgress');
  const loadingPercent = document.getElementById('loadingPercent');
  loadAssets((loaded, total) => {
    const progress = total ? loaded / total : 1;
    loadingProgress.style.width = `${Math.round(progress * 100)}%`;
    loadingPercent.textContent = `${Math.round(progress * 100)}%`;
  }).finally(() => {
    const game = new Game(canvas);
    game.start();
    loadingProgress.style.width = '100%';
    loadingPercent.textContent = '100%';
    loading.classList.add('done');
    window.coelhoGame = game;
  });
})();
