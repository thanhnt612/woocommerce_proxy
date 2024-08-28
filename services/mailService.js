const transporter = require('../config/mailConfig');
const logger = require('../middlewares/loggerMiddleware');

const mailService = {
  sendOrderConfirmationEmail(orderDetails) {
    const { order_id, billing_email, items, order_total, billing_info } = orderDetails;

    const mailOptions = {
      from: process.env.USER_NAME,
      to: billing_email,
      subject: `Xác nhận đơn hàng #${order_id}`,
      html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <div style="background-color: #800080; padding: 10px; text-align: center; color: #fff; font-size: 24px;">
               Đơn hàng mới: #${order_id}
            </div>
            <div style="padding: 20px;">
                <p>Bạn đã nhận được đơn hàng từ ${billing_info.first_name} ${billing_info.last_name}.</p>
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
                    <a href="mailto:${billing_info.email}">${billing_info.email}</a>
                </p>
                <p style="margin-top: 20px;">Xin chúc mừng vì đã bán được hàng 🎉</p>
            </div>
        </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error(`Không thể gửi email: ${error.message}`);
        throw new Error("Không thể gửi email");
      }
      logger.info(`Email sent: ${info.response}`);
    });
  }
};

module.exports = mailService;
