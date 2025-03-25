const express = require("express");
const {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
} = require("../controllers/country.controller");
const {validateToken} = require("../middleware/auth.middleware");
const {validateAdmin} = require("../middleware/auth.middleware");

const router = express.Router();

// ✅ Create a new country (Admin Only)
router.post("/", validateToken, validateAdmin, createCountry);

// ✅ Get all countries
router.get("/", validateToken,getAllCountries);

// ✅ Get country by ID
router.get("/:id", validateToken,getCountryById);

// ✅ Update country by ID (Admin Only)
router.put("/:id", validateToken, validateAdmin, updateCountry);

// ✅ Delete country by ID (Admin Only)
router.delete("/:id", validateToken, validateAdmin, deleteCountry);

module.exports = router;