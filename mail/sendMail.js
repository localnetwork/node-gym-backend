require("dotenv").config();
const nodemailer = require('nodemailer'); 
const { findOrderById, findPaymentMethodById } = require("../lib/entity");

const generateAdminInvoiceReceipt = async (receiver, product, status) => {
    let transporter = nodemailer.createTransport({
        host: process.env.NODE_EMAIL_HOST,
        port: process.env.NODE_EMAIL_PORT,
        secure: true,
        requireTLS: false,
        services: process.env.NODE_EMAIL_SERVICES,
        auth: {
            user: process.env.NODE_EMAIL_USER,  // Your email address
            pass: process.env.NODE_EMAIL_PASSWORD   // Your password
        },
        tls: {
            rejectUnauthorized: false
        }
    });  
    const mailOptions = {
        from: process.env.NODE_EMAIL_USER,
        to: receiver,
        subject: `A new order - ${status}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <img src="http://localhost:1000/images/logo.jpg" alt="One Kaizen Logo" style="max-width: 200px; height: auto;">
                <h2>New Order</h2>
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
                            <td style="border: 1px solid #ddd; padding: 8px;">${product.title}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">x1</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">PHP${product.price}</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top: 20px;">Total: PHP ${product.price}</p>
                <p style="margin-top: 20px;">If you have any questions, please contact our support team.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending mail', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    }); 
}

const generateInvoiceReceipt = async (receiver, product, orderId, status) => {

    const order = await findOrderById(orderId); 
    const payment_method = await findPaymentMethodById(order?.mode_payments); 
    let transporter = nodemailer.createTransport({
        host: process.env.NODE_EMAIL_HOST,
        port: process.env.NODE_EMAIL_PORT,
        secure: true,
        requireTLS: false,
        services: process.env.NODE_EMAIL_SERVICES,
        auth: {
            user: process.env.NODE_EMAIL_USER,  // Your email address
            pass: process.env.NODE_EMAIL_PASSWORD   // Your password
        },
        tls: {
            rejectUnauthorized: false
        }
    });  
    const mailOptions = {
        from: process.env.NODE_EMAIL_USER, 
        to: receiver,
        subject: `Order #${orderId} - ${status}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="background:#000; padding: 10px 15px; text-align:center;"> 
                    <img src="http://localhost:1000/images/logo.jpg" alt="One Kaizen Logo" style="max-width: 100px; height: auto;">
                </div>
                <h2>Invoice Receipt</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Payment Method:</strong> ${payment_method?.title}</p>
                <p>Order Status: <span style="color: #fff; padding: 5px 15px; display: inline-block; ${status === 'completed' ? "background: green;" : "background: red;"}">${status}</span></p>
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
                            <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">${product.title}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">x1</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align:center;">PHP${product.price}</td>
                        </tr>
                    </tbody>
                </table>
                <p style="margin-top: 20px;">Total: PHP ${product.price}</p>
                <p style="margin-top: 20px;">If you have any questions, please contact our support team.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending mail', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = {
    generateInvoiceReceipt
}