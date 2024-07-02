const express = require("express");
const router = express.Router();
const { isAdmin, verifyToken } = require("../middleware/authMiddleware");
const {
  getMembershipDurations,
  addMembershipDuration,
  deleteMembershipDuration
} = require("../controllers/membershipController");
router.get("/membership-durations", verifyToken, isAdmin, getMembershipDurations);
router.post("/membership-durations", verifyToken, isAdmin, addMembershipDuration);
router.delete("/membership-durations/:id", verifyToken, isAdmin, deleteMembershipDuration);

module.exports = router;
