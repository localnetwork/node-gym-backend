require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs');
const { connection, query } = require("./config/db");

const cookieParser = require('cookie-parser'); 
const nodemailer = require('nodemailer');

const {
  verifyToken,
  verifyCookieToken
} = require("./middleware/authMiddleware.js");


const userRoutes = require("./routes/userRoutes");
const promosRoutes = require("./routes/promosRoutes");
const membershipDurationsRoutes = require("./routes/membershipRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodsRoutes");
const nonMembersRoutes = require("./routes/nonMembersRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(cookieParser());


app.use(cors())  

app.options('*', cors())  

app.use(express.json());

app.use(userRoutes);
app.use(promosRoutes);
app.use(subscriptionRoutes)
app.use(paymentMethodRoutes); 
app.use(membershipDurationsRoutes); 
app.use(nonMembersRoutes); 
app.use(contactRoutes); 
 
// app.use(verifyCookieToken, express.static(path.join(__dirname, 'public'))); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.get('/images/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'public/images', imageName);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(err.status).end();
    }
  });   
}); 
 
 
app.listen(process.env.NODE_PORT || 3000, () => {
  console.log(
    `Server is running on port http://localhost:${
      process.env.NODE_PORT || 3000
    }`
  );
});

setTimeout(() => {
  connection.query("SELECT 1", (err, result) => {
    if (err) {
      console.error("Error connecting to database: " + err.stack);
      return;
    }
    console.log("Connected to database");
  }); 
}, 1000) 