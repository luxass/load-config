import { readFile, unlink, writeFile } from "node:fs/promises";
import { builtinModules, createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { find } from "elysius";

import { bundle, transform } from "@swc/core";

import type { Options } from "./types";

const _require = createRequire(import.meta.url);

const dirnameVarName = "__original_dirname";
const filenameVarName = "__original_filename";
const importMetaUrlVarName = "__original_import_meta_url";

// @ts-expect-error - jest is only defined inside Jest.
const isUsingJest = typeof jest === "undefined";

export async function loadConfig<T = any>(
  resolvedPath: string,
  options?: Options
): Promise<T> {
  const { swc, spack, cwd } = options || {};
  let isESM = options?.isESM || false;
  if (typeof options?.isESM === "undefined") {
    if (/\.m[jt]s$/.test(resolvedPath)) {
      isESM = true;
    } else if (/\.c[jt]s$/.test(resolvedPath)) {
      isESM = false;
    } else {
      try {
        const packagePath = await find("package.json");

        isESM =
          !!packagePath &&
          JSON.parse(await readFile(packagePath, "utf-8")).type === "module";
      } catch (e) {}
    }
  }
  const resolvedUrlPath = pathToFileURL(resolvedPath);
  const injectValues =
    `const ${dirnameVarName} = ${JSON.stringify(
      path.dirname(resolvedUrlPath.pathname)
    )};` +
    `const ${filenameVarName} = ${JSON.stringify(resolvedUrlPath.pathname)};` +
    `const ${importMetaUrlVarName} = ${JSON.stringify(resolvedUrlPath.href)};`;

  const bundleResult = await bundle({
    ...spack,
    workingDir: cwd || process.cwd(),
    entry: {
      main: resolvedPath
    },
    output: {
      name: "load-config-output",
      path: "load-config-output.js"
    },
    module: {},
    externalModules: [
      ...(spack?.externalModules || []),
      ...builtinModules,
      ...builtinModules.map((name) => `node:${name}`)
    ]
  });

  // spack extracts import.meta.url into a object that
  // hold both url, and main.
  // so we replace importMeta.url with __original_import_meta_url
  // and importMeta.main with ''. <- to remove it from the config file.

  const bundleCode = bundleResult.main.code
    .replaceAll(
      /(^|[^\w.])import\.meta\.url($|[^\w.])/gm,
      `$1${importMetaUrlVarName}$2`
    )
    .replaceAll(
      /(^|[^\w.])importMeta\.url($|[^\w.])/gm,
      `$1${importMetaUrlVarName}$2`
    )
    .replaceAll(/(^|[^\w.])import\.meta\.main($|[^\w.])/gm, "''");

  const { code } = await transform(bundleCode, {
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
              ...swc?.jsc?.transform?.optimizer?.globals?.vars,
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
      preserveImportMeta: false,
      strictMode: false
    }
  });

  const file = `${resolvedPath}.timestamp-${Date.now()}.${
    isESM ? "mjs" : "cjs"
  }`;

  await writeFile(file, injectValues + code);
  let config;

  const requireFn = isUsingJest ? (file: string) => import(file) : _require;
  try {
    const r = await requireFn(pathToFileURL(file).pathname);
    config = r.default || r;
  } finally {
    await unlink(file);
  }
  return config && config.default ? config.default : config;
}
