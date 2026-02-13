const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  detectAnomalies
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Stats and special routes
router.get('/stats', getExpenseStats);
router.post('/detect-anomalies', detectAnomalies);

// CRUD routes
router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
