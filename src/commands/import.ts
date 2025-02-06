import dbg from "debug";
import {
  CreateTagsCommand,
  DescribeInstancesCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { TerminatingWarning } from "../lib/errors";
import { getConfiguration } from "../lib/configuration";
import { tagsAsObject } from "../lib/aws-helpers";
import { tagNames } from "../lib/constants";

const debug = dbg("boxes:import");

type ImportOptions = {
  instanceId: string;
  boxId: string;
  overwrite: boolean;
};

export async function importBox(options: ImportOptions): Promise<void> {
  const { instanceId, boxId, overwrite } = options;

  //  Create an EC2 client.
  const { aws: awsConfig } = await getConfiguration();
  const client = new EC2Client({ ...awsConfig });

  //  Get our AWS instances, we'll search for the instance and check for
  //  conflicts.
  debug(`preparing to describe all instances...`);
  const response = await client.send(new DescribeInstancesCommand({}));
  if (!response || !response.Reservations) {
    throw new TerminatingWarning("Failed to query AWS for boxes/reservations");
  }
  debug("...described successfully");

  //  Find the instance. If it doesn't exist, fail.
  const instance = response.Reservations?.flatMap((r) => r.Instances).find(
    (instance) => instance?.InstanceId === instanceId,
  );

  //  If there is no instance with the provided instance id, fail.
  if (!instance) {
    throw new TerminatingWarning(`Instance with id '${instanceId}' not found`);
  }

  //  If this instance already has a box id, but we have not chosen to
  //  overwrite it, then fail.
  const tags = tagsAsObject(instance?.Tags);
  if (tags.hasOwnProperty(tagNames.boxId) && !overwrite) {
    throw new TerminatingWarning(
      `Instance '${instanceId}' is already tagged with box id '${
        tags[tagNames.boxId]
      }`,
    );
  }

  //  Get any volumes ids that we will tag.
  const volumeIds =
    instance?.BlockDeviceMappings?.map((bdm) => bdm.Ebs?.VolumeId).filter(
      (volumeId): volumeId is string => !!volumeId,
    ) || [];

  //  Send the 'start instances' command. Find the status of the starting
  //  instance in the respose.
  debug(
    `preparing to tag instance ${instanceId} and volumes ${volumeIds} with ${tagNames.boxId}=${boxId}...`,
  );
  await client.send(
    new CreateTagsCommand({
      Resources: [instanceId, ...volumeIds],
      Tags: [
        {
          Key: tagNames.boxId,
          Value: boxId,
        },
      ],
    }),
  );
  debug(`...complete`);
}
