const pkg = require("./package.json");

const banner = `/*
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * Homepage - ${pkg.homepage}
 * Released under the ${pkg.license} License, 
 * (c) ${new Date().getFullYear()} ${pkg.author}
 */
`;

module.exports = {
  input: "index.js",
  output: {
    file: "./dist/stats-webgl.js",
    format: "esm",
    banner,
    sourcemap: true,
  },
};
