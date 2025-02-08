import dbg from "debug";
import { EC2Client, StartInstancesCommand } from "@aws-sdk/client-ec2";
import { TerminatingWarning } from "../lib/errors";
import { getBoxes } from "../lib/get-boxes";
import { BoxState, awsStateToBoxState } from "../box";
import { getConfiguration } from "../lib/configuration";
import { waitForInstanceState } from "../lib/aws-helpers";
import { restoreArchivedVolumes } from "../lib/volumes";

const debug = dbg("boxes:start");

export type BoxTransition = {
  boxId: string;
  instanceId: string | undefined;
  currentState: BoxState;
  previousState: BoxState;
};

export type StartOptions = {
  boxId: string;
  wait: boolean;
  restoreArchivedVolumes: boolean;
};

export async function start(options: StartOptions): Promise<BoxTransition> {
  const { boxId, wait, restoreArchivedVolumes: enableRestore } = options;

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

  //  If the box has archived volumes, but we have not confirmed we will restore
  //  them, fail.
  if (box.hasArchivedVolumes && !enableRestore) {
    throw new TerminatingWarning(
      `This box has archived volumes which must be restored.
This feature is experimental and may cause data loss.
To accept this risk, re-run with the '--yes' parameter.`,
    );
  }

  //  Create an EC2 client.
  const { aws: awsConfig } = await getConfiguration();
  const client = new EC2Client({ ...awsConfig });

  //  If we must restore volumes, do so now.
  if (box.hasArchivedVolumes) {
    debug(`preparing to restore archived volumes for ${box.instanceId}...`);
    console.log(
      `  restoring archived volume(s)} for ${boxId}, this may take some time...`,
    );
    await restoreArchivedVolumes(box.instanceId);
  }

  //  Send the 'start instances' command. Find the status of the starting
  //  instance in the respose.
  debug(`preparing to start instance ${box.instanceId}...`);
  const response = await client.send(
    new StartInstancesCommand({
      InstanceIds: [box.instanceId],
    }),
  );
  debug(`...complete, ${response.StartingInstances?.length} instances started`);
  const startingInstances = response.StartingInstances?.find(
    (si) => si.InstanceId === box.instanceId,
  );
  const previousState = awsStateToBoxState(
    startingInstances?.PreviousState?.Name,
  );
  let currentState = awsStateToBoxState(startingInstances?.CurrentState?.Name);

  //  If the wait flag has been specified, wait for the instance to enter
  //  the 'started' state.
  if (wait) {
    console.log(
      `  waiting for ${boxId} to startup - this may take some time...`,
    );
    await waitForInstanceState(client, box.instanceId, "running");
    currentState = BoxState.Running; // hacky-ish, but we know it's stopped now...
  }

  return {
    boxId,
    instanceId: box.instanceId,
    currentState,
    previousState,
  };
}
