import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { BounceLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/loading_img.png";
import { Helmet } from "react-helmet-async";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialPageLoad, setInitialPageLoad] = useState(true);

  // Form Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [terms, setTerms] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [passStrength, setPassStrength] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setInitialPageLoad(false), 1000);
    fetchTerms();
    return () => clearTimeout(timer);
  }, []);

  const fetchTerms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/terms-and-conditions");
      setTerms(res.data.sort((a, b) => a.sl - b.sl));
    } catch (err) {
      console.error("Error fetching terms", err);
    }
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);

    // Improved Strength Logic
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[a-zA-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    setPassStrength(strength);
  };

  // STEP 1: Verify Email 
  const verifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/search/${encodeURIComponent(email.trim())}`);
      if (res.data.exists) {
        setStep(2);
      } else {
        toast.error("This email is not authorized as admin");
      }
    } catch (err) {
      toast.error("Verification failed. Server might be down.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Logic for Next Button
  const isPassValid = passStrength === 100 && password === confirmPassword && password !== "";

  const goToTerms = (e) => {
    e.preventDefault();
    if (isPassValid) {
      setStep(3);
    }
  };

  // STEP 3: Final Registration
  const handleRegister = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;

      await axios.patch("http://localhost:5000/api/admin/update-by-email", {
        email,
        firebaseUid
      });

      toast.success("Admin account created successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (initialPageLoad) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "80vh" }}>
        <img src={logo} alt="Logo" style={{ width: "220px", marginBottom: "20px" }} />
        <BounceLoader color="#6199ff" size={50} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>City Parking | Sign Up</title>
      </Helmet>
      <div className="container py-5" style={{ maxWidth: "500px" }}>
        <ToastContainer position="top-center" autoClose={3000} />
        <div className="card border-0 shadow-sm p-4 rounded-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-2">Admin Sign Up</h3>
            <img src={logo} alt="Logo" style={{ width: "150px" }} className="mb-3" />
            <p className="text-muted small">Step {step} of 3</p>
          </div>

          {step === 1 && (
            <form onSubmit={verifyEmail}>
              <div className="mb-3">
                <label className="form-label fw-bold small">Authorized Admin Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg border shadow-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm" type="submit" disabled={loading}>
                {loading ? "Checking..." : "Next"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={goToTerms}>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold small mb-0">Password</label>
                  <div style={{ width: "80px", height: "6px", backgroundColor: "#e0e0e0", borderRadius: "10px" }}>
                    <div style={{ width: `${passStrength}%`, height: "100%", borderRadius: "10px", transition: "0.3s", backgroundColor: passStrength < 50 ? "#ff4d4d" : passStrength < 100 ? "#ffcc00" : "#00cc66" }}></div>
                  </div>
                </div>
                <div className="position-relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="form-control form-control-lg border shadow-sm"
                    value={password}
                    placeholder="******"
                    onChange={handlePasswordChange}
                    required
                  />
                  <span className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={20} className="text-muted" /> : <Eye size={20} className="text-muted" />}
                  </span>
                </div>
                {passStrength < 100 && password.length > 0 && (
                  <span className="text-muted x-small" style={{ fontSize: '11px' }}>
                    Must be 8+ chars, include letters, numbers, & symbols.
                  </span>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small">Confirm Password</label>
                <div className="position-relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    className="form-control form-control-lg border shadow-sm"
                    value={confirmPassword}
                    placeholder="******"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                    {showConfirmPass ? <EyeOff size={20} className="text-muted" /> : <Eye size={20} className="text-muted" />}
                  </span>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <span className="text-danger small fw-bold">Passwords do not match</span>
                )}
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary w-50" type="button" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary w-50 fw-bold shadow-sm" type="submit" disabled={!isPassValid}>
                  Next
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="animate__animated animate__fadeIn">
              <div className="terms-scroll-box mb-4 shadow-sm border p-3 rounded" style={{ height: "250px", overflowY: "auto", fontSize: "14px" }}>
                <p className="fw-bold text-center text-primary">City Parking ® - Terms & Conditions</p>
                <hr />
                {terms.length > 0 ? terms.map((t) => (
                  <div key={t._id} className="mb-3">
                    <p className="fw-bold mb-1">{t.sl}. {t.section_title}</p>
                    <p className="text-secondary">{t.message}</p>
                  </div>
                )) : <p className="text-center text-muted small">Loading terms...</p>}
              </div>

              <div className="form-check mb-4 d-flex align-items-center gap-2">
                <input className="form-check-input mt-0" type="checkbox" id="agree" checked={agreed} onChange={() => setAgreed(!agreed)} />
                <label className="form-check-label small" htmlFor="agree">I agree to the terms and conditions</label>
              </div>

              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                  style={{ backgroundColor: agreed ? '#0d6efd' : '#a0c4ff', border: 'none' }}
                  disabled={!agreed || loading}
                  onClick={handleRegister}
                >
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
                <button className="btn btn-link text-muted small" onClick={() => setStep(2)}>Back to Password</button>
              </div>
            </div>
          )}

          <p className="text-center mt-4 text-muted small">
            Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-bold">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}