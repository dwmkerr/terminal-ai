import {
  EC2Client,
  DescribeInstancesCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import path from "path";
import mock from "mock-fs";
import { stop } from "./stop";

import describeInstancesResponse from "../fixtures/get-boxes-describe-instances.json";
import instancesStopSteambox from "../fixtures/instances-stop-steambox.json";

describe("stop", () => {
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

  test("can stop boxes", async () => {
    //  Record fixtures with:
    //  AWS_PROFILE=dwmkerr aws ec2 describe-instances --filters "Name=tag:boxes.boxid,Values=*" > ./src/fixtures/aws-ec2-describe-instances.json
    //  aws ec2 stop-instances --instance-ids i-043a3c1ce6c9ea6ad | tee ./src/fixtures/instances-stop-steambox.json
    const ec2Mock = mockClient(EC2Client)
      .on(DescribeInstancesCommand)
      .resolves(describeInstancesResponse)
      .on(StopInstancesCommand)
      .resolves(instancesStopSteambox);

    await stop({ boxId: "steambox", wait: false, archiveVolumes: false });

    expect(ec2Mock).toHaveReceivedCommand(DescribeInstancesCommand);
    expect(ec2Mock).toHaveReceivedCommandWith(StopInstancesCommand, {
      InstanceIds: ["i-043a3c1ce6c9ea6ad"],
    });
  });
});
