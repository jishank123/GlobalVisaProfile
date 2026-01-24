const express = require('express');
const router = express.Router();
const {
  submitProfileAssessment,
  getProfileAssessments,
  getProfileAssessment,
  updateProfileAssessment,
  deleteProfileAssessment,
  getAssessmentStats
} = require('../controllers/profileAssessmentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/', submitProfileAssessment);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/', getProfileAssessments);
router.get('/stats', getAssessmentStats);
router.get('/:id', getProfileAssessment);
router.put('/:id', updateProfileAssessment);
router.delete('/:id', deleteProfileAssessment);

module.exports = router;