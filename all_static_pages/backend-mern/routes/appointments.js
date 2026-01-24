const express = require('express');
const router = express.Router();
const {
  submitAppointmentRequest,
  getAppointmentRequests,
  getAppointmentRequest,
  updateAppointmentRequest,
  scheduleAppointment,
  addCommunication,
  deleteAppointmentRequest,
  getAppointmentStats
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/', submitAppointmentRequest);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/', getAppointmentRequests);
router.get('/stats', getAppointmentStats);
router.get('/:id', getAppointmentRequest);
router.put('/:id', updateAppointmentRequest);
router.post('/:id/schedule', scheduleAppointment);
router.post('/:id/communications', addCommunication);
router.delete('/:id', deleteAppointmentRequest);

module.exports = router;