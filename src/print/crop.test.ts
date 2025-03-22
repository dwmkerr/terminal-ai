import { crop } from "./crop";

describe("print", () => {
  describe("crop", () => {
    test("can crop string", () => {
      expect(crop("1234567890", 5)).toBe("12...");
      expect(crop("1234567890", 10)).toBe("1234567890");
    });
  });
});
