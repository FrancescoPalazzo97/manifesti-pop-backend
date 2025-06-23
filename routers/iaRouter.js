const express = require(`express`);
const router = express.Router();
const iaController = require("../controllers/iaController");

const postChat = iaController;

router.post(`/`, postChat);

module.exports = router;