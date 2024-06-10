const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/authMiddleware");
const { getPromos, addPromo } = require("../controllers/promosController");

router.get("/promos", isAdmin, getPromos);
router.post("/promos", isAdmin, addPromo);

module.exports = router;
