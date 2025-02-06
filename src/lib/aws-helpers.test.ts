import {
  tagsAsObject,
  SnapshotDetails,
  snapshotDetailsToTag,
  snapshotDetailsFromTag,
} from "./aws-helpers";

describe("aws-helpers", () => {
  describe("tagsAsObject", () => {
    it("should correctly convert an array of tags into an object", () => {
      // Test case with a sample array of Tag objects
      const tags = [
        {
          Key: "Name",
          Value: "Torrent Box",
        },
        {
          Key: "Owner",
          Value: "dwmkerr",
        },
        {
          Key: "Project",
          Value: "github.com/dwmkerr/dwmkerr",
        },
        {
          Key: "boxes.boxid",
          Value: "torrentbox",
        },
        {
          Key: "boxes.volumesnapshots",
          Value: "[]",
        },
        {
          Key: "missing value",
          Value: "",
        },
      ];

      const expectedObject = {
        Name: "Torrent Box",
        Owner: "dwmkerr",
        Project: "github.com/dwmkerr/dwmkerr",
        "boxes.boxid": "torrentbox",
        "boxes.volumesnapshots": "[]",
        "missing value": "",
      };

      // Call the function and assert the result
      const result = tagsAsObject(tags);
      expect(result).toEqual(expectedObject);
    });
  });

  describe("snapshotDetails serialization and deserialization", () => {
    it("should serialize and deserialize snapshot details correctly", () => {
      //  Assert we can go to/from the JSON form of the snapshot details
      //  which are stored in an AWS tag.
      const originalSnapshotDetails: SnapshotDetails[] = [
        { snapshotId: "snap-03c3efc7e9254ab0a", device: "/dev/xvda" },
        { snapshotId: "snap-056afd3da4b3b003b", device: "/dev/xvdf" },
      ];

      const serializedString = snapshotDetailsToTag(originalSnapshotDetails);
      const deserializedSnapshotDetails =
        snapshotDetailsFromTag(serializedString);

      // Then: The deserialized result should match the original
      expect(deserializedSnapshotDetails).toEqual(originalSnapshotDetails);
    });
  });
});
