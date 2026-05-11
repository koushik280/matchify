const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { upload } = require("../config/cloudinary");
const {
  getMyProfile,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  reorderPhotos,
  updateLocation,
} = require("../controllers/profileController");

// All routes require authentication
router.use(protect);

// GET /api/profile/me - get own profile
router.get("/me", getMyProfile);

// PATCH /api/profile/update - update fields
router.patch("/update", updateProfile);

// POST /api/profile/upload-photo - upload single photo
router.post("/upload-photo", upload.single("photo"), uploadPhoto);

// DELETE /api/profile/delete-photo - delete photo
router.delete("/delete-photo", deletePhoto);

// PATCH /api/profile/reorder-photos - reorder photos
router.patch("/reorder-photos", reorderPhotos);

router.patch("/location", updateLocation);

module.exports = router;
