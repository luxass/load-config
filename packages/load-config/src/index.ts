import { build } from "esbuild";

interface Options {}

export async function loadConfig<T = any>(path: string, options?: Options): Promise<T> {
  const { outputFiles } = await build({

  });

  console.log(outputFiles);
  
  return {} as T;
}
