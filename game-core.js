(function initCoelhoMath(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CoelhoMath = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createCoelhoMath() {
  'use strict';

  const PAYLINES = [
    [0, 0, 0], [0, 1, 0], [0, 1, 1], [1, 1, 0], [1, 1, 1],
    [1, 2, 1], [1, 2, 2], [2, 2, 1], [2, 2, 2], [2, 3, 2],
  ];

  const SYMBOLS = {
    wild: { label: 'WILD', payout: 200, color: '#ffcf3f' },
    rabbit: { label: 'COELHO', payout: 100, color: '#ffd43b' },
    bag: { label: 'FORTUNA', payout: 50, color: '#f64c5f' },
    cards: { label: 'COELHO DOURADO', payout: 10, color: '#eea72c' },
    coins: { label: 'MOEDAS', payout: 5, color: '#f5bd2e' },
    rockets: { label: 'LANTERNA', payout: 3, color: '#ef4c3e' },
    carrot: { label: 'CENOURA', payout: 2, color: '#ff8a2d' },
  };

  const SYMBOL_POOL = ['rabbit', 'bag', 'cards', 'coins', 'rockets', 'carrot'];
  const MIXED_LINE_GROUPS = [
    [0, 5, 9], [1, 6, 7], [2, 3, 8], [4, 6, 9],
    [0, 3, 6, 9], [1, 4, 7, 8], [0, 4, 7, 9], [1, 3, 6, 8],
  ];
  const PRIZE_RATE = 0.035;
  const WILD_RATE = 0.012;
  const FEATURE_TRIGGER_RATE = 0.00024;
  const FEATURE_WIN_RATE = 0.46;
  const PRIZE_VALUES = [0.5, 1, 2, 3, 5, 10, 15, 20, 25, 50, 100, 250, 500];
  const PRIZE_WEIGHTS = [28, 22, 16, 10, 8, 6, 3, 2, 2, 1.4, 0.8, 0.35, 0.1];

  function randomPrize(random = Math.random) {
    let roll = random() * PRIZE_WEIGHTS.reduce((sum, value) => sum + value, 0);
    for (let index = 0; index < PRIZE_VALUES.length; index += 1) {
      roll -= PRIZE_WEIGHTS[index];
      if (roll <= 0) return PRIZE_VALUES[index];
    }
    return 0.5;
  }

  function randomSymbol(feature = false, random = Math.random) {
    if (feature) return random() < 0.5 ? 'prize' : 'empty';
    const roll = random();
    if (roll < PRIZE_RATE) return 'prize';
    if (roll < PRIZE_RATE + WILD_RATE) return 'wild';
    return SYMBOL_POOL[Math.floor(random() * SYMBOL_POOL.length)];
  }

  function makeGrid(feature = false, random = Math.random) {
    if (feature) return makeFeatureGrid(random);
    return [3, 4, 3].map((rows) => Array.from({ length: rows }, () => {
      const type = randomSymbol(feature, random);
      return { type, prize: type === 'prize' ? randomPrize(random) : 0 };
    }));
  }

  function randomFeaturePrizeCount(random = Math.random) {
    if (random() < FEATURE_WIN_RATE) return 5 + Math.floor(random() * 6);
    return 1 + Math.floor(random() * 4);
  }

  function makeFeatureGrid(random = Math.random, requestedPrizeCount = randomFeaturePrizeCount(random)) {
    const prizeCount = Math.max(1, Math.min(10, Math.floor(requestedPrizeCount)));
    const grid = [3, 4, 3].map((rows) => Array.from({ length: rows }, () => ({ type: 'empty', prize: 0 })));
    const cells = [];
    grid.forEach((column, c) => column.forEach((_, r) => cells.push({ c, r })));
    shuffled(cells, random).slice(0, prizeCount).forEach(({ c, r }) => {
      grid[c][r] = { type: 'prize', prize: randomPrize(random) };
    });
    return grid;
  }

  function makeFeaturePlan(spins = 8, random = Math.random) {
    const count = Math.max(1, Math.floor(spins));
    const plan = Array.from({ length: count }, () => randomFeaturePrizeCount(random));
    // Bônus nunca paga em todas as rodadas: pelo menos uma deve ter somente 1–4 prêmios.
    if (plan.every((prizeCount) => prizeCount >= 5)) {
      plan[Math.floor(random() * plan.length)] = 1 + Math.floor(random() * 4);
    }
    return plan;
  }

  function shuffled(values, random = Math.random) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function makeMixedWinGrid(random = Math.random) {
    const grid = makeGrid(false, random);
    const group = MIXED_LINE_GROUPS[Math.floor(random() * MIXED_LINE_GROUPS.length)];
    const types = shuffled(SYMBOL_POOL, random).slice(0, group.length);
    const assignments = new Map();

    group.forEach((lineIndex, targetIndex) => {
      PAYLINES[lineIndex].forEach((row, column) => {
        const key = `${column}-${row}`;
        if (!assignments.has(key)) assignments.set(key, new Set());
        assignments.get(key).add(types[targetIndex]);
      });
    });

    assignments.forEach((assignedTypes, key) => {
      const [column, row] = key.split('-').map(Number);
      grid[column][row] = {
        type: assignedTypes.size === 1 ? [...assignedTypes][0] : 'wild',
        prize: 0,
      };
    });

    return grid;
  }

  function evaluateGrid(grid, bet, lineStake) {
    let total = 0;
    const lines = [];
    const prizeCells = [];
    const allCells = [];

    grid.forEach((column, c) => column.forEach((symbol, r) => {
      if (symbol.type === 'prize') prizeCells.push({ c, r, value: symbol.prize || 0.5 });
    }));

    PAYLINES.forEach((line, index) => {
      const picked = line.map((row, column) => grid[column][row].type);
      if (picked.includes('prize') || picked.includes('empty')) return;
      const base = picked.find((type) => type !== 'wild') || 'wild';
      if (!picked.every((type) => type === base || type === 'wild')) return;
      const amount = SYMBOLS[base].payout * lineStake;
      total += amount;
      const cells = line.map((r, c) => ({ c, r }));
      lines.push({ index, base, amount, cells });
      cells.forEach((cell) => allCells.push(cell));
    });

    if (prizeCells.length >= 5) {
      total += prizeCells.reduce((sum, cell) => sum + cell.value * bet, 0);
      prizeCells.forEach((cell) => allCells.push(cell));
    }

    total = Math.min(total, 5000 * bet);
    const cells = [...new Map(allCells.map((cell) => [`${cell.c}-${cell.r}`, cell])).values()];
    return { total, lines, cells, prizes: prizeCells };
  }

  function applyFeatureWin(featureTotal, spinWin, bet) {
    const maximum = Math.max(0, 5000 * bet);
    const current = clampNumber(featureTotal, 0, maximum);
    const available = Math.max(0, maximum - current);
    const awarded = clampNumber(spinWin, 0, available);
    const total = current + awarded;
    return {
      awarded,
      total,
      maximum,
      reachedMaximum: maximum > 0 && total >= maximum,
    };
  }

  function clampNumber(value, minimum, maximum) {
    const numeric = Number.isFinite(value) ? value : minimum;
    return Math.max(minimum, Math.min(maximum, numeric));
  }

  function simulate(spins, options = {}) {
    const random = options.random || Math.random;
    const baseBet = options.baseBet || 0.05;
    const level = options.level || 4;
    const lineStake = baseBet * level;
    const bet = lineStake * 10;
    let wagered = 0;
    let won = 0;
    let wins = 0;
    let features = 0;
    for (let index = 0; index < spins; index += 1) {
      const grid = makeGrid(false, random);
      const result = evaluateGrid(grid, bet, lineStake);
      wagered += bet;
      won += result.total;
      if (result.total > 0) wins += 1;
      if (random() < FEATURE_TRIGGER_RATE) {
        features += 1;
        let featureTotal = 0;
        const featurePlan = makeFeaturePlan(8, random);
        for (let featureSpin = 0; featureSpin < 8; featureSpin += 1) {
          const result = evaluateGrid(makeFeatureGrid(random, featurePlan[featureSpin]), bet, lineStake);
          const accounting = applyFeatureWin(featureTotal, result.total, bet);
          won += accounting.awarded;
          featureTotal = accounting.total;
          if (accounting.reachedMaximum) break;
        }
      }
    }
    return { spins, wagered, won, wins, features, observedReturn: wagered ? won / wagered : 0 };
  }

  return {
    PAYLINES,
    SYMBOLS,
    SYMBOL_POOL,
    MIXED_LINE_GROUPS,
    PRIZE_RATE,
    WILD_RATE,
    FEATURE_TRIGGER_RATE,
    FEATURE_WIN_RATE,
    PRIZE_VALUES,
    randomPrize,
    randomSymbol,
    makeGrid,
    randomFeaturePrizeCount,
    makeFeatureGrid,
    makeFeaturePlan,
    makeMixedWinGrid,
    evaluateGrid,
    applyFeatureWin,
    simulate,
  };
}));
