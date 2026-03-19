import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, ShieldCheck, Settings, Headset } from "lucide-react";
import logo from "../assets/loading_img.png"

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinkStyle = "nav-item-custom text-decoration-none px-3 py-2 d-flex align-items-center gap-2";

  return (
    <>
      <nav className="navbar-fixed-top shadow-sm border-bottom bg-white w-100">
        <div className="container-fluid d-flex justify-content-between align-items-center px-4 py-2">

          {/* RIGHT SIDE: Logo */}
          <div className="navbar-logo">
            <Link className="navbar-brand" to="/">
              <img src={logo} alt="Logo" height="35" />
            </Link>
          </div>

          {/* LEFT SIDE: Options (Desktop) / Toggle Button (Mobile) */}
          <div className="d-flex align-items-center" ref={menuRef}>
            {user && (
              <>
                {/* Mobile Toggle Button */}
                <button
                  className="d-md-none border-0 bg-transparent p-0 me-3"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <X size={28} className="text-primary" /> : <Menu size={28} />}
                </button>

                {/* Desktop Nav Links */}
                <div className="d-none d-md-flex align-items-center gap-2">
                  <Link to="/" className={navLinkStyle}><LayoutDashboard size={18} /> Dashboard</Link>
                  <Link to="/AdminManagement" className={navLinkStyle}><ShieldCheck size={18} /> Admin</Link>
                  <Link to="/system-management" className={navLinkStyle}><Settings size={18} /> System</Link>
                  <Link to="/customer-service" className={navLinkStyle}><Headset size={18} /> Customer</Link>
                  <button onClick={handleLogout} className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-1 ms-2">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="d-flex gap-3">
                <Link to="/login" className="text-decoration-none fw-bold">Login</Link>
                <Link to="/register" className="text-decoration-none text-muted">Register</Link>
              </div>
            )}
          </div>

          

          {/* MOBILE DROPDOWN MENU */}
          <div className={`mobile-menu shadow-lg d-md-none ${isOpen ? "open" : ""}`}>
            <div className="p-3 d-flex flex-column gap-2">
              <Link to="/" onClick={() => setIsOpen(false)} className={navLinkStyle}><LayoutDashboard size={20} /> Dashboard</Link>
              <Link to="/AdminManagement" onClick={() => setIsOpen(false)} className={navLinkStyle}><ShieldCheck size={20} /> Admin</Link>
              <Link to="/system-management" onClick={() => setIsOpen(false)} className={navLinkStyle}><Settings size={20} /> System</Link>
              <Link to="/customer-service" onClick={() => setIsOpen(false)} className={navLinkStyle}><Headset size={20} /> Customer</Link>
              <hr className="my-1" />
              <button onClick={handleLogout} className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2 mt-2">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under the fixed navbar */}
      <div style={{ height: "70px" }}></div>

      <style>{`
        .navbar-fixed-top {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1050;
          background: white;
        }
        .nav-item-custom {
          color: #444;
          font-weight: 500;
          transition: all 0.2s;
          border-radius: 8px;
        }
        .nav-item-custom:hover {
          background-color: #f0f7ff;
          color: #0d6efd;
        }
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: white;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.4s ease-in-out, opacity 0.3s;
          opacity: 0;
          border-bottom: 2px solid #0d6efd;
        }
        .mobile-menu.open {
          max-height: 400px;
          opacity: 1;
        }
      `}</style>
    </>
  );
}