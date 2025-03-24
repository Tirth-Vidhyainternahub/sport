const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseConfig");
const User = require("../models/user.model");
const responseHandler = require("../utils/response");
const errorHandler = require("../utils/error");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return errorHandler(res, 400, "ID Token is required.");
    }

    // Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return errorHandler(res, 400, "Google account must have an email.");
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user and save it to generate _id
      user = await new User({
        name: name || "Unnamed User",
        email,
        profilePic: picture || "",
        isVerified: true,
        role: "user",
        accountMethod: "google",
        providerId: uid,
        lastLogin: new Date(),
      }).save();
    } else {
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
    }

    // Create a JWT token with all user data EXCEPT password
    const tokenPayload = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
      role: user.role,
      accountMethod: user.accountMethod,
      providerId: user.providerId,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "7d" });

    responseHandler(res, 200, "Google login successful", { user, token });
  } catch (error) {
    errorHandler(res, 500, "Google Login Failed", error);
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = {googleLogin};