import path from "path";
import mock from "mock-fs";
import { getConfiguration } from "./configuration";

describe("configuration", () => {
  //  Mock the config file.
  beforeEach(() => {
    const boxesPath = path.join(path.resolve(), "./boxes.json");
    mock({
      [boxesPath]: mock.load(
        path.join(path.resolve(), "./src/fixtures/boxes.json"),
      ),
    });
  });

  afterEach(() => {
    mock.restore();
  });

  test("can load configuration", async () => {
    const configuration = await getConfiguration();

    expect(configuration).toMatchObject({
      boxes: {
        steambox: {
          commands: {
            connect: {
              command: "dcv://Administrator@${host}:8443",
              copyCommand: "password",
            },
          },
        },
        torrentbox: {},
        ubox: {
          commands: {
            connect: {
              command: "open vnc://ubuntu@${host}:5901",
              copyCommand: "password",
            },
            ssh: {
              command:
                "ssh -i /Users/dwmkerr/repos/github/dwmkerr/dwmkerr/tf-aws-dwmkerr/dwmkerr_aws_key.pem ubuntu@${host}",
              copyCommand: "password",
            },
          },
        },
      },
      commands: {
        ssh: {
          command: "ssh ${host}",
          copyCommand: "ssh ${host}",
        },
      },
      aws: {
        region: "us-west-2",
      },
    });
  });
});
