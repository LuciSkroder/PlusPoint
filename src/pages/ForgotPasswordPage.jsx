import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Auth } from "../components/DataBase";
import { useNavigate } from "react-router";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // For success or error messages
  const [error, setError] = useState(""); // To specifically show Firebase errors
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(Auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
      // Optional: You might want to redirect them to the login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
      console.error("Password reset error:", err.message);
    }
  };

  return (
    <div>
      <h2>Forgot Your Password?</h2>
      <p>
        Enter your email address below and we'll send you a link to reset your
        password.
      </p>
      <form onSubmit={handlePasswordReset}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Email</button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        <a
          onClick={() => navigate("/login")}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Back to Login
        </a>
      </p>
    </div>
  );
}
