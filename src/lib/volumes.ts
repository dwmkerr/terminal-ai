import dbg from "debug";
import {
  DescribeVolumesCommand,
  CreateSnapshotCommand,
  EC2Client,
  VolumeAttachment,
  CreateTagsCommand,
  DetachVolumeCommand,
  DeleteVolumeCommand,
  CreateVolumeCommand,
  DescribeInstancesCommand,
  AttachVolumeCommand,
  DeleteSnapshotCommand,
  Tag,
  DeleteTagsCommand,
} from "@aws-sdk/client-ec2";
import { getConfiguration } from "./configuration";
import { TerminatingWarning } from "./errors";
import * as aws from "./aws-helpers";
import { tagNames } from "./constants";

const debug = dbg("boxes:volumes");

export interface DetachableVolume {
  volumeId: string;
  device: string;
}

export interface SnapshottedAndDeletedVolume extends DetachableVolume {
  snapshotId: string;
}

export interface RecreatedVolume extends DetachableVolume {
  snapshotId: string;
}

export async function getDetachableVolumes(
  instanceId: string,
): Promise<DetachableVolume[]> {
  //  Create an EC2 client.
  const { aws: awsConfig } = await getConfiguration();
  const client = new EC2Client({ ...awsConfig });

  //  Get the volumes for the box.
  debug(`getting detachable volumes for ${instanceId}...`);
  const response = await client.send(
    new DescribeVolumesCommand({
      Filters: [
        {
          Name: "attachment.instance-id",
          Values: [instanceId],
        },
      ],
    }),
  );

  //  If there are no volumes, we're done.
  if (!response.Volumes) {
    debug("no volumes found");
    return [];
  }

  //  Filter down the volumes to ones which are attached.
  const volumeAttachments = response.Volumes.flatMap((volume) => {
    return volume?.Attachments?.[0];
  }).filter((va): va is VolumeAttachment => !!va);

  //  Grab the detachable volumes from the response.
  const detachableVolumes = volumeAttachments.reduce(
    (result: DetachableVolume[], attachment) => {
      debug(
        `found volume ${attachment.VolumeId} on device ${attachment.Device}`,
      );
      if (!attachment.VolumeId || !attachment.Device) {
        debug(`volumeid or device missing, skipping this volume`);
        return result;
      }
      result.push({
        volumeId: attachment.VolumeId,
        device: attachment.Device,
      });
      return result;
    },
    [],
  );

  debug(`successfully found ${detachableVolumes.length} detachable volumes`);
  return detachableVolumes;
}

export async function archiveVolumes(
  instanceId: string,
  volumes: DetachableVolume[],
  tags: Tag[],
): Promise<SnapshottedAndDeletedVolume[]> {
  //  Create an EC2 client.
  const { aws: awsConfig } = await getConfiguration();
  const client = new EC2Client({ ...awsConfig });
  debug(`preparing to snapshot/tag/delete volumes for instance ${instanceId}`);

  debug(`waiting for instance ${instanceId} to be in 'stopped' state...`);
  const instanceStopped = await aws.waitForInstanceState(
    client,
    instanceId,
    "stopped",
  );
  if (!instanceStopped) {
    throw new TerminatingWarning(
      `timed out waiting for instance ${instanceId} to enter 'stopped' state`,
    );
  }

  //  Detach each volume. No useful results are returned, but the client will
  //  throw on an error.
  //  TODO we may need to 'wait' as well, no built in parameter for this.
  await Promise.all(
    volumes.map(async (volume) => {
      debug(`detaching ${volume.volumeId}...`);
      return await client.send(
        new DetachVolumeCommand({ VolumeId: volume.volumeId }),
      );
    }),
  );

  //  Snapshot each volume.
  //  TODO we may need to 'wait' as well, no built in parameter for this.
  const snapshots = await Promise.all(
    volumes.map(async (volume) => {
      debug(`snapshotting ${volume.volumeId}...`);
      const response = await client.send(
        new CreateSnapshotCommand({
          VolumeId: volume.volumeId,
          TagSpecifications: [
            {
              ResourceType: "snapshot",
              Tags: tags,
            },
          ],
        }),
      );

      if (!response.SnapshotId) {
        throw new TerminatingWarning(
          `Failed to get a snapshot ID when snaphotting volume ${volume}, aborting to prevent data loss`,
        );
      }

      return {
        ...volume,
        snapshotId: response.SnapshotId,
      };
    }),
  );

  //  Now we must tag the instance with the details of the snapshots, so that
  //  we can later restore them. Note that there is no response for this call,
  //  it will just throw for errors.
  const snapshotDetailsTag = {
    Key: tagNames.volumeArchives,
    Value: aws.snapshotDetailsToTag(snapshots),
  };
  debug("creating snapshot details tag", snapshotDetailsTag);
  await client.send(
    new CreateTagsCommand({
      Resources: [instanceId],
      Tags: [snapshotDetailsTag],
    }),
  );

  //  We've created the snapshots, now we can delete the volumes.
  await Promise.all(
    volumes.map(async (volume) => {
      debug(`deleting ${volume.volumeId}...`);
      await client.send(new DeleteVolumeCommand({ VolumeId: volume.volumeId }));
    }),
  );

  debug(
    `successfully snapshotted/tagged/deleted ${snapshots.length} snapshots`,
  );
  return snapshots;
}

export async function restoreArchivedVolumes(
  instanceId: string,
): Promise<RecreatedVolume[]> {
  //  Create an EC2 client.
  const { aws: awsConfig } = await getConfiguration();
  const client = new EC2Client({ ...awsConfig });
  debug(`preparing to recreate volumes for instance ${instanceId}`);

  //  Get the details of the instance, we'll need the tags and AZ.
  debug(`getting instance details...`);
  const result = await client.send(
    new DescribeInstancesCommand({
      InstanceIds: [instanceId],
    }),
  );
  const instance = result?.Reservations?.[0].Instances?.[0];
  if (!instance) {
    throw new TerminatingWarning(
      `Cannot restore volumes - unable to get instance details for '${instanceId}'`,
    );
  }
  const availabilityZone = instance?.Placement?.AvailabilityZone;
  if (!availabilityZone) {
    throw new TerminatingWarning(
      `Cannot restore volumes - unable to find availability zone for '${instanceId}'`,
    );
  }

  //  Get the tags. Fail if we don't have a boxId.
  const tags = aws.tagsAsObject(instance.Tags);
  const boxId = tags[tagNames.boxId];
  if (!boxId) {
    throw new TerminatingWarning(
      `Cannot restore volumes - unable to find box id for '${instanceId}'`,
    );
  }

  //  If we don't have the required snapshots tag, we must fail.
  const snapshotDetailsTag = tags[tagNames.volumeArchives];
  if (!snapshotDetailsTag) {
    throw new TerminatingWarning(
      "unable to restore volume snapshots - required tags are missing",
    );
  }

  //  From the snapshot details tag, load the actual snapshot details.
  const snapshotDetails = aws.snapshotDetailsFromTag(snapshotDetailsTag);
  debug("loaded snapshot details from instance tag", snapshotDetails);

  //  We're now going to go through each snapshot, create a volume, attach,
  //  and then delete the snapshot.
  const recreatedVolumes = await Promise.all(
    snapshotDetails.map(
      async ({ snapshotId, device }): Promise<RecreatedVolume> => {
        //  First, create the volume from the snapshot.
        debug(
          `creating volume from snapshot ${snapshotId} in AZ ${availabilityZone}...`,
        );
        const { VolumeId: volumeId } = await client.send(
          new CreateVolumeCommand({
            SnapshotId: snapshotId,
            AvailabilityZone: availabilityZone,
            TagSpecifications: [
              {
                ResourceType: "volume",
                Tags: [
                  {
                    Key: tagNames.boxId,
                    Value: boxId,
                  },
                ],
              },
            ],
          }),
        );
        if (!volumeId) {
          throw new Error(
            `create volume from snapshot ${snapshotId} has no returned volume id`,
          );
        }

        //  Wait for the volume to become ready.
        debug(`waiting for volume ${volumeId} to be ready...`);
        const ready = await aws.waitForVolumeReady(client, volumeId);
        if (!ready) {
          throw new TerminatingWarning(
            `timed out waiting for volumes to restore from snapshots`,
          );
        }

        //  Then attach the snapshot to the instance.
        debug(`attaching volume ${volumeId} to ${instanceId} on ${device}...`);
        await client.send(
          new AttachVolumeCommand({
            InstanceId: instanceId,
            VolumeId: volumeId,
            Device: device,
          }),
        );

        //  Finally, delete the snapshot.
        debug(`deleting snapshot ${snapshotId}...`);
        await client.send(
          new DeleteSnapshotCommand({
            SnapshotId: snapshotId,
          }),
        );

        //  We can return the details of the newly created volume.
        return {
          volumeId,
          device,
          snapshotId,
        };
      },
    ),
  );

  //  Now that we have successfully recreated the volumes, delete the volume
  //  archives tag.
  debug(`deleting '${tagNames.volumeArchives}' tag from ${instanceId}...`);
  await client.send(
    new DeleteTagsCommand({
      Resources: [instanceId],
      Tags: [{ Key: tagNames.volumeArchives }],
    }),
  );

  debug(`successfully recreated ${recreatedVolumes.length} volumes`);
  return recreatedVolumes;
}
