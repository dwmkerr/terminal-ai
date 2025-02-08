import { getBoxesCosts } from "../lib/get-boxes-costs";

type BoxCosts = Record<string, string>;

export async function getCosts({
  year,
  month,
}: {
  yes: boolean;
  year: string;
  month: string;
}): Promise<BoxCosts> {
  //  Parse the year/month number if provided.
  const yearNumber = year ? parseInt(year, 10) : undefined;
  const monthNumber = month ? parseInt(month, 10) : undefined;

  //  Get the box costs as an array. Then flatten into an object.
  const boxCosts = await getBoxesCosts({
    yearNumber,
    monthNumber,
  });
  const boxCostsObject = boxCosts.reduce((acc, boxCost) => {
    acc[boxCost.boxId] = boxCost.amount;
    return acc;
  }, {} as BoxCosts);

  return boxCostsObject;
}
