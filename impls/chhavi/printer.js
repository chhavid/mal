const { MalValue } = require('./types');

const pr_str = (malValue) => {
  if (malValue instanceof MalValue) return malValue.pr_str();
  return malValue;
};

module.exports = { pr_str };
