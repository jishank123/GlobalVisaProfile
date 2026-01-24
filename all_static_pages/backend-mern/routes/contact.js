const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getContactForms,
  getContactForm,
  updateContactForm,
  respondToContactForm,
  convertToLead,
  addCommunication,
  deleteContactForm,
  getContactStats
} = require('../controllers/contactFormController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/', submitContactForm);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/', getContactForms);
router.get('/stats', getContactStats);
router.get('/:id', getContactForm);
router.put('/:id', updateContactForm);
router.post('/:id/respond', respondToContactForm);
router.post('/:id/convert-to-lead', convertToLead);
router.post('/:id/communications', addCommunication);
router.delete('/:id', deleteContactForm);

module.exports = router;