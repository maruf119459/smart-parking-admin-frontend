import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import {
  Settings, Trash2, Layers, DollarSign,
  ChevronLeft, ChevronRight, Edit
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/loading_img.png";
import { BounceLoader } from "react-spinners";
import { Helmet } from "react-helmet-async";

const BASE_URL = "https://smart-parking-backend-u47b.onrender.com/api";
const ITEMS_PER_PAGE = 10;

export default function SystemManagement() {
  const [chargeControls, setChargeControls] = useState([]);
  const [slots, setSlots] = useState([]);
  const [initialPageLoad, setInitialPageLoad] = useState(true);

  // Pagination
  const [ratePage, setRatePage] = useState(1);
  const [slotPage, setSlotPage] = useState(1);

  // Charge form (add)
  const [vehicleType, setVehicleType] = useState("");
  const [chargingRate, setChargingRate] = useState("");
  const [timeType, setTimeType] = useState("Per Minute");

  // Slot form (add)
  const [levelNo, setLevelNo] = useState("");
  const [rowNo, setRowNo] = useState("");
  const [sNo, setSNo] = useState("");
  const [slotVehicleType, setSlotVehicleType] = useState("");

  // Edit states
  const [editingChargeId, setEditingChargeId] = useState(null);
  const [editChargingRate, setEditChargingRate] = useState("");
  const [editTimeType, setEditTimeType] = useState("Per Minute");

  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editSlotVehicleType, setEditSlotVehicleType] = useState("");

  /* ---------------- LOAD DATA ---------------- */
  const loadData = useCallback(async () => {
    if (!initialPageLoad) setInitialPageLoad(true);

    try {
      const [slotRes, chargeRes] = await Promise.all([
        axios.get(`${BASE_URL}/slots`),
        axios.get(`${BASE_URL}/vehicle-types-and-charges`)
      ]);

      setChargeControls(chargeRes.data || []);
      setSlots(slotRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load system data");
    }
    finally {
      setInitialPageLoad(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ---------------- CHARGE HANDLERS ---------------- */
  const handleAddCharge = async (e) => {
    e.preventDefault();
    const formattedVehicle = vehicleType.trim().toLowerCase().replace(/\s+/g, '_');

    // Basic duplicate check (client-side)
    if (chargeControls.some(c => c.vehicleType === formattedVehicle)) {
      toast.error("This vehicle type already exists");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/charge-control`, {
        vehicleType: formattedVehicle,
        chargingRate: Number(chargingRate),
      });
      toast.success("Charge rule added");
      setVehicleType("");
      setChargingRate("");
      setTimeType("Per Minute");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding charge");
    }
  };

  const startEditCharge = (charge) => {
    setEditingChargeId(charge._id);
    setEditChargingRate(charge.chargingRate);
    setEditTimeType(charge.timeType || "Per Minute");
  };

  const handleUpdateCharge = async (e, id) => {
    e.preventDefault();
    try {
      await axios.patch(`${BASE_URL}/charge-control/${id}`, {
        chargingRate: Number(editChargingRate),
        timeType: editTimeType,
      });
      toast.success("Charge updated");
      setEditingChargeId(null);
      loadData();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteCharge = (id) => {
    Swal.fire({
      title: "Delete Charge Rate?",
      text: "This may affect existing slots using this type.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/charge-control/${id}`);
          toast.success("Deleted");
          loadData();
        } catch {
          toast.error("Delete failed");
        }
      }
    });
  };

  /* ---------------- SLOT HANDLERS ---------------- */
  const handleAddSlot = async (e) => {
    e.preventDefault();
    const slotID = `L${levelNo}-R${rowNo}-S${sNo}`;

    try {
      await axios.post(`${BASE_URL}/slots`, {
        slotNumber: slotID,
        vehicleType: slotVehicleType,
        status: "free"
      });
      toast.success("Slot added");
      setLevelNo(""); setRowNo(""); setSNo(""); setSlotVehicleType("");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Slot already exists or server error");
    }
  };

  const startEditSlot = (id) => {
    const slotToEdit = slots.find(s => s._id === id);
    if (slotToEdit) {
      setEditingSlotId(id);
      setEditSlotVehicleType(slotToEdit.vehicleType);
    }
  };


  const handleUpdateSlot = async (e, id) => {
    e.preventDefault();
    try {
      await axios.patch(`${BASE_URL}/slots-update-slotNumber-vehicleType/${id}`, {
        vehicleType: editSlotVehicleType,
      });
      toast.success("Slot updated");
      setEditingSlotId(null);
      loadData();
    } catch (err) {
      toast.error("Slot update failed");
    }
  };

  const deleteSlot = (id) => {
    Swal.fire({
      title: "Delete slot?",
      icon: "question",
      showCancelButton: true
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await axios.delete(`${BASE_URL}/slots/${id}`);
          toast.success("Slot deleted");
          loadData();
        } catch {
          toast.error("Delete failed");
        }
      }
    });
  };

  /* ---------------- PAGINATION ---------------- */
  const paginate = (data, currentPage) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const PaginationButtons = ({ totalItems, currentPage, setPage }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage === totalPages}
          onClick={() => setPage(currentPage + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };


  if (initialPageLoad) {
    return (
      <div style={{ height: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", }} >
        <img src={logo} alt="City Parking Logo" style={{ width: "220px", marginBottom: "20px" }} />
        <BounceLoader color="#6199ff" size={50} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>City Parking | System Management</title>
      </Helmet>
      <div className="container-fluid p-4 bg-light min-vh-100">
        <ToastContainer position="top-right" />

        <div className="mb-4">
          <h3 className="fw-bold text-dark d-flex align-items-center gap-2">
            <Settings className="text-primary" /> System Configuration
          </h3>
        </div>

        <div className="row g-4">
          {/* LEFT: FORMS */}
          <div className="col-lg-4">
            {/* CHARGE FORM */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                  <DollarSign size={20} className="text-success" /> Pricing Rules
                </h5>
                <form onSubmit={handleAddCharge} className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold">Vehicle Category</label>
                    <input
                      className="form-control"
                      placeholder="e.g. SUV, Bike"
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Rate (BDT)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={chargingRate}
                      onChange={e => setChargingRate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Unit</label>
                    <select
                      className="form-select"
                      value={timeType}
                      onChange={e => setTimeType(e.target.value)}
                    >
                      <option value="Per Minute">Per Minute</option>
                      <option value="Per Hour">Per Hour</option>
                    </select>
                  </div>
                  <button className="btn btn-primary w-100 fw-bold py-2 mt-3">Add Pricing Rule</button>
                </form>
              </div>
            </div>

            {/* SLOT FORM */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <Layers size={20} className="text-primary" /> Create New Slot
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddSlot} className="row g-3">
                  <div className="col-4">
                    <label className="form-label small fw-bold">Level</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="1"
                      value={levelNo}
                      onChange={e => setLevelNo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label small fw-bold">Row</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="3"
                      value={rowNo}
                      onChange={e => setRowNo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label small fw-bold">Slot</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="5"
                      value={sNo}
                      onChange={e => setSNo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 text-center text-muted small py-1 bg-light rounded">
                    Generated ID: <b>L{levelNo || 0}-R{rowNo || 0}-S{sNo || 0}</b>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Authorized Vehicle</label>
                    <select
                      className="form-select"
                      value={slotVehicleType}
                      onChange={e => setSlotVehicleType(e.target.value)}
                      required
                    >
                      <option value="">Select Type</option>
                      {chargeControls.map(c => (
                        <option key={c._id} value={c.vehicleType}>
                          {c.vehicleType.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-dark w-100 fw-bold mt-3">Add Slot to System</button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: TABLES + EDIT FORMS */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-0 p-4 pb-0">
                <ul className="nav nav-tabs border-0 gap-3" id="systemTab" role="tablist">
                  <li className="nav-item">
                    <button className="nav-link active fw-bold border-0" data-bs-toggle="tab" data-bs-target="#tab-rates">Rate Registry</button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link fw-bold border-0" data-bs-toggle="tab" data-bs-target="#tab-slots">Slot Map</button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-4">
                <div className="tab-content">
                  {/* RATES TAB */}
                  <div className="tab-pane fade show active" id="tab-rates">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr className="small text-muted">
                          <th>VEHICLE TYPE</th>
                          <th>RATE</th>
                          <th>UNIT</th>
                          <th className="text-end">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(chargeControls, ratePage).map((c) => (
                          <React.Fragment key={c._id}>
                            <tr>
                              <td className="fw-bold">{c.vehicleType.replace('_', ' ').toUpperCase()}</td>
                              <td>{c.chargingRate}</td>
                              <td>
                                <span className="badge bg-light text-dark border">
                                  {c.timeType || "Per Minute"}
                                </span>
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-link text-danger me-1"
                                  onClick={() => deleteCharge(c._id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  className="btn btn-sm btn-link text-primary"
                                  onClick={() => startEditCharge(c)}
                                >
                                  <Edit size={16} />
                                </button>
                              </td>
                            </tr>

                            {/* FIXED: Conditional rendering now checks specific ID */}
                            {editingChargeId === c._id && (
                              <tr>
                                <td colSpan={4} className="border-0">
                                  <form
                                    onSubmit={(e) => handleUpdateCharge(e, c._id)}
                                    className="row g-2 bg-light p-3 rounded shadow-sm"
                                  >
                                    <div className="col-5">
                                      <input
                                        className="form-control form-control-sm bg-white"
                                        value={c.vehicleType.replace('_', ' ').toUpperCase()}
                                        disabled
                                      />
                                    </div>
                                    <div className="col-3">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={editChargingRate}
                                        onChange={e => setEditChargingRate(e.target.value)}
                                        required
                                      />
                                    </div>
                                    <div className="col-2">
                                      <select
                                        className="form-select form-select-sm"
                                        value={editTimeType}
                                        onChange={e => setEditTimeType(e.target.value)}
                                      >
                                        <option value="Per Minute">Per Minute</option>
                                        <option value="Per Hour">Per Hour</option>
                                      </select>
                                    </div>
                                    <div className="col-2 d-flex gap-1">
                                      <button type="submit" className="btn btn-sm btn-success">Save</button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setEditingChargeId(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    <PaginationButtons
                      totalItems={chargeControls.length}
                      currentPage={ratePage}
                      setPage={setRatePage}
                    />
                  </div>

                  {/* SLOTS TAB */}
                  <div className="tab-pane fade" id="tab-slots">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr className="small text-muted">
                          <th>SLOT ID</th>
                          <th>CATEGORY</th>
                          <th>STATUS</th>
                          <th className="text-end">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(slots, slotPage).map((s) => (
                          <React.Fragment key={s._id}>
                            <tr>
                              <td className="font-monospace fw-bold text-primary">{s.slotNumber}</td>
                              <td className="text-capitalize">{s.vehicleType.replace('_', ' ')}</td>
                              <td>
                                <span className={`badge rounded-pill ${s.status === 'free' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-link text-danger me-1"
                                  onClick={() => deleteSlot(s._id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                                <button
                                  className="btn btn-sm btn-link text-primary"
                                  onClick={() => startEditSlot(s._id)}
                                >
                                  <Edit size={16} />
                                </button>
                              </td>
                            </tr>

                            {editingSlotId === s._id && (
                              <tr>
                                <td colSpan={4}>
                                  <form
                                    onSubmit={(e) => handleUpdateSlot(e, s._id)}
                                    className="row g-2 bg-light p-3 rounded"
                                  >
                                    <div className="col-6">
                                      <input
                                        className="form-control form-control-sm bg-white"
                                        value={s.slotNumber}
                                        disabled
                                      />
                                    </div>
                                    <div className="col-4">
                                      <select
                                        className="form-select form-select-sm"
                                        value={editSlotVehicleType}
                                        onChange={e => setEditSlotVehicleType(e.target.value)}
                                        required
                                      >
                                        <option value="">Select Type</option>
                                        {chargeControls.map(c => (
                                          <option key={c._id} value={c.vehicleType}>
                                            {c.vehicleType.replace('_', ' ').toUpperCase()}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="col-2 d-flex gap-1">
                                      <button type="submit" className="btn btn-sm btn-success">Save</button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setEditingSlotId(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    <PaginationButtons
                      totalItems={slots.length}
                      currentPage={slotPage}
                      setPage={setSlotPage}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .nav-tabs .nav-link { color: #6c757d; padding: 0.5rem 1rem; border-radius: 8px !important; }
        .nav-tabs .nav-link.active { background-color: #f0f4ff !important; color: #0d6efd !important; }
        .card { transition: transform 0.2s; }
        .form-control:focus, .form-select:focus { border-color: #0d6efd; box-shadow: none; }
      `}</style>
      </div>
    </>
  );
}