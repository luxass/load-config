module.exports = {
  extends: "@luxass",
  overrides: [
    {
      files: ["*.cookie"],
      parser: "jsonc-eslint-parser"
    }
  ]
};
