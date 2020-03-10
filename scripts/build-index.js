const fs = require("fs").promises;
const { pkg, pagesDir, indexPath } = require("./config");

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
function getCommit() {
  return process.env.REPOSITORY_URL && process.env.COMMIT_REF
    ? {
        url: `${process.env.REPOSITORY_URL}/commits/${process.env.COMMIT_REF}`,
        text: process.env.COMMIT_REF.slice(0, 6)
      }
    : {
        url: "",
        text: "develop"
      };
}
const hiddenPages = ["index", "thank-you"];
async function main() {
  const pagePaths = (await fs.readdir(pagesDir)).filter(
    n => n.endsWith(".html") && !hiddenPages.some(p => n.startsWith(p))
  );

  const pages = await Promise.all(
    pagePaths.map(async p => {
      const content = await fs.readFile(`${pagesDir}/${p}`, "utf8");
      const [title] = content.match(/(?<=<title>).*(?=<\/title>)/ims);
      return {
        title: title
          .replace("Alpine.js Playground - ", "")
          .trim()
          .replace(/\n/g, ""),
        path: p.replace(".html", "")
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
  const commit = getCommit();
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Alpine.js Playground - ${
      pkg.description
    }" />
    <title>Alpine.js Playground</title>
    <link
      href="https://cdn.jsdelivr.net/npm/tailwindcss@1.x.x/dist/tailwind.min.css"
      rel="stylesheet"
    />
    <script
      src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@2.x.x/dist/alpine.min.js"
      defer
    ></script>
  </head>

  <body class="flex">
    <div
      x-data="page()"
      class="flex mx-auto flex-col items-center px-8 md:px-32 py-24"
    >
      <h2 class="text-xl font-semibold text-gray-900 mb-8">Alpine.js Playground</h2>
      <div class="text-xs text-gray-500 italic mb-4">Last update: <a
        class="text-blue-300 hover:text-blue-600 hover:underline"
        href="${commit.url}"
      >${commit.text}</a>
      </div>
      <p class="mb-4">${
        pkg.description
      } by <a class="text-blue-500 hover:text-blue-800 hover:underline" href="https://codewithhugo.com/tags/alpinejs">Hugo</a></p>
      <ul class="list-inside mb-8">
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

      <form
        action="https://buttondown.email/api/emails/embed-subscribe/alpinejs"
        method="post"
        target="popupwindow"
        onsubmit="window.open('https://buttondown.email/alpinejs', 'popupwindow')"
        class="flex md:w-4/5 md:p-10 flex-col rounded mb-4 embeddable-buttondown-form"
      >
        <label
          class="flex text-gray-700 font-semibold mb-2 text-sm"
          for="bd-email"
        >
          Subscribe to Alpine.js Weekly
        </label>
        <p class="leading-relaxed flex text-sm mb-4">A free, once–weekly email roundup of Alpine.js news and articles.</p>
        <input
          placeholder="calebporzio@alpinejs.org"
          class="flex mb-2 bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 appearance-none leading-normal"
          type="email"
          name="email"
          id="bd-email"
          required="required"
        />
        <input type="hidden" value="1" name="embed" />
        <input
          class="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
          value="Subscribe"
        />
      </form>
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
