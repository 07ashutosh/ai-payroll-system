const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('head', 'firstName lastName employeeId')
      .sort('name');

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'firstName lastName employeeId email')
      .populate('createdBy', 'name email');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin, HR)
exports.createDepartment = async (req, res) => {
  try {
    // Add user who created the department
    req.body.createdBy = req.user.id;

    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin, HR)
exports.updateDepartment = async (req, res) => {
  try {
    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('head', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has employees
    const Employee = require('../models/Employee');
    const employeeCount = await Employee.countDocuments({ 
      department: req.params.id 
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${employeeCount} employees are assigned to this department.`
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
};

// @desc    Get department statistics
// @route   GET /api/departments/:id/stats
// @access  Private
exports.getDepartmentStats = async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const Expense = require('../models/Expense');

    const [employeeCount, totalExpenses] = await Promise.all([
      Employee.countDocuments({ 
        department: req.params.id, 
        status: 'Active' 
      }),
      Expense.aggregate([
        { $match: { department: mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        employeeCount,
        totalExpenses: totalExpenses[0]?.total || 0
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