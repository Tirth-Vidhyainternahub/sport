const Sport = require("../models/sport.model");
const Country = require("../models/country.model");
const errorHandler = require("../utils/error");
const responseHandler = require("../utils/response");
const cloudinary = require("../config/cloudinaryConfig");

exports.createSport = async (req, res) => {
  try {
    let { name, category, countries } = req.body;

    // Validate required fields
    if (!name || !category || !req.file || !countries) {
      return errorHandler(res, 400, "All fields are required.");
    }

    // Parse countries JSON string into an array
    try {
      countries = JSON.parse(countries);
      if (!Array.isArray(countries) || countries.length === 0) {
        return errorHandler(res, 400, "Countries must be a non-empty array.");
      }
    } catch (error) {
      return errorHandler(res, 400, "Invalid countries format. Must be a JSON array.");
    }

    // Check if sport already exists (case insensitive)
    const existingSport = await Sport.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingSport) {
      return errorHandler(res, 400, "Sport already exists.");
    }

    // Upload logo to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "sports" }); // Store in 'sports' folder
    if (!result.secure_url) {
      return errorHandler(res, 500, "Failed to upload logo.");
    }

    // Fetch country documents from the database
    const countryDocs = await Country.find({ name: { $in: countries } });

    // Validate that all countries exist
    if (countryDocs.length !== countries.length) {
      return errorHandler(res, 400, "One or more countries are invalid.");
    }

    // ✅ Fix: Include `_id` field
    const countryData = countryDocs.map((country) => ({
      id: country._id, // <-- Added this line to fix validation error
      name: country.name,
      flag: country.flag,
    }));

    // Create new sport entry
    const newSport = new Sport({
      name,
      category,
      logo: result.secure_url,
      countries: countryData, // Now includes `id`
    });

    await newSport.save();

    return responseHandler(res, 201, "Sport created successfully", newSport);
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};

exports.updateSport = async (req, res) => {
  try {
    const { sportId } = req.params;
    let { name, category, countries } = req.body;

    // Find the existing sport
    const existingSport = await Sport.findById(sportId);
    if (!existingSport) {
      return errorHandler(res, 404, "Sport not found.");
    }

    let updatedFields = {};
    if (name) updatedFields.name = name;
    if (category) updatedFields.category = category;

    // Handle logo update
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "sports" });
      if (!result || !result.secure_url) {
        return errorHandler(res, 500, "Failed to upload logo.");
      }
      updatedFields.logo = result.secure_url;
    }

    // Handle countries update
    if (countries) {
      try {
        countries = JSON.parse(countries);
        if (!Array.isArray(countries) || countries.length === 0) {
          return errorHandler(res, 400, "Countries must be a non-empty array.");
        }
      } catch (error) {
        return errorHandler(res, 400, "Invalid countries format. Must be a JSON array.");
      }

      const countryDocs = await Country.find({ name: { $in: countries } });

      if (countryDocs.length !== countries.length) {
        return errorHandler(res, 400, "One or more countries are invalid.");
      }

      // ✅ Fix: Include `_id` field
      updatedFields.countries = countryDocs.map((country) => ({
        id: country._id, // <-- Added this line to fix validation error
        name: country.name,
        flag: country.flag,
      }));
    }

    // Update the sport
    const updatedSport = await Sport.findByIdAndUpdate(sportId, updatedFields, {
      new: true,
      runValidators: true,
    });

    return responseHandler(res, 200, "Sport updated successfully", updatedSport);
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};

exports.deleteSport = async (req, res) => {
  try {
    const { sportId } = req.params;

    // Check if the sport exists
    const existingSport = await Sport.findById(sportId);
    if (!existingSport) {
      return errorHandler(res, 404, "Sport not found.");
    }

    // Delete the sport
    await Sport.deleteOne({ _id: sportId });

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

    const sport = await Sport.findById(sportId).populate("countries");
    if (!sport) {
      return errorHandler(res, 404, "Sport not found.");
    }

    return responseHandler(res, 200, "Sport fetched successfully", sport);
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};

exports.getSportsByCountry = async (req, res) => {
  try {
    const { countryName } = req.params;

    // Find sports where the country name matches in the embedded country details
    const sports = await Sport.find({
      countries: { $elemMatch: { name: countryName } }
    }).populate("countries");

    if (!sports.length) {
      return errorHandler(res, 404, "No sports found for this country.");
    }

    return responseHandler(res, 200, "Sports fetched successfully.", sports);
  } catch (error) {
    return errorHandler(res, 500, "Server error", error.message);
  }
};