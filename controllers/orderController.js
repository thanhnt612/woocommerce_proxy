const socketService = require('../services/socketService');
const logger = require('../middlewares/loggerMiddleware');

const orderController = {
  handleNewOrder(req, res) {
    try {
      const orderDetails = req.body;
      logger.info(`Received new order: ${JSON.stringify(orderDetails)}`);

      socketService.emitNewOrder(orderDetails);

      res.status(200).json({
        success: true,
        message: "New order received",
      });
    } catch (error) {
      logger.error(`Error processing new order: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Failed to process new order",
      });
    }
  }
};

module.exports = orderController;
