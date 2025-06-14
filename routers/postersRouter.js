const express = require(`express`);
const router = express.Router();
const postersController = require(`../controllers/postersController`)

const { index, show, storeReviews, storeOrders } = postersController;

// INDEX
router.get('/', index);

//SHOW
router.get(`/:id`, show);

// STORE REVIEWS
router.post('/:id', storeReviews);

// STORE ORDERS 
router.post(`/order`, storeOrders)

module.exports = router;