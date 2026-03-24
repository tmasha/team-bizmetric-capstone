import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/chat', label: 'Secure Chat' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-mark">AI</span>
        <span>Azure AI Governance</span>
      </div>
      <nav className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="status-pill">Secure and Operational</div>
    </header>
  );
}
