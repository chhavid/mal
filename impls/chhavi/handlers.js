const { Env } = require('./env');
const { MalNil, MalSymbol, MalList, MalFn } = require('./types');

const handleDef = (ast, env, EVAL) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const handleIf = (ast, env, EVAL) => {
  const [cond, if_block, else_block] = ast.value.slice(1);
  const predicate = EVAL(cond, env);

  if (predicate !== false && !(predicate instanceof MalNil))
    return if_block;

  if (else_block === undefined)
    return new MalNil();

  return else_block;
};

const handleLet = (ast, env, EVAL) => {
  const letEnv = new Env(env);
  const [bindings, ...forms] = ast.value.slice(1);

  for (let i = 0; i < bindings.value.length; i += 2) {
    letEnv.set(bindings.value[i], EVAL(bindings.value[i + 1], letEnv));
  }

  const doForms = new MalList([new MalSymbol('do'), ...forms]);
  return [doForms, letEnv];
};

const handleDo = (ast, env, EVAL) => {
  const expressions = ast.value.slice(1);
  expressions.slice(0, -1).forEach(expression => {
    EVAL(expression, env);
  })
  return expressions.slice(-1)[0];
};

const handleFn = (ast, env, EVAL) => {
  const [, binds, ...exprs] = ast.value;
  const doForms = new MalList([new MalSymbol('do'), ...exprs]);

  const func = (...args) => {
    const fnEnv = new Env(env, binds.value, exprs);
    fnEnv.bind(args);
    return EVAL(ast.value[2], fnEnv);
  }
  return new MalFn(doForms, binds.value, env, func);
};

module.exports = { handleFn, handleDo, handleDef, handleIf, handleLet }
