# load-config

<p align="center">
  <a href="https://www.npmjs.com/package/@luxass/load-config"><img src="https://img.shields.io/npm/v/@luxass/load-config?style=for-the-badge&color=3FA7D6&label="></a>
<p>

## Install
```bash
npm install @luxass/load-config esbuild
```

## Usage

```ts
import { loadConfig } from "@luxass/load-config";

await loadConfig("typeschema.config.ts", {
  cwd: process.cwd(),
  esbuild: {
    // options for esbuild
  }
}) // { config: { ... }, dependencies: [] }
```
