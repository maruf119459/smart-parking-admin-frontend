import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent");
    } catch {
      alert("Failed to send email");
    }
  };

  return (
    <form onSubmit={handleReset}>
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter email"
        required
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit">Reset Password</button>
    </form>
  );
};

export default ForgotPassword;
