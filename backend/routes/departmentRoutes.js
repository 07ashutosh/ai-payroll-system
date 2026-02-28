const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats route
router.get('/:id/stats', getDepartmentStats);

// CRUD routes
router.route('/')
  .get(getDepartments)
  .post(authorize('Admin', 'HR'), createDepartment);

router.route('/:id')
  .get(getDepartment)
  .put(authorize('Admin', 'HR'), updateDepartment)
  .delete(authorize('Admin'), deleteDepartment);

module.exports = router;