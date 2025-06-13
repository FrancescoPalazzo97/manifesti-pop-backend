const express = require(`express`);
const router = express.Router();
const postersController = require(`../controllers/postersController`)

const { index, show, store } = postersController;

// INDEX
router.get('/', index);

//SHOW
router.get(`/:id`, show);

// STORE
router.post('/:id', store);

module.exports = router;