const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    wooCommerceSites: {
      wp_dev: {
        baseUrl: process.env.WOOCOMMERCE_SITE1_BASE_URL,
        consumerKey: process.env.WOOCOMMERCE_SITE1_CONSUMER_KEY,
        consumerSecret: process.env.WOOCOMMERCE_SITE1_CONSUMER_SECRET,
      },
      wp_seo: {
        baseUrl: process.env.WOOCOMMERCE_SITE2_BASE_URL,
        consumerKey: process.env.WOOCOMMERCE_SITE2_CONSUMER_KEY,
        consumerSecret: process.env.WOOCOMMERCE_SITE2_CONSUMER_SECRET,
      },
      // Thêm các site khác tương tự
    },
    port: process.env.PORT || 5000,
  };
  