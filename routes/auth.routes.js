const express = require("express");
const { googleLogin, facebookLogin, manualSignup, verifyEmail, manualLogin } = require("../controllers/auth.controller");
const upload = require("../middleware/upload");
const router = express.Router();

// Google Login Route
router.post("/google-login", googleLogin);

// Facebook Login Route
router.post("/facebook-login", facebookLogin);

// manual signup and login
router.post("/signup", upload.single("profilePic"), manualSignup);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", manualLogin);

module.exports = router;