const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Please provide expense title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Categorization
  category: {
    type: String,
    enum: [
      'Salary',
      'Rent',
      'Utilities',
      'Marketing',
      'Software',
      'Hardware',
      'Travel',
      'Office Supplies',
      'Insurance',
      'Legal',
      'Training',
      'Entertainment',
      'Maintenance',
      'Other'
    ],
    default: 'Other'
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // AI Classification
  aiSuggested: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  originalCategory: {
    type: String
  },

  // Date Information
  date: {
    type: Date,
    required: [true, 'Please provide expense date'],
    default: Date.now
  },
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  year: {
    type: Number
  },

  // Department & Employee
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  vendor: {
    type: String,
    trim: true
  },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Check', 'UPI', 'Other'],
    default: 'Bank Transfer'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  transactionId: {
    type: String
  },
  paidDate: {
    type: Date
  },

  // Receipt/Proof
  receipt: {
    filename: String,
    path: String,
    uploadDate: Date
  },
  invoiceNumber: {
    type: String
  },

  // Budget Tracking
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Yearly'],
    default: 'Monthly'
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
  approvedDate: {
    type: Date
  },
  rejectionReason: {
    type: String
  },

  // Anomaly Detection
  isAnomaly: {
    type: Boolean,
    default: false
  },
  anomalyScore: {
    type: Number
  },
  anomalyReason: {
    type: String
  },

  // Tags for better organization
  tags: [{
    type: String,
    trim: true
  }],

  // Notes
  notes: {
    type: String
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to set month and year
expenseSchema.pre('save', function(next) {
  if (this.date) {
    this.month = this.date.getMonth() + 1;
    this.year = this.date.getFullYear();
  }
  next();
});

// Indexes for performance
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ department: 1 });
expenseSchema.index({ month: 1, year: 1 });
expenseSchema.index({ paymentStatus: 1 });
expenseSchema.index({ createdBy: 1 });

// Static method to get expenses by date range
expenseSchema.statics.getByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('department employee createdBy');
};

// Static method to get monthly expenses
expenseSchema.statics.getMonthlyExpenses = function(month, year) {
  return this.find({ month, year })
    .populate('department employee')
    .sort('-date');
};

// Static method to get expenses by category
expenseSchema.statics.getByCategory = function(category, startDate, endDate) {
  const query = { category };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }
  return this.find(query).populate('department employee');
};

// Instance method to mark as anomaly
expenseSchema.methods.markAsAnomaly = function(score, reason) {
  this.isAnomaly = true;
  this.anomalyScore = score;
  this.anomalyReason = reason;
  return this.save();
};

// Virtual for formatted date
expenseSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

module.exports = mongoose.model('Expense', expenseSchema);
