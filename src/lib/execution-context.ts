export type ExecutionContext = {
  //  This is a first-time run.
  firstTime: boolean;

  //  More explicity, do we believe we have a TTY?
  isTTYstdin: boolean;
  isTTYstdout: boolean;
};
