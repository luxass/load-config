import { describe, expect, it } from "vitest";

import { loadConfig } from "../src";

describe("load config swc", () => {
  it("give me a name", async () => {
    const config = await loadConfig("./fixtures/typeschema.config.ts", {});
    console.log(config);
    expect(config).toStrictEqual({
      name: "test",
      version: "1.0.0",
      description: "test"
    });
  });
});
