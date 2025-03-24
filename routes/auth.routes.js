const express = require("express");
const { googleLogin, facebookLogin } = require("../controllers/auth.controller");
const upload = require("../middleware/upload");
const router = express.Router();

// Google Login Route
router.post("/google-login", googleLogin);

// Facebook Login Route
router.post("/facebook-login", facebookLogin);

module.exports = router;