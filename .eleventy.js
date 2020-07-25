const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));
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
