import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI, expenseAPI, payrollAPI } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    employees: { total: 0 },
    expenses: { total: 0, count: 0 },
    payroll: { totalNet: 0, count: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeeStats, expenseStats, payrollStats] = await Promise.all([
        employeeAPI.getStats(),
        expenseAPI.getStats(),
        payrollAPI.getStats({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
      ]);

      setStats({
        employees: employeeStats.data.data || { total: 0 },
        expenses: expenseStats.data.data?.overall || { total: 0, count: 0 },
        payroll: payrollStats.data.data || { totalNet: 0, count: 0 }
      });
    } catch (error) {
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}!</h1>
            <p className="dashboard-subtitle">Here's what's happening with your business today</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Employees</h3>
              <p className="stat-value">{stats.employees.totalEmployees || 0}</p>
              <span className="stat-label">Active employees</span>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Expenses</h3>
              <p className="stat-value">${(stats.expenses.total || 0).toLocaleString()}</p>
              <span className="stat-label">{stats.expenses.count || 0} transactions</span>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <h3>Monthly Payroll</h3>
              <p className="stat-value">${(stats.payroll.totalNet || 0).toLocaleString()}</p>
              <span className="stat-label">{stats.payroll.count || 0} employees paid</span>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>AI Insights</h3>
              <p className="stat-value">Active</p>
              <span className="stat-label">Real-time monitoring</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/employees')} className="action-card">
              <span className="action-icon">👤</span>
              <h3>Manage Employees</h3>
              <p>Add, edit, or view employee details</p>
            </button>

            <button onClick={() => navigate('/expenses')} className="action-card">
              <span className="action-icon">💳</span>
              <h3>Track Expenses</h3>
              <p>Record and categorize expenses with AI</p>
            </button>

            <button onClick={() => navigate('/payroll')} className="action-card">
              <span className="action-icon">💸</span>
              <h3>Process Payroll</h3>
              <p>Calculate and process monthly salaries</p>
            </button>

            <button className="action-card">
              <span className="action-icon">📈</span>
              <h3>View Reports</h3>
              <p>Generate financial reports and insights</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon activity-success">✓</div>
              <div className="activity-content">
                <h4>Payroll Processed</h4>
                <p>Monthly payroll completed successfully</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon activity-info">📝</div>
              <div className="activity-content">
                <h4>New Expense Added</h4>
                <p>Office supplies expense recorded</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon activity-primary">👤</div>
              <div className="activity-content">
                <h4>Employee Onboarded</h4>
                <p>New team member added to system</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
