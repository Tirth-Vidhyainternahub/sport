const mongoose = require("mongoose");

const UserPreferencesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User
      required: true,
      unique: true, // Each user has only one preference entry
    },
    favoriteCountries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country", // Favorite Countries (Max 3)
      },
    ],
    favoriteSports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport", // Favorite Sports (No Limit)
      },
    ],
    favoriteLeagues: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "League", // Favorite Leagues (No Limit)
      },
    ],
  },
  { timestamps: true }
);

// Restrict max favorite countries to 3
UserPreferencesSchema.pre("save", function (next) {
  if (this.favoriteCountries.length > 3) {
    return next(new Error("You can only select up to 3 favorite countries."));
  }
  next();
});

const UserPreferences = mongoose.model("UserPreferences", UserPreferencesSchema);
module.exports = UserPreferences;
