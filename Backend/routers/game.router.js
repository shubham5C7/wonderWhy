const express = require("express");
const router = express.Router();
const { getHistory } = require("../controllers/game.controller");

router.get("/", getHistory);

module.exports = router;