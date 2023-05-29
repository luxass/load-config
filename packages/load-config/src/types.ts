import type { BuildOptions } from "esbuild";

export type Options = {
  /**
   * Working directory
   */
  cwd?: string
  /**
   * Options for esbuild
   */
  esbuild?: BuildOptions

  /**
   * Skip format detection
   */
  isESM?: boolean
};

export type LoadConfigResult<T> = {
  config: T
};
