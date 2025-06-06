import { ChatAction } from "./ChatAction";
import { CopyResponseAction } from "./CopyResponseAction";
import { SaveConversationAction } from "./SaveConversationAction";
import { ExecuteResponseAction } from "./ExecuteResponseAction";
import { FullscreenInputAction } from "./FullscreenInputAction";
import { QuitAction } from "./QuitAction";
import { ReplyAction } from "./ReplyAction";
import { SaveResponseAction } from "./SaveResponseAction";
import { ChangeModelAction } from "./ChangeModelAction";
import { AttachFileAction } from "./AttachFileAction";

export const ChatActions: ChatAction[] = [
  ReplyAction,
  FullscreenInputAction,
  AttachFileAction,
  ChangeModelAction,
  CopyResponseAction,
  SaveResponseAction,
  ExecuteResponseAction,
  SaveConversationAction,
  QuitAction,
];
