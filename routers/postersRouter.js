const express = require(`express`);
const router = express.Router();
const postersController = require(`../controllers/postersController`)

const { index, show } = postersController;

// INDEX
router.get('/', index);

//SHOW
router.get(`/:id`, show);

module.exports = router;