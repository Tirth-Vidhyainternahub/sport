const UserPreferences = require("../models/userPreferences.model");
const User = require("../models/user.model");
const Country = require("../models/country.model");
const Sport = require("../models/sport.model");
const League = require("../models/league.model");
const errorHandler = require("../utils/error");
const responseHandler = require("../utils/response");

// Create or Update User Preferences
const createUserPreferences = async (req, res) => {
  try {
    const { favoriteCountries = [], favoriteSports = [], favoriteLeagues = [] } = req.body;

    // Validate user existence and ensure req.user._id is available
    if (!req.user || !req.user._id) {
      return errorHandler(res, 400, "User ID is missing or invalid.");
    }

    const user = await User.findById(req.user._id);
    if (!user) return errorHandler(res, 404, "User not found.");

    const userId = user._id;
    const userName = user.name || "Unknown User"; // Avoid null userName

    // Fetch full country details based on names
    const populatedCountries = await Promise.all(
      favoriteCountries.map(async (name) => {
        const country = await Country.findOne({ name });
        if (!country) throw new Error(`Country not found: ${name}`);
        return { id: country._id, name: country.name, flag: country.flag };
      })
    );

    // Fetch full sport details based on names
    const populatedSports = await Promise.all(
      favoriteSports.map(async (name) => {
        const sport = await Sport.findOne({ name });
        if (!sport) throw new Error(`Sport not found: ${name}`);
        return { id: sport._id, name: sport.name, logo: sport.logo };
      })
    );

    // Fetch full league details based on names
    const populatedLeagues = await Promise.all(
      favoriteLeagues.map(async (name) => {
        const league = await League.findOne({ name });
        if (!league) throw new Error(`League not found: ${name}`);
        return { id: league._id, name: league.name };
      })
    );

    // Check if user preferences already exist (Update if yes, Create if no)
    let userPreferences = await UserPreferences.findOne({ userId });

    if (userPreferences) {
      // Update existing preferences
      userPreferences.favoriteCountries = populatedCountries;
      userPreferences.favoriteSports = populatedSports;
      userPreferences.favoriteLeagues = populatedLeagues;
      await userPreferences.save();
    } else {
      // Create new preferences
      userPreferences = new UserPreferences({
        userId,
        userName,
        favoriteCountries: populatedCountries,
        favoriteSports: populatedSports,
        favoriteLeagues: populatedLeagues,
      });

      await userPreferences.save();
    }

    return responseHandler(res, 200, "User preferences saved successfully.", userPreferences);
  } catch (error) {
    return errorHandler(res, 500, error.message || "Something went wrong while saving preferences.");
  }
};

// Get User Preferences
const getUserPreferences = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      console.error("Missing or invalid user:", req.user); // Debugging log
      return errorHandler(res, 400, "User ID is missing or invalid.");
    }

    const userId = req.user._id;
    console.log("Fetching preferences for User ID:", userId); // Debugging log

    // Fetch user preferences
    const userPreferences = await UserPreferences.findOne({ userId })
      .populate("favoriteCountries.id", "name flag")
      .populate("favoriteSports.id", "name logo")
      .populate("favoriteLeagues.id", "name")
      .lean(); // Optimize query performance

    if (!userPreferences) {
      console.warn("No preferences found for User ID:", userId); // Debugging log
      return errorHandler(res, 404, "User preferences not found.");
    }

    return responseHandler(res, 200, "User preferences retrieved successfully.", userPreferences);
  } catch (error) {
    console.error("Error fetching user preferences:", error); // Debugging log
    return errorHandler(res, 500, error.message || "Something went wrong while fetching preferences.");
  }
};

const getAllUserPreferences = async (req, res) => {
  try {
    // Fetch all user preferences
    const userPreferences = await UserPreferences.find()
      .populate("userId", "name email") // Populate user details (optional)
      .populate("favoriteCountries.id", "name flag")
      .populate("favoriteSports.id", "name logo")
      .populate("favoriteLeagues.id", "name")
      .lean();

    if (!userPreferences.length) {
      return errorHandler(res, 404, "No user preferences found.");
    }

    return responseHandler(res, 200, "All user preferences retrieved successfully.", userPreferences);
  } catch (error) {
    console.error("Error fetching all user preferences:", error);
    return errorHandler(res, 500, error.message || "Something went wrong while fetching preferences.");
  }
};

const getUserPreferencesByPreferenceId = async (req, res) => {
  try {
    const { id } = req.params; // Extracting the preference document ID

    if (!id) {
      return errorHandler(res, 400, "Preference ID is required.");
    }

    console.log("Fetching user preferences for Preference ID:", id); // Debugging log

    const userPreferences = await UserPreferences.findById(id)
      .populate("favoriteCountries.id", "name flag")
      .populate("favoriteSports.id", "name logo")
      .populate("favoriteLeagues.id", "name")
      .lean(); // Optimize query performance

    if (!userPreferences) {
      return errorHandler(res, 404, "User preferences not found.");
    }

    return responseHandler(res, 200, "User preferences retrieved successfully.", userPreferences);
  } catch (error) {
    console.error("Error fetching user preferences by Preference ID:", error);
    return errorHandler(res, 500, error.message || "Something went wrong.");
  }
};

const updateUserPreferences = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user._id) {
      return errorHandler(res, 400, "User authentication required.");
    }

    const userId = req.user._id;
    const { favoriteCountries = [], favoriteSports = [], favoriteLeagues = [] } = req.body;

    // Fetch the existing user preferences
    let userPreferences = await UserPreferences.findOne({ userId });

    if (!userPreferences) {
      return errorHandler(res, 404, "User preferences not found.");
    }

    // Fetch full country details based on names
    const populatedCountries = await Promise.all(
      favoriteCountries.map(async (name) => {
        const country = await Country.findOne({ name });
        if (!country) throw new Error(`Country not found: ${name}`);
        return { id: country._id, name: country.name, flag: country.flag };
      })
    );

    // Fetch full sport details based on names
    const populatedSports = await Promise.all(
      favoriteSports.map(async (name) => {
        const sport = await Sport.findOne({ name });
        if (!sport) throw new Error(`Sport not found: ${name}`);
        return { id: sport._id, name: sport.name, logo: sport.logo };
      })
    );

    // Fetch full league details based on names
    const populatedLeagues = await Promise.all(
      favoriteLeagues.map(async (name) => {
        const league = await League.findOne({ name });
        if (!league) throw new Error(`League not found: ${name}`);
        return { id: league._id, name: league.name };
      })
    );

    // Update the user preferences
    userPreferences.favoriteCountries = populatedCountries;
    userPreferences.favoriteSports = populatedSports;
    userPreferences.favoriteLeagues = populatedLeagues;
    await userPreferences.save();

    return responseHandler(res, 200, "User preferences updated successfully.", userPreferences);
  } catch (error) {
    return errorHandler(res, 500, error.message || "Something went wrong while updating preferences.");
  }
};

const deleteUserPreferencesById = async (req, res) => {
  try {
    const { id } = req.params; // Extract Preference ID

    // Check if user preferences exist
    const userPreferences = await UserPreferences.findById(id);

    if (!userPreferences) {
      return errorHandler(res, 404, "User preferences not found.");
    }

    // Delete user preferences
    await UserPreferences.findByIdAndDelete(id);

    return responseHandler(res, 200, "User preferences deleted successfully.");
  } catch (error) {
    return errorHandler(res, 500, error.message || "Something went wrong while deleting preferences.");
  }
};


module.exports = { createUserPreferences, getUserPreferences,getAllUserPreferences,getUserPreferencesByPreferenceId,updateUserPreferences,deleteUserPreferencesById};