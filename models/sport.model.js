const mongoose = require("mongoose");

const SportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["Team", "PvP", "MotoSports", "Event", "Multi_Sport"],
      required: true,
    },
    logo: {
      type: String, // URL to store logo
      default: "",
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country", // Relates sport to a country
      required: true,
    },
  },
  { timestamps: true }
);

const Sport = mongoose.model("Sport", SportSchema);
module.exports = Sport;
