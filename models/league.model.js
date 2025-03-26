const mongoose = require("mongoose");

const LeagueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    sport: {
      _id: false, // Prevent MongoDB from generating an extra _id for sub-document
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Sport", required: true },
      name: { type: String, required: true },
      logo: { type: String, required: true },
    },
    country: {
      _id: false,
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Country", required: true },
      name: { type: String, required: true },
      flag: { type: String, required: true },
    },
    category: {
      type: String,
      enum: ["League"],
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const League = mongoose.model("League", LeagueSchema);
module.exports = League;
