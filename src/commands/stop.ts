import dbg from "debug";
import { EC2Client, StopInstancesCommand } from "@aws-sdk/client-ec2";
import { TerminatingWarning } from "../lib/errors";
import { getBoxes } from "../lib/get-boxes";
import { BoxState, awsStateToBoxState } from "../box";
import { getConfiguration } from "../lib/configuration";
import { BoxTransition } from "./start";
import { waitForInstanceState } from "../lib/aws-helpers";
import { getDetachableVolumes, archiveVolumes } from "../lib/volumes";
import { tagNames } from "../lib/constants";

const debug = dbg("boxes:stop");

export type StopOptions = {
  boxId: string;
  wait: boolean;
  archiveVolumes: boolean;
};

export async function stop(options: StopOptions): Promise<BoxTransition> {
  const { boxId, wait, archiveVolumes: enableArchive } = options;

  //  Get the box, fail with a warning if it is not found.
  const boxes = await getBoxes();
  const box = boxes.find((b) => b.boxId === boxId);
  if (!box) {
    throw new TerminatingWarning(`Unable to find box with id '${boxId}'`);
  }

  //  If the box has no instance id, fail.
  if (!box.instanceId) {
    throw new TerminatingWarning(
      `Box with id '${boxId}' has no associated AWS instance ID`,
    );
  }

  //  Create an EC2 client.
  const { aws: awsConfig } = await getConfiguration();
  const client = new EC2Client({ ...awsConfig });

  //  Send the 'stop instances' command. Find the status of the stopping
  //  instance in the respose.
  debug(`preparing to stop instance ${box.instanceId}...`);
  const response = await client.send(
    new StopInstancesCommand({
      InstanceIds: [box.instanceId],
    }),
  );
  debug(`...complete, ${response.StoppingInstances?.length} instances stopped`);
  const stoppingInstance = response.StoppingInstances?.find(
    (si) => si.InstanceId === box.instanceId,
  );
  const previousState = awsStateToBoxState(
    stoppingInstance?.PreviousState?.Name,
  );
  let currentState = awsStateToBoxState(stoppingInstance?.CurrentState?.Name);

  //  If the wait flag has been specified, wait for the instance to enter
  //  the 'started' state. We also must wait if we are archiving.
  if (wait || enableArchive) {
    console.log(
      `  waiting for ${boxId} to shutdown - this may take some time...`,
    );
    await waitForInstanceState(client, box.instanceId, "stopped");
    currentState = BoxState.Stopped; // hacky-ish, but we know it's stopped now...
  }

  //  If we are archiving the volumes, do so now before we try and stop the box.
  //  Make sure to tag the snapshots with the box id so that we track its costs
  //  and can restore the tag to the volume later.
  if (enableArchive) {
    const volumes = await getDetachableVolumes(box.instanceId);
    console.log(
      `  archiving ${volumes.length} volume(s), this may take some time...`,
    );
    await archiveVolumes(box.instanceId, volumes, [
      {
        Key: tagNames.boxId,
        Value: boxId,
      },
    ]);
  }

  return {
    boxId,
    instanceId: box.instanceId,
    currentState,
    previousState,
  };
}
