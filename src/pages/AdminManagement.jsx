import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  console.log("User" + user.email)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  //Load all admins
  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin");
      setAdmins(res.data);
    } catch (err) {
      console.error("Fetch admin error:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  //Add admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/admin", form);
      alert("Admin added successfully");

      setForm({ name: "", email: "", phone: "" });
      fetchAdmins();
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Admin with this email already exists");
      } else {
        alert("Failed to add admin");
      }
    } finally {
      setLoading(false);
    }
  };

  //Delete admin
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/${id}`);
      alert("Admin deleted successfully");
      fetchAdmins();
    } catch (err) {
      alert("Failed to delete admin");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>
      <h2>Admin Management</h2>

      {/* Add Admin Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <h3>Add New Admin</h3>

        <input
          type="text"
          placeholder="Admin Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Admin Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="text"
          placeholder="Phone Number"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Admin"}
        </button>
      </form>

      {/*Admin List Table */}
      <h3>Admin List</h3>

      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>SL</th>
            <th>Admin Name</th>
            <th>Admin Email</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {admins.length === 0 ? (
            <tr>
              <td colSpan="5" align="center">
                No admins found
              </td>
            </tr>
          ) : (
            admins.map((admin, index) => (
              <tr key={admin._id}>
                <td>{index + 1}</td>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>{admin.phone}</td>
                <td>
                  <button
                    disabled={
                      admin.role === "super" || user?.email === admin.email
                    }
                    onClick={() => handleDelete(admin._id)}
                    style={{
                      color:
                        admin.role === "super" || user?.email === admin.email
                          ? "gray"
                          : "red",
                      cursor:
                        admin.role === "super" || user?.email === admin.email
                          ? "not-allowed"
                          : "pointer"
                    }}
                    title={
                      admin.role === "super"
                        ? "Super admin cannot be deleted"
                        : user?.email === admin.email
                          ? "You cannot delete your own account"
                          : "Delete admin"
                    }
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
