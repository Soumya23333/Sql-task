const express = require("express");

const router = express.Router();

const { uploadDocument } = require("../controller/documentController");

const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");
const uploadLimiter = require("../middleware/rateLimitMiddleware");
router.post(
    "/document",
    protect,
    uploadLimiter,
    upload.single("document"),
    uploadDocument
);

module.exports = router;