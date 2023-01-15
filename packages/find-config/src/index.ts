import { statSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, extname, parse, resolve } from "node:path";

import type { ConfigResult, Loader, Options } from "./types";

const customRequire = createRequire(import.meta.url);

export async function resolveConfig<T = any>(
  options: Options
): Promise<ConfigResult<T> | null> {
  const { cwd, files, loaders: _loaders, name } = options;
  const loaders: Array<Loader> = [
    {
      filter: /\.+/,
      async load(file, name) {
        const base = extname(file);
        if (base === ".js" || base === ".cjs") {
          return customRequire(file);
        }
        const content = customRequire(file);

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
      const loader = (loaders || []).find((loader) => loader.filter.test(file));
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
      filter: /\.+/,
      load(file, name) {
        const base = extname(file);
        if (base === ".js" || base === ".cjs") {
          return customRequire(file);
        }
        const content = customRequire(file);

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
      const loader = (loaders || []).find((loader) => loader.filter.test(file));
      if (!loader) {
        return {
          path: file,
          config: null
        };
      }

      const config = loader.load(file, name);
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
          const content = customRequire(file);
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
          const content = customRequire(file);
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
