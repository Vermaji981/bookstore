const express = require('express');
const router = express.Router();
const { askBookAssistant } = require('../controllers/aiAssistantController');

router.post('/ask', askBookAssistant);

module.exports = router;

