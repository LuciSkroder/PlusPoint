import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Auth } from "../components/DataBase";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors
    try {
      await signInWithEmailAndPassword(Auth, email, password);
      console.log("Logged in successfully!");
      navigate("/");
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Don't have an account? <a href="/signup">Sign Up</a>
      </p>
      <p>
        <a
          onClick={() => navigate("/forgotpassword")}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Forgot password?
        </a>
      </p>
    </div>
  );
}
