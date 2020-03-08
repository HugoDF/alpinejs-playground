// @ts-nocheck
const fs = require("fs").promises;
const critical = require("critical");

const pagesDir = `${__dirname}/../pages`;
const inlineable = ["thank-you.html"];

async function main() {
  const files = (await fs.readdir(pagesDir)).filter(
    f => inlineable.includes(f) && f.endsWith(".html")
  );

  let i = 0;
  const parallelism = 3;
  while (i < files.length) {
    await Promise.all(
      files.slice(i, i + parallelism).map(async f => {
        try {
          const css = await critical.generate({
            base: "pages",
            src: f,
            dimensions: [
              {
                height: 300,
                width: 600
              },
              {
                height: 900,
                width: 1200
              }
            ]
          });
          const file = await fs.readFile(`${pagesDir}/${f}`, "utf8");
          const newHtml = file.replace(
            `
    <link
      href="https://cdn.jsdelivr.net/npm/tailwindcss@1.x.x/dist/tailwind.min.css"
      rel="stylesheet"
    />`,
            `<style>${css}</style>`
          );

          await fs.writeFile(`${pagesDir}/${f}`, newHtml, "utf8");
          console.log("done", f);
        } catch (err) {
          console.error(`${f}: ${err.stack}`);
        }
      })
    );
    i += parallelism;
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
}
