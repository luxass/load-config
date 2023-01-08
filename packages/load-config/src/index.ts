import { build, type BuildOptions } from "esbuild";

interface Options {
  esbuild: BuildOptions;
}

export async function loadConfig<T = any>(
  path: string,
  options?: Options
): Promise<T> {
  const { esbuild } = options || {};
  const { outputFiles } = await build({
    ...esbuild,
    entryPoints: [path]
  });

  console.log(outputFiles);

  return {} as T;
}
