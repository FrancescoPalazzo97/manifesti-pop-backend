const express = require(`express`);
const router = express.Router();
const orderController = require("../controllers/orderController");

const { storeOrders } = orderController;

// STORE ORDERS 
router.post(`/`, storeOrders)

module.exports = router;