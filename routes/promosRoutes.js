const express = require("express");
const router = express.Router();
const { isAdmin, isAdminEmployee, verifyToken } = require("../middleware/authMiddleware");
const {
  getPromos,
  getActivePromos,
  addPromo,
  deletePromo,
  getPromo,
  editPromo,
  getMemberActivePromos,
  getNonMemberActivePromos,
  getPublicPromos
} = require("../controllers/promosController");

router.get("/promos", isAdmin, getPromos);
router.get("/promos/public", getPublicPromos);
router.get("/active-promos", verifyToken, isAdminEmployee, getActivePromos); 
router.get('/member-promos', verifyToken, getMemberActivePromos);
router.get('/nonmember-promos', verifyToken, isAdminEmployee, getNonMemberActivePromos);
router.post("/promos", isAdmin, addPromo);
router.delete("/promos/:id", verifyToken, isAdmin, deletePromo);
router.get("/promos/:id", verifyToken, isAdmin, getPromo);
router.put("/promos/:id", verifyToken, isAdmin, editPromo);

module.exports = router;
