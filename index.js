require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");

const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const fs = require("fs");
const { connection, query } = require("./config/db");
const cron = require("./jobs/cronJobs");

const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const {
  verifyToken,
  verifyCookieToken,
} = require("./middleware/authMiddleware.js");

const userRoutes = require("./routes/userRoutes");
const promosRoutes = require("./routes/promosRoutes");
const membershipDurationsRoutes = require("./routes/membershipRoutes");
const ordersRoutes = require("./routes/ordersRoutes.js");
const paymentMethodRoutes = require("./routes/paymentMethodsRoutes");
const nonMembersRoutes = require("./routes/nonMembersRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(cookieParser());

app.use(bodyParser.json());

app.use(cors());

app.options("*", cors());

app.use(express.json());

app.use(userRoutes);
app.use(promosRoutes);
app.use(ordersRoutes);
app.use(paymentMethodRoutes);
app.use(membershipDurationsRoutes);
app.use(nonMembersRoutes);
app.use(contactRoutes);

// app.use(verifyCookieToken, express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "public")));
app.get("/images/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "public/images", imageName);
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

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/payments"); // Destination folder
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + "-" + Date.now() + extension); // Unique file name with original extension
  },
});

const upload = multer({ storage: storage });

app.post("/test", upload.single("proof"), (req, res) => {
  const { promo, orderId, payment_method } = req.body; // Extract promo and orderId from req.body
  const proofFile = req.file; // Uploaded file information, if any

  // Log the received data for debugging
  // console.log('promo:', promo?.id);
  // console.log('orderId:', payment_method);
  // console.log('proofFile:', proofFile); // This will contain file details if uploaded

  // Respond with some data (replace with actual logic)
  res.json({ message: "Received data successfully" });
});

setTimeout(() => {
  connection.query("SELECT 1", (err, result) => {
    if (err) {
      console.error("Error connecting to database: " + err.stack);
      return;
    }
    console.log("Connected to database");
  });
}, 1000);
