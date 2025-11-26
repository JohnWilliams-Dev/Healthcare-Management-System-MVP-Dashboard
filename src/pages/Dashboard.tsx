import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

export const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h1>Healthcare Management System MVP Dashboard</h1>
      <p>Welcome to the Healthcare Management System MVP</p>

      <div className="dashboard-cards">
        <Link to="/patients" className="dashboard-card">
          <h2>Patients</h2>
          <p>Manage patient profiles and records</p>
        </Link>

        <Link to="/doctors" className="dashboard-card">
          <h2>Doctors</h2>
          <p>Manage doctor profiles and availability</p>
        </Link>

        <Link to="/appointments" className="dashboard-card">
          <h2>Appointments</h2>
          <p>Manage scheduling and appointment tracking</p>
        </Link>
      </div>
    </div>
  );
};
