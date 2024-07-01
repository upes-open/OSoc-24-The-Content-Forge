const express = require('express');
const router = express.Router();
const { uploadToS3 } = require('../controllers/uploadController');

// POST /api/upload
router.post('/upload', uploadToS3);

module.exports = router;
