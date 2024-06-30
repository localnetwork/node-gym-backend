const express = require("express");
const router = express.Router();
const { isAdmin, isAdminEmployee } = require("../middleware/authMiddleware");

const {
  addNonmemberTransaction,
  getNonMemberTransactions,
} = require("../controllers/nonMemberController");

router.post("/non-members/transactions", verifyToken, isAdminEmployee, addNonmemberTransaction);
router.get("/non-members/transactions", verifyToken, isAdminEmployee, getNonMemberTransactions);

module.exports = router;