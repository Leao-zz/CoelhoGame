'use strict';

const core = require('../game-core.js');

let state = 0xC0E1A0;
const random = () => {
  state = (1664525 * state + 1013904223) >>> 0;
  return state / 0x100000000;
};

const result = core.simulate(10000, { random, baseBet: 0.05, level: 4 });
console.log(JSON.stringify(result, null, 2));
