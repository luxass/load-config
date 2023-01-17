import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { resolveConfig } from "../src";
import { cookieLoader } from "./cookie-loaders";

describe("resolve config with loaders", () => {
  test("resolve correctly without any error", async () => {
    const config = await resolveConfig({
      loaders: [cookieLoader],
      cwd: join(__dirname, "loaders"),
      files: ["package.json", "config.cookie"],
      name: "cookies"
    });

    expect(config?.path).toBe(join(__dirname, "loaders", "config.cookie"));
    expect(config?.config).toStrictEqual({
      we: {
        love: {
          cookies: "very much"
        }
      }
    });
  });

  test("resolve with config being null", async () => {
    const config = await resolveConfig({
      cwd: join(__dirname, "loaders"),
      files: ["package.json", "config.cookie"],
      name: "cookies"
    });

    expect(config?.path).toBe(join(__dirname, "loaders", "config.cookie"));
    expect(config?.config).toBeNull();
  });
});

describe("multiple", () => {
  test("resolve correctly", async () => {
    const config = await resolveConfig<{ lines: string[] }>({
      loaders: [cookieLoader],
      cwd: join(__dirname, "multiple"),
      files: ["package.json", "config.cookie", "cookies.json"],
      name: "cookies"
    });

    expect(config?.path).toBe(join(__dirname, "multiple", "config.cookie"));
    expect(config?.config).toHaveProperty("lines");
    expect(config?.config!.lines).toHaveLength(10);
  });
});

describe("package.json", () => {
  test("find `cookies` in package.json", async () => {
    const config = await resolveConfig<{ lines: string[] }>({
      cwd: join(__dirname, "package-json"),
      files: ["package.json", "config.cookie"],
      name: "cookies"
    });

    expect(config?.path).toBe(join(__dirname, "package-json", "package.json"));
    expect(config?.config).toStrictEqual({
      we: {
        love: "cookies"
      }
    });
  });
});
