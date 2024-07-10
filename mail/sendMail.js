require("dotenv").config();
const nodemailer = require("nodemailer");
const { findOrderById, findPaymentMethodById } = require("../lib/entity");
const { query } = require("../config/db");

let transporter = nodemailer.createTransport({
  host: process.env.NODE_EMAIL_HOST,
  port: process.env.NODE_EMAIL_PORT,
  secure: true,
  requireTLS: false,
  services: process.env.NODE_EMAIL_SERVICES,
  auth: {
    user: process.env.NODE_EMAIL_USER, // Your email address
    pass: process.env.NODE_EMAIL_PASSWORD, // Your password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateInvoiceReceipt = async (receiver, product, orderId, status) => {
  const order = await findOrderById(orderId);
  const payment_method = await findPaymentMethodById(order?.mode_payments);

  const mailOptions = {
    from: process.env.NODE_EMAIL_USER,
    to: receiver,
    subject: `Order #${orderId} - ${status}`,
    html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="background:#000; padding: 10px 15px; text-align:center;"> 
                    <img src="https://one-kaizen.vercel.app/images/logo.jpg" alt="One Kaizen Logo" style="max-width: 100px; height: auto;">
                </div>
                <h2>Invoice Receipt</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Payment Method:</strong> ${payment_method?.title}</p>
                <p>Order Status: <span style="color: #fff; padding: 5px 15px; display: inline-block; ${
                  status === "completed"
                    ? "background: green;"
                    : "background: red;"
                }">${status}</span></p>
                <p>Thank you for your order!</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${
                              product.title
                            }</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">x1</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">PHP${
                              product.price
                            }</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top: 20px;">Total: PHP ${product.price}</p>
                <p style="margin-top: 20px;">If you have any questions, please contact our support team.</p>
            </div>
        `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending mail", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
// Order #${orderId} - ${status}
const sendInvoiceToEmployees = async (product, orderId, status) => {
  try {
    const results = await query("SELECT * FROM users WHERE role != 3");
    results.forEach((user) => {
      const mailOptions = {
        from: process.env.NODE_EMAIL_USER,
        to: user.email,
        subject: `New Order #${orderId} - ${status}`,
        html: `
                    <p>Hello ${user.name},</p>
                    <p>We wanted to inform you that there's a new order for ${product.title}.</p>
                    <p>Order Details:</p>
                    <ul>
                        <li><strong>Order ID:</strong> ${orderId}</li>
                        <li><strong>Status:</strong> ${status}</li>
                    </ul>
                    <p>Thank you!</p>
                `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(`Error sending email to ${user.email}:`, error);
        } else {
          console.log(
            `Email sent successfully to ${user.email}:`,
            info.response
          );
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  generateInvoiceReceipt,
  sendInvoiceToEmployees,
};
