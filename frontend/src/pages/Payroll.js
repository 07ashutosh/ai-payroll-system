import React, { useState, useEffect } from 'react';
import { payrollAPI } from '../services/api';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import './Payroll.css';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await payrollAPI.getAll({
        month: currentMonth,
        year: currentYear
      });
      setPayrolls(response.data.data);
    } catch (error) {
      toast.error('Error fetching payroll records');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    if (!window.confirm(`Process payroll for ${getMonthName(currentMonth)} ${currentYear}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await payrollAPI.process({
        month: currentMonth,
        year: currentYear
      });
      
      toast.success(`Payroll processed for ${response.data.data.processed} employees!`);
      fetchPayrolls();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSlip = async (id, employeeId) => {
    try {
      const response = await payrollAPI.getSalarySlip(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_slip_${employeeId}_${currentMonth}_${currentYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Salary slip downloaded!');
    } catch (error) {
      toast.error('Error downloading salary slip');
    }
  };

  const handleMarkAsPaid = async (id) => {
    const transactionId = prompt('Enter transaction ID:');
    if (!transactionId) return;

    try {
      await payrollAPI.markAsPaid(id, { transactionId });
      toast.success('Payroll marked as paid!');
      fetchPayrolls();
    } catch (error) {
      toast.error('Error updating payroll status');
    }
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading payroll...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="payroll-page">
        <div className="page-header">
          <div>
            <h1>Payroll Management</h1>
            <p>Period: {getMonthName(currentMonth)} {currentYear}</p>
          </div>
          <button
            onClick={handleProcessPayroll}
            className="btn btn-primary"
            disabled={processing || payrolls.length > 0}
          >
            {processing ? 'Processing...' : '⚡ Process Payroll'}
          </button>
        </div>

        {payrolls.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">💼</div>
            <h2>No Payroll Processed</h2>
            <p>Click "Process Payroll" to calculate salaries for this month</p>
            <button onClick={handleProcessPayroll} className="btn btn-primary" disabled={processing}>
              {processing ? 'Processing...' : 'Process Now'}
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="payroll-summary">
              <div className="summary-card">
                <h3>Total Employees</h3>
                <p className="summary-value">{payrolls.length}</p>
              </div>
              <div className="summary-card">
                <h3>Total Gross</h3>
                <p className="summary-value">
                  ${payrolls.reduce((sum, p) => sum + p.grossSalary, 0).toLocaleString()}
                </p>
              </div>
              <div className="summary-card">
                <h3>Total Net</h3>
                <p className="summary-value">
                  ${payrolls.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
                </p>
              </div>
              <div className="summary-card">
                <h3>Paid</h3>
                <p className="summary-value">
                  {payrolls.filter(p => p.paymentStatus === 'Paid').length}/{payrolls.length}
                </p>
              </div>
            </div>

            {/* Payroll Table */}
            <div className="payroll-table-container">
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll._id}>
                      <td>
                        {payroll.employee?.firstName} {payroll.employee?.lastName}
                      </td>
                      <td>{payroll.employee?.employeeId}</td>
                      <td className="amount">${payroll.grossSalary.toLocaleString()}</td>
                      <td className="deduction">${payroll.totalDeductions.toLocaleString()}</td>
                      <td className="net-amount">${payroll.netSalary.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${payroll.paymentStatus.toLowerCase()}`}>
                          {payroll.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDownloadSlip(payroll._id, payroll.employee?.employeeId)}
                          className="btn-icon"
                          title="Download Slip"
                        >
                          📄
                        </button>
                        {payroll.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(payroll._id)}
                            className="btn-icon"
                            title="Mark as Paid"
                          >
                            ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Payroll;
