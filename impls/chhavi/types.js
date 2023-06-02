const { isDeepStrictEqual } = require('util');

class MalValue {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value.toString();
  }

  equals(other) {
    return other instanceof MalValue && isDeepStrictEqual(other.value, this.value);
  }
}

class MalIterable extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalIterable {
  constructor(value) {
    super(value);
  }

  isEmpty() {
    return this.value.length === 0;
  }

  toString() {
    return "(" + this.value.map(x => {
      if (x instanceof MalValue) return x.toString();
      return x;
    }).join(' ') + ")";
  }
}

class MalVector extends MalIterable {
  constructor(value) {
    super(value);
  }

  toString() {
    return '[' + this.value.map(x => {
      if (x instanceof MalValue) return x.toString();
      return x;
    }).join(' ') + ']';
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  toString() {
    return "nil";
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  toString() {
    return '"' + this.value + '"';
  }
}

class MalFn extends MalValue {
  constructor(ast, binds, env) {
    super(ast);
    this.binds = binds;
    this.env = env;
  }

  toString() {
    return "#<function>";
  }

  apply(_, args) {
    return this.value(...args);
  }
}

class MalHashMap extends MalIterable {
  constructor(value) {
    super(value);
  }

  toString() {
    return '{' + this.value.map(x => {
      if (x instanceof MalValue) return x.toString();
      return x;
    }).join(' ') + '}';
  }
}

module.exports = { MalSymbol, MalValue, MalList, MalVector, MalNil, MalHashMap, MalFn, MalString, MalIterable };