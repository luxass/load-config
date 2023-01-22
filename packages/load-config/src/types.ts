import type { BuildOptions } from "esbuild";

export interface Options {
  /**
   * Working directory
   */
  cwd?: string;
  /**
   * Options for esbuild
   */
  esbuild?: BuildOptions;

  /**
   * Skip format detection
   */
  isESM?: boolean;
}

export interface LoadConfigResult<T> {
  config: T;
}
