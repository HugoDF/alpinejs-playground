const fs = require("fs").promises;

const pagesDir = `${__dirname}/../pages`;
const indexPath = `${pagesDir}/index.html`;

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

async function main() {
  const pagePaths = (await fs.readdir(pagesDir)).filter(
    n => n.endsWith(".html") && !n.startsWith("index")
  );

  const pages = await Promise.all(
    pagePaths.map(async p => {
      const content = await fs.readFile(`${pagesDir}/${p}`, "utf8");
      const [title] = content.match(/(?<=<title>).*(?=<\/title>)/ims);
      return {
        title: title.replace("Alpine.js Playground - ", "").trim().replace(/\n/g, ''),
        path: p
      };
    })
  );

  await fs.writeFile(indexPath, template(pages), "utf8");
}

const renderPagesToJSObj = pages =>
  pages
    .map(
      ({ title, path }) =>
        `{ title: ${JSON.stringify(title)}, path: '${path}' }`
    )
    .join(",\n");

function template(pages) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta description="Alpine.js Playground - Ready to use Alpine.js examples" />
    <title>Alpine.js Playground</title>
    <link
      href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
      rel="stylesheet"
    />
    <script
      src="https://unpkg.com/alpinejs@2.0.2/dist/alpine.js"
      defer
    ></script>
  </head>

  <body class="flex">
    <div
      x-data="page()"
      class="flex mx-auto flex-col items-center px-32 py-24"
    >
      <h2 class="text-xl font-semibold text-gray-900 mb-8">Alpine.js Playground</h2>
      <div class="text-xs text-gray-500 italic mb-4">Last Updated: ${new Date().toLocaleString('en-GB')}</div>
      <p class="mb-4">Ready to use Alpine.js examples by <a href="https://codewithhugo.com/tags/alpinejs">Hugo</a></p>
      <ul class="list-inside">
        <template x-for="page in pages" :key="page.path">
          <li class="list-disc w-full">
            <a
              class="text-blue-500 hover:text-blue-800 hover:underline"
              :href="'/' + page.path"
              x-text="page.title"
            ></a>
          </li>
        </template>
      </ul>
    </div>
    <script>
      function page() {
        return {
          pages: [${renderPagesToJSObj(pages)}]
        }
      }
    </script>
  </body>
</html>`;
}
