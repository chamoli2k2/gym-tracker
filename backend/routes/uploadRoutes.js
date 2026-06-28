const express = require('express');
const path = require('path');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

router.post('/image', upload.single('image'), uploadController.uploadImage);

module.exports = router;
