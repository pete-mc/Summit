import moment from "moment";
import { processGuids, reconstructGuids, processGuidsAndDates, reconstructGuidsAndDates } from "@/helpers/CompressGuids";

function toGuidFromIndex(index: number): string {
  const suffix = index.toString(16).padStart(12, "0");
  return `12345678-1234-1234-1234-${suffix}`;
}

describe("CompressGuids helpers", () => {
  it("roundtrips empty input through processGuids/reconstructGuids", () => {
    const guids: string[] = [];

    const compressed = processGuids(guids);
    const reconstructed = reconstructGuids(compressed);

    expect(compressed).toEqual([]);
    expect(reconstructed).toEqual([]);
  });

  it("roundtrips guids through processGuids/reconstructGuids", () => {
    const guids = [toGuidFromIndex(1), toGuidFromIndex(2), toGuidFromIndex(3)];

    const compressed = processGuids(guids);
    const reconstructed = reconstructGuids(compressed);

    expect(reconstructed).toEqual(guids.map((guid) => guid.toLowerCase()));
  });

  it("uses a single batch at the exact guid boundary (62)", () => {
    const guids = Array.from({ length: 62 }, (_, i) => toGuidFromIndex(i + 1));

    const compressedBatches = processGuids(guids);
    const reconstructed = reconstructGuids(compressedBatches);

    expect(compressedBatches).toHaveLength(1);
    expect(reconstructed).toEqual(guids.map((guid) => guid.toLowerCase()));
  });

  it("roundtrips empty input through processGuidsAndDates/reconstructGuidsAndDates", () => {
    const guidsAndDates: { guid: string; date: Date }[] = [];

    const compressed = processGuidsAndDates(guidsAndDates);
    const reconstructed = reconstructGuidsAndDates(compressed);

    expect(compressed).toEqual([]);
    expect(reconstructed).toEqual([]);
  });

  it("roundtrips guid/date tuples through processGuidsAndDates/reconstructGuidsAndDates", () => {
    const guidsAndDates = [
      { guid: toGuidFromIndex(10), date: new Date("2024-01-15T00:00:00.000Z") },
      { guid: toGuidFromIndex(11), date: new Date("2025-06-03T00:00:00.000Z") },
      { guid: toGuidFromIndex(12), date: new Date("2026-12-25T00:00:00.000Z") },
    ];

    const compressed = processGuidsAndDates(guidsAndDates);
    const reconstructed = reconstructGuidsAndDates(compressed);

    expect(reconstructed.map((item) => item.guid)).toEqual(guidsAndDates.map((item) => item.guid.toLowerCase()));
    expect(reconstructed.map((item) => moment(item.date).format("DDMMYY"))).toEqual(guidsAndDates.map((item) => moment(item.date).format("DDMMYY")));
  });

  it("uses a single batch at the exact guid/date boundary (50)", () => {
    const start = new Date("2024-01-01T00:00:00.000Z");
    const guidsAndDates = Array.from({ length: 50 }, (_, i) => ({
      guid: toGuidFromIndex(i + 100),
      date: new Date(start.getTime() + i * 24 * 60 * 60 * 1000),
    }));

    const compressedBatches = processGuidsAndDates(guidsAndDates);
    const reconstructed = reconstructGuidsAndDates(compressedBatches);

    expect(compressedBatches).toHaveLength(1);
    expect(reconstructed.map((item) => item.guid)).toEqual(guidsAndDates.map((item) => item.guid.toLowerCase()));
    expect(reconstructed.map((item) => moment(item.date).format("DDMMYY"))).toEqual(guidsAndDates.map((item) => moment(item.date).format("DDMMYY")));
  });

  it("supports representative batching conditions for guid compression", () => {
    const guids = Array.from({ length: 63 }, (_, i) => toGuidFromIndex(i + 1));

    const compressedBatches = processGuids(guids);
    const reconstructed = reconstructGuids(compressedBatches);

    expect(compressedBatches).toHaveLength(2);
    expect(reconstructed).toEqual(guids.map((guid) => guid.toLowerCase()));
  });

  it("supports representative batching conditions for guid/date compression", () => {
    const start = new Date("2024-01-01T00:00:00.000Z");
    const guidsAndDates = Array.from({ length: 51 }, (_, i) => ({
      guid: toGuidFromIndex(i + 100),
      date: new Date(start.getTime() + i * 24 * 60 * 60 * 1000),
    }));

    const compressedBatches = processGuidsAndDates(guidsAndDates);
    const reconstructed = reconstructGuidsAndDates(compressedBatches);

    expect(compressedBatches).toHaveLength(2);
    expect(reconstructed.map((item) => item.guid)).toEqual(guidsAndDates.map((item) => item.guid.toLowerCase()));
    expect(reconstructed.map((item) => moment(item.date).format("DDMMYY"))).toEqual(guidsAndDates.map((item) => moment(item.date).format("DDMMYY")));
  });
});
