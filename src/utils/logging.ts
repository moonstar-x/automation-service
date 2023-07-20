import chalk, { Chalk } from 'chalk';
import util from 'util';
import { config } from '@config/config';

const parseArguments = (args: unknown[]) => {
  return args.map((item) => {
    if (typeof item === 'string') {
      return item;
    }

    return util.inspect(item, { colors: false, depth: 2 });
  });
};

const prepareMessage = (chalkStyle: Chalk, label: string, level: string, args: unknown[]) => {
  return chalkStyle(`(${new Date().toUTCString()}) [${chalk.bold(`${label}/${level}`)}] -`, ...parseArguments(Array.prototype.slice.call(args)));
};

export class Logger {
  private label: string;

  constructor(label: string) {
    this.label = label;
  }

  info(...args: unknown[]): void {
    console.info(prepareMessage(chalk.cyan, this.label, 'INFO', args));
  }

  warn(...args: unknown[]): void {
    console.warn(prepareMessage(chalk.yellow, this.label, 'WARN', args));
  }

  error(...args: unknown[]): void {
    console.error(prepareMessage(chalk.red, this.label, 'ERROR', args));
  }

  debug(...args: unknown[]): void {
    if (config.debug) {
      console.debug(prepareMessage(chalk.green, this.label, 'DEBUG', args));
    }
  }
}
