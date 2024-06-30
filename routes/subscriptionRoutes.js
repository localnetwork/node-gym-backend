const express = require("express");
const router = express.Router();
const { isAdmin, isAdminEmployee } = require("../middleware/authMiddleware");
const {
  addSubscription,
  viewUserSubscriptions,
  viewAllSubscriptions,
} = require("../controllers/subscriptionController");

router.post("/subscriptions", verifyToken, isAdminEmployee, addSubscription);
router.get("/user/subscriptions/:id", verifyToken, isAdminEmployee, viewUserSubscriptions);
router.get('/subscriptions', verifyToken, isAdminEmployee, viewAllSubscriptions);
module.exports = router;