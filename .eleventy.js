const fs = require('fs');
const yaml = require("js-yaml");
const esbuild = require("esbuild");

function bundle() {
  esbuild.buildSync({
    entryPoints: ['./assets/editor.js'],
    bundle: true,
    outfile: './dist/editor.js',
    minify: process.env.NODE_ENV === 'production'
  })
}

fs.mkdirSync('./dist', {recursive: true});
fs.copyFileSync('./node_modules/alpinejs/dist/alpine.js', './dist/alpine.js');
bundle()

module.exports = function(eleventyConfig) {
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  eleventyConfig.addWatchTarget("./assets");
  eleventyConfig.addTransform('bundle', (content) => {
    bundle();
    return content;
  });

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      // "liquid",
      "js"
    ],
    // markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: "./pages",
      includes: "../_includes",
      data: "../_data",
      output: "dist"
    }
  };
};
