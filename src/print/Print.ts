import * as colors from "colors";

interface PrintOptions {
  interactive: boolean;
  debug: boolean;
}

export class PrintWIP {
  protected options: PrintOptions = { interactive: true, debug: false };

  constructor({ interactive, debug }: PrintOptions) {
    this.options.interactive = interactive;
    this.options.debug = debug;
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  error(message: string, ...params: any[]) {
    if (this.options.debug) {
      console.error(this.format(message), ...params);
    }
  }

  format(message: string) {
    return this.options.interactive ? colors.red(message) : message;
  }
}

// const print = new Print({interactive: true, debug: false});
// print.error('My error message', 'param1', 2, {test: 'param3'});
