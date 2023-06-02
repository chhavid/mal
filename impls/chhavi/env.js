const { MalList } = require('./types');

class Env {
  #outer;
  constructor(outer, binds = [], exprs = []) {
    this.#outer = outer;
    this.binds = binds;
    this.exprs = exprs;
    this.data = {};
  }

  set(symbol, malValue) {
    this.data[symbol.value] = malValue;
  }

  bind(args) {
    const paramsLength = this.binds.length;

    for (let i = 0; i < paramsLength; i++) {
      const value = this.binds[i].value;

      if (value === '&') {
        const symbol = this.binds[i + 1];
        const rest = args.slice(i);
        return this.set(symbol, new MalList(rest));
      }

      this.set(this.binds[i], args[i]);
    }
  }

  find(symbol) {
    if (this.data[symbol.value] !== undefined) {
      return this;
    }

    if (this.#outer) {
      return this.#outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    if (!env) throw `${symbol.value} not found`;

    return env.data[symbol.value];
  }
}

module.exports = { Env };