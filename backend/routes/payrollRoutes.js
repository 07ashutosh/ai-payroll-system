const express = require('express');
const router = express.Router();
const {
  getPayrollRecords,
  getPayroll,
  processPayroll,
  updatePayroll,
  markAsPaid,
  generateSalarySlip,
  getPayrollStats
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats and special routes
router.get('/stats', getPayrollStats);
router.post('/process', authorize('Admin', 'HR'), processPayroll);
router.get('/:id/salary-slip', generateSalarySlip);
router.put('/:id/mark-paid', authorize('Admin', 'Accountant'), markAsPaid);

// CRUD routes
router.route('/')
  .get(getPayrollRecords);

router.route('/:id')
  .get(getPayroll)
  .put(authorize('Admin', 'HR'), updatePayroll);

module.exports = router;
