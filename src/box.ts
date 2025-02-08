import { Instance } from "@aws-sdk/client-ec2";

export enum BoxState {
  Unknown,
  Pending,
  Running,
  ShuttingDown,
  Terminated,
  Stopping,
  Stopped,
}

export function awsStateToBoxState(awsState?: string): BoxState {
  switch (awsState) {
    case "pending":
      return BoxState.Pending;
    case "running":
      return BoxState.Running;
    case "shutting-down":
      return BoxState.ShuttingDown;
    case "terminated":
      return BoxState.Terminated;
    case "stopping":
      return BoxState.Stopping;
    case "stopped":
      return BoxState.Stopped;
    default:
      return BoxState.Unknown;
  }
}

export type Box = {
  boxId: string;
  name: string;
  state: BoxState;
  instanceId: string | undefined;
  hasArchivedVolumes: boolean;
  instance: Instance | undefined;
};
