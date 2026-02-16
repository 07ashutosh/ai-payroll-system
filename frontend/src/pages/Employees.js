import React, { useState, useEffect } from 'react';
import { employeeAPI, departmentAPI } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    department: '',
    position: '',
    employmentType: 'Full-time',
    'salary.basic': '',
    'salary.hra': '',
    'salary.allowances': ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data);
    } catch (error) {
      toast.error('Error fetching employees');
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert nested salary fields
    const submitData = {
      ...formData,
      salary: {
        basic: parseFloat(formData['salary.basic']) || 0,
        hra: parseFloat(formData['salary.hra']) || 0,
        allowances: parseFloat(formData['salary.allowances']) || 0
      }
    };
    delete submitData['salary.basic'];
    delete submitData['salary.hra'];
    delete submitData['salary.allowances'];

    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee, submitData);
        toast.success('Employee updated successfully');
      } else {
        await employeeAPI.create(submitData);
        toast.success('Employee created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee._id);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      dateOfBirth: employee.dateOfBirth?.split('T')[0] || '',
      gender: employee.gender,
      department: employee.department?._id || '',
      position: employee.position,
      employmentType: employee.employmentType,
      'salary.basic': employee.salary?.basic || '',
      'salary.hra': employee.salary?.hra || '',
      'salary.allowances': employee.salary?.allowances || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Error deleting employee');
      }
    }
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'Male',
      department: '',
      position: '',
      employmentType: 'Full-time',
      'salary.basic': '',
      'salary.hra': '',
      'salary.allowances': ''
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="employees-page">
        <div className="page-header">
          <h1>Employees</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            + Add Employee
          </button>
        </div>

        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td>{employee.employeeId}</td>
                  <td>{employee.firstName} {employee.lastName}</td>
                  <td>{employee.email}</td>
                  <td>{employee.department?.name || 'N/A'}</td>
                  <td>{employee.position}</td>
                  <td>${employee.salary?.basic?.toLocaleString() || 0}</td>
                  <td>
                    <span className={`status-badge status-${employee.status.toLowerCase()}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="btn-icon btn-edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
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

          {employees.length === 0 && (
            <div className="empty-state">
              <p>No employees found. Add your first employee!</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>

              <form onSubmit={handleSubmit} className="employee-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Position *</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Employment Type *</label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                </div>

                <h3 className="form-section-title">Salary Details</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Basic Salary *</label>
                    <input
                      type="number"
                      name="salary.basic"
                      value={formData['salary.basic']}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>HRA</label>
                    <input
                      type="number"
                      name="salary.hra"
                      value={formData['salary.hra']}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Allowances</label>
                    <input
                      type="number"
                      name="salary.allowances"
                      value={formData['salary.allowances']}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingEmployee ? 'Update' : 'Create'} Employee
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

export default Employees;
