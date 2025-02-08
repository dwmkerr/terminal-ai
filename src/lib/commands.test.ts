import { Instance } from "@aws-sdk/client-ec2";
import { buildCommand } from "./commands";
import { CommandConfiguration } from "./configuration";
import { TerminatingWarning } from "./errors";

describe("commands", () => {
  describe("buildCommand", () => {
    test("correctly unescapes dollar symbols", () => {
      //  A command like this should unescape the dollar so that we can refer
      //  to the environment variable in the tokenised command.
      const config: CommandConfiguration = {
        command: "echo $$SHELL",
      };

      const { command } = buildCommand(config, undefined);

      expect(command).toEqual("echo $SHELL");
    });

    test("throws for a token which is not found", () => {
      //  A command like this should unescape the dollar so that we can refer
      //  to the environment variable in the tokenised command.
      const config: CommandConfiguration = {
        command: "ssh ${ip_address}",
      };

      expect(() => buildCommand(config, undefined)).toThrow(
        new TerminatingWarning(
          "cannot find value for parameter 'ip_address' in command 'ssh ${ip_address}'",
        ),
      );
    });

    test("correctly expands parameters", () => {
      //  A command like this should unescape the dollar so that we can refer
      //  to the environment variable in the tokenised command.
      const config: CommandConfiguration = {
        command: "ssh ${ip_address}",
        parameters: {
          ip_address: "10.0.0.1",
        },
      };

      const { command } = buildCommand(config, undefined);
      expect(command).toEqual("ssh 10.0.0.1");
    });

    test("throws if an instance parameter is not found", () => {
      //  A command like this should unescape the dollar so that we can refer
      //  to the environment variable in the tokenised command.
      const instance: Instance = {
        PublicIpAddress: "10.0.0.1",
      };
      const config: CommandConfiguration = {
        command: "ssh ${instance.PublicDnsName}",
      };

      expect(() => buildCommand(config, instance)).toThrow(
        new TerminatingWarning(
          "cannot find value for instance parameter 'PublicDnsName' in command 'ssh ${instance.PublicDnsName}'",
        ),
      );
    });

    test("correctly expands instance parameters", () => {
      //  A command like this should unescape the dollar so that we can refer
      //  to the environment variable in the tokenised command.
      const instance: Instance = {
        PublicIpAddress: "10.0.0.1",
      };
      const config: CommandConfiguration = {
        command: "ssh ${instance.PublicIpAddress}",
        parameters: {
          ip_address: "10.0.0.1",
        },
      };

      const { command } = buildCommand(config, instance);
      expect(command).toEqual("ssh 10.0.0.1");
    });

    test("correctly expands supported shorthand instance", () => {
      //  A command like this should unescape the dollar so that we can refer
      //  to the environment variable in the tokenised command.
      const instance: Instance = {
        PublicDnsName: "myhost",
        PublicIpAddress: "10.0.0.1",
      };
      const config: CommandConfiguration = {
        command: "echo ${host} ${ip}",
      };

      const { command } = buildCommand(config, instance);
      expect(command).toEqual("echo myhost 10.0.0.1");
    });

    test("throws if an argument is missing", () => {
      const config: CommandConfiguration = {
        command: "ssh ${0:user}@${1:host}",
      };
      const args: string[] = [];

      expect(() => buildCommand(config, undefined, args)).toThrow(
        new TerminatingWarning("argument 1 'user' is missing"),
      );
    });

    test("correctly expands arguments", () => {
      const config: CommandConfiguration = {
        command: "ssh ${0:user}@${1:host}",
      };
      const args = ["user", "10.0.0.1"];

      const { command } = buildCommand(config, undefined, args);
      expect(command).toEqual("ssh user@10.0.0.1");
    });

    test("correctly spreads arguments", () => {
      const config: CommandConfiguration = {
        command: "ssh ${user}@${host} ${*}",
        parameters: {
          user: "dwmkerr",
        },
      };
      const instance: Instance = {
        PublicDnsName: "myhost",
      };
      const args = ["echo", "whoami"];

      const { command } = buildCommand(config, instance, args);
      expect(command).toEqual("ssh dwmkerr@myhost echo whoami");
      const { command: commandWithoutArgs } = buildCommand(
        config,
        instance,
        undefined,
      );
      expect(commandWithoutArgs).toEqual("ssh dwmkerr@myhost ");
    });

    test("correctly expands the clipboard", () => {
      const instance: Instance = {
        PublicDnsName: "myhost",
        PublicIpAddress: "10.0.0.1",
      };
      const config: CommandConfiguration = {
        command: "echo ${host} ${ip}",
        copyCommand: "echo ${host} ${ip}",
      };

      const { command, copyCommand } = buildCommand(config, instance);
      expect(command).toEqual("echo myhost 10.0.0.1");
      expect(copyCommand).toEqual("echo myhost 10.0.0.1");
    });
  });
});
