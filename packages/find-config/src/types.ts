export interface Options {
  loaders: Array<Loader>;
}

type MaybeAsync<T> = T | Promise<T>;

export interface Loader {
  filter: RegExp;
  load: () => MaybeAsync<Options>;
}
