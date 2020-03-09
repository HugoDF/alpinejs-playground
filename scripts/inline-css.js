// @ts-nocheck
const fs = require("fs").promises;
const { distDir } = require("./config");
const PurgeCSS = require("purgecss").default;
const fetch = require("node-fetch");

const tailwindCachePath = ".tailwind-cache.css";

async function loadTailwind() {
  const cachedVersion = await fs
    .readFile(tailwindCachePath, "utf8")
    .catch(() => {});
  if (cachedVersion) {
    return cachedVersion;
  }
  const css = await fetch(
    "https://cdn.jsdelivr.net/npm/tailwindcss@1.x.x/dist/tailwind.min.css"
  ).then(res => res.text());
  await fs.writeFile(tailwindCachePath, css, "utf8");
  return css;
}
/**
 * inline-css will inline Tailwind CSS rules into HTML files
 * in the ./dist directory
 */
async function main() {
  const files = (await fs.readdir(distDir)).filter(f => f.endsWith(".html"));
  const tailwindCss = await loadTailwind();
  await Promise.all(
    files.map(async f => {
      try {
        const file = await fs.readFile(`${distDir}/${f}`, "utf8");
        const [{ css }] = await new PurgeCSS().purge({
          defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
          // defaultExtractor: content => content.match(/[A-z0-9-:\/]+/g) || [],
          content: [
            {
              raw: file,
              extension: "html"
            }
          ],
          css: [
            {
              raw: tailwindCss,
              extension: "css"
            }
          ]
        });
        const newHtml = file.replace(
          `<link
      href="https://cdn.jsdelivr.net/npm/tailwindcss@1.x.x/dist/tailwind.min.css"
      rel="stylesheet"
    />`,
          `<style>${css}</style>`
        );

        await fs.writeFile(`${distDir}/${f}`, newHtml, "utf8");
        console.log("done", f);
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
