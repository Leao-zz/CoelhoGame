'use strict';

const assert = require('node:assert/strict');
const core = require('../game-core.js');

function seeded(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function uniform(type, prize = 0) {
  return [3, 4, 3].map((rows) => Array.from({ length: rows }, () => ({ type, prize })));
}

function approximately(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} deve ser aproximadamente ${expected}`);
}

const baseBet = 0.05;
const level = 4;
const lineStake = baseBet * level;
const bet = lineStake * 10;

assert.equal(core.PAYLINES.length, 10, 'deve possuir 10 linhas fixas');
core.PAYLINES.forEach((line) => {
  assert.equal(line.length, 3);
  assert.ok(line[0] >= 0 && line[0] <= 2);
  assert.ok(line[1] >= 0 && line[1] <= 3);
  assert.ok(line[2] >= 0 && line[2] <= 2);
});

const normalGrid = core.makeGrid(false, seeded(10));
assert.deepEqual(normalGrid.map((column) => column.length), [3, 4, 3]);

const featureGrid = core.makeGrid(true, seeded(20));
assert.ok(featureGrid.flat().every((symbol) => symbol.type === 'prize'));

const mixedGrid = core.makeMixedWinGrid(seeded(33));
const mixedResult = core.evaluateGrid(mixedGrid, bet, lineStake);
assert.ok(mixedResult.lines.length >= 3, 'deve criar várias linhas vencedoras no mesmo giro');
assert.ok(new Set(mixedResult.lines.map((line) => line.base)).size >= 2, 'deve misturar símbolos entre as linhas vencedoras');

const carrot = core.evaluateGrid(uniform('carrot'), bet, lineStake);
assert.equal(carrot.lines.length, 10);
approximately(carrot.total, 10 * core.SYMBOLS.carrot.payout * lineStake);

const wildSubstitution = uniform('carrot');
wildSubstitution[0].forEach((symbol) => { symbol.type = 'wild'; });
const substituted = core.evaluateGrid(wildSubstitution, bet, lineStake);
assert.equal(substituted.lines.length, 10);
approximately(substituted.total, carrot.total);

const allWild = core.evaluateGrid(uniform('wild'), bet, lineStake);
assert.equal(allWild.lines.length, 10);
approximately(allWild.total, 10 * core.SYMBOLS.wild.payout * lineStake);

const prizeGrid = [
  Array.from({ length: 3 }, () => ({ type: 'carrot', prize: 0 })),
  Array.from({ length: 4 }, () => ({ type: 'coins', prize: 0 })),
  Array.from({ length: 3 }, () => ({ type: 'rockets', prize: 0 })),
];
const prizeValues = [0.5, 1, 2, 3, 5];
prizeValues.forEach((value, index) => {
  const c = index < 3 ? 0 : 1;
  const r = index < 3 ? index : index - 3;
  prizeGrid[c][r] = { type: 'prize', prize: value };
});
const prizes = core.evaluateGrid(prizeGrid, bet, lineStake);
assert.equal(prizes.prizes.length, 5);
approximately(prizes.total, prizeValues.reduce((sum, value) => sum + value, 0) * bet);

const maximum = core.evaluateGrid(uniform('prize', 500), bet, lineStake);
approximately(maximum.total, 5000 * bet);

const firstFeatureWin = core.applyFeatureWin(0, 120, bet);
approximately(firstFeatureWin.awarded, 120);
approximately(firstFeatureWin.total, 120);
approximately(firstFeatureWin.maximum, 5000 * bet);
assert.equal(firstFeatureWin.reachedMaximum, false);

const cappedFeatureWin = core.applyFeatureWin((5000 * bet) - 10, 200, bet);
approximately(cappedFeatureWin.awarded, 10);
approximately(cappedFeatureWin.total, 5000 * bet);
assert.equal(cappedFeatureWin.reachedMaximum, true);

const exhaustedFeatureWin = core.applyFeatureWin(5000 * bet, 50, bet);
approximately(exhaustedFeatureWin.awarded, 0);
approximately(exhaustedFeatureWin.total, 5000 * bet);
assert.equal(exhaustedFeatureWin.reachedMaximum, true);

const simulation = core.simulate(1000, { random: seeded(777), baseBet, level });
assert.equal(simulation.spins, 1000);
approximately(simulation.wagered, 1000 * bet, 1e-7);
assert.ok(Number.isFinite(simulation.won));
assert.ok(Number.isFinite(simulation.observedReturn));
assert.ok(simulation.wins >= 0 && simulation.wins <= 1000);

console.log('game-core: 14 testes concluídos');
