module.exports = function(eleventyConfig) {
  // Pass through CMS admin and media
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("public");
  
  // Pass through ALL original website folders and assets - DO NOT PROCESS THROUGH ELEVENTY
  // This ensures the cloned site pages work exactly as they were
  const originalFolders = [
    "32049-2", "7-reasons-why-you-should-work-with-a-realtor", "about-us", "action",
    "add-listing-2", "agencies", "agency-action-category", "agency-area", "agency-category",
    "agency-city", "agency-county", "agent-action", "agent-area", "agent-city", "agents",
    "agent_listings", "all-listings-3", "april-2022-commercial-market-insight", "area",
    "author-profile-2", "blog-list-shortcodes-2", "blog-list-sidebar-right", "blogs", "cart",
    "category", "city", "comments", "contact-form", "contact-us", "dashboard-2",
    "dashboard-add-property", "dashboard-profile-page", "developer-action-category", "developer-area",
    "developer-category", "developer-city", "developer-county", "developers", "directory",
    "elementor-home-v4", "elementor-home-v5", "elementor-home-v6", "elementor-homepage-2",
    "elementor-homepage-v3", "estate_agency", "estate_developer", "events",
    "existing-home-sales-slid-5-4-in-june", "featured-agents", "featured-article",
    "featured-developer-agency", "featured-property", "feed", "florida-realtors-work-to-defeat-rent-control",
    "grid-builder", "half-map-radius-search", "heres-this-weeks-commloan-commercial-rate-snaps",
    "heres-this-weeks-commloan-commercial-rate-snapshot", "heres-this-weeks-commloan-commercial-rate-snapshot-2",
    "home-page-2016", "homepage-elementor", "homepage-v2", "homepage-with-map", "image", "inquiry-form",
    "latest-news-from-nar", "latest-news-from-nar-2", "lead-generation-form", "listings", "listings-by-user",
    "membership-packages-shortcode-2", "off-market-2-bed-2-5-bath-1400sqft-1400-square-",
    "off-market-3-bed-3-bath-1184sqft-1184-square-fe", "off-market-4-bed-2-5-bath-3239sqft-3239-square-",
    "off-market-4-bed-3-bath-1724sqft-1724-square-fe", "OPR", "our-agents", "properties",
    "properties-carousel", "properties-list-just-featured", "properties-list-sidebar-left",
    "properties-list-with-ajax-filters", "property-list-directory-design", "property-submit-front",
    "property_features", "property_status", "recent-items", "register-and-login-forms", "revslider",
    "selling-your-home-during-the-holidays", "services", "sign-in-2", "single-category-2",
    "single-location-2", "single-map-with-pins", "splash-page", "split-level-home-sold", "state",
    "tag", "taxonomy-grid-and-carousels", "terms-and-coditions", "testimonials", "update",
    "wp-admin", "wp-content", "wp-includes", "wp-json", "wpestate-crm-contact-status",
    "wpestate-crm-lead-status", "*.html", "*.php"
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
