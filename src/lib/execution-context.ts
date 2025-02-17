export type ExecutionContext = {
  //  This is a first-time run.
  firstTime: boolean;

  //  The user is interfacing via a terminal. This is inferred from stdin
  //  being a tty.
  isInteractiveXX: boolean;

  //  More explicity, do we believe we have a TTY?
  isTTYstdin: boolean;
  isTTYstdout: boolean;
};
