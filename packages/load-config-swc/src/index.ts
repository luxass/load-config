import { transform } from "@swc/core";

interface Options {}

export async function loadConfig<T = any>(path: string, options: Options): Promise<T> {
  const {
    code
  } = await transform(path, {

  });

  console.log(code);

  return {} as T;
  
}
