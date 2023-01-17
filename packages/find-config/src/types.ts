export interface ConfigResult<T> {
  path: string;
  config: T | null;
}

export interface Options {
  files: string[];
  loaders?: Array<Loader>;
  cwd: string;
  name: string;
}

type MaybeAsync<T> = T | Promise<T>;

export interface Loader {
  filter: RegExp;
  load(path: string, name: string): MaybeAsync<any>;
  loadSync?(path: string, name: string): any;
}
