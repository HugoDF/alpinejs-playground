const PurgeCSS = require("purgecss").default;
const opts = require('./options')
const loadRemoteStyleSheet = require('./loadRemoteStyleSheet');

const styleLinkRegex = /<link[^>]*rel="stylesheet"[^>]*>/gm;
const extractHrefRegex = /(?<=href=").*(?=")/gm;

/**
 * Inline CSS rules from CDN/remote includes into HTML
 * @param {string} html - HTML document string into which to inline remote CSS
 * @param {object} options - Inline CSS options
 * @returns {Promise<string>}
 */

async function inlineCss(html, options = opts()) {
  // 1. Extract stylesheet URLs from document as string
  const linkTags = html.match(styleLinkRegex);

  // 1.1 only if links are in the document
  if (!linkTags || linkTags.length === 0) {
    console.warn('HTML did not contain any link tags')
    return html
  }

  // @todo 1.2 only if there's a `href`, only if
  const styleSheetUrls = linkTags.map(t => t.match(extractHrefRegex)[0]);
  // 2. Fetch styleSheet by url
  const styleSheetContents = await Promise.all(
    styleSheetUrls.map(url => loadRemoteStyleSheet(url, options))
  );
  // @todo cache Purge output using `styleSheets.url` + HTML content
  // 3. inject as CSS contents in PurgeCSS config
  const purgeResult = await new PurgeCSS().purge({
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    content: [
      {
        raw: html,
        extension: "html"
      }
    ],
    css: styleSheetContents.map(css => ({
      raw: css,
      extension: "css"
    }))
  });

  // 4. create a "url" -> purgedCSS map
  const urlToCss = purgeResult.reduce((acc, { css }, i) => {
    const styleSheetUrl = styleSheetUrls[i];
    acc[styleSheetUrl] = css;
    return acc;
  }, {});

  // 5. replace <link> tags with correct CSS in <style> tags
  return html.replace(styleLinkRegex, linkTag => {
    // 5.1. find relevant CSS based on linkTag.match(extractHrefRegex)
    // & url -> CSS map
    const [linkHref] = linkTag.match(extractHrefRegex);
    const css = urlToCss[linkHref];
    return `<style>${css}</style>`;
  });
}

module.exports = inlineCss
