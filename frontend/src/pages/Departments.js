import React, { useState, useEffect } from 'react';
import { departmentAPI, employeeAPI } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import './Departments.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
    'budget.monthly': '',
    'budget.yearly': '',
    status: 'Active'
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (error) {
      toast.error('Error fetching departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees');
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

    // Convert nested budget fields
    const submitData = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      head: formData.head || undefined,
      budget: {
        monthly: parseFloat(formData['budget.monthly']) || 0,
        yearly: parseFloat(formData['budget.yearly']) || 0
      },
      status: formData.status
    };

    try {
      if (editingDept) {
        await departmentAPI.update(editingDept, submitData);
        toast.success('Department updated successfully');
      } else {
        await departmentAPI.create(submitData);
        toast.success('Department created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving department');
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept._id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      head: dept.head?._id || '',
      'budget.monthly': dept.budget?.monthly || '',
      'budget.yearly': dept.budget?.yearly || '',
      status: dept.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentAPI.delete(id);
        toast.success('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting department');
      }
    }
  };

  const resetForm = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      head: '',
      'budget.monthly': '',
      'budget.yearly': '',
      status: 'Active'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading departments...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="departments-page">
        <div className="page-header">
          <h1>Departments</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            + Add Department
          </button>
        </div>

        <div className="departments-grid">
          {departments.map((dept) => (
            <div key={dept._id} className="department-card">
              <div className="dept-header">
                <h3>{dept.name}</h3>
                <span className={`status-badge status-${dept.status.toLowerCase()}`}>
                  {dept.status}
                </span>
              </div>
              
              <div className="dept-code">Code: {dept.code}</div>
              
              {dept.description && (
                <p className="dept-description">{dept.description}</p>
              )}

              <div className="dept-info">
                <div className="info-item">
                  <span className="info-label">Head:</span>
                  <span className="info-value">
                    {dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'Not assigned'}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">Monthly Budget:</span>
                  <span className="info-value">${dept.budget?.monthly?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="dept-actions">
                <button onClick={() => handleEdit(dept)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => handleDelete(dept._id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {departments.length === 0 && (
          <div className="empty-state">
            <p>No departments found. Add your first department!</p>
          </div>
        )}

        {/* Add/Edit Department Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingDept ? 'Edit Department' : 'Add New Department'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>

              <form onSubmit={handleSubmit} className="department-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Department Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Human Resources"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Department Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., HR"
                      required
                      maxLength="10"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Department description..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department Head</label>
                    <select
                      name="head"
                      value={formData.head}
                      onChange={handleChange}
                    >
                      <option value="">Select Department Head</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Monthly Budget</label>
                    <input
                      type="number"
                      name="budget.monthly"
                      value={formData['budget.monthly']}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Yearly Budget</label>
                    <input
                      type="number"
                      name="budget.yearly"
                      value={formData['budget.yearly']}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingDept ? 'Update' : 'Create'} Department
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

export default Departments;