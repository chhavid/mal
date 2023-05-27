class MalValue {
  constructor(value) {
    this.value = value;
  }

  pr_str() {
    return this.value.toString();
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  isEmpty() {
    return this.value.length === 0;
  }

  pr_str() {
    return "(" + this.value.map(x => x.pr_str()).join(' ') + ")";
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  pr_str() {
    return '[' + this.value.map(x => {
      if (x instanceof MalValue) return x.pr_str();
      return x;
    }).join(' ') + ']';
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  pr_str() {
    return "nil";
  }
}

module.exports = { MalSymbol, MalValue, MalList, MalVector, MalNil };