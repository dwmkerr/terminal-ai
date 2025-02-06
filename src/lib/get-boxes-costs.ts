import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer"; // ES Modules import
import { TerminatingWarning } from "./errors";
import { getConfiguration } from "./configuration";

export function dateToLocalDateString(date: Date): string {
  const year = `${date.getFullYear()}`.padStart(4, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface GetBoxesCostsOptions {
  yearNumber: number | undefined;
  monthNumber: number | undefined;
}

//  Our returned costs will look something like this:
//  {
//    "*": "~ 33.78 USD",
//    steambox: "~ 0.53 USD",
//    torrentbox: "~ 0.05 USD",
//  }
export interface BoxCostDescription {
  boxId: string;
  amount: string;
}

export async function getBoxesCosts(
  options?: GetBoxesCostsOptions,
): Promise<BoxCostDescription[]> {
  const { aws: awsConfig } = await getConfiguration();
  const client = new CostExplorerClient({ ...awsConfig });

  //  If the caller has specified a year, we must also have a month.
  //  It is fine to just have a month on it's own - it'll default to
  //  the current year.
  if (options?.yearNumber && options.monthNumber === undefined) {
    throw new TerminatingWarning(
      "'year' can only be combined with the 'month' option",
    );
  }

  //  Get the firt day of the current month OR the specified month.
  const now = new Date(Date.now());
  const year = options?.yearNumber || now.getFullYear();
  const startOfMonth =
    options && options.monthNumber
      ? new Date(year, options.monthNumber - 1, 10)
      : new Date(now);
  startOfMonth.setDate(1);

  //  Get the next month, then 'zero-th' date, which is the last day of the
  //  month before.
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  const start = dateToLocalDateString(startOfMonth);
  const end = dateToLocalDateString(endOfMonth);
  const response = await client.send(
    new GetCostAndUsageCommand({
      TimePeriod: { Start: start, End: end },
      Metrics: ["UNBLENDED_COST"],
      Granularity: "MONTHLY",
      GroupBy: [{ Type: "TAG", Key: "boxes.boxid" }],
    }),
  );

  //  Get the groups. If we don't have sufficient response data we must bail
  //  out early.
  if (!response.ResultsByTime) {
    throw new TerminatingWarning("Failed to load cost data from AWS");
  }
  const groups = response.ResultsByTime[0].Groups;
  const estimated = response.ResultsByTime[0].Estimated || false;

  //  If there are no groups, we cannot continue.
  if (groups === undefined) {
    throw new TerminatingWarning("Failed to load cost groups data from AWS");
  }

  //  Map each group - each group looks like this:
  // {
  //   "Keys": [
  //     "boxes.boxid$steambox"
  //   ],
  //     "Metrics": {
  //       "UnblendedCost": {
  //         "Amount": "0.5264341375",
  //         "Unit": "USD"
  //       }
  //     }
  // },
  //  We need to make the set look like this:
  //  {
  //    "*": "~ 33.78 USD",
  //    steambox: "~ 0.53 USD",
  //    torrentbox: "~ 0.05 USD",
  //  }

  //  printCost just formats the costs and uses question marks if AWS returns
  //  us undefined values. Not perfect but good enough.
  const printCost = (
    estimated: boolean,
    stringAmount: string | undefined,
    unit: string | undefined,
  ) => {
    const lead = estimated ? "~ " : "";
    const amount = stringAmount
      ? Number.parseFloat(stringAmount).toFixed(2)
      : "?";
    const unitVal = unit || "?";
    return `${lead}${amount} ${unitVal}`;
  };
  const costs = groups.map((g) => {
    const boxId = g.Keys?.[0].split("$")[1];
    const amount = printCost(
      estimated,
      g.Metrics?.UnblendedCost.Amount,
      g.Metrics?.UnblendedCost.Unit,
    );
    return {
      //  The 'undefined' boxId is any other non-boxes costs, which we show
      //  as a '*'.
      boxId: boxId || "*",
      amount,
    } as BoxCostDescription;
  });

  return costs;
}
