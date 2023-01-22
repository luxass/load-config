# load-config-swc 

> NEEDS MORE TESTING BEFORE A RELEASE

<p align="center">
  <a href="https://www.npmjs.com/package/@luxass/load-config-swc"><img src="https://img.shields.io/npm/v/@luxass/load-config-swc?style=for-the-badge&color=3FA7D6&label="></a>
<p>

## Install
```bash
npm install @luxass/load-config-swc @swc/core
```

## Usage

```ts
import { loadConfig } from "@luxass/load-config-swc";

await loadConfig("typeschema.config.ts", {
  cwd: process.cwd(),
  swc: {
    // options for swc
  }
}) // { ... }
```
