export default {
  dirname: __dirname,
  filename: __filename,
  // @ts-expect-error aaaa
  url2: import.meta.urla,
  url: import.meta.url
}
