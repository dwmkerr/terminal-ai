import dbg from "debug";
import { ChatContext } from "../ChatContext";
import { loadStdinInput } from "../../input/file-input/load-stdin-input";
import { StdStreamLike } from "../../execution-context/execution-context";
import { delimitFileInputForChat } from "../../input/file-input/delimit-file-input";
import { printHint } from "../../theme";
import { loadFileInput } from "../../input/file-input/load-file-input";
import { cropLines } from "../../print/crop";
import { dataUriEncodeFileInput } from "../../input/file-input/data-uri-encode-file-input";
import { FileInputType } from "../../input/file-input/file-input";

const debug = dbg("ai:chat:loadAndAppendInputFiles");

export async function loadAndAppendInputFiles(
  chatContext: ChatContext,
  stdin: StdStreamLike,
  interactive: boolean,
) {
  //  Go through the file path inbox, load any files. We'll always try to load
  //  from stdin as well if it has data.
  const stdinFile = await loadStdinInput(stdin);
  const paths = chatContext.filePathsOutbox;
  const imagePaths = chatContext.imageFilePathsOutbox;
  const files = await Promise.all(
    paths.map((p) => loadFileInput(p, FileInputType.File)),
  );
  const inputFiles = [...files, stdinFile].filter((f) => f !== undefined);
  const imageFiles = await Promise.all(
    imagePaths.map((p) => loadFileInput(p, FileInputType.ImageFile)),
  );
  const totalFileCount = inputFiles.length + imageFiles.length;

  //  No files means nothing to do.
  if (totalFileCount === 0) {
    return;
  }

  //  TODO: we can continue to simplify this. We likely don't need the outbox
  //  of paths or specific files, can just use an outbox. Similarly the inbox
  //  can be path and type. Maybe update when we add audio.
  //  Construct a message for each file.
  const filesMessage = inputFiles.map(delimitFileInputForChat).join("\n");
  chatContext.messages.push({
    role: "user",
    content: filesMessage,
  });

  //  Add any images.
  imageFiles.forEach((image) => {
    chatContext.messages.push({
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: dataUriEncodeFileInput(image),
          },
        },
      ],
    });
  });

  //  If we're interactive, we can include a 'sending' message.
  if (interactive) {
    inputFiles.map((f) =>
      console.log(printHint(`(uploading: ${f.path}...)`, interactive)),
    );
    imageFiles.map((f) =>
      console.log(printHint(`(uploading image: ${f.path}...)`, interactive)),
    );
  }

  //  Clear the inbox, update the outbox, and we're done.
  chatContext.filePathsSent = chatContext.filePathsSent.concat([
    ...paths,
    ...imagePaths,
  ]);
  chatContext.filesSent = chatContext.filesSent.concat(inputFiles);
  chatContext.filePathsOutbox = [];
  chatContext.imageFilePathsSent =
    chatContext.imageFilePathsSent.concat(imagePaths);
  chatContext.imageFilesSent = chatContext.imageFilesSent.concat(inputFiles);
  chatContext.imageFilePathsOutbox = [];

  //  Debug the file output but crop the file message itself.
  debug(`attached ${paths.length + imagePaths.length} messages:`);
  debug(cropLines(filesMessage, 10));
}
