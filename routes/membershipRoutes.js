const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/authMiddleware");
const {
  getMembershipDurations,
  addMembershipDuration,
} = require("../controllers/membershipController");
router.get("/membership-durations", isAdmin, getMembershipDurations);
router.post("/membership-durations", isAdmin, addMembershipDuration);

module.exports = router;
