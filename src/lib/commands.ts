import { Instance } from "@aws-sdk/client-ec2";
import { CommandConfiguration } from "./configuration";
import { TerminatingWarning } from "./errors";

function expandCommand(
  command: string,
  tokens: Record<string, string>,
  instance?: Instance,
  args?: string[],
) {
  //  Iterate through each token and replace it. Ignore double escaped dollars
  //  as they will be replaced into single dollars to allow users to use
  //  parameter expansion in commands.
  let expandedCommand = command;
  const tokenRex = /[^$]\${(.*?)}/g;
  const matches = command.matchAll(tokenRex);
  for (const match of matches) {
    const token = match[1];
    const tokenText = "${" + token + "}";

    //  If our token is a spread argument, spread it.
    if (token === "*") {
      expandedCommand = expandedCommand.replace(
        tokenText,
        args?.join(" ") || "",
      );
      continue;
    }

    //  If our token is an argument, try and expand it.
    if (token.indexOf(":") !== -1) {
      const [argPosition, argName] = token.split(":");
      const argNumber = Number.parseInt(argPosition);
      const argValue = args?.[argNumber];
      if (!argValue) {
        throw new TerminatingWarning(
          `argument ${argNumber + 1} '${argName}' is missing`,
        );
      }
      expandedCommand = expandedCommand.replace(tokenText, `${argValue}`);
      continue;
    }

    //  If our token is an instance token, try to read the instance value.
    if (/instance\./.test(token)) {
      const instanceToken = token.replace(/instance\./, "");
      const instanceTokenValue = instance?.[instanceToken as keyof Instance];
      if (!instanceTokenValue) {
        throw new TerminatingWarning(
          `cannot find value for instance parameter '${instanceToken}' in command '${command}'`,
        );
      }
      expandedCommand = expandedCommand.replace(
        tokenText,
        `${instanceTokenValue}`,
      );
      continue;
    }

    //  Get our token value. If it is undefined, throw.
    const tokenValue = tokens[token];
    if (tokenValue === undefined) {
      throw new TerminatingWarning(
        `cannot find value for parameter '${token}' in command '${command}'`,
      );
    }

    //  Replace the token.
    expandedCommand = expandedCommand.replace(tokenText, tokenValue);
  }

  //  Replace any escaped dollar symbols.
  expandedCommand = expandedCommand.replace(/\$\$/, "$");

  return expandedCommand;
}

export function buildCommand(
  config: CommandConfiguration,
  instance?: Instance,
  args?: string[],
) {
  const tokens: Record<string, string> = {
    //  We have our provided parameters...
    ...config.parameters,
    //  ...as well as shorthand instance parameters...
    host: instance?.PublicDnsName || "",
    ip: instance?.PublicIpAddress || "",
  };

  return {
    command: expandCommand(config.command, tokens, instance, args),
    copyCommand: config.copyCommand
      ? expandCommand(config.copyCommand, tokens, instance, args)
      : undefined,
  };
}
