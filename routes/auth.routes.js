const express = require("express");
const { googleLogin} = require("../controllers/auth.controller");
const upload = require("../middleware/upload");
const router = express.Router();

// Google Login Route
router.post("/google-login", googleLogin);

module.exports = router;