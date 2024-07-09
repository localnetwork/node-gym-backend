const express = require("express");
const router = express.Router();
const { isAdmin, isAdminEmployee } = require("../middleware/authMiddleware");
const {
  getPaymentMethods
} = require("../controllers/paymentMethodsController");

router.get("/payment-methods", verifyToken, getPaymentMethods);

module.exports = router;