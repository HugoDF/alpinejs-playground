const fs = require("fs");

const pageDir = `${__dirname}/../pages`;
const args = process.argv.slice(2);
const [name] = args;

const fileName = name.endsWith(".html") ? name : `${name}.html`;

const exampleContent = `---
title: "${fileName}"
template: example.njk
---
<div x-data="{ msg: 'Alpine.js' }">
  <p>Hello <span x-text="msg"></span></p>
</div>`;

fs.writeFileSync(`${pageDir}/${fileName}`, exampleContent, "utf8");
