const League = require("../models/league.model");
const Sport = require("../models/sport.model");
const Country = require("../models/country.model");
const responseHandler = require("../utils/response");
const errorHandler = require("../utils/error");

// Create a new league
const createLeague = async (req, res) => {
    try {
        const { name, sportName, countryName, category, startDate, endDate } = req.body;

        // Validate required fields
        if (!name || !sportName || !countryName || !category || !startDate || !endDate) {
            return errorHandler(res, 400, "All fields are required.");
        }

        // Fetch the sport details from the database
        const sport = await Sport.findOne({ name: sportName });
        if (!sport) {
            return errorHandler(res, 400, "Invalid sport name.");
        }

        // Fetch the country details from the database
        const country = await Country.findOne({ name: countryName });
        if (!country) {
            return errorHandler(res, 400, "Invalid country name.");
        }

        // Extract the list of valid country names for the sport
        const validCountries = sport.countries.map(c => c.name);

        // Check if the given country is in the list
        if (!validCountries.includes(countryName)) {
            return errorHandler(res, 400, `The sport '${sportName}' is only available in: ${validCountries.join(", ")}.`);
        }

        // Create a new league with proper sport and country structure
        const newLeague = new League({
            name,
            sport: {
                id: sport._id,
                name: sport.name,
                logo: sport.logo,
            },
            country: {
                id: country._id,
                name: country.name,
                flag: country.flag,
            },
            category,
            startDate,
            endDate,
        });

        await newLeague.save();

        return responseHandler(res, 201, "League created successfully.", newLeague);
    } catch (error) {
        return errorHandler(res, 500, "Internal Server Error", error.message);
    }
};

// Get all leagues
const getLeagues = async (req, res) => {
    try {
        const leagues = await League.find();

        if (!leagues.length) {
            return errorHandler(res, 404, "No leagues found.");
        }

        return responseHandler(res, 200, "Leagues retrieved successfully.", leagues);
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong while fetching leagues.", error);
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

        return responseHandler(res, 200, "League retrieved successfully.", league);
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong while fetching the league.", error);
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

        let sportData = existingLeague.sport;
        let countryData = existingLeague.country;

        // Validate Sport by Name
        if (sport) {
            const foundSport = await Sport.findOne({ name: sport });
            if (!foundSport) {
                return errorHandler(res, 404, `Sport '${sport}' not found.`);
            }
            sportData = {
                id: foundSport._id,
                name: foundSport.name,
                logo: foundSport.logo,
            };
        }

        // Validate Country by Name
        if (country) {
            const foundCountry = await Country.findOne({ name: country });
            if (!foundCountry) {
                return errorHandler(res, 404, `Country '${country}' not found.`);
            }

            // Ensure that the selected country exists in the sport's countries array
            const foundSport = await Sport.findOne({ name: sport || existingLeague.sport.name });
            const countryExistsInSport = foundSport.countries.some(
                (c) => c.name.toLowerCase() === country.toLowerCase()
            );

            if (!countryExistsInSport) {
                return errorHandler(
                    res,
                    400,
                    `The sport '${sport || existingLeague.sport.name}' is not available in '${country}'.`
                );
            }

            countryData = {
                id: foundCountry._id,
                name: foundCountry.name,
                flag: foundCountry.flag,
            };
        }

        // Update League Details
        existingLeague.name = name || existingLeague.name;
        existingLeague.sport = sportData;
        existingLeague.country = countryData;
        existingLeague.category = category || existingLeague.category;
        existingLeague.startDate = startDate || existingLeague.startDate;
        existingLeague.endDate = endDate || existingLeague.endDate;

        // Save Updated League
        await existingLeague.save();

        return responseHandler(res, 200, "League updated successfully.", existingLeague);
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong.", error);
    }
};

// Delete league
const deleteLeague = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the league exists
        const league = await League.findById(id);
        if (!league) {
            return errorHandler(res, 404, "League not found.");
        }

        // Delete the league
        await League.deleteOne({ _id: id });

        return responseHandler(res, 200, "League deleted successfully.");
    } catch (error) {
        return errorHandler(res, 500, "Something went wrong while deleting the league.", error);
    }
};

module.exports = {
    createLeague,
    getLeagues,
    getLeagueById,
    updateLeague,
    deleteLeague,
};