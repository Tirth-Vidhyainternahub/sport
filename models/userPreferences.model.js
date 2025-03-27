const mongoose = require("mongoose");

const UserPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures one user can have only one preferences document
    },
    userName: {
      type: String,
      required: true,
    },
    favoriteCountries: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
        name: { type: String, required: true },
        flag: { type: String },
      },
    ],
    favoriteSports: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Sport", required: true },
        name: { type: String, required: true },
        logo: { type: String },
      },
    ],
    favoriteLeagues: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "League", required: true },
        name: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const UserPreferences = mongoose.model("UserPreferences", UserPreferencesSchema);
module.exports = UserPreferences;
