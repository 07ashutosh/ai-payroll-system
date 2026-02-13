const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'Please provide first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  // Employment Information
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Please assign a department']
  },
  position: {
    type: String,
    required: [true, 'Please provide position']
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
    default: 'Full-time'
  },
  joinDate: {
    type: Date,
    required: [true, 'Please provide join date'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Terminated', 'On Leave'],
    default: 'Active'
  },

  // Salary Information
  salary: {
    basic: {
      type: Number,
      required: [true, 'Please provide basic salary']
    },
    hra: {
      type: Number,
      default: 0
    },
    allowances: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
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
    insurance: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },

  // Bank Details
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String
  },

  // Tax Information
  taxInfo: {
    panNumber: String,
    taxId: String,
    taxExemptions: Number
  },

  // Leave Information
  leaves: {
    casual: {
      total: { type: Number, default: 12 },
      used: { type: Number, default: 0 }
    },
    sick: {
      total: { type: Number, default: 12 },
      used: { type: Number, default: 0 }
    },
    paid: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 }
    }
  },

  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['Resume', 'ID Proof', 'Address Proof', 'Education', 'Other']
    },
    filename: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],

  // Profile Picture
  profilePicture: {
    type: String,
    default: null
  },

  // Performance Metrics
  performance: {
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    lastReviewDate: Date,
    nextReviewDate: Date
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for gross salary
employeeSchema.virtual('grossSalary').get(function() {
  return this.salary.basic + this.salary.hra + this.salary.allowances;
});

// Virtual for total deductions
employeeSchema.virtual('totalDeductions').get(function() {
  return this.deductions.tax + 
         this.deductions.providentFund + 
         this.deductions.insurance + 
         this.deductions.other;
});

// Virtual for net salary
employeeSchema.virtual('netSalary').get(function() {
  return this.grossSalary - this.totalDeductions;
});

// Virtual for available leaves
employeeSchema.virtual('availableLeaves').get(function() {
  return {
    casual: this.leaves.casual.total - this.leaves.casual.used,
    sick: this.leaves.sick.total - this.leaves.sick.used,
    paid: this.leaves.paid.total - this.leaves.paid.used
  };
});

// Index for faster queries
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

// Pre-save middleware to generate employee ID
employeeSchema.pre('save', async function(next) {
  if (this.isNew && !this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Method to calculate monthly salary
employeeSchema.methods.calculateMonthlySalary = function(bonuses = 0, overtime = 0, daysPresent = 30) {
  const dailySalary = this.grossSalary / 30;
  const earnedSalary = dailySalary * daysPresent;
  const totalEarnings = earnedSalary + bonuses + overtime;
  const netPay = totalEarnings - this.totalDeductions;
  
  return {
    basic: this.salary.basic,
    hra: this.salary.hra,
    allowances: this.salary.allowances,
    bonuses,
    overtime,
    grossEarnings: totalEarnings,
    deductions: this.totalDeductions,
    netPay: Math.max(0, netPay)
  };
};

module.exports = mongoose.model('Employee', employeeSchema);
