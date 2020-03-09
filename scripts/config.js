const pkg = require("../package.json");
const pagesDir = `${__dirname}/../pages`;
const distDir = `${__dirname}/../dist`;
const indexPath = `${distDir}/index.html`;
module.exports = {
  pkg,
  pagesDir,
  distDir,
  indexPath
};
