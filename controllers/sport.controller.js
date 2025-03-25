const Sport = require("../models/sport.model");
const Country = require("../models/country.model"); // Ensure this model exists
const errorHandler = require("../utils/error");
const responseHandler = require("../utils/response");

exports.createSport = async (req, res) => {
  try {
    const { name, category, logo, countries } = req.body;

    // Validate required fields
    if (!name || !category || !logo || !countries || !Array.isArray(countries)) {
      return errorHandler(res, 400, "All fields are required, and countries must be an array.");
    }

    // Fetch country details from DB
    const countryDocs = await Country.find({ name: { $in: countries } });

    if (countryDocs.length !== countries.length) {
      return errorHandler(res, 400, "One or more countries are invalid.");
    }

    // Map country details
    const countryData = countryDocs.map((country) => ({
      id: country._id,
      name: country.name,
      flag: country.flag,
    }));

    // Check if sport already exists
    const existingSport = await Sport.findOne({ name });
    if (existingSport) {
      return errorHandler(res, 400, "Sport already exists.");
    }

    // Create new sport with embedded country details
    const newSport = new Sport({ name, category, logo, countries: countryData });
    await newSport.save();

    return responseHandler(res, 201, "Sport created successfully", newSport);
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};

exports.updateSport = async (req, res) => {
  try {
    const { sportId } = req.params; // Get sport ID from URL
    const { name, category, logo, countries } = req.body;

    // Check if the sport exists
    const existingSport = await Sport.findById(sportId);
    if (!existingSport) {
      return errorHandler(res, 404, "Sport not found.");
    }

    let updatedFields = {}; // Store fields to be updated

    // Update name if provided
    if (name) updatedFields.name = name;

    // Update category if provided
    if (category) updatedFields.category = category;

    // Update logo if provided
    if (logo) updatedFields.logo = logo;

    // If countries are provided, fetch their details
    if (countries && Array.isArray(countries)) {
      const countryDocs = await Country.find({ name: { $in: countries } });

      if (countryDocs.length !== countries.length) {
        return errorHandler(res, 400, "One or more countries are invalid.");
      }

      // Map country details
      updatedFields.countries = countryDocs.map((country) => ({
        id: country._id,
        name: country.name,
        flag: country.flag,
      }));
    }

    // Update the sport in the database
    const updatedSport = await Sport.findByIdAndUpdate(sportId, updatedFields, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    });

    return responseHandler(res, 200, "Sport updated successfully", updatedSport);
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};

exports.deleteSport = async (req, res) => {
  try {
    const { sportId } = req.params; // Get sport ID from URL

    // Check if the sport exists
    const existingSport = await Sport.findById(sportId);
    if (!existingSport) {
      return errorHandler(res, 404, "Sport not found.");
    }

    // Delete the sport
    await Sport.findByIdAndDelete(sportId);

    return responseHandler(res, 200, "Sport deleted successfully");
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};

exports.getAllSports = async (req, res) => {
  try {
    const sports = await Sport.find().populate("countries"); // Fetch sports with country details
    return responseHandler(res, 200, "Sports fetched successfully", sports);
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};

exports.getSportById = async (req, res) => {
  try {
    const { sportId } = req.params;

    // Find the sport by ID
    const sport = await Sport.findById(sportId).populate("countries");
    if (!sport) {
      return errorHandler(res, 404, "Sport not found.");
    }

    return responseHandler(res, 200, "Sport fetched successfully", sport);
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};
