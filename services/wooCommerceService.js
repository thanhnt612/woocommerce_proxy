const axios = require('axios');
const config = require('../config');

const wooCommerceService = {
  async proxyRequest(site, apiPath, method, params, data) {
  
    
    const siteConfig = config.wooCommerceSites[site];

    if (!siteConfig) {
      throw new Error(`Configuration for site ${site} not found`);
    }

    const url = `${siteConfig.baseUrl}${apiPath}`;
    console.log(url,'url');
    
    return await axios({
      method: method,
      url: url,
      params: {
        ...params,
        consumer_key: siteConfig.consumerKey,
        consumer_secret: siteConfig.consumerSecret,
      },
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

module.exports = wooCommerceService;
