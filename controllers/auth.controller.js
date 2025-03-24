const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseConfig");
const User = require("../models/user.model");
const responseHandler = require("../utils/response");
const errorHandler = require("../utils/error");
const https = require("https");


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

const facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return errorHandler(res, 400, "Access Token is required.");
    }

    const facebookGraphUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;

    https.get(facebookGraphUrl, (fbRes) => {
      let data = "";

      fbRes.on("data", (chunk) => {
        data += chunk;
      });

      fbRes.on("end", async () => {
        const fbUser = JSON.parse(data);
        if (!fbUser || fbUser.error) {
          return errorHandler(res, 400, "Invalid Facebook Token");
        }

        let user = await User.findOne({ email: fbUser.email });
        if (!user) {
          user = new User({
            name: fbUser.name,
            email: fbUser.email,
            profilePic: fbUser.picture.data.url,
            isVerified: true,
            role: "user",
            accountMethod: "facebook", // ✅ Ensure accountMethod is always provided
            providerId: fbUser.id,
            lastLogin: new Date(),
          });

          await user.save();
        }

        responseHandler(res, 200, "Facebook login successful", { user });
      });
    }).on("error", (err) => {
      errorHandler(res, 500, "Facebook Login Failed", err.message);
    });
  } catch (err) {
    errorHandler(res, 500, "Facebook Login Failed", err.message);
  }
};


module.exports = {googleLogin,facebookLogin};