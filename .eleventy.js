module.exports = function() {
  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid",
      "js"
    ],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: "./pages",
      data: "../_data",
      output: "dist"
    }
  };
};
