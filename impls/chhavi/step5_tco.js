const readline = require('readline');
const { read_str } = require('./reader.js');
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalVector, MalHashMap, MalFn } = require('./types.js');
const { Env } = require('./env.js');
const { ns } = require('./core.js');
const { handleDef, handleDo, handleLet, handleFn, handleIf } = require('./handlers.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const setEnv = (env) => {
  Object.keys(ns).forEach(symbol => {
    env.set(new MalSymbol(symbol), ns[symbol]);
  });
};

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
  while (true) {
    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }

    if (ast.isEmpty()) return ast;

    switch (ast.value[0].value) {
      case 'def!':
        return handleDef(ast, env, EVAL);

      case 'let*':
        [ast, env] = handleLet(ast, env, EVAL);
        break;

      case 'do':
        ast = handleDo(ast, env, EVAL);
        break;

      case 'fn*':
        ast = handleFn(ast, env);
        break;

      case 'if':
        ast = handleIf(ast, env, EVAL);
        break;

      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if (fn instanceof MalFn) {
          ast = fn.value;
          env = new Env(fn.env, fn.binds, args);
          env.bind(args);
        } else {
          return fn.apply(null, args);
        }
    }
  }
};

const PRINT = malValue => pr_str(malValue);

const env = new Env();
setEnv(env);

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
