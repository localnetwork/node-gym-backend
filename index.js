require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs');

const userRoutes = require("./routes/userRoutes");
const promosRoutes = require("./routes/promosRoutes");
const membershipDurationsRoutes = require("./routes/membershipRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodsRoutes");

const app = express();

app.use(cors())  

app.options('*', cors())  

app.get("/", (req, res) => {
  res.status(200).json({
    status_code: 200,
    message: "Welcome to the Gym API.",
  });
});



app.use(express.json());

app.use(userRoutes);
app.use(promosRoutes);
app.use(subscriptionRoutes)
app.use(paymentMethodRoutes); 
app.use(membershipDurationsRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/image/:imageName', (req, res) => { 
    const imageName = req.params.imageName;
    res.sendFile(path.join(__dirname, 'public/images', imageName));
});

 
app.listen(process.env.NODE_PORT || 3000, () => {
  console.log(
    `Server is running on port http://localhost:${
      process.env.NODE_PORT || 3000
    }`
  );
});