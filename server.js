const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const config = require("./config");
const logger = require("./middlewares/loggerMiddleware");
const apiRoutes = require("./routes/api");
const webhookRoutes = require("./routes/webhook");
const socketService = require('./services/socketService');

const app = express();
const httpServer = require('http').createServer(app);

socketService.init(httpServer);

// Tạo write stream (in append mode) cho request log
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs/request.log"),
  { flags: "a" }
);

// Sử dụng morgan để ghi log tất cả request vào file 'request.log'
app.use(morgan("combined", { stream: accessLogStream }));

// Middleware để xử lý CORS
app.use(cors());

// Middleware để parse JSON body
app.use(express.json());

// Routes
app.use(apiRoutes);
app.use(webhookRoutes);

// Khởi chạy server
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  logger.info(`Server đang chạy trên cổng ${config.port}`);
});
