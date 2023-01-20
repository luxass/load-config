import { readFile, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { find } from "elysius";

import { transform } from "@swc/core";

import type { LoadConfigResult, Options } from "./types";

const _require = createRequire(import.meta.url);

const dirnameVarName = "__original_dirname";
const filenameVarName = "__original_filename";
const importMetaUrlVarName = "__original_import_meta_url";

// @ts-expect-error - jest is only defined inside Jest.
const isUsingJest = typeof jest === "undefined";

export async function loadConfig<T = any>(
  resolvedPath: string,
  options?: Options
): Promise<LoadConfigResult<T>> {
  const { swc, cwd } = options || {};
  let isESM = options?.isESM || false;
  if (!options?.isESM) {
    if (/\.m[jt]s$/.test(resolvedPath)) {
      isESM = true;
    } else if (/\.c[jt]s$/.test(resolvedPath)) {
      isESM = false;
    } else {
      try {
        const packagePath = await find("package.json", { cwd: resolvedPath });

        isESM =
          !!packagePath &&
          JSON.parse(await readFile(packagePath, "utf-8")).type === "module";
      } catch (e) {}
    }
  }
  const content = await readFile(resolvedPath, "utf-8");

  const injectValues =
    `var ${dirnameVarName} = ${JSON.stringify(path.dirname(resolvedPath))};` +
    `var ${filenameVarName} = ${JSON.stringify(resolvedPath)};` +
    `var ${importMetaUrlVarName} = ${JSON.stringify(
      pathToFileURL(resolvedPath).href
    )};`;

  const { code } = await transform(content, {
    ...swc,
    cwd: cwd || process.cwd(),
    jsc: {
      parser: {
        syntax: "typescript"
      },
      transform: {
        optimizer: {
          globals: {
            vars: {
              __dirname: dirnameVarName,
              __filename: filenameVarName
            }
          }
        }
      },
      target: "es2021"
    },
    sourceMaps: "inline",
    inlineSourcesContent: true,
    isModule: true,
    module: {
      type: isESM ? "es6" : "commonjs",
      preserveImportMeta: true,
      strictMode: false
    },
    outputPath: resolvedPath
  });

  const file = `${resolvedPath}.timestamp-${Date.now()}.${
    isESM ? "mjs" : "js"
  }`;

  await writeFile(
    file,
    injectValues +
      code.replaceAll(
        /(^|[^\w.])import\.meta\.url($|[^\w.])/gm,
        `$1${importMetaUrlVarName}$2`
      )
  );
  let config;

  const requireFn = isUsingJest ? (file: string) => import(file) : _require;

  try {
    const r = await requireFn(file);
    config = r.default || r;
  } finally {
    await unlink(file);
  }
  return {
    config: config && config.default ? config.default : config,
    dependencies: []
  };
}
