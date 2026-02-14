import axios from "axios";
import { useEffect, useState } from "react";


export default function SystemManagement() {
  /* -------------------- STATES -------------------- */
  const [vehicleType, setVehicleType] = useState("");
  const [charge, setCharge] = useState("");

  const [chargeControls, setChargeControls] = useState([]);

  const [slotNumber, setSlotNumber] = useState("");
  const [slotVehicleType, setSlotVehicleType] = useState("");
  const [slots, setSlots] = useState([]);

  /* -------------------- LOAD DATA -------------------- */
  useEffect(() => {
    loadChargeControls();
    loadSlots();
  }, []);

  const loadChargeControls = async () => {
    const res = await axios.get("http://localhost:5000/api/vehicle-types");
    const types = res.data;

    const details = await Promise.all(
      types.map(async (type) => {
        const r = await axios.get("http://localhost:5000/api/charge-control", {
          params: { vehicleType: type }
        });
        return {
          vehicleType: type,
          chargePerMinutes: r.data.chargePerMinutes
        };
      })
    );

    setChargeControls(details);
  };

  const loadSlots = async () => {
    const res = await axios.get("http://localhost:5000/api/slots");
    setSlots(res.data);
  };

  /* -------------------- CHARGE CONTROL -------------------- */
  const addChargeControl = async () => {
    if (!vehicleType || !charge) return alert("Fill all fields");

    await axios.post("http://localhost:5000/api/charge-control", {
      vehicleType: vehicleType.toLowerCase(),
      chargePerMinutes: Number(charge)
    });

    setVehicleType("");
    setCharge("");
    loadChargeControls();
  };

  const updateCharge = async (id, newCharge) => {
    await axios.patch("http://localhost:5000/api/charge-control/${id}", {
      chargePerMinutes: Number(newCharge)
    });
    loadChargeControls();
  };

  const deleteCharge = async (id) => {
    if (!window.confirm("Delete charge control?")) return;
    await axios.delete("http://localhost:5000/api/charge-control/${id}");
    loadChargeControls();
  };

  /* -------------------- SLOT MANAGEMENT -------------------- */
  const addSlot = async () => {
    if (!slotNumber || !slotVehicleType) return alert("Fill all fields");

    await axios.post("http://localhost:5000/api/slots", {
      slotNumber,
      vehicleType: slotVehicleType
    });

    setSlotNumber("");
    setSlotVehicleType("");
    loadSlots();
  };

  const updateSlot = async (id, data) => {
    await axios.patch(`http://localhost:5000/api/slots-update-slotNumber-vehicleType/${id}`, data);
    loadSlots();
  };

  const deleteSlot = async (id) => {
    if (!window.confirm("Delete slot?")) return;
    await axios.delete(`http://localhost:5000/api/slots/${id}`);
    loadSlots();
  };

  /* -------------------- UI -------------------- */
  return (
    <div style={{ padding: 20 }}>
      <h2>System Management</h2>

      {/* ================= CHARGE CONTROL ================= */}
      <h3>Vehicle Charge Control</h3>

      <input
        placeholder="Vehicle type (e.g. car, bike)"
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
      />

      <input
        type="number"
        placeholder="Charge per minute"
        value={charge}
        onChange={(e) => setCharge(e.target.value)}
      />

      <button onClick={addChargeControl}>Add</button>

      <table border="1" cellPadding="8" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Charge / min</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {chargeControls.map((c) => (
            <tr key={c.vehicleType}>
              <td>{c.vehicleType}</td>
              <td>{c.chargePerMinutes}</td>
              <td>
                <button
                  onClick={() =>
                    updateCharge(c._id, prompt("New charge:", c.chargePerMinutes))
                  }
                >
                  Update
                </button>
                <button onClick={() => deleteCharge(c._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= SLOT MANAGEMENT ================= */}
      <h3 style={{ marginTop: 30 }}>Slot Management</h3>

      <input
        placeholder="Slot number (e.g. F1)"
        value={slotNumber}
        onChange={(e) => setSlotNumber(e.target.value)}
      />

      <select
        value={slotVehicleType}
        onChange={(e) => setSlotVehicleType(e.target.value)}
      >
        <option value="">Select vehicle type</option>
        {chargeControls.map((c) => (
          <option key={c.vehicleType} value={c.vehicleType}>
            {c.vehicleType}
          </option>
        ))}
      </select>

      <button onClick={addSlot}>Add Slot</button>

      <table border="1" cellPadding="8" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Slot</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s._id}>
              <td>{s.slotNumber}</td>
              <td>{s.vehicleType}</td>
              <td>{s.status}</td>
              <td>
                <button
                  onClick={() =>
                    updateSlot(s._id, {
                      slotNumber: prompt("Slot number:", s.slotNumber),
                      vehicleType: prompt("Vehicle type:", s.vehicleType)
                    })
                  }
                >
                  Update
                </button>
                <button onClick={() => deleteSlot(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
