import {
  describe, expect, it
} from "vitest";

describe("load config - swc", () => {
  it("should load config", async () => {
    const config = await import("../src");
    expect(config).toEqual({
      name: "vitest",
      version: "0.0.0"
    });
  });
});
