import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { resolveConfigSync } from "../src";
import { cookieLoader, cookieLoaderWithSync } from "./cookie-loaders";

describe("resolve config with loaders", () => {
  test("resolve correctly", () => {
    const config = resolveConfigSync({
      loaders: [cookieLoaderWithSync],
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

  test("return config null if using async loader inside resolveConfigSync", () => {
    const config = resolveConfigSync({
      loaders: [cookieLoader],
      cwd: join(__dirname, "loaders"),
      files: ["package.json", "config.cookie"],
      name: "cookies"
    });

    expect(config?.path).toBe(join(__dirname, "loaders", "config.cookie"));
    expect(config?.config).toBeNull();
  });
});

describe("multiple", () => {
  test("resolve correctly", () => {
    const config = resolveConfigSync<{ lines: string[] }>({
      loaders: [cookieLoaderWithSync],
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
  test("find `cookies` in package.json", () => {
    const config = resolveConfigSync<{ lines: string[] }>({
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
