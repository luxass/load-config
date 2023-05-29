# find-config

<p align="center">
  <a href="https://www.npmjs.com/package/@luxass/find-config"><img src="https://img.shields.io/npm/v/@luxass/find-config?style=for-the-badge&color=3FA7D6&label="></a>
<p>

## Install
```bash
npm install @luxass/find-config
```

## Usage

```ts
import type { Loader } from "@luxass/find-config";
import { resolveConfig, resolveConfigSync } from "@luxass/find-config";

const cookieLoader: Loader = {
  filter: /\.cookie$/,
  load: async (path) => {
    return {
      name: "cookie from async loader",
    };
  },
  loadSync: (path) => {
    return {
      name: "cookie from sync loader",
    };
  }
};

await resolveConfig({
  files: [
    "package.json",
    "cookie.json",
    "cookie.js",
    "cookie.ts",
    "cookie.cookie",
  ],
  loaders: [
    cookieLoader
  ],
  cwd: process.cwd(),
  name: "cookie", // used as the packageKey for package.json
}); // { name: "cookie from async loader" }

resolveConfigSync({
  files: [
    "package.json",
    "cookie.json",
    "cookie.js",
    "cookie.ts",
    "cookie.cookie",
  ],
  loaders: [
    cookieLoader
  ],
  cwd: process.cwd(),
  name: "cookie", // used as the packageKey for package.json
}); // { name: "cookie from sync loader" }
```
