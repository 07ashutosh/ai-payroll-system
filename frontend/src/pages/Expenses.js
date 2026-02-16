import React, { useState, useEffect } from 'react';
import { expenseAPI, departmentAPI } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import './Expenses.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Other',
    date: new Date().toISOString().split('T')[0],
    department: '',
    vendor: '',
    paymentMethod: 'Bank Transfer'
  });

  useEffect(() => {
    fetchExpenses();
    fetchDepartments();
    fetchStats();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data.data);
    } catch (error) {
      toast.error('Error fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await expenseAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await expenseAPI.create(formData);
      toast.success('Expense added successfully! AI categorized it automatically.');
      setShowModal(false);
      resetForm();
      fetchExpenses();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding expense');
    }
  };

  const handleDetectAnomalies = async () => {
    try {
      toast.info('Detecting anomalies...');
      const response = await expenseAPI.detectAnomalies();
      const anomalies = response.data.data.anomalies;
      
      if (anomalies.length > 0) {
        toast.warning(`Found ${anomalies.length} unusual expenses!`);
      } else {
        toast.success('No anomalies detected. All expenses look normal.');
      }
    } catch (error) {
      toast.error('Error detecting anomalies');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        toast.success('Expense deleted successfully');
        fetchExpenses();
        fetchStats();
      } catch (error) {
        toast.error('Error deleting expense');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      amount: '',
      category: 'Other',
      date: new Date().toISOString().split('T')[0],
      department: '',
      vendor: '',
      paymentMethod: 'Bank Transfer'
    });
  };

  const categories = [
    'Salary', 'Rent', 'Utilities', 'Marketing', 'Software', 'Hardware',
    'Travel', 'Office Supplies', 'Insurance', 'Legal', 'Training',
    'Entertainment', 'Maintenance', 'Other'
  ];

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading expenses...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="expenses-page">
        <div className="page-header">
          <div>
            <h1>Expenses</h1>
            <p>Track and categorize your business expenses with AI</p>
          </div>
          <div className="header-actions">
            <button onClick={handleDetectAnomalies} className="btn btn-warning">
              🔍 Detect Anomalies
            </button>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              + Add Expense
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-row">
            <div className="stat-card">
              <h3>Total Expenses</h3>
              <p className="stat-value">${stats.overall?.total?.toLocaleString() || 0}</p>
              <span className="stat-label">{stats.overall?.count || 0} transactions</span>
            </div>
            <div className="stat-card">
              <h3>Top Category</h3>
              <p className="stat-value">{stats.byCategory?.[0]?._id || 'N/A'}</p>
              <span className="stat-label">${stats.byCategory?.[0]?.total?.toLocaleString() || 0}</span>
            </div>
          </div>
        )}

        {/* Expenses Table */}
        <div className="expenses-table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.title}</td>
                  <td>
                    <span className="category-badge">
                      {expense.category}
                      {expense.aiSuggested && ' 🤖'}
                    </span>
                  </td>
                  <td className="amount">${expense.amount.toLocaleString()}</td>
                  <td>{expense.vendor || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${expense.paymentStatus.toLowerCase()}`}>
                      {expense.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="btn-icon btn-delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {expenses.length === 0 && (
            <div className="empty-state">
              <p>No expenses found. Add your first expense!</p>
            </div>
          )}
        </div>

        {/* Add Expense Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Expense</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>

              <form onSubmit={handleSubmit} className="expense-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Office rent payment"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Additional details..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <small>💡 Leave as "Other" for AI to categorize automatically</small>
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vendor</label>
                    <input
                      type="text"
                      name="vendor"
                      value={formData.vendor}
                      onChange={handleChange}
                      placeholder="Vendor/supplier name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Check">Check</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Expenses;
