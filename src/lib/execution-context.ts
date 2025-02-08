export type ExecutionContext = {
  //  The user is interfacing via a terminal.
  isInteractive: boolean;

  //  More explicity, do we believe we have a TTY?
  isTTY: boolean;
};
