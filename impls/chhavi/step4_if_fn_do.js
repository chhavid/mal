const readline = require('readline');
const { read_str } = require('./reader.js');
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalVector, MalHashMap, MalNil, MalFn } = require('./types.js');
const { Env } = require('./env.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalList(newAst);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalVector(newAst);
  }

  if (ast instanceof MalHashMap) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalHashMap(newAst);
  }
  return ast;
};

const READ = str => read_str(str);

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case 'def!':
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);

    case 'let*':
      const newEnv = new Env(env);
      const bindings = ast.value[1].value;

      for (let i = 0; i < bindings.length; i += 2) {
        newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
      }
      return EVAL(ast.value[2], newEnv);

    case 'do':
      const operations = ast.value.slice(1);
      for (let i = 0; i < operations.length - 1; i++) {
        EVAL(operations[i], env);
      }
      return EVAL(operations.slice(-1)[0], env);

    case 'fn*':
      const func = (...args) => {
        const [, binds, exprs] = ast.value;
        const fnEnv = new Env(env, binds, exprs);
        fnEnv.bind(args);
        return EVAL(exprs, fnEnv);
      }
      return new MalFn(func);

    case 'if':
      const [cond, if_block, else_block] = ast.value.slice(1);
      const predicate = EVAL(cond, env);

      if (predicate !== false && !(predicate instanceof MalNil))
        return EVAL(if_block, env);

      if (else_block === undefined)
        return new MalNil();

      return EVAL(else_block, env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = malValue => pr_str(malValue);

const env = new Env();
env.set(new MalSymbol('+'), ((...args) => args.reduce((a, b) => a + b)));
env.set(new MalSymbol('*'), ((...args) => args.reduce((a, b) => a * b)));
env.set(new MalSymbol('-'), ((...args) => args.reduce((a, b) => a - b)));
env.set(new MalSymbol('/'), ((...args) => args.reduce((a, b) => a / b)));

env.set(new MalSymbol('list'), ((...args) => new MalList(args)));
env.set(new MalSymbol('vector'), ((...args) => new MalVector(args)));
env.set(new MalSymbol('count'), (a => {
  if (a instanceof MalNil) return 0;
  return a.value.length;
}));

env.set(new MalSymbol('not'), (a => {
  if (a instanceof MalNil || a === false) return true;
  return false;
}));

env.set(new MalSymbol('>='), ((a, b) => a >= b));
env.set(new MalSymbol('<='), ((a, b) => a <= b));
env.set(new MalSymbol('>'), ((a, b) => a > b));
env.set(new MalSymbol('<'), ((a, b) => a < b));
env.set(new MalSymbol('='), ((...args) => args.every(a => a === args[0])));
env.set(new MalSymbol('empty?'), ((...args) => !args[0].value.length
));
env.set(new MalSymbol('list?'), (args => args instanceof MalList));

env.set(new MalSymbol('prn'), (...args) => {
  console.log(...args);
  return new MalNil();
});

env.set(new MalSymbol('println'), (...args) => {
  console.log(...args, '\n');
  return new MalNil();
});

const rep = str => PRINT(EVAL(READ(str), env));

const repl = () =>
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (e) {
      console.log(e);
    }
    repl();
  });

repl();
