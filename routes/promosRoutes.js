const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/authMiddleware");
const {
  getPromos,
  getActivePromos,
  addPromo,
  deletePromo,
  getPromo,
  editPromo,
} = require("../controllers/promosController");

router.get("/promos", isAdmin, getPromos);
router.get("/active-promos", isAdmin, getActivePromos); 
router.post("/promos", isAdmin, addPromo);
router.delete("/promos/:id", isAdmin, deletePromo);
router.get("/promos/:id", isAdmin, getPromo);
router.put("/promos/:id", isAdmin, editPromo);

module.exports = router;
