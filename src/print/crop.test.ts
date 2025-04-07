import { crop, cropLines } from "./crop";

describe("print", () => {
  describe("crop", () => {
    test("can crop string", () => {
      expect(crop("1234567890", 5)).toBe("12...");
      expect(crop("1234567890", 10)).toBe("1234567890");
    });
  });

  describe("cropLines", () => {
    test("can crop lines", () => {
      expect(cropLines("one\ntwo\nthree", 3)).toBe("one\ntwo\nthree");
      expect(cropLines("one\ntwo\nthree", 2)).toBe("one\n...");
    });
  });
});
