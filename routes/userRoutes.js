const express = require("express");
const router = express.Router();
const {
  register,
  login,
  profile,
  getUsers, 
  getUser, 
  deleteUser, 
  updateUserById,
} = require("../controllers/userController.js");
const {
  verifyToken,
  isAdminEmployee,
  isAdmin,
} = require("../middleware/authMiddleware.js");

router.post("/login", login);
router.get("/profile", verifyToken, profile); 
router.get('/users', verifyToken, isAdminEmployee, getUsers)
router.post("/users", verifyToken, isAdminEmployee, register); 
router.delete("/users/:id", verifyToken, isAdminEmployee, deleteUser); 
router.get("/users/:id", verifyToken, isAdminEmployee, getUser); 
router.put("/users/:id", verifyToken, isAdminEmployee, updateUserById)
 
module.exports = router;