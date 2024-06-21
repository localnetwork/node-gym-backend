require("dotenv").config();
const connection = require("./config/db");
const cors = require("cors");
const express = require("express");

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
app.listen(process.env.NODE_PORT || 3000, () => {
  console.log(
    `Server is running on port http://localhost:${
      process.env.NODE_PORT || 3000
    }`
  );
});
