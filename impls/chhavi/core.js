const { isDeepStrictEqual } = require('util');
const { MalList, MalVector, MalNil, MalString, MalValue, MalIterable } =
  require('./types.js');

const ns = {
  '+': (...args) => args.reduce((a, b) => a + b),
  '*': (...args) => args.reduce((a, b) => a * b),
  '-': (...args) => args.reduce((a, b) => a - b),
  '/': (...args) => args.reduce((a, b) => a / b),
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

  'str': (...args) => new MalString((args.map(a => {
    if (a instanceof MalIterable)
      return a.toString().replaceAll('"', '').replaceAll('\\', '\\"');

    return (a instanceof MalValue) ? a.value : a;
  })).join('')),

  'pr-str': (...args) => {
    const string = args.map((arg) => arg.toString()).join(' ');
    const updated = string.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
    return new MalString(updated);
  },

  'println': (...args) => {
    const string = args.map(arg => arg.value).join(' ');
    const updated = string.replaceAll('\\n', '\n');
    console.log(updated);
    return new MalNil();
  },
}

module.exports = { ns };