const express = require("express");
const { signUp, login, checkUser } = require("../controllers/user.controller");
const userMiddleware = require("../middleware/userMiddleware");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/check", userMiddleware, checkUser); 

module.exports = router;