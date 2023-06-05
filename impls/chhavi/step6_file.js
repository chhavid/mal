const readline = require('readline');
const { read_str, CommentException } = require('./reader.js');
const { pr_str } = require('./printer.js');
const { MalSymbol, MalList, MalVector, MalHashMap, MalFn, MalString } = require('./types.js');
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
  env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env))
  env.set(new MalSymbol('*ARGV*'), new MalList([]));
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
        ast = handleFn(ast, env, EVAL);
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

env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));

const rep = str => {
  return PRINT(EVAL(READ(str), env))
};

const repl = () =>
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (e) {
      if (!(e instanceof CommentException)) console.log(e);
    }
    repl();
  });

rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');

if (process.argv.length >= 3) {
  const args = Array.from(process.argv).slice(3);
  const malArgs = new MalList(args.map((x) => new MalString(x)));

  env.set(new MalSymbol('*ARGV*'), malArgs);

  const code = '(load-file "' + process.argv[2] + '")';
  rep(code);
  rl.close();
} else {
  repl();
}
