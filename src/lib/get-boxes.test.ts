import path from "path";
import mock from "mock-fs";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { getBoxes } from "./get-boxes";

import describeInstancesResponse from "../fixtures/get-boxes-describe-instances.json";
import describeInstancesWithArchivedVolumesResponse from "../fixtures/get-boxes-describe-instances-with-archived-volumes.json";
import { BoxState } from "../box";
import { tagNames } from "./constants";

describe("get-boxes", () => {
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

  test("can get boxes", async () => {
    //  Record fixture with:
    //  AWS_PROFILE=dwmkerr aws ec2 describe-instances --filters "Name=tag:boxes.boxid,Values=*" > ./src/fixtures/aws-ec2-describe-instances.json
    const ec2Mock = mockClient(EC2Client)
      .on(DescribeInstancesCommand)
      .resolves(describeInstancesResponse);

    const boxes = await getBoxes();

    expect(ec2Mock).toHaveReceivedCommandWith(DescribeInstancesCommand, {
      Filters: [
        {
          Name: `tag:${tagNames.boxId}`,
          Values: ["*"],
        },
      ],
    });
    expect(boxes[0]).toMatchObject({
      boxId: "torrentbox",
      instanceId: "i-08fec1692931e31e7",
      name: "Torrent Box",
      state: BoxState.Stopped,
      // we don't care too much about the 'instance' object..
    });
  });

  test("throws an unknown box id warning if a box is not found", async () => {
    //  Record fixture with:
    //  AWS_PROFILE=dwmkerr aws ec2 describe-instances --filters "Name=tag:boxes.boxid,Values=*" > ./src/fixtures/aws-ec2-describe-instances.json
    const ec2Mock = mockClient(EC2Client)
      .on(DescribeInstancesCommand)
      .resolves(describeInstancesResponse);

    const boxes = await getBoxes();

    expect(ec2Mock).toHaveReceivedCommand(DescribeInstancesCommand);
    expect(boxes[0]).toMatchObject({
      boxId: "torrentbox",
      instanceId: "i-08fec1692931e31e7",
      name: "Torrent Box",
      state: BoxState.Stopped,
      // we don't care too much about the 'instance' object..
    });
  });

  test("can correctly identify if a box has archived volumes", async () => {
    //  Record fixture with:
    //  aws ec2 describe-instances --filters "Name=tag:boxes.boxid,Values=*" > ./src/fixtures/get-boxes-describe-instances-with-archived-volumes.json
    const ec2Mock = mockClient(EC2Client)
      .on(DescribeInstancesCommand)
      .resolves(describeInstancesWithArchivedVolumesResponse);

    const boxes = await getBoxes();

    expect(ec2Mock).toHaveReceivedCommand(DescribeInstancesCommand);
    expect(boxes[0]).toMatchObject({
      boxId: "torrentbox",
      instanceId: "i-08fec1692931e31e7",
      name: "Torrent Box",
      state: BoxState.Stopped,
      // we don't care too much about the 'instance' object..
    });
    expect(boxes[1]).toMatchObject({
      boxId: "steambox",
      instanceId: "i-043a3c1ce6c9ea6ad",
      name: "Steam Box",
      state: BoxState.Stopped,
      hasArchivedVolumes: true,
      // we don't care too much about the 'instance' object..
    });
  });
});
