const fs = require("fs").promises;
const fetch = require("node-fetch");
const opts = require("./options");

const inMemory = new Map();

const cache = {
  async set(key, value) {
    inMemory.set(key, value);
    await fs.writeFile(key, value, "utf8");
  },
  async get(key, options) {
    const cachedVersion =
      inMemory.get(key) ||
      (await fs
        .readFile(key, "utf8")
        // No cache for resource, init the directory, if it doesn't exist
        .catch(() => fs.mkdir(options.cachePath).catch(() => {})));

    inMemory.set(key, cachedVersion);

    return cachedVersion;
  },
};

/**
 * Load & cache (to fs) remote stylesheets
 * @param {string} url - Stylesheet URL to load
 * @param {object} options
 * @param {boolean} options.noCache - Whether to use existing cache
 * @param {boolean} options.cachePath - Where to store the cache
 */
async function loadRemoteStyleSheet(url, options = opts()) {
  const { noCache, cachePath } = options;
  const styleSheetCachePath = `${cachePath}/${Buffer.from(url).toString(
    "base64"
  )}`;
  // cache enabled by default
  if (!noCache) {
    const cachedVersion = await cache.get(styleSheetCachePath, options);
    if (cachedVersion) {
      return cachedVersion;
    }
  }

  const css = await fetch(url).then((res) => res.text());
  // Cache loaded resource
  await cache.set(styleSheetCachePath, css);

  return css;
}

module.exports = loadRemoteStyleSheet;
