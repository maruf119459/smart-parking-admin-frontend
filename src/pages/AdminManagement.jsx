import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import { Trash2, UserPlus, Users, Phone, Mail, User } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/loading_img.png";
import { BounceLoader } from "react-spinners";
import { io } from "socket.io-client";
import { Helmet } from "react-helmet-async";

// Initialize socket 
const socket = io("http://localhost:5000");

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [initialPageLoad, setInitialPageLoad] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Validation Logic
  const isPhoneValid = /^01[0-9]{9}$/.test(form.phone);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isFormValid = form.name.trim() !== "" && isEmailValid && isPhoneValid;

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin");
      setAdmins(res.data);
    } catch (err) {
      toast.error("Failed to load admin list");
    } finally {
      setTimeout(() => setInitialPageLoad(false), 800);
    }
  };

  useEffect(() => {
    fetchAdmins();

    socket.on("adminUpdated", () => {
      fetchAdmins();
    });

    return () => {
      socket.off("adminUpdated");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/admin", form);
      toast.success("Admin authorized successfully");
      setForm({ name: "", email: "", phone: "" });
      fetchAdmins();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("This email is already registered");
      } else {
        toast.error("An error occurred while adding the admin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, adminEmail, adminRole) => {
    if (adminRole === "super" || user?.email === adminEmail) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to remove ${adminEmail} from the admin list.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/admin/${id}`);
          toast.success("Admin removed successfully");
          fetchAdmins();
        } catch (err) {
          toast.error("Failed to delete admin");
        }
      }
    });
  };

  if (initialPageLoad) {
    return (
        <div style={{ height: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <img src={logo} alt="Logo" style={{ width: "220px", marginBottom: "20px" }} />
          <BounceLoader color="#6199ff" size={50} />
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>City Parking | Admin Management</title>
      </Helmet>

      <div className="container py-4" style={{ maxWidth: "1000px" }}>
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="d-flex align-items-center gap-2 mb-4">
          <Users className="text-primary" size={28} />
          <h2 className="fw-bold m-0" style={{ color: "#2c3e50" }}>Admin Management</h2>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 rounded-4 sticky-top" style={{ top: "90px" }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <UserPlus className="text-primary" size={20} />
                <h5 className="fw-bold m-0">Add New Admin</h5>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><User size={16} /></span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 shadow-none"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Mail size={16} /></span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0 shadow-none"
                      placeholder="admin@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Phone size={16} /></span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0 shadow-none"
                      placeholder="01XXXXXXXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                  {form.phone && !isPhoneValid && (
                    <div className="text-danger x-small mt-1" style={{ fontSize: "11px" }}>
                      Must be 11 digits starting with 01
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2 shadow-sm rounded-3"
                  disabled={loading || !isFormValid}
                >
                  {loading ? "Authorizing..." : "Add Admin"}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 border-0">SL</th>
                      <th className="py-3 border-0">Admin Info</th>
                      <th className="py-3 border-0">Contact</th>
                      <th className="py-3 border-0 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">No administrators found.</td>
                      </tr>
                    ) : (
                      admins.map((admin, index) => {
                        const isProtected = admin.role === "super" || user?.email === admin.email;

                        return (
                          <tr key={admin._id}>
                            <td className="px-4 text-muted small">{index + 1}</td>
                            <td>
                              <div className="fw-bold">{admin.name}</div>
                              <div className="small text-muted">{admin.email}</div>
                              {admin.role === "super" && <span className="badge bg-soft-primary text-primary x-small">Super Admin</span>}
                            </td>
                            <td className="small">{admin.phone}</td>
                            <td className="text-center px-4">
                              <button
                                className="btn btn-sm p-2 border-0"
                                onClick={() => handleDelete(admin._id, admin.email, admin.role)}
                                disabled={isProtected}
                                style={{
                                  color: isProtected ? "#dee2e6" : "#dc3545",
                                  transition: "0.2s"
                                }}
                                title={
                                  admin.role === "super"
                                    ? "Protected Role"
                                    : user?.email === admin.email
                                      ? "Your Account"
                                      : "Delete Admin"
                                }
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .bg-soft-primary { background-color: #e7f1ff; font-size: 10px; }
        .x-small { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .table thead th { font-size: 12px; text-transform: uppercase; color: #6c757d; font-weight: 700; }
        .form-control:focus { border-color: #0d6efd; background-color: #fff; }
        .input-group-text { color: #6c757d; }
      `}</style>
      </div>
    </>
  );
}