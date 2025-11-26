import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/patients', label: 'Patients' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/appointments', label: 'Appointments' },
];

interface NavigationProps {
  isOpen?: boolean;
  onNavigate?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isOpen = true, onNavigate }) => {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">HM</div>
        <div>
          <div className="brand-title">HealthCare</div>
          <div className="brand-subtitle">Management</div>
        </div>
      </div>
      <nav className="sidebar-links">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={onNavigate}
            >
              <span className="dot" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
