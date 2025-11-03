import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Auth } from "../components/DataBase";
import { useNavigate } from "react-router";
import "../css/login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
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
      <form className="login-form" onSubmit={handleLogin}>
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
        <button className="login-button" type="submit">
          Login
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")} className="sign-up-link">
          Sign Up
        </button>
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
