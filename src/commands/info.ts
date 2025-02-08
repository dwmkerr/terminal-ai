import { getBoxes } from "../lib/get-boxes";

export async function info(boxId: string) {
  const boxes = await getBoxes();
  const box = boxes.find((b) => b.boxId === boxId);
  console.log(box);
}
