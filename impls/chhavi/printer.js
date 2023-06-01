const { MalValue } = require('./types');

const pr_str = (malValue) => {
  if (malValue instanceof MalValue) return malValue.toString();
  return malValue;
};

module.exports = { pr_str };
