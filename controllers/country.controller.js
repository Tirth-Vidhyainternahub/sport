const Country = require("../models/country.model");
const errorHandler = require("../utils/error");
const responseHandler = require("../utils/response");

// ✅ Create a new country
const createCountry = async (req, res) => {
  try {
    const { name, flag } = req.body;

    // Check if country already exists
    const existingCountry = await Country.findOne({ name });
    if (existingCountry) {
      return errorHandler(res, 400, "Country already exists.");
    }

    // Create new country
    const country = new Country({ name, flag });
    await country.save();

    return responseHandler(res, 201, "Country created successfully.", country);
  } catch (error) {
    return errorHandler(res, 500, "Internal Server Error.");
  }
};

// ✅ Get all countries
const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    return responseHandler(res, 200, "Countries fetched successfully.", countries);
  } catch (error) {
    return errorHandler(res, 500, "Internal Server Error.");
  }
};

// ✅ Get country by ID
const getCountryById = async (req, res) => {
  try {
    const { id } = req.params;
    const country = await Country.findById(id);

    if (!country) {
      return errorHandler(res, 404, "Country not found.");
    }

    return responseHandler(res, 200, "Country fetched successfully.", country);
  } catch (error) {
    return errorHandler(res, 500, "Internal Server Error.");
  }
};

// ✅ Update country by ID
const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, flag } = req.body;

    const updatedCountry = await Country.findByIdAndUpdate(
      id,
      { name, flag },
      { new: true, runValidators: true }
    );

    if (!updatedCountry) {
      return errorHandler(res, 404, "Country not found.");
    }

    return responseHandler(res, 200, "Country updated successfully.", updatedCountry);
  } catch (error) {
    return errorHandler(res, 500, "Internal Server Error.");
  }
};

// ✅ Delete country by ID
const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCountry = await Country.findByIdAndDelete(id);

    if (!deletedCountry) {
      return errorHandler(res, 404, "Country not found.");
    }

    return responseHandler(res, 200, "Country deleted successfully.");
  } catch (error) {
    return errorHandler(res, 500, "Internal Server Error.");
  }
};

module.exports = {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
};
