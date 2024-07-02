const express = require("express");
const router = express.Router();
const {
  addInquiry
} = require("../controllers/contactInquiryController.js");

router.post('/contact-inquire', addInquiry)

module.exports = router; 