const wooCommerceService = require('../services/wooCommerceService');
const logger = require('../middlewares/loggerMiddleware');

const proxyController = {
  async handleProxyRequest(req, res) {
    try {
      const apiPath = req.originalUrl.replace("/api", "");
      const site = req.query.site || req.body.site;

      console.log(`contected to ${site}`);
      
      if (!site) {
        return res.status(400).json({ success: false, message: 'Site is required' });
      }

      const response = await wooCommerceService.proxyRequest(site, apiPath, req.method, req.query, req.body);

      const totalPages = response.headers["x-wp-totalpages"];
      res.status(response.status).json({
        success: response.status === 200,
        data: response.data,
        totalPages: totalPages ? parseInt(totalPages, 10) : 0,
      });
    } catch (error) {
      logger.error(`Error in proxy: ${error.message}`, {
        stack: error.stack,
        config: error.config,  // thông tin cấu hình request
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        } : 'No response'
      });

      const status = error.response ? error.response.status : 500;
      const data = error.response ? error.response.data : { message: "Internal Server Error" };

      res.status(status).json({ success: false, data: data, totalPages: 0 });
    }
  }
};

module.exports = proxyController;

