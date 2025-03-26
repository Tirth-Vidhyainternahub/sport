const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { validateToken, validateAdmin } = require("../middleware/auth.middleware");
const {
  createSport,
  updateSport,
  deleteSport,
  getAllSports,
  getSportById,
  getSportsByCountry,
} = require("../controllers/sport.controller");

router.post("/", validateToken, validateAdmin, upload.single("logo"), createSport);
router.patch("/:sportId", validateToken, validateAdmin, upload.single("logo"), updateSport);
router.delete("/:sportId", validateToken, validateAdmin, deleteSport);
router.get("/", getAllSports);
router.get("/:sportId", getSportById);
router.get("/country/:countryName", getSportsByCountry);

module.exports = router;