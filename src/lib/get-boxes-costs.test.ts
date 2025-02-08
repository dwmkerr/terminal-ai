import path from "path";
import mock from "mock-fs";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer"; // ES Modules import
import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { getBoxesCosts, dateToLocalDateString } from "./get-boxes-costs";

import getMonthlyCostsResponse from "../fixtures/aws-ce-get-costs.json";

describe("get-boxes-costs", () => {
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

  test("can get boxes costs for a given month", async () => {
    const ecMock = mockClient(CostExplorerClient)
      .on(GetCostAndUsageCommand)
      .resolves(getMonthlyCostsResponse);
    const boxCosts = await getBoxesCosts({
      yearNumber: 2023,
      monthNumber: 11,
    });

    //  Assert that we've hit the mocked current month from the first date
    //  to the last.
    expect(ecMock).toHaveReceivedCommandWith(GetCostAndUsageCommand, {
      TimePeriod: {
        Start: `2023-11-01`,
        End: `2023-11-30`,
      },
      Metrics: ["UNBLENDED_COST"],
      Granularity: "MONTHLY",
      GroupBy: [{ Type: "TAG", Key: "boxes.boxid" }],
    });

    expect(boxCosts).toEqual([
      { boxId: "*", amount: "~ 33.78 USD" },
      { boxId: "steambox", amount: "~ 0.53 USD" },
      { boxId: "torrentbox", amount: "~ 0.05 USD" },
    ]);
  });

  test("defaults to the current year and month if no options provided", async () => {
    //  Get the first and last date of the current month.
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    //  Mock, then call the get costs function.
    const ecMock = mockClient(CostExplorerClient)
      .on(GetCostAndUsageCommand)
      .resolves(getMonthlyCostsResponse);
    await getBoxesCosts();

    //  ...we don't care about the result of the call, just that the dates
    //  specified matched the current month.
    expect(ecMock).toHaveReceivedCommandWith(GetCostAndUsageCommand, {
      TimePeriod: {
        Start: `${dateToLocalDateString(firstDay)}`,
        End: `${dateToLocalDateString(lastDay)}`,
      },
      Metrics: ["UNBLENDED_COST"],
      Granularity: "MONTHLY",
      GroupBy: [{ Type: "TAG", Key: "boxes.boxid" }],
    });
  });
});
