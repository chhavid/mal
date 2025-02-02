const { Env } = require('./env');
const { MalNil, MalSymbol, MalList, MalFn, MalHashMap, MalIterable } = require('./types');

const handleDef = (ast, env, EVAL) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const handleDefMacro = (ast, env, EVAL) => {
  const macro = EVAL(ast.value[2], env);
  macro.isMacro = true;
  env.set(ast.value[1], macro);
  return env.get(ast.value[1]);
};

const isMacroCall = (ast, env) => {
  try {
    return ast instanceof MalList &&
      !ast.isEmpty() &&
      ast.value[0] instanceof MalSymbol &&
      env.get(ast.value[0]).isMacro;
  } catch (error) {
    return false;
  }
};

const macroExpand = (ast, env) => {
  while (isMacroCall(ast, env)) {
    const macro = env.get(ast.value[0]);
    ast = macro.apply(null, ast.value.slice(1));
  }

  return ast;
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
    return EVAL(doForms, fnEnv);
  }
  return new MalFn(doForms, binds.value, env, func);
};

const isUnquote = (ast) => ast instanceof MalList && ast.beginsWith('unquote');

const getResult = (elt, result) => {
  if (elt instanceof MalList && elt.beginsWith("splice-unquote")) {
    return new MalList([new MalSymbol("concat"), elt.value[1], result]);
  }
  return new MalList([new MalSymbol("cons"), handleQuasiquote(elt), result]);
};

const handleQuasiquote = (ast) => {
  if (isUnquote(ast)) return ast.value[1];

  if (ast instanceof MalSymbol || ast instanceof MalHashMap)
    return new MalList([new MalSymbol("quote"), ast]);

  if (ast instanceof MalIterable) {
    let result = new MalList([]);

    for (let i = ast.value.length - 1; i >= 0; i--) {
      result = getResult(ast.value[i], result);
    }
    if (ast instanceof MalList) return result;

    return new MalList([new MalSymbol("vec"), result]);
  }
  return ast;
};

module.exports = { handleFn, handleDo, handleDef, handleIf, handleLet, handleQuasiquote, handleDefMacro, macroExpand }
