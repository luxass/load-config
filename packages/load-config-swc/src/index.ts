import { readFile } from "fs/promises";

import { transform } from "@swc/core";

interface Options {}

export async function loadConfig<T = any>(
  path: string,
  options: Options
): Promise<T> {
  let content = await readFile(path, "utf-8");
  // content = content.replace(/import\.meta\.url/g, JSON.stringify("http://api.example.com"));
  content = `
    import.meta.url = "http://api.example.com";
    const __dirname = "http://api.example.com";
    ${content}
  `;
  console.log(content);
  
  const { code } = await transform(content, {
    filename: "conf.ts",

    jsc: {
      parser: {
        syntax: "typescript",
        dynamicImport: true
      },
      transform: {
        optimizer: {
          globals: {
            vars: {
              // "import.meta.url": "'http://api.example.com'"
              // "import.meta.url": "JSON.stringify('http://api.example.com')",
              __dirname: JSON.stringify("http://api.example.com")
            }
          }
        }
      },
      baseUrl: "./",
      target: "es2021",
      keepClassNames: true
    },
    sourceMaps: "inline",
    inlineSourcesContent: true,
    isModule: true,
    module: {
      type: "es6",
      ignoreDynamic: false
    }
  });

  console.log(code);

  return {} as T;
}
