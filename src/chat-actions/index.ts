import { ChatAction } from "./ChatAction";
import { CopyResponseAction } from "./CopyResponseAction";
import { DumpConversationAction } from "./DumpConversationAction";
import { ExecuteResponseAction } from "./ExecuteResponseAction";
import { FullscreenInputAction } from "./FullscreenInputAction";
import { QuitAction } from "./QuitAction";
import { ReplyAction } from "./ReplyAction";
import { SaveResponseAction } from "./SaveResponseAction";

export const ChatActions: ChatAction[] = [
  DumpConversationAction,
  FullscreenInputAction,
  ReplyAction,
  CopyResponseAction,
  SaveResponseAction,
  ExecuteResponseAction,
  QuitAction,
];
