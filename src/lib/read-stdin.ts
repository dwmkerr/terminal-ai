import { StdStreamLike } from "../execution-context/execution-context";

export function readStdin(stdin: StdStreamLike): Promise<string | undefined> {
  //  If std is interactive tnen there's no input to stream.
  return new Promise((resolve, reject) => {
    //  If std is interactive tnen there's no input to stream.
    if (stdin.isTTY) {
      return resolve(undefined);
    }

    //  Read the input data until we hit the end of the stream.
    let inputData = "";
    stdin.on("data", (chunk) => {
      inputData += chunk;
    });
    stdin.on("end", () => {
      resolve(inputData);
    });
    stdin.on("error", (e) => {
      reject(e);
    });
  });
}
