const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/authMiddleware");
const {
  getPromos,
  addPromo,
  deletePromo,
  getPromo,
  editPromo,
} = require("../controllers/promosController");

router.get("/promos", isAdmin, getPromos);
router.post("/promos", isAdmin, addPromo);
router.delete("/promos/:id", isAdmin, deletePromo);
router.get("/promos/:id", isAdmin, getPromo);
router.put("/promos/:id", isAdmin, editPromo);

module.exports = router;
