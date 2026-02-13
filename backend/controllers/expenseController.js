const Expense = require('../models/Expense');
const mlServiceClient = require('../services/mlServiceClient');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const {
      category,
      department,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = { createdBy: req.user.id };

    if (category) {
      query.category = category;
    }

    if (department) {
      query.department = department;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Execute query
    const expenses = await Expense.find(query)
      .populate('department', 'name')
      .populate('employee', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-date');

    const count = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total: count,
      pages: Math.ceil(count / limit),
      data: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('department', 'name code')
      .populate('employee', 'firstName lastName')
      .populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    // Add user who created the expense
    req.body.createdBy = req.user.id;

    // If category not provided or is 'Other', use AI to categorize
    if (!req.body.category || req.body.category === 'Other') {
      const aiResult = await mlServiceClient.categorizeExpense({
        title: req.body.title,
        description: req.body.description,
        amount: req.body.amount,
        vendor: req.body.vendor
      });

      if (aiResult.success && aiResult.confidence > 0.6) {
        req.body.category = aiResult.category;
        req.body.aiSuggested = true;
        req.body.aiConfidence = aiResult.confidence;
      }
    }

    // Create expense
    const expense = await Expense.create(req.body);

    // Populate references
    await expense.populate('department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check ownership
    if (expense.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this expense'
      });
    }

    // Update expense
    req.body.updatedBy = req.user.id;

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check ownership
    if (expense.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
exports.getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { createdBy: req.user.id };

    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalExpenses = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byCategory: stats,
        overall: totalExpenses[0] || { total: 0, count: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Detect expense anomalies
// @route   POST /api/expenses/detect-anomalies
// @access  Private
exports.detectAnomalies = async (req, res) => {
  try {
    // Get recent expenses
    const expenses = await Expense.find({ createdBy: req.user.id })
      .sort('-date')
      .limit(100);

    if (expenses.length < 10) {
      return res.status(200).json({
        success: true,
        message: 'Need at least 10 expenses for anomaly detection',
        data: { anomalies: [] }
      });
    }

    // Call ML service
    const result = await mlServiceClient.detectAnomalies(expenses);

    // Mark anomalies in database
    if (result.success && result.anomalies.length > 0) {
      for (const anomaly of result.anomalies) {
        await Expense.findByIdAndUpdate(anomaly.expense_id, {
          isAnomaly: true,
          anomalyScore: anomaly.anomaly_score,
          anomalyReason: anomaly.reason
        });
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error detecting anomalies',
      error: error.message
    });
  }
};
