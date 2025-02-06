import path from "path";
import {
  EC2Client,
  DescribeInstancesCommand,
  CreateTagsCommand,
} from "@aws-sdk/client-ec2";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import mock from "mock-fs";

import { importBox } from "./import";
import describeInstancesResponse from "../fixtures/import-describe-instances.json";
import { tagNames } from "../lib/constants";
import { TerminatingWarning } from "../lib/errors";

describe("import", () => {
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

  test("can import box", async () => {
    //  Our test values.
    const instanceId = "i-066771b1f0f0668af";
    const volumeId = "vol-090dc4a9e9f30804c";

    //  Record fixtures with:
    //  AWS_PROFILE=dwmkerr aws ec1 describe-instances | tee ./src/fixtures/import-describe-instances.json
    const ec2Mock = mockClient(EC2Client)
      .on(DescribeInstancesCommand)
      .resolves(describeInstancesResponse);

    //  First let's try and import a box that doesn't exist, then assert the
    //  warning.
    try {
      await importBox({
        instanceId: "i-ffff71b1f0f0668af",
        boxId: "ubuntubox",
        overwrite: false,
      });
      fail("expected 'import' to fail with 'instance id not found'");
    } catch (err) {
      expect(err).toBeInstanceOf(TerminatingWarning);
      const error = err as TerminatingWarning;
      expect(error.message).toMatch(/not found/);
    }

    //  Try and import the unimported 'ubuntubox'.
    await importBox({
      instanceId,
      boxId: "ubuntubox",
      overwrite: false,
    });

    expect(ec2Mock).toHaveReceivedCommand(DescribeInstancesCommand);
    expect(ec2Mock).toHaveReceivedCommandWith(CreateTagsCommand, {
      Resources: [instanceId, volumeId],
      Tags: [
        {
          Key: tagNames.boxId,
          Value: "ubuntubox",
        },
      ],
    });
  });

  // test("can update tags on existing box", async () => {
  //   //  Record fixtures with:
  //   //  AWS_PROFILE=dwmkerr aws ec2 describe-instances --filters "Name=tag:boxes.boxid,Values=*" > ./src/fixtures/aws-ec2-describe-instances.json
  //   //  aws ec2 start-instances --instance-ids i-043a3c1ce6c9ea6ad | tee ./src/fixtures/instances-start-steambox.json
  //   const ec2Mock = mockClient(EC2Client)
  //     .on(DescribeInstancesCommand)
  //     .resolves(describeInstancesResponse)
  //     .on(CreateTagsCommand)
  //     .resolves(instancesStartSteambox);

  //   await import({
  //     instanceId: "steambox",
  //     overwrite: true,
  //   });

  //   expect(ec2Mock).toHaveReceivedCommand(DescribeInstancesCommand);
  //   expect(ec2Mock).toHaveReceivedCommandWith(CreateTagsCommand, {
  //     Resources: [instanceId, volumeId],
  //     Tags: [
  //       {
  //         Key: tagNames.boxId,
  //         Value: "ubuntubox",
  //       },
  //     ],
  //   });
  // });

  test("throws when the instance id cannot be found", async () => {
    //  Record fixtures with:
    //  AWS_PROFILE=dwmkerr aws ec1 describe-instances | tee ./src/fixtures/import-describe-instances.json
    const ec2Mock = mockClient(EC2Client)
      .on(DescribeInstancesCommand)
      .resolves(describeInstancesResponse);

    //  Let's try and import a box that doesn't exist, then assert the warning.
    try {
      await importBox({
        instanceId: "i-ffff71b1f0f0668af",
        boxId: "ubuntubox",
        overwrite: false,
      });
      fail("expected 'import' to fail with 'not found'");
    } catch (err) {
      expect(err).toBeInstanceOf(TerminatingWarning);
      const error = err as TerminatingWarning;
      expect(error.message).toMatch(/not found/);
    }

    expect(ec2Mock).toHaveReceivedCommand(DescribeInstancesCommand);
  });

  test("throws when the instance id is already tagged and 'overwrite' is not specified", async () => {
    //  Record fixtures with:
    //  AWS_PROFILE=dwmkerr aws ec1 describe-instances | tee ./src/fixtures/import-describe-instances.json
    const ec2Mock = mockClient(EC2Client)
      .on(DescribeInstancesCommand)
      .resolves(describeInstancesResponse);

    //  Let's try and import a box that already exists, without overwrite, then
    //  assert the warning.
    try {
      await importBox({
        instanceId: "i-043a3c1ce6c9ea6ad", // steambox
        boxId: "ubuntubox",
        overwrite: false,
      });
      fail("expected 'import' to fail with 'already tagged'");
    } catch (err) {
      expect(err).toBeInstanceOf(TerminatingWarning);
      const error = err as TerminatingWarning;
      expect(error.message).toMatch(/already tagged/);
    }

    expect(ec2Mock).toHaveReceivedCommand(DescribeInstancesCommand);
  });
});
