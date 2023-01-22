import type { Options as SwcOptions } from "@swc/core";
import type { BundleOptions } from "@swc/core/spack";

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
   * Options for spack (swc's bundler)
   */
  spack?: BundleOptions;

  /**
   * Skip format detection
   */
  isESM?: boolean;
}

export interface LoadConfigResult<T> {
  config: T;
}
