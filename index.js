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

app.get("/", (req, res) => {
  res.status(200).json({
    status_code: 200,
    message: "Welcome to the Gym API.",
  });
});


app.use(cors());
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



// Ensure the 'qrcodes' directory exists
const qrCodeDir = path.join(__dirname, 'public', 'images', 'qr-codes'); 
if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir);
}
 
// Route to generate a QR code with a unique URL
app.get('/generate-qr', async (req, res) => {
    try {
        // Generate a unique UUID
        const uniqueId = uuidv4();
        
        // Construct the unique URL
        const uniqueUrl = `${process.env.NODE_QR_BASE_URL}/user/qr-info/${uniqueId}`;
        
        // Generate QR code
        const qrCodePath = path.join(qrCodeDir, `${uniqueId}.png`);
        await QRCode.toFile(qrCodePath, uniqueUrl, {
          width: 500,
          height: 500,
          color: {
            dark: '#000000ff',
            light: '#0000'
          } 
        },);
        
        // Respond with the QR code image URL
        res.send(`<img src="/images/qr-codes/${uniqueId}.png" alt="QR Code" />`);
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send('Failed to generate QR code');
    }
}); 

app.listen(process.env.NODE_PORT || 3000, () => {
  console.log(
    `Server is running on port http://localhost:${
      process.env.NODE_PORT || 3000
    }`
  );
});
