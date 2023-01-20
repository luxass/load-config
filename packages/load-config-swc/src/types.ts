import type { Options as SwcOptions } from "@swc/core";

export interface Options {
  /**
   * Working directory
   */
  cwd?: string;
  /**
   * Options for swc
   */
  swc?: SwcOptions;

  /**
   * Skip format detection
   */
  isESM?: boolean;
}

export interface LoadConfigResult<T> {
  config: T;
  dependencies: string[];
}
