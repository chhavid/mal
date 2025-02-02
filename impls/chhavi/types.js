const { isDeepStrictEqual } = require('util');

const pr_str = (malValue) => {
  if (malValue instanceof MalValue)
    return malValue.toString(true);
  return malValue;
};

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

  isEmpty() {
    return this.value.length === 0;
  }

  beginsWith(symbol) {
    return !this.isEmpty() && this.value[0].value === symbol;
  }

  nth(n) {
    if (n >= this.value.length) throw "index out of range";
    return this.value[n];
  }

  first() {
    if (this.isEmpty()) return new MalNil();
    return this.value[0];
  }

  rest() {
    return new MalList(this.value.slice(1));
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

  toString() {
    return "(" + this.value.map(x => {
      if (x instanceof MalValue) return pr_str(x);
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
      if (x instanceof MalValue) return pr_str(x);
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

  toString(printReadably) {
    if (printReadably) {
      return '"' + this.value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }
    return this.value.toString();
  }
}

class MalFn extends MalValue {
  constructor(ast, binds, env, fn = () => { }, isMacro = false) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn;
    this.isMacro = isMacro;
  }

  toString() {
    return "#<function>";
  }

  apply(_, args) {
    return this.fn.apply(null, args);
  }
}

class MalHashMap extends MalIterable {
  constructor(value) {
    super(value);
  }

  toString() {
    return '{' + this.value.map(x => {
      if (x instanceof MalValue) return pr_str(x);
      return x;
    }).join(' ') + '}';
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  toString(printReadably) {
    return ("(atom " + pr_str(this.value, printReadably) + ')')
  }

  deref() {
    return this.value;
  }

  reset(newValue) {
    this.value = newValue;
    return this.value;
  }

  swap(fn, args) {
    this.value = fn.apply(null, [this.value, ...args])
    return this.value;
  }
}

module.exports = { MalSymbol, MalValue, MalList, MalVector, MalNil, MalHashMap, MalFn, MalString, MalIterable, pr_str, MalAtom };