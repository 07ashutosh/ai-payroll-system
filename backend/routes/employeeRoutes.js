const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats route
router.get('/stats', getEmployeeStats);

// CRUD routes
router.route('/')
  .get(getEmployees)
  .post(authorize('Admin', 'HR'), createEmployee);

router.route('/:id')
  .get(getEmployee)
  .put(authorize('Admin', 'HR'), updateEmployee)
  .delete(authorize('Admin'), deleteEmployee);

module.exports = router;
