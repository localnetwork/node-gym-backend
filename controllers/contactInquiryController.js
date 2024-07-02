require("dotenv").config();

const nodemailer = require('nodemailer');
const util = require("../lib/util");
const { connection, query } = require("../config/db"); 

const addInquiry = async(req, res) => {

    const { name, email, subject, message } = req.body; 
    
 
    let transporter = nodemailer.createTransport({
        host: process.env.NODE_EMAIL_HOST,
        port: process.env.NODE_EMAIL_PORT,
        secure: true,
        services: process.env.NODE_EMAIL_SERVICES,
        auth: {
            user: process.env.NODE_EMAIL_USER,  // Your email address
            pass: process.env.NODE_EMAIL_PASSWORD   // Your password
        }
    });

    let errors = [];

    // Check if name is provided
    if (!name) {
        errors.push({
            name: "Name is required."
        });
    }

    // Check if email is provided and valid
    if (!email) {
        errors.push({
            email: "Email is required."
        });
    } else {
        // Validate email format using a basic regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push({
                email: "Email is invalid."
            });
        }
    }

    // Check if subject is provided
    if (!subject) {
        errors.push({
            subject: "Subject is required."
        });
    }

    // Check if message is provided
    if (!message) {
        errors.push({
            message: "Message is required."
        });
    }

    // If there are any errors, return a 422 status with error details
    if (errors.length > 0) {
        return res.status(422).json({
            status_code: 422,
            message: "Please check errors in the fields.",
            errors: errors
        });
    }
 
    try {

        let mailOptions = {
            from: `One Kaizen <${process.env.NODE_EMAIL_USER}>`,
            to: process.env.NODE_EMAIL_RECEIVER,
            replyTo: email,
            subject: `Contact Form Inquiry-${util.getTimestamp().toString()}`,
            html: `
                <p>
                    Name: ${name}
                </p>
                <p>
                    Email: ${email}
                </p>
                <p>
                    Subject: ${subject}
                </p>
                <p>
                    Message: ${message}
                </p>
            `
        };
      
        

        let results = await query({
            sql: 'INSERT INTO inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)',
            timeout: 10000,
            values: [name, email, subject, message], 
        }); 

        if(results.length === 0) {
            return res.status(500).json({
                status_code: 500,
                message: "Server Error",
                error: "Server Error."
            });
        }

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send('Error: ' + error.message);
            } else {
                console.log('Email sent: ' + info.response);
                res.send('Email sent: ' + info.response);
            }
        }); 

         
        return res.status(200).json({
            status_code: 200,
            message: "Inquiry has been sent successfully.",
            data: {
                name: name,
                email: email,
                subject: subject,
                message: message
            }
        });

    }catch(error) {
        return res.status(500).json({
            status_code: 500,
            message: "Server Error",
            error: error.stack
        });
    
    }
}

module.exports = {
    addInquiry
}