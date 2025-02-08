import path from "path";
import {
  EC2Client,
  DescribeVolumesCommand,
  CreateSnapshotCommand,
  CreateTagsCommand,
  DetachVolumeCommand,
  CreateVolumeCommand,
  DescribeInstancesCommand,
  AttachVolumeCommand,
  DeleteSnapshotCommand,
  DeleteTagsCommand,
} from "@aws-sdk/client-ec2";
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import mock from "mock-fs";
import {
  DetachableVolume,
  getDetachableVolumes,
  restoreArchivedVolumes,
  archiveVolumes,
} from "./volumes";
import { tagNames } from "./constants";

import describeVolumesTorrentBoxResponse from "../fixtures/volumes-describe-volumes-torrent-box.json";
import createSnapshot1Response from "../fixtures/volumes-create-snapshot-volume1.json";
import createSnapshot2Response from "../fixtures/volumes-create-snapshot-volume2.json";
import describeInstancesResponse from "../fixtures/volumes-describe-instances.json";
import describeInstancesMissingTagsResponse from "../fixtures/volumes-describe-instances-missing-tags.json";
import createVolume1Response from "../fixtures/volumes-create-volume1.json";
import createVolume2Response from "../fixtures/volumes-create-volume2.json";
import attachVolume1Response from "../fixtures/volumes-attach-volume1.json";
import attachVolume2Response from "../fixtures/volumes-attach-volume2.json";
import { TerminatingWarning } from "./errors";

describe("volumes", () => {
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

  describe("get-detachable-volumes", () => {
    test("can get detachable volumes from 'torrentbox'", async () => {
      //  Record fixtures with:
      //  aws ec2 describe-volumes --filters Name=attachment.instance-id,Values=i-08fec1692931e31e7 > ./src/fixtures/aws-ec2-describe-volumes-torrent-box.json
      const ec2Mock = mockClient(EC2Client)
        .on(DescribeVolumesCommand)
        .resolves(describeVolumesTorrentBoxResponse);

      //  Get the detachable volumes, assert the command was called with the
      //  correct instance id.
      const instanceId = "i-08fec1692931e31e7"; // fixture 'torrentbox' id
      const detachableVolumes = await getDetachableVolumes(instanceId);

      expect(ec2Mock).toHaveReceivedCommandWith(DescribeVolumesCommand, {
        Filters: [
          {
            Name: "attachment.instance-id",
            Values: [instanceId],
          },
        ],
      });

      expect(detachableVolumes).toEqual([
        {
          volumeId: "vol-0582d7fc0f3d797fc",
          device: "/dev/xvda",
        },
        {
          volumeId: "vol-0987a9ce9bb4c7b1d",
          device: "/dev/xvdf",
        },
      ]);
    });
  });

  describe("archiveVolumes", () => {
    test("can snapshot with tags and delete volumes", async () => {
      //  Note: to record the fixtures and update this test process, check the
      //  ./fixtures/volumes-test-script.md file for the AWS commands to use.
      const ec2Mock = mockClient(EC2Client)
        .on(DetachVolumeCommand, {
          VolumeId: "vol-0582d7fc0f3d797fc",
        })
        .on(DetachVolumeCommand, {
          VolumeId: "vol-0582d7fc0f3d797fc",
        })
        .on(CreateSnapshotCommand, {
          VolumeId: "vol-0582d7fc0f3d797fc",
        })
        .resolves(createSnapshot1Response)
        .on(CreateSnapshotCommand, {
          VolumeId: "vol-0987a9ce9bb4c7b1d",
        })
        .resolves(createSnapshot2Response);

      //  Get the detachable volumes, assert the command was called with the
      //  correct instance id.
      const instanceId = "i-08fec1692931e31e7"; // fixture 'torrentbox' id
      const detachableVolumes: DetachableVolume[] = [
        {
          volumeId: "vol-0582d7fc0f3d797fc",
          device: "/dev/xvda",
        },
        {
          volumeId: "vol-0987a9ce9bb4c7b1d",
          device: "/dev/xvdf",
        },
      ];

      const tags = [{ Key: tagNames.boxId, Value: "torrentbox" }];
      const result = await archiveVolumes(instanceId, detachableVolumes, tags);

      //  Assert we have detached the two volumes.
      expect(ec2Mock).toHaveReceivedCommandWith(DetachVolumeCommand, {
        VolumeId: "vol-0582d7fc0f3d797fc",
      });
      expect(ec2Mock).toHaveReceivedCommandWith(DetachVolumeCommand, {
        VolumeId: "vol-0987a9ce9bb4c7b1d",
      });

      //  Assert we have created the two snapshots.
      expect(ec2Mock).toHaveReceivedCommandWith(CreateSnapshotCommand, {
        VolumeId: "vol-0582d7fc0f3d797fc",
        TagSpecifications: [
          {
            ResourceType: "snapshot",
            Tags: [
              {
                Key: tagNames.boxId,
                Value: "torrentbox",
              },
            ],
          },
        ],
      });
      expect(ec2Mock).toHaveReceivedCommandWith(CreateSnapshotCommand, {
        VolumeId: "vol-0987a9ce9bb4c7b1d",
        TagSpecifications: [
          {
            ResourceType: "snapshot",
            Tags: [
              {
                Key: tagNames.boxId,
                Value: "torrentbox",
              },
            ],
          },
        ],
      });

      expect(result).toEqual([
        {
          volumeId: "vol-0582d7fc0f3d797fc",
          device: "/dev/xvda",
          snapshotId: "snap-03c3efc7e9254ab0a",
        },
        {
          volumeId: "vol-0987a9ce9bb4c7b1d",
          device: "/dev/xvdf",
          snapshotId: "snap-056afd3da4b3b003b",
        },
      ]);

      //  Now we need to assert that the instance is updated with a set of tags
      //  that idenfify the snapshots.
      expect(ec2Mock).toHaveReceivedCommandWith(CreateTagsCommand, {
        Resources: [instanceId],
        Tags: [
          {
            Key: tagNames.volumeArchives,
            Value:
              '[{"device":"/dev/xvda","snapshotId":"snap-03c3efc7e9254ab0a"},{"device":"/dev/xvdf","snapshotId":"snap-056afd3da4b3b003b"}]',
          },
        ],
      });
    });
  });

  describe("restoreArchivedVolumes", () => {
    test("throws a TerminatingWarning if the required tags are not present", async () => {
      const instanceId = "i-08fec1692931e31e7"; // fixture 'torrentbox' id
      const ec2Mock = mockClient(EC2Client)
        .on(DescribeInstancesCommand)
        .resolves(describeInstancesMissingTagsResponse);

      //  Recreate the volumes from the snapshot tag. This response is missing
      //  the required tag so should throw. Jest doesn't let us check the
      //  message/type of error particularly well so it's a bit janky here.
      try {
        await restoreArchivedVolumes(instanceId);
        fail("recreate volumes did not throw");
      } catch (err) {
        const error = err as TerminatingWarning;
        expect(error).toBeInstanceOf(TerminatingWarning);
        expect(error.message).toMatch(
          "unable to restore volume snapshots - required tags are missing",
        );
      }

      //  Expect the call to the mock.
      expect(ec2Mock).toHaveReceivedCommandWith(DescribeInstancesCommand, {
        InstanceIds: [instanceId],
      });
    });

    test("can recreate volumes from snapshot tag", async () => {
      //  Note: to record the fixtures and update this test process, check the
      //  ./fixtures/volumes-test-script.md file for the AWS commands to use.
      const instanceId = "i-08fec1692931e31e7"; // fixture 'torrentbox' id
      const device1 = "/dev/xvda";
      const snapshotId1 = "snap-03c3efc7e9254ab0a";
      const device2 = "/dev/xvdf";
      const snapshotId2 = "snap-056afd3da4b3b003b";
      const ec2Mock = mockClient(EC2Client)
        .on(DescribeInstancesCommand)
        .resolves(describeInstancesResponse)
        .on(CreateVolumeCommand, {
          SnapshotId: snapshotId1,
        })
        .resolves(createVolume1Response)
        .on(CreateVolumeCommand, {
          SnapshotId: snapshotId2,
        })
        .resolves(createVolume2Response)
        .on(AttachVolumeCommand, {
          Device: device1,
        })
        .resolves(attachVolume1Response)
        .on(AttachVolumeCommand, {
          Device: device2,
        })
        .resolves(attachVolume2Response);

      //  Recreate the volumes from the snapshot tag.
      const recreatedVolumes = await restoreArchivedVolumes(instanceId);

      expect(recreatedVolumes).toEqual([
        {
          snapshotId: snapshotId1,
          device: device1,
          volumeId: "vol-0c3940cade857692b",
        },
        {
          snapshotId: snapshotId2,
          device: device2,
          volumeId: "vol-059b4ea55caf83199",
        },
      ]);

      //  First, instance is queried to get snapshot and AZ data.
      expect(ec2Mock).toHaveReceivedCommandWith(DescribeInstancesCommand, {
        InstanceIds: [instanceId],
      });

      //  With the tags loaded and the snapshot data available, expect the
      //  snapshots to be restored.
      expect(ec2Mock).toHaveReceivedCommandWith(CreateVolumeCommand, {
        SnapshotId: snapshotId1,
        AvailabilityZone: "us-west-2a", // the az of our fixture instance
        TagSpecifications: [
          {
            ResourceType: "volume",
            Tags: [
              {
                Key: tagNames.boxId,
                Value: "torrentbox",
              },
            ],
          },
        ],
      });
      expect(ec2Mock).toHaveReceivedCommandWith(CreateVolumeCommand, {
        SnapshotId: snapshotId2,
        AvailabilityZone: "us-west-2a", // the az of our fixture instance
        TagSpecifications: [
          {
            ResourceType: "volume",
            Tags: [
              {
                Key: tagNames.boxId,
                Value: "torrentbox",
              },
            ],
          },
        ],
      });

      //  Now the newly created volumes should be attached.
      expect(ec2Mock).toHaveReceivedCommandWith(AttachVolumeCommand, {
        Device: device1,
      });
      expect(ec2Mock).toHaveReceivedCommandWith(AttachVolumeCommand, {
        Device: device2,
      });

      //  The two snapshots should have been deleted.
      expect(ec2Mock).toHaveReceivedCommandWith(DeleteSnapshotCommand, {
        SnapshotId: snapshotId1,
      });
      expect(ec2Mock).toHaveReceivedCommandWith(DeleteSnapshotCommand, {
        SnapshotId: snapshotId2,
      });

      //  The 'archived volumes' tag on the instance should have been removed.
      expect(ec2Mock).toHaveReceivedCommandWith(DeleteTagsCommand, {
        Resources: [instanceId],
        Tags: [
          {
            Key: tagNames.volumeArchives,
          },
        ],
      });
    });
  });
});
