const express = require("express");
const router = express.Router();
const { isAdmin, isAdminEmployee } = require("../middleware/authMiddleware");
const {
  addOrder,
  viewUserOrders,
  viewAllOrders,
  checkout,
  executePayment,
  viewOrderDetails, 
} = require("../controllers/ordersController");



const multer = require('multer');
const path = require('path');
const { verifyOrderOwner } = require("../middleware/orderMiddleware");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/payments'); // Destination folder
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname); // Get the file extension
        cb(null, file.fieldname + '-' + Date.now() + extension); // Unique file name with original extension
    }
});

const upload = multer({ storage: storage }); 

router.post("/orders", verifyToken, isAdminEmployee, addOrder);
router.get("/user/orders/:id", verifyToken, isAdminEmployee, viewUserOrders);
router.get('/orders', verifyToken, isAdminEmployee, viewAllOrders);
router.post('/checkout', verifyToken, upload.single('proof'), checkout);
router.post('/checkout/execute', verifyToken, executePayment);
router.get('/checkout/:id', verifyOrderOwner, viewOrderDetails);
module.exports = router;