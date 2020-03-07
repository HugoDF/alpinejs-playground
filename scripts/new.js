const fs = require("fs");

const pageDir = `${__dirname}/../pages`;
const args = process.argv.slice(2);
const [name] = args;

const fileName = name.endsWith(".html") ? name : `${name}.html`;

const exampleContent = fs.readFileSync(
  `${pageDir}/example-template.html`,
  "utf8"
);
fs.writeFileSync(`${pageDir}/${fileName}`, exampleContent, "utf8");
