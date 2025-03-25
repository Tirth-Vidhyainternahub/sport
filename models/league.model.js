const mongoose = require("mongoose");

const LeagueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport", // Relates league to a sport
      required: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country", // Relates league to a country
      required: true,
    },
    category: {
      type: String,
      enum: ["League", "Adhoc", "GrandSlam"],
      required: true,
    },
    startDate: {
      type: Date, // Only for Adhoc type
    },
    endDate: {
      type: Date, // Only for Adhoc type
    },
  },
  { timestamps: true }
);

const League = mongoose.model("League", LeagueSchema);
module.exports = League;
