import { statSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, parse, resolve } from "node:path";

import type { ConfigResult, Loader, Options } from "./types";

const _require = createRequire(import.meta.url);

export async function resolveConfig<T = any>(
  options: Options
): Promise<ConfigResult<T> | null> {
  const { cwd, files, loaders: _loaders, name } = options;
  const loaders: Array<Loader> = [
    {
      filter: /\.json$/,
      async load(file, name) {
        const content = _require(file);

        if (content[name]) {
          return content[name];
        }
        return content;
      }
    }
  ];
  if (_loaders) {
    loaders.unshift(..._loaders);
  }

  try {
    const file = await find(cwd, files, name);
    if (file) {
      const loader = loaders.find((loader) => loader.filter.test(file));
      if (!loader) {
        return {
          path: file,
          config: null
        };
      }

      const config = await loader.load(file, name);
      return {
        path: file,
        config
      };
    }
  } catch (e) {
    console.log(e);
  }
  return null;
}

export function resolveConfigSync<T = any>(
  options: Options
): ConfigResult<T> | null {
  const { cwd, files, loaders: _loaders, name } = options;
  const loaders: Array<Loader> = [
    {
      filter: /\.json$/,
      load(file, name) {
        const content = _require(file);

        if (content[name]) {
          return content[name];
        }
        return content;
      }
    }
  ];

  if (_loaders) {
    loaders.unshift(..._loaders);
  }

  try {
    const file = findSync(cwd, files, name);

    if (file) {
      const loader = loaders.find((loader) => loader.filter.test(file));

      if (!loader) {
        return {
          path: file,
          config: null
        };
      }

      if (
        Object.getPrototypeOf(loader.load).constructor.name === "AsyncFunction" &&
        !loader.loadSync
      ) {
        console.error("You are using a async loader in sync mode.");
        console.error(
          "Please use a `loadSync` or use resolveConfig instead of resolveConfigSync."
        );
        return {
          path: file,
          config: null
        };
      }

      const config = (loader.loadSync || loader.load)(file, name);
      return {
        path: file,
        config
      };
    }
  } catch (e) {
    console.log(e);
  }
  return null;
}

async function find(
  dir: string,
  names: string[],
  pkgKey: string
): Promise<string | null> {
  const root = parse(dir).root;
  while (dir !== root) {
    for (const name of names) {
      const file = resolve(dir, name);
      try {
        const stats = await stat(file);
        if (stats.isFile()) {
          const baseName = basename(file);
          if (baseName !== "package.json") {
            return file;
          }
          const content = _require(file);
          if (content[pkgKey]) {
            return file;
          }
        }
      } catch (e) {
        if (e.code !== "ENOENT") {
          throw e;
        }
      }
    }
    dir = parse(dir).dir;
  }
  return null;
}

function findSync(dir: string, names: string[], pkgKey: string): string | null {
  const root = parse(dir).root;
  while (dir !== root) {
    for (const name of names) {
      const file = resolve(dir, name);
      try {
        const stats = statSync(file);
        if (stats.isFile()) {
          const baseName = basename(file);
          if (baseName !== "package.json") {
            return file;
          }
          const content = _require(file);
          if (content[pkgKey]) {
            return file;
          }
        }
      } catch (e) {
        if (e.code !== "ENOENT") {
          throw e;
        }
      }
    }
    dir = parse(dir).dir;
  }
  return null;
}

export { ConfigResult, Loader, Options };
