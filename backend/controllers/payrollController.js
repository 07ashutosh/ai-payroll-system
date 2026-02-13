const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private
exports.getPayrollRecords = async (req, res) => {
  try {
    const { month, year, employee, page = 1, limit = 10 } = req.query;

    const query = {};

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (employee) query.employee = employee;

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName employeeId email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-year -month');

    const count = await Payroll.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payrolls.length,
      total: count,
      pages: Math.ceil(count / limit),
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payroll records',
      error: error.message
    });
  }
};

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
// @access  Private
exports.getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email department')
      .populate('processedBy', 'name email');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payroll',
      error: error.message
    });
  }
};

// @desc    Process monthly payroll for all employees
// @route   POST /api/payroll/process
// @access  Private (Admin, HR)
exports.processPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month and year'
      });
    }

    // Check if payroll already processed
    const existing = await Payroll.findOne({ month, year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Payroll for ${month}/${year} already processed`
      });
    }

    // Get all active employees
    const employees = await Employee.find({ status: 'Active' });

    const payrolls = [];
    const errors = [];

    // Process payroll for each employee
    for (const employee of employees) {
      try {
        // Calculate dates
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        // Calculate payroll
        const payrollData = {
          employee: employee._id,
          month,
          year,
          payPeriodStart: startDate,
          payPeriodEnd: endDate,
          workingDays: 30,
          daysPresent: 30, // TODO: Get from attendance system
          daysAbsent: 0,
          leaves: {
            casual: 0,
            sick: 0,
            paid: 0,
            unpaid: 0
          },
          earnings: {
            basicSalary: employee.salary.basic,
            hra: employee.salary.hra,
            allowances: employee.salary.allowances,
            bonuses: 0,
            incentives: 0,
            overtime: {
              hours: 0,
              rate: 0,
              amount: 0
            },
            arrears: 0,
            other: 0
          },
          deductions: {
            tax: employee.deductions.tax,
            providentFund: employee.deductions.providentFund,
            employeeStateInsurance: 0,
            professionalTax: 0,
            insurance: employee.deductions.insurance,
            loan: 0,
            advance: 0,
            lateDeduction: 0,
            other: employee.deductions.other
          },
          reimbursements: {
            travel: 0,
            medical: 0,
            food: 0,
            communication: 0,
            other: 0
          },
          grossSalary: employee.grossSalary,
          processedBy: req.user.id
        };

        const payroll = await Payroll.create(payrollData);
        payrolls.push(payroll);
      } catch (err) {
        errors.push({
          employee: employee.employeeId,
          error: err.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Payroll processed for ${payrolls.length} employees`,
      data: {
        processed: payrolls.length,
        failed: errors.length,
        errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing payroll',
      error: error.message
    });
  }
};

// @desc    Update payroll record
// @route   PUT /api/payroll/:id
// @access  Private (Admin, HR)
exports.updatePayroll = async (req, res) => {
  try {
    let payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Update payroll
    payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('employee', 'firstName lastName employeeId');

    res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payroll',
      error: error.message
    });
  }
};

// @desc    Mark payroll as paid
// @route   PUT /api/payroll/:id/mark-paid
// @access  Private (Admin, Accountant)
exports.markAsPaid = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    await payroll.markAsPaid(transactionId);

    res.status(200).json({
      success: true,
      message: 'Payroll marked as paid',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking payroll as paid',
      error: error.message
    });
  }
};

// @desc    Generate salary slip PDF
// @route   GET /api/payroll/:id/salary-slip
// @access  Private
exports.generateSalarySlip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'firstName lastName employeeId email department position');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=salary_slip_${payroll.employee.employeeId}_${payroll.month}_${payroll.year}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('SALARY SLIP', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Employee: ${payroll.employee.firstName} ${payroll.employee.lastName}`);
    doc.text(`Employee ID: ${payroll.employee.employeeId}`);
    doc.text(`Position: ${payroll.employee.position}`);
    doc.text(`Month: ${payroll.periodDescription}`);
    doc.moveDown();

    doc.text('EARNINGS', { underline: true });
    doc.text(`Basic Salary: $${payroll.earnings.basicSalary.toFixed(2)}`);
    doc.text(`HRA: $${payroll.earnings.hra.toFixed(2)}`);
    doc.text(`Allowances: $${payroll.earnings.allowances.toFixed(2)}`);
    doc.text(`Bonuses: $${payroll.earnings.bonuses.toFixed(2)}`);
    doc.text(`Total Earnings: $${payroll.totalEarnings.toFixed(2)}`, { bold: true });
    doc.moveDown();

    doc.text('DEDUCTIONS', { underline: true });
    doc.text(`Tax: $${payroll.deductions.tax.toFixed(2)}`);
    doc.text(`PF: $${payroll.deductions.providentFund.toFixed(2)}`);
    doc.text(`Insurance: $${payroll.deductions.insurance.toFixed(2)}`);
    doc.text(`Total Deductions: $${payroll.totalDeductions.toFixed(2)}`, { bold: true });
    doc.moveDown();

    doc.fontSize(14);
    doc.text(`NET SALARY: $${payroll.netSalary.toFixed(2)}`, { bold: true });

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating salary slip',
      error: error.message
    });
  }
};

// @desc    Get payroll statistics
// @route   GET /api/payroll/stats
// @access  Private
exports.getPayrollStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    const stats = await Payroll.getTotalPayroll(
      parseInt(month),
      parseInt(year)
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
