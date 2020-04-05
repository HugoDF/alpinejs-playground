// @ts-nocheck
const fs = require("fs").promises;
const { distDir } = require("../config");
const inlineCss = require('./inline-css')

/**
 * Inline CSS CLI
 */
async function main() {
  const files = (await fs.readdir(distDir)).filter(f => f.endsWith(".html"));
  await Promise.all(
    files.map(async f => {
      try {
        console.time(f);
        const filePath = `${distDir}/${f}`
        // Read file
        const initialHtml = await fs.readFile(filePath, "utf8");
        // Run transform
        const newHtml = await inlineCss(initialHtml);
        // Write back to file
        await fs.writeFile(filePath, newHtml, "utf8");
        console.timeEnd(f);
      } catch (err) {
        console.error(`${f}: ${err.stack}`);
      }
    })
  );
}

if (require.main === module) {
  main().catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
}
