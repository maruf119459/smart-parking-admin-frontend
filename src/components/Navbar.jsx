import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        padding: "10px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      {/* LEFT SIDE NAV */}
      <div>
        {user && (
          <>
            <Link to="/" style={{ marginRight: "10px" }}>
              Dashboard
            </Link>
            <Link to="/AdminManagement" style={{ marginRight: "10px" }}>
              Admin Management
            </Link>
            <Link to="/system-management" style={{ marginRight: "10px" }}>
              System Management
            </Link>
            <Link to="/customer-service" style={{ marginRight: "10px" }}>
              Customer Service
            </Link>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" style={{ marginRight: "10px" }}>
              Login
            </Link>
            <Link to="/register">
              Create Account
            </Link>
          </>
        )}
      </div>

      {/* RIGHT SIDE */}
      {user && (
        <button onClick={handleLogout}>
          Logout
        </button>
      )}
    </nav>
  );
}
