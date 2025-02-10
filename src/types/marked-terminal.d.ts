declare module "marked-terminal" {
  import { MarkedExtension } from "marked";

  export interface MarkedTerminalOptions {
    firstHeading?: number;
    showSectionPrefix?: boolean;
  }

  export function markedTerminal(
    options?: MarkedTerminalOptions,
  ): MarkedExtension;
}
