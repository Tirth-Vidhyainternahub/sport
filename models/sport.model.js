const mongoose = require("mongoose");

const SportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    countries: [
      {
        _id: false, // Prevent MongoDB from generating new IDs for embedded documents
        id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Store original ObjectId
        name: { type: String, required: true },
        flag: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Sport = mongoose.model("Sport", SportSchema);
module.exports = Sport;
