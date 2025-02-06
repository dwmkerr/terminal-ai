import dbg from "debug";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { Box, awsStateToBoxState } from "../box";
import { TerminatingWarning } from "./errors";
import { getConfiguration } from "./configuration";
import { tagsAsObject } from "./aws-helpers";
import { tagNames } from "./constants";
const debug = dbg("boxes");

export async function getBoxes(): Promise<Box[]> {
  const { aws: awsConfig } = await getConfiguration();
  const client = new EC2Client({ ...awsConfig });

  debug(`preparing to describe instances with '${tagNames.boxId}' tags...`);
  const instancesResponse = await client.send(
    new DescribeInstancesCommand({
      // TODO typescript this seems to not be found...
      // IncludeAllInstances: true,
      Filters: [
        {
          Name: `tag:${tagNames.boxId}`,
          Values: ["*"],
        },
      ],
    }),
  );

  if (!instancesResponse || !instancesResponse.Reservations) {
    throw new TerminatingWarning("Failed to query AWS for boxes/reservations");
  }
  debug("...described successfully");

  //  Filter down to instances which have a state.
  const instances = instancesResponse.Reservations.flatMap((r) => {
    return r.Instances;
  }).filter((instance) => instance !== undefined);

  //  We filter out terminated boxes (otherwise we can get multiple boxes with
  //  the same ID, e.g. if a user quickly terminates and recreates a box).
  const validInstances = instances.filter(
    (i) => i?.State?.Name !== "terminated",
  );

  const boxes = validInstances.map((i): Box => {
    const tags = tagsAsObject(i?.Tags);
    return {
      boxId: tags[tagNames.boxId],
      instanceId: i?.InstanceId,
      name: tags?.["Name"],
      state: awsStateToBoxState(i?.State?.Name),
      hasArchivedVolumes: tags.hasOwnProperty(tagNames.volumeArchives),
      instance: i,
    };
  });
  debug(`found ${boxes.length} boxes`);

  return boxes;
}
