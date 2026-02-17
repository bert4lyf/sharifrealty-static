module.exports = function(eleventyConfig) {
  // Pass through CMS admin and media
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("public");
  
  // Pass through original website folders and assets
  const originalFolders = [
    "about-us", "agencies", "agents", "blogs", "contact-us", "dashboard-2",
    "events", "feed", "image", "properties", "public", "testimonials",
    "wp-content", "wp-admin", "wp-includes", "wp-json",
    "*.html", "*.php"
  ];
  
  originalFolders.forEach(folder => {
    eleventyConfig.addPassthroughCopy(folder);
  });
  
  // Watch for changes to config
  eleventyConfig.addWatchTarget("admin/config.yml");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"],
    pathPrefix: "/"
  };
};
