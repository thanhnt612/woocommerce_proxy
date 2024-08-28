const mailService = require('../services/mailService');
const logger = require('../middlewares/loggerMiddleware');

const webhookController = {
  handleWebhook(req, res) {
    try {
      const orderDetails = req.body;
      logger.info(`Received order: ${JSON.stringify(orderDetails)}`);
      
      mailService.sendOrderConfirmationEmail(orderDetails);
      res.status(200).send("Email đã được gửi");
    } catch (error) {
      logger.error(`Error processing webhook: ${error.message}`);
      res.status(500).send("Không thể xử lý webhook");
    }
  }
};

module.exports = webhookController;
