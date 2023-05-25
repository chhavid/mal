const { stdout, stdin } = process;

const READ = (args) => args;

const EVAL = (args) => args;

const PRINT = (args) => args;

const rep = (args) => {
  return PRINT(EVAL(READ(args)))
};

const main = () => {
  stdin.setEncoding('utf8');
  stdout.setEncoding('utf8');
  stdout.write('user> ');

  stdin.on('data', (chunk) => {
    stdout.write(rep(chunk));
    stdout.write('user> ');
  })
};

main();