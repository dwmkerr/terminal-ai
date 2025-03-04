export type ExecutionContext = {
  //  This is a first-time run.
  firstTime: boolean;

  //  More explicity, do we believe we have a TTY?
  isTTYstdin: boolean;
  isTTYstdout: boolean;

  //  If we have piped input to stdin, it'll be here.
  stdinContent: string | undefined;
};
