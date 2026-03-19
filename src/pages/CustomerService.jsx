import axios from "axios";
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Changed import
import { Search, FileText, Calendar, Mail, Download, Clock } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { BounceLoader } from "react-spinners";
import logo from "../assets/loading_img.png";

export default function CustomerService() {
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialPageLoad, setInitialPageLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitialPageLoad(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const search = async () => {
    if (!email) return toast.error("Customer email is required");

    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/customer-service/search",
        { params: { email, from, to } }
      );
      setResults(res.data);
      if (res.data.length === 0) toast.info("No records found for this query");
    } catch (err) {
      toast.error("Search failed. Check connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPaid = (payments) => {
    return payments
      .filter((p) => p.status?.toUpperCase() === "SUCCESS")
      .reduce((acc, p) => acc + (p.amount || 0), 0)
      .toFixed(2);
  };

  const downloadFullReport = () => {
    if (results.length === 0) return toast.warn("No data available to download");
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("City Parking - Full Customer Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Customer: ${email}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
    doc.text(`Search Period: ${from} to ${to}. (Date Formate: YYYY-MM-DD)`, 14, 40);

    let finalY = 40;

    results.forEach((record, index) => {
      const startY = index === 0 ? 45 : finalY + 20;
      
      if (startY > 250) {
        doc.addPage();
        finalY = 20; // Reset Y for new page
      } else {
        finalY = startY;
      }

      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text(`Record #${index + 1}: Booking ID ${record.parkingId.slice(-6).toUpperCase()}`, 14, finalY);

      const infoData = [
        ["Vehicle", record.vehicleType, "Slot", record.slotNumber || "N/A"],
        ["Booking Time", new Date(record.bookingTime).toLocaleString(), "Status", record.parkingStatus],
      ];

      // Using autoTable directly as a function to avoid the "not a function" error
      autoTable(doc, {
        startY: finalY + 5,
        body: infoData,
        theme: 'grid',
        styles: { fontSize: 9 },
      });

      const paymentRows = record.payments.map(p => [
        p.transactionId,
        `BDT ${p.amount}`,
        p.status,
        new Date(p.createdAt).toLocaleString()
      ]);

      paymentRows.push([
        { content: "Total Successful Paid", colSpan: 1, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: `BDT ${calculateTotalPaid(record.payments)}`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [["Txn ID", "Amount", "Status", "Date"]],
        body: paymentRows,
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
      });

      finalY = doc.lastAutoTable.finalY;
    });

    doc.save(`Full_Report_${email}.pdf`);
  };

  console.log(results);
  if (initialPageLoad) {
    return (
      <div style={{ height: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <img src={logo} alt="Logo" style={{ width: "220px", marginBottom: "20px" }} />
        <BounceLoader color="#6199ff" size={50} />
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "1100px", fontFamily: "sans-serif" }}>
      <ToastContainer position="top-right" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <Search className="text-primary" size={28} />
          <h2 className="fw-bold m-0" style={{ color: "#2c3e50" }}>Customer Service Portal</h2>
        </div>
        {results.length > 0 && (
          <button className="btn btn-success fw-bold d-flex align-items-center gap-2 shadow-sm" onClick={downloadFullReport}>
            <Download size={18} /> Download Full Report
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm p-4 rounded-4 mb-5 bg-white">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small fw-bold text-muted">Customer Email</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><Mail size={16}/></span>
              <input
                className="form-control bg-light border-start-0 shadow-none"
                placeholder="search@customer.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold text-muted">From Date</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><Calendar size={16}/></span>
              <input type="date" className="form-control bg-light border-start-0 shadow-none" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-bold text-muted">To Date</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><Calendar size={16}/></span>
              <input type="date" className="form-control bg-light border-start-0 shadow-none" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100 fw-bold py-2 shadow-sm" onClick={search} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <BounceLoader color="#6199ff" size={50} className="mx-auto" />
          <p className="mt-2 text-muted small">Fetching records...</p>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
          <p className="text-muted m-0">No parking records found for this criteria.</p>
        </div>
      )}

      {!loading && results.map((r) => (
        <div key={r.parkingId} className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom px-4">
            <div className="d-flex align-items-center gap-2">
              <FileText className="text-primary" size={20} />
              <h5 className="fw-bold m-0">Booking ID: #{r.parkingId.slice(-6).toUpperCase()}</h5>
            </div>
          </div>

          <div className="card-body px-4 py-4">
            <div className="row mb-4 text-center text-md-start">
              <div className="col-md-3 col-6 mb-3">
                <small className="text-muted d-block text-uppercase fw-bold">Vehicle</small>
                <span className="fw-bold text-dark">{r.vehicleType}</span>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <small className="text-muted d-block text-uppercase fw-bold">Slot</small>
                <span className="fw-bold text-dark">{r.slotNumber || "Not Assigned"}</span>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <small className="text-muted d-block text-uppercase fw-bold">Status</small>
                <span className={`badge ${r.parkingStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>{r.parkingStatus}</span>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <small className="text-muted d-block text-uppercase fw-bold">Total Paid</small>
                <span className="fw-bold text-primary">৳ {r.paidAmount || "0"}</span>
              </div>
            </div>

            <div className="row g-4 mb-4 bg-light p-3 rounded-3 mx-1">
                <div className="col-md-4 small"><Clock size={14} className="me-1"/> <b>Booking:</b> {new Date(r.bookingTime).toLocaleString()}</div>
                <div className="col-md-4 small"><Clock size={14} className="me-1"/> <b>Entry:</b> {r.entryTime ? new Date(r.entryTime).toLocaleString() : "N/A"}</div>
                <div className="col-md-4 small"><Clock size={14} className="me-1"/> <b>Exit:</b> {r.exitTime ? new Date(r.exitTime).toLocaleString() : "N/A"}</div>
            </div>

            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 mt-4">
              <FileText size={18} className="text-muted" /> Payment History
            </h6>
            
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr className="small text-uppercase">
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {r.payments.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-3 text-muted">No payment attempts record.</td></tr>
                  ) : (
                    <>
                      {r.payments.map((p, i) => (
                        <tr key={i} className="small">
                          <td className="font-monospace">{p.transactionId}</td>
                          <td className="fw-bold">৳ {p.amount ?? "-"}</td>
                          <td>
                            <span className={`badge rounded-pill ${p.status?.toLowerCase() === 'success' ? 'bg-success' : 'bg-danger'}`}>
                                {p.status}
                            </span>
                          </td>
                          <td>{new Date(p.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="table-primary">
                        <td className="fw-bold text-end">Total Successfully Paid:</td>
                        <td className="fw-bold text-primary" colSpan="3">৳ {calculateTotalPaid(r.payments)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .form-label { margin-bottom: 0.3rem; }
        .badge { font-weight: 500; font-size: 11px; text-transform: capitalize; }
        .table { font-size: 13px; }
        .card-header { border-top-left-radius: 12px !important; border-top-right-radius: 12px !important; }
        .btn-success { background-color: #198754; border: none; }
      `}</style>
    </div>
  );
}