const express = require("express");
const router = express.Router();
const { createSport ,updateSport,deleteSport,getAllSports,getSportById,getSportsByCountry} = require("../controllers/sport.controller");
const {validateToken} = require("../middleware/auth.middleware");
const {validateAdmin} = require("../middleware/auth.middleware");

router.post("/", validateToken,validateAdmin,createSport); // Route to create a sport
router.patch("/:sportId", validateToken, validateAdmin, updateSport); // Update sport by ID
router.delete("/:sportId", validateToken, validateAdmin, deleteSport);
router.get("/", validateToken,getAllSports); // Fetch all sports
router.get("/:sportId", validateToken,getSportById); // Fetch a sport by ID
router.get("/by-country/:countryName", validateToken, getSportsByCountry);

module.exports = router;