const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const smtpConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.USER_NAME, // email 
    pass: process.env.APP_PASSWORD, // mật khẩu
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

module.exports = {
  smtpConfig,
  transporter
};
