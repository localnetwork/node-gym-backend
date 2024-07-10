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
  updateProfile,
  updateProfilePassword,
} = require("../controllers/userController.js");
const {
  verifyToken,
  isAdminEmployee,
  isAdmin,
} = require("../middleware/authMiddleware.js");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/profile-pictures"); // Destination folder
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + "-" + Date.now() + extension); // Unique file name with original extension
  },
});

const upload = multer({ storage: storage });

router.post("/login", login);
router.get("/profile", verifyToken, profile);
router.get("/users", verifyToken, isAdminEmployee, getUsers);
router.get("/deleted-users", verifyToken, isAdmin, getDeletedUsers);
router.post(
  "/users",
  verifyToken,
  upload.single("profile_picture"),
  isAdminEmployee,
  register
);
router.delete("/users/:id", verifyToken, isAdminEmployee, deleteUser);
router.delete(
  "/users/:id/soft-delete",
  verifyToken,
  isAdminEmployee,
  softDeleteUser
);
router.put("/users/:id/restore", verifyToken, isAdminEmployee, restoreUser);
router.get("/users/:id", verifyToken, isAdminEmployee, getUser);
router.put(
  "/users/:id",
  verifyToken,
  isAdminEmployee,
  upload.single("profile_picture"),
  updateUserById
);
router.get("/users/public/:uuid", getPublicUserInfoByUuid);
router.put(
  "/change-password-admin",
  verifyToken,
  isAdmin,
  changePasswordByAdmin
);

router.put("/profile", verifyToken, updateProfile);

router.put("/profile/password", verifyToken, updateProfilePassword);

module.exports = router;
