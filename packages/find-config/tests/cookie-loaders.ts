import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

import type { Loader } from "../src";

export const cookieLoader: Loader = {
  filter: /.cookie$/,
  async load(filepath) {
    return JSON.parse(await readFile(filepath, "utf-8"));
  }
};

export const cookieLoaderWithSync: Loader = {
  filter: /.cookie$/,
  async load(filepath) {
    return JSON.parse(await readFile(filepath, "utf-8"));
  },
  loadSync(filepath) {
    return JSON.parse(readFileSync(filepath, "utf-8"));
  }
};
