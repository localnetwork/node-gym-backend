const express = require("express");
const router = express.Router();
const {
  register,
  login,
  profile,
  getUsers, 
} = require("../controllers/userController.js");
const {
  verifyToken,
  isAdminEmployee,
  isAdmin,
} = require("../middleware/authMiddleware.js");

// const { protect } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register", verifyToken, register);
router.get("/profile", verifyToken, profile);
router.get('/users', verifyToken, isAdmin, getUsers)

module.exports = router;
