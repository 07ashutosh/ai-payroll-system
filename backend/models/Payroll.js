const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  // Employee Reference
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Please provide employee']
  },

  // Period
  month: {
    type: Number,
    required: [true, 'Please provide month'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Please provide year']
  },
  payPeriodStart: {
    type: Date,
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },

  // Attendance
  workingDays: {
    type: Number,
    required: true,
    default: 30
  },
  daysPresent: {
    type: Number,
    required: true,
    default: 30
  },
  daysAbsent: {
    type: Number,
    default: 0
  },
  leaves: {
    casual: { type: Number, default: 0 },
    sick: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    unpaid: { type: Number, default: 0 }
  },
  holidays: {
    type: Number,
    default: 0
  },

  // Earnings
  earnings: {
    basicSalary: {
      type: Number,
      required: true
    },
    hra: {
      type: Number,
      default: 0
    },
    allowances: {
      type: Number,
      default: 0
    },
    bonuses: {
      type: Number,
      default: 0
    },
    incentives: {
      type: Number,
      default: 0
    },
    overtime: {
      hours: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    arrears: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },

  // Deductions
  deductions: {
    tax: {
      type: Number,
      default: 0
    },
    providentFund: {
      type: Number,
      default: 0
    },
    employeeStateInsurance: {
      type: Number,
      default: 0
    },
    professionalTax: {
      type: Number,
      default: 0
    },
    insurance: {
      type: Number,
      default: 0
    },
    loan: {
      type: Number,
      default: 0
    },
    advance: {
      type: Number,
      default: 0
    },
    lateDeduction: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },

  // Reimbursements
  reimbursements: {
    travel: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },

  // Calculated Amounts
  grossSalary: {
    type: Number,
    required: true
  },
  totalEarnings: {
    type: Number,
    required: true
  },
  totalDeductions: {
    type: Number,
    required: true
  },
  totalReimbursements: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },

  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid', 'Failed', 'On Hold'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Check', 'Cash', 'UPI'],
    default: 'Bank Transfer'
  },
  paymentDate: {
    type: Date
  },
  transactionId: {
    type: String
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },

  // Salary Slip
  salarySlipGenerated: {
    type: Boolean,
    default: false
  },
  salarySlipPath: {
    type: String
  },
  salarySlipGeneratedAt: {
    type: Date
  },

  // Approval Workflow
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },

  // Notes and Comments
  notes: {
    type: String
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // Metadata
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for unique payroll per employee per month
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Other indexes
payrollSchema.index({ month: 1, year: 1 });
payrollSchema.index({ paymentStatus: 1 });
payrollSchema.index({ approvalStatus: 1 });

// Virtual for period description
payrollSchema.virtual('periodDescription').get(function() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[this.month - 1]} ${this.year}`;
});

// Pre-save middleware to calculate totals
payrollSchema.pre('save', function(next) {
  // Calculate total earnings
  this.totalEarnings = 
    this.earnings.basicSalary +
    this.earnings.hra +
    this.earnings.allowances +
    this.earnings.bonuses +
    this.earnings.incentives +
    this.earnings.overtime.amount +
    this.earnings.arrears +
    this.earnings.other;

  // Calculate total deductions
  this.totalDeductions = 
    this.deductions.tax +
    this.deductions.providentFund +
    this.deductions.employeeStateInsurance +
    this.deductions.professionalTax +
    this.deductions.insurance +
    this.deductions.loan +
    this.deductions.advance +
    this.deductions.lateDeduction +
    this.deductions.other;

  // Calculate total reimbursements
  this.totalReimbursements = 
    this.reimbursements.travel +
    this.reimbursements.medical +
    this.reimbursements.food +
    this.reimbursements.communication +
    this.reimbursements.other;

  // Calculate net salary
  this.netSalary = this.totalEarnings - this.totalDeductions + this.totalReimbursements;

  // Ensure net salary is not negative
  this.netSalary = Math.max(0, this.netSalary);

  next();
});

// Static method to get payroll by period
payrollSchema.statics.getByPeriod = function(month, year) {
  return this.find({ month, year })
    .populate('employee', 'firstName lastName employeeId email department')
    .sort('employee.employeeId');
};

// Static method to get employee payroll history
payrollSchema.statics.getEmployeeHistory = function(employeeId, limit = 12) {
  return this.find({ employee: employeeId })
    .sort('-year -month')
    .limit(limit)
    .populate('employee', 'firstName lastName employeeId');
};

// Static method to calculate total payroll for period
payrollSchema.statics.getTotalPayroll = async function(month, year) {
  const result = await this.aggregate([
    {
      $match: { month, year, paymentStatus: { $ne: 'Failed' } }
    },
    {
      $group: {
        _id: null,
        totalGross: { $sum: '$grossSalary' },
        totalEarnings: { $sum: '$totalEarnings' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalNet: { $sum: '$netSalary' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result[0] || {
    totalGross: 0,
    totalEarnings: 0,
    totalDeductions: 0,
    totalNet: 0,
    count: 0
  };
};

// Instance method to mark as paid
payrollSchema.methods.markAsPaid = function(transactionId) {
  this.paymentStatus = 'Paid';
  this.paymentDate = new Date();
  this.transactionId = transactionId;
  return this.save();
};

// Instance method to generate salary slip path
payrollSchema.methods.getSalarySlipFilename = function() {
  return `salary_slip_${this.employee.employeeId}_${this.month}_${this.year}.pdf`;
};

module.exports = mongoose.model('Payroll', payrollSchema);
