const express = require("express");
const router = express.Router();
const {
  register,
  login,
  profile,
} = require("../controllers/userController.js");
const {
  verifyToken,
  isAdminEmployee,
} = require("../middleware/authMiddleware.js");

// const { protect } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register", verifyToken, register);
router.get("/profile", verifyToken, profile);

module.exports = router;
