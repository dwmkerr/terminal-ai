import { getBoxes } from "../lib/get-boxes";

export async function list() {
  const boxes = await getBoxes();
  return boxes;
}
