import { useEffect, useState } from "react";
import { BarChart3, Home, Lock, MessageSquare, Moon, Shield, Sun } from "lucide-react";
import { NavLink } from "react-router";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Secure Chat", icon: MessageSquare },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Navbar() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="brand">
          <span className="brand-mark">
            <Shield size={16} />
          </span>
          <span>Azure AI Governance</span>
        </div>
        <nav className="nav-links">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Icon size={15} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          className="theme-toggle"
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="status-pill">
          <Lock size={13} />
          <span className="status-dot" />
          <span>Secure and Operational</span>
        </div>
      </div>
    </header>
  );
}
