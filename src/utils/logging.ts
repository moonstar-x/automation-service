import chalk, { Chalk } from 'chalk';
import util from 'util';

const parseArguments = (args: unknown[]) => {
  return args.map((item) => {
    if (typeof item === 'string') {
      return item;
    }

    return util.inspect(item, { colors: false, depth: null });
  });
};

const prepareMessage = (chalkStyle: Chalk, prefix: string, args: unknown[]) => {
  return chalkStyle(`(${new Date().toLocaleTimeString()}) - ${chalk.bold(prefix)} - `, ...parseArguments(Array.prototype.slice.call(args)));
};

export class Logger {
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  info(...args: unknown[]): void {
    console.info(prepareMessage(chalk.cyan, this.label, args));
  }

  warn(...args: unknown[]): void {
    console.info(prepareMessage(chalk.yellow, this.label, args));
  }

  error(...args: unknown[]): void {
    console.info(prepareMessage(chalk.red, this.label, args));
  }
}
