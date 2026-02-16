import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>💼 AI Payroll</h2>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          
          <Link to="/employees" className={`nav-item ${isActive('/employees')}`}>
            <span className="nav-icon">👥</span>
            <span>Employees</span>
          </Link>
          
          <Link to="/expenses" className={`nav-item ${isActive('/expenses')}`}>
            <span className="nav-icon">💳</span>
            <span>Expenses</span>
          </Link>
          
          <Link to="/payroll" className={`nav-item ${isActive('/payroll')}`}>
            <span className="nav-icon">💰</span>
            <span>Payroll</span>
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
