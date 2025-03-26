const League = require("../models/league.model");
const Sport = require("../models/sport.model");
const Country = require("../models/country.model");
const response = require("../utils/response");
const errorHandler = require("../utils/error");

// Create a new league
const createLeague = async (req, res) => {
    try {
        const { name, sport, country, category, startDate, endDate } = req.body;

        if (!name || !sport || !country || !category) {
            return errorHandler(res, 400, "All required fields must be provided.");
        }

        // Check if league already exists
        const existingLeague = await League.findOne({ name });
        if (existingLeague) {
            return errorHandler(res, 400, "League with this name already exists.");
        }

        // Validate Sport ID and Fetch Details
        const sportData = await Sport.findById(sport);
        if (!sportData) {
            return errorHandler(res, 404, "Sport not found.");
        }

        // Validate Country ID and Fetch Details
        const countryData = await Country.findById(country);
        if (!countryData) {
            return errorHandler(res, 404, "Country not found.");
        }

        // Create new league with embedded sport and country data
        const league = new League({
            name,
            sport: {
                id: sportData._id,
                name: sportData.name,
                logo: sportData.logo,
            },
            country: {
                id: countryData._id,
                name: countryData.name,
                flag: countryData.flag,
            },
            category,
            startDate,
            endDate,
        });

        await league.save();

        return response(res, 201, "League created successfully.", league);
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong.", error);
    }
};

// Get all leagues
const getLeagues = async (req, res) => {
    try {
        const leagues = await League.find();
        return response(res, 200, "Leagues retrieved successfully.", leagues);
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong.", error);
    }
};

// Get league by ID
const getLeagueById = async (req, res) => {
    try {
        const { id } = req.params;
        const league = await League.findById(id);

        if (!league) {
            return errorHandler(res, 404, "League not found.");
        }

        return response(res, 200, "League retrieved successfully.", league);
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong.", error);
    }
};

// Update league
const updateLeague = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sport, country, category, startDate, endDate } = req.body;

        // Check if league exists
        const existingLeague = await League.findById(id);
        if (!existingLeague) {
            return errorHandler(res, 404, "League not found.");
        }

        // Validate Sport ID and Fetch Details
        let sportData = existingLeague.sport;
        if (sport) {
            sportData = await Sport.findById(sport);
            if (!sportData) {
                return errorHandler(res, 404, "Sport not found.");
            }
            sportData = {
                id: sportData._id,
                name: sportData.name,
                logo: sportData.logo,
            };
        }

        // Validate Country ID and Fetch Details
        let countryData = existingLeague.country;
        if (country) {
            countryData = await Country.findById(country);
            if (!countryData) {
                return errorHandler(res, 404, "Country not found.");
            }
            countryData = {
                id: countryData._id,
                name: countryData.name,
                flag: countryData.flag,
            };
        }

        // Update the league
        existingLeague.name = name || existingLeague.name;
        existingLeague.sport = sportData;
        existingLeague.country = countryData;
        existingLeague.category = category || existingLeague.category;
        existingLeague.startDate = startDate || existingLeague.startDate;
        existingLeague.endDate = endDate || existingLeague.endDate;

        await existingLeague.save();

        return response(res, 200, "League updated successfully.", existingLeague);
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong.", error);
    }
};

// Delete league
const deleteLeague = async (req, res) => {
    try {
        const { id } = req.params;
        const league = await League.findById(id);

        if (!league) {
            return errorHandler(res, 404, "League not found.");
        }

        await league.deleteOne();
        return response(res, 200, "League deleted successfully.");
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong.", error);
    }
};

module.exports = {
    createLeague,
    getLeagues,
    getLeagueById,
    updateLeague,
    deleteLeague,
};