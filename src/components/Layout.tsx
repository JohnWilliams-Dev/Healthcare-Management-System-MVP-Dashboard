import React, { useState } from 'react';
import { Navigation } from './Navigation';
import '../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout-shell">
      <Navigation isOpen={sidebarOpen} onNavigate={closeSidebar} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <div className="layout-main">
        <header className="topbar">
          <button
            className="topbar-menu"
            aria-label="Open navigation"
            onClick={openSidebar}
          >
            ☰
          </button>
          <div>
            <div className="topbar-title">Healthcare Management</div>
            <div className="topbar-subtitle">Stay on top of patients, doctors, and appointments</div>
          </div>
          <div className="topbar-actions">
            {/* <input className="topbar-search" placeholder="Search patients, doctors, appointments..." /> */}
            <button className="btn-secondary">Support</button>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};
