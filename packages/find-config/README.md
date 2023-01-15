# load-config

<p align="center">
  <a href="https://www.npmjs.com/package/@luxass/find-config"><img src="https://img.shields.io/npm/v/@luxass/find-config?style=for-the-badge&color=3FA7D6&label="></a>
<p>

## Install
```bash
npm install @luxass/find-config
```

## Usage

```ts
import { findConfig } from "@luxass/find-config";

await findConfig({
  loaders: [
    {
      filter: /\.json$/,
      loader: async (path) => {
        
      }
    }
  ]
})

```
