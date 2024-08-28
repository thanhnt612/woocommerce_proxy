const express = require("express");
const axios = require("axios");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const winston = require("winston");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Thay thế * bằng domain của bạn để bảo mật hơn
    methods: ["GET", "POST"],
  },
});

// Lắng nghe kết nối từ client
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Sử dụng morgan để ghi log tất cả request vào file 'request.log'
app.use(morgan("combined"));

// Middleware để xử lý CORS
app.use(cors());

// Middleware để parse JSON body
app.use(express.json());

// Proxy các yêu cầu tới WooCommerce API
app.use("/api/*", async (req, res) => {
  try {
    const apiPath = req.originalUrl.replace("/api", "");
    const wooCommerceUrl = `${process.env.WOOCOMMERCE_API_BASE_URL}${apiPath}`;

    const params = {
      ...req.query,
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
    };

    const response = await axios({
      method: req.method,
      url: wooCommerceUrl,
      params: params,
      data: req.body,
      headers: { "Content-Type": "application/json" },
    });

    const totalPages = response.headers["x-wp-totalpages"];

    res.status(response.status).json({
      success: response.status === 200,
      data: response.data,
      totalPages: totalPages ? parseInt(totalPages, 10) : 0,
    });
  } catch (error) {
    console.error("Error in proxy:", error.message);
    const status = error.response ? error.response.status : 500;
    const data = error.response
      ? error.response.data
      : { message: "Internal Server Error" };
    res.status(status).json({ success: false, data: data, totalPages: 0 });
  }
});
app.get("/", (req, res) => {
  const currentYear = new Date().getFullYear();
  res.render("index", { title: "Muha Server", year: currentYear });
});
// Endpoint để nhận webhook từ WooCommerce và gửi email
app.post("/webhook-endpoint", (req, res) => {
  const { order_id, billing_email, items, order_total, billing_info } =
    req.body;

  if (!billing_email) {
    return res.status(400).send("Email người nhận không được xác định.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER_NAME,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.USER_NAME,
    to: billing_email,
    subject: `Xác nhận đơn hàng #${order_id}`,
    html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <div style="background-color: #800080; padding: 10px; text-align: center; color: #fff; font-size: 24px;">
               Đơn hàng mới: #${order_id}
            </div>
            <div style="padding: 20px;">
                <p>Bạn đã nhận được đơn hàng từ ${billing_info.first_name} ${
      billing_info.last_name
    }.</p>
                <p>Thứ tự như sau:</p>
                <h2 style="color: #800080;">Đơn hàng #${order_id} (${new Date().toLocaleDateString()})</h2>
                <table width="100%" cellpadding="10" cellspacing="0" border="1" style="border-collapse: collapse; border: 1px solid #ccc;">
                    <thead>
                        <tr>
                            <th align="left">Tên sản phẩm</th>
                            <th align="center">Số lượng</th>
                            <th align="right">Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items
                          .map(
                            (item) => `
                        <tr>
                            <td>${item.name}</td>
                            <td align="center">${item.quantity}</td>
                            <td align="right">${item.total} VND</td>
                        </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" align="right"><strong>Tổng tiền:</strong></td>
                            <td align="right"><strong>${order_total} VND</strong></td>
                        </tr>
                    </tfoot>
                </table>
                <h3>Địa chỉ giao hàng</h3>
                <p>
                    ${billing_info.first_name} ${billing_info.last_name}<br>
                    ${billing_info.address_1}<br>
                    ${billing_info.city}, ${billing_info.postcode}<br>
                    ${billing_info.country}<br>
                    ${billing_info.phone}<br>
                    <a href="mailto:${billing_info.email}">${
      billing_info.email
    }</a>
                </p>
                <p style="margin-top: 20px;">Xin chúc mừng vì đã bán được hàng 🎉</p>
            </div>
        </div>
        `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send("Không thể gửi email");
    }
    res.status(200).send("Email đã được gửi");
  });
});

// Endpoint để nhận đơn hàng mới từ WooCommerce và trả về cho React
app.post("/woocommerce_new_order", (req, res) => {
  const { order_id, billing_email, items, order_total, billing_info } =
    req.body;

  // Gửi dữ liệu đơn hàng tới tất cả các client kết nối qua Socket.io
  io.emit("new_order", {
    order_id,
    billing_email,
    items,
    order_total,
    billing_info,
  });

  res.status(200).json({
    success: true,
    message: "New order received",
  });
});

// Khởi chạy server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
module.exports = app;