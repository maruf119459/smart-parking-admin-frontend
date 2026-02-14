import axios from "axios";
import { useState } from "react";

export default function CustomerService() {
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!email) return alert("Email required");

    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/customer-service/search",
        { params: { email, from, to } }
      );
      setResults(res.data);
    } catch (err) {
      alert("Search failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Customer Service</h2>

      <input
        placeholder="Customer email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />

      <button onClick={search}>Search</button>

      {loading && <p>Loading...</p>}

      {!loading && results.length === 0 && (
        <p>No records found</p>
      )}

      {results.map((r) => (
        <div
          key={r.parkingId}
          style={{ border: "1px solid #444", marginTop: 15, padding: 10 }}
        >
          <h4>Parking Info</h4>
          <p><b>Vehicle:</b> {r.vehicleType}</p>
          <p><b>Slot:</b> {r.slotNumber}</p>
          <p><b>Status:</b> {r.parkingStatus}</p>
          <p><b>Paid:</b> ৳ {r.paidAmount}</p>

          <h4>Payment Attempts</h4>
          {r.payments.length === 0 ? (
            <p>No payment attempts</p>
          ) : (
            <table border="1" cellPadding="6">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {r.payments.map((p, i) => (
                  <tr key={i}>
                    <td>{p.transactionId}</td>
                    <td>{p.amount ?? "-"}</td>
                    <td>{p.status}</td>
                    <td>{new Date(p.createdAt).toLocaleString()}</td>
                    <td>{p.paidAt ? new Date(p.paidAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
