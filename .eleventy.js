module.exports = function(eleventyConfig) {
  // Pass through admin, media, and static assets
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("public");
  
  // Watch for changes to config
  eleventyConfig.addWatchTarget("admin/config.yml");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"]
  };
};
