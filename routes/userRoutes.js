const express = require("express");
const router = express.Router();
const {
  register,
  login,
  profile,
  getUsers, 
  getDeletedUsers, 
  getUser, 
  deleteUser, 
  softDeleteUser, 
  updateUserById,
  getPublicUserInfoByUuid,
  changePasswordByAdmin, 
  restoreUser, 
} = require("../controllers/userController.js");
const {
  verifyToken,
  isAdminEmployee,
  isAdmin,
} = require("../middleware/authMiddleware.js");

router.post("/login", login);
router.get("/profile", verifyToken, profile);  
router.get('/users', verifyToken, isAdminEmployee, getUsers)
router.get('/deleted-users', verifyToken, isAdmin, getDeletedUsers)
router.post("/users", verifyToken, isAdminEmployee, register); 
router.delete("/users/:id", verifyToken, isAdminEmployee, deleteUser); 
router.delete("/users/:id/soft-delete", verifyToken, isAdminEmployee, softDeleteUser); 
router.put("/users/:id/restore", verifyToken, isAdminEmployee, restoreUser); 
router.get("/users/:id", verifyToken, isAdminEmployee, getUser); 
router.put("/users/:id", verifyToken, isAdminEmployee, updateUserById)
router.get('/users/public/:uuid', getPublicUserInfoByUuid); 
router.put("/change-password-admin", verifyToken, isAdmin, changePasswordByAdmin)

module.exports = router; 