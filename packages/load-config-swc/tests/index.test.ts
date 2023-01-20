import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { loadConfig } from "../src";

describe("load config", () => {
  test("load config with esm detection", async () => {
    const configPath = join(__dirname, "typescript", "config.ts");

    const { config } = await loadConfig(configPath, {
      cwd: join(__dirname, "typescript")
    });

    expect(config).toStrictEqual({
      name: "load-config",
      version: "0.0.0"
    });
  });

  test("load config with esm", async () => {
    const configPath = join(__dirname, "typescript", "config.ts");

    const { config } = await loadConfig(configPath, {
      cwd: join(__dirname, "typescript"),
      isESM: true
    });

    expect(config).toStrictEqual({
      name: "load-config",
      version: "0.0.0"
    });
  });

  test("load config without esm", async () => {
    const configPath = join(__dirname, "typescript", "config.ts");

    const { config } = await loadConfig(configPath, {
      cwd: join(__dirname, "typescript"),
      isESM: false
    });

    expect(config).toStrictEqual({
      name: "load-config",
      version: "0.0.0"
    });
  });

  test("inject values", async () => {
    const dirname = join(__dirname, "inject");
    const configPath = join(dirname, "config.ts");

    const { config } = await loadConfig(configPath, {
      cwd: dirname
    });

    expect(config).toStrictEqual({
      dirname,
      filename: join(configPath),
      url: `file://${configPath}`,
      url2: undefined
    });
  });
});
