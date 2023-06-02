const { isDeepStrictEqual } = require('util');
const { MalList, MalVector, MalNil, MalString, MalValue } =
  require('./types.js');

const ns = {
  '+': (...args) => args.reduce((a, b) => a + b),
  '*': (...args) => args.reduce((a, b) => a * b),
  '-': (...args) => args.reduce((a, b) => a - b),
  '/': (...args) => args.reduce((a, b) => a / b),
  'str': (...args) => new MalString((args.map(a => a.value)).join('')),
  'list': ((...args) => new MalList(args)),
  'vector': ((...args) => new MalVector(args)),
  'count': (a => (a instanceof MalNil) ? 0 : a.value.length),
  'not': (a => (a instanceof MalNil || a === false) ? true : false),
  '>=': ((a, b) => a >= b),
  '<=': ((a, b) => a <= b),
  '>': ((a, b) => a > b),
  '<': ((a, b) => a < b),
  '=': ((...args) => args.every(a => isDeepStrictEqual(a, args[0]))),
  'empty?': ((...args) => !args[0].value.length),
  'list?': (args => args instanceof MalList),
  'prn': (...args) => {
    console.log(...args.map(a => a instanceof MalValue ? a.toString() : a));
    return new MalNil();
  },
  'pr-str': (...args) => {
    const string = args.map((arg) => arg.toString()).join(' ');
    const updated = string.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
    return new MalString(updated);
  },
  'println': (...args) => {
    console.log(...args.map(a => a instanceof MalValue ? a.value : a));
    return new MalNil();
  },
}

module.exports = { ns };