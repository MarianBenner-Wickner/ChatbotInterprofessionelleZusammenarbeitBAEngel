//routes/feedback.js

const express = require('express');
const router = express.Router();
const controller = require('../controllers/feedbackController');

// Routen
router.post('/feedback', controller.submitFeedback);
router.get('/feedback', controller.getFeedbackList);
router.delete('/feedback/:id', controller.deleteFeedback);
router.put('/feedback/:id/status', controller.markFeedbackAsSeen);

// Export
module.exports = router;