// @ts-nocheck
const fs = require("fs").promises;
const { distDir } = require("../config");
const inlineCss = require("./inline-css");
let glob = require("glob");
const { promisify } = require("util");
glob = promisify(glob);

/**
 * Inline CSS CLI
 */
async function main() {
  const paths = await glob(`${distDir}/**/*.html`);
  await Promise.all(
    paths.map(async (path) => {
      try {
        console.time(path);
        // Read file
        const initialHtml = await fs.readFile(path, "utf8");
        // Run transform
        const newHtml = await inlineCss(initialHtml);
        // Write back to file
        await fs.writeFile(path, newHtml, "utf8");
        console.timeEnd(path);
      } catch (err) {
        console.error(`${path}: ${err.stack}`);
      }
    })
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
}
