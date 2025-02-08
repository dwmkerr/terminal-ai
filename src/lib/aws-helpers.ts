import dbg from "debug";
import {
  EC2Client,
  DescribeVolumesCommand,
  DescribeInstancesCommand,
  Tag,
} from "@aws-sdk/client-ec2";

const debug = dbg("boxes:aws");

export function tagsAsObject(tags: Tag[] | undefined): Record<string, string> {
  return (
    tags?.reduce((result: Record<string, string>, tag) => {
      return {
        ...result,
        ...(tag?.Key && { [tag.Key]: tag.Value || "" }),
      };
    }, {}) || {}
  );
}

export interface SnapshotDetails {
  snapshotId: string;
  device: string;
}

export function snapshotDetailsToTag(
  snapshotDetails: SnapshotDetails[],
): string {
  return JSON.stringify(
    snapshotDetails.map((snapshot) => ({
      device: snapshot.device,
      snapshotId: snapshot.snapshotId,
    })),
  );
}

export function snapshotDetailsFromTag(tagValue: string) {
  const rawDetails = JSON.parse(tagValue) as Record<string, string>[];
  const snapshots = rawDetails.map((raw) => {
    if (!raw["device"] || !raw["snapshotId"]) {
      throw new Error("snapshot details tag missing device/volume data");
    }
    return {
      device: raw["device"],
      snapshotId: raw["snapshotId"],
    };
  });
  return snapshots;
}

export async function waitForVolumeReady(
  client: EC2Client,
  volumeId: string,
  intervalMs: number = 5 * 1000,
  timeoutMs: number = 60 * 60 * 1000,
) {
  //  When running unit tests in Jest we can return immediately as
  //  all service calls are mocked to correct values. This function
  //  can be tested independently in the future.
  if (process.env.JEST_WORKER_ID !== undefined) {
    return true;
  }

  const timeStart = new Date();
  let currentMs = 0;
  let volumeState = "";

  do {
    try {
      const { Volumes } = await client.send(
        new DescribeVolumesCommand({ VolumeIds: [volumeId] }),
      );
      if (Volumes && Volumes.length > 0 && Volumes?.[0].State) {
        volumeState = Volumes[0].State;
      } else {
        throw new Error("Volume not found");
      }
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(`Error describing volume ${volumeId}: ${error.message}`);
    }

    if (volumeState === "available") {
      debug(`volume ${volumeId} is now in a ready state.`);
      return true;
    }

    currentMs = new Date().getTime() - timeStart.getTime();
    const currentSeconds = Math.round(currentMs / 1000);
    debug(
      `waited ${currentSeconds}s/${
        timeoutMs / 1000
      }s for ${volumeId} to be in target state 'ready'...`,
    );

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  } while (currentMs <= timeoutMs);

  debug(
    `timeout after ${
      currentMs / 1000
    }s waiting for ${volumeId} to be in target state 'ready'`,
  );

  return false;
}

type EC2InstanceState =
  | "pending"
  | "running"
  | "shutting-down"
  | "terminated"
  | "stopping"
  | "stopped";

export async function waitForInstanceState(
  client: EC2Client,
  instanceId: string,
  targetState: EC2InstanceState,
  intervalMs: number = 5 * 1000,
  timeoutMs: number = 5 * 60 * 1000,
) {
  //  When running unit tests in Jest we can return immediately as
  //  all service calls are mocked to correct values. This function
  //  can be tested independently in the future.
  if (process.env.JEST_WORKER_ID !== undefined) {
    return true;
  }

  const timeStart = new Date();
  let currentMs = 0;

  do {
    try {
      const { Reservations } = await client.send(
        new DescribeInstancesCommand({
          InstanceIds: [instanceId],
        }),
      );
      const currentState = Reservations?.[0].Instances?.[0].State?.Name;
      if (!currentState) {
        throw new Error("Instance or instance state not found");
      }
      if (currentState === (targetState as string)) {
        debug(`instance ${instanceId} is now in target state '${targetState}'`);
        return true;
      }
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(
        `Error describing instance ${instanceId}: ${error.message}`,
      );
    }

    currentMs = new Date().getTime() - timeStart.getTime();
    const currentSeconds = Math.round(currentMs / 1000);
    debug(
      `waited ${currentSeconds}s/${
        timeoutMs / 1000
      }s for ${instanceId} to be in target state '${targetState}'...`,
    );

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  } while (currentMs <= timeoutMs);

  debug(
    `timeout after ${
      currentMs / 1000
    }s waiting for ${instanceId} to be in target state '${targetState}'`,
  );
  return false;
}
