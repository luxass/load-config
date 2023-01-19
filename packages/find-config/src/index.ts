import { createRequire } from "node:module";
import { basename } from "node:path";

import { find, findSync } from "elysius";

import type { ConfigResult, Loader, Options } from "./types";

const _require = createRequire(import.meta.url);

const tester = (file: string, name: string) => {
  const baseName = basename(file);
  if (baseName !== "package.json") {
    return true;
  }
  const content = _require(file);
  if (content[name]) {
    return true;
  }
  return false;
};

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
    const file = await find(files, {
      cwd,
      test: (file) => tester(file, name)
    });
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
    const file = findSync(files, {
      cwd,
      test: (file) => tester(file, name)
    });

    if (file) {
      const loader = loaders.find((loader) => loader.filter.test(file));

      if (!loader) {
        return {
          path: file,
          config: null
        };
      }

      if (
        Object.getPrototypeOf(loader.load).constructor.name ===
          "AsyncFunction" &&
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

export { ConfigResult, Loader, Options };
