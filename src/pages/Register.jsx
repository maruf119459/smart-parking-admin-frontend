import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: ""
  });

  // STEP 1: Verify Email 
  const verifyEmail = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter an email");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/search/${encodeURIComponent(email.trim())}`
      );

      if (!res.data.exists) {
        alert("This email is not authorized as admin");
        return;
      }

      setStep(2);
    } catch (err) {
      console.error("Verification Error:", err);

      if (err.response?.status === 404) {
        alert("API endpoint not found");
      } else if (err.response?.status === 400) {
        alert("Invalid email format");
      } else {
        alert("Email verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  // STEP 2: Create Firebase account
  const createAccount = async (e) => {
  e.preventDefault();

  const { password, confirmPassword } = passwords;

  if (password !== confirmPassword) {
    return alert("Passwords do not match");
  }

  setLoading(true);

  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUid = userCredential.user.uid;

    // Update admininfo by email
    await axios.patch("http://localhost:5000/api/admin/update-by-email", {
      email,
      firebaseUid
    });

    alert("Admin account created successfully");

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Admin Registration</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={verifyEmail}>
          <input
            type="email"
            placeholder="Admin Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Next"}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={createAccount}>
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setPasswords({ ...passwords, password: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Confirm Password"
            required
            onChange={(e) =>
              setPasswords({
                ...passwords,
                confirmPassword: e.target.value
              })
            }
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
