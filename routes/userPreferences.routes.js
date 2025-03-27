const express = require("express");
const router = express.Router();
const { createUserPreferences,getUserPreferences,getAllUserPreferences,getUserPreferencesByPreferenceId,updateUserPreferences,deleteUserPreferencesById } = require("../controllers/userPreferences.controller");
const {validateToken,validateAdmin} = require("../middleware/auth.middleware");

// Route to create/update user preferences
router.post("/", validateToken,createUserPreferences);
router.get("/",validateToken,validateAdmin,getUserPreferences)
router.get("/all", validateToken,validateAdmin ,getAllUserPreferences);
router.get("/:id", validateToken,validateAdmin,getUserPreferencesByPreferenceId);
router.patch("/update", validateToken, updateUserPreferences);
router.delete("/:id", validateToken, validateAdmin,deleteUserPreferencesById);

module.exports = router;