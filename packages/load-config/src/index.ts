import { readFile, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { find } from "elysius";
import { build } from "esbuild";

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
  const { esbuild, cwd } = options || {};
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
  const format = isESM ? "esm" : "cjs";
  const result = await build({
    ...esbuild,
    entryPoints: [resolvedPath],
    absWorkingDir: cwd || process.cwd(),
    outfile: "out.js",
    format,
    platform: "node",
    target: ["node16"],
    sourcemap: "inline",
    bundle: true,
    metafile: true,
    write: false,
    define: {
      ...esbuild?.define,
      "__dirname": dirnameVarName,
      "__filename": filenameVarName,
      "import.meta.url": importMetaUrlVarName
    },
    plugins: [
      {
        name: "inject-file-scopes",
        setup(build) {
          build.onLoad({ filter: /\.[cm]?[jt]s$/ }, async (args) => {
            const contents = await readFile(args.path, "utf-8");
            const injectValues =
              `const ${dirnameVarName} = ${JSON.stringify(
                path.dirname(args.path)
              )};` +
              `const ${filenameVarName} = ${JSON.stringify(args.path)};` +
              `const ${importMetaUrlVarName} = ${JSON.stringify(
                pathToFileURL(args.path).href
              )};`;

            return {
              contents: injectValues + contents,
              loader: args.path.endsWith("ts") ? "ts" : "js"
            };
          });
        }
      },
      {
        name: "externalize",
        setup(build) {
          build.onResolve(
            {
              filter: /.*/
            },
            async (args) => {
              console.log(args);

              if (args.path[0] === "." || path.isAbsolute(args.path)) {
                return;
              }

              return {
                external: true
              };
            }
          );
        }
      }
    ]
  });

  const dependencies = Object.keys(result.metafile?.inputs || {});
  const { text } = result.outputFiles[0];

  const file = `${resolvedPath}.timestamp-${Date.now()}.${
    isESM ? "mjs" : "cjs"
  }`;

  await writeFile(file, text);
  let config;

  const requireFn = isUsingJest ? (file: string) => import(file) : _require;
  try {
    const r = await requireFn(pathToFileURL(file).pathname);
    config = r.default || r;
  } finally {
    await unlink(file);
  }
  return {
    config: config && config.default ? config.default : config,
    dependencies
  };
}

export type { Options };
