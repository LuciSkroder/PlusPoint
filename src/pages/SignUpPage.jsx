import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { Auth, DataBase } from "../components/DataBase";
import { useNavigate } from "react-router";
import "../css/signup.css";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create the user's Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(
        Auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Signed up successfully! User:", user.uid);

      // 2. Write the new user's profile to the Realtime Database
      if (user) {
        const userProfileRef = ref(DataBase, `users/${user.uid}`);
        await set(userProfileRef, {
          email: user.email,
          displayName: "New Parent User",
          children: {},
        });
        console.log("User profile created in Realtime Database.");
      }

      // 3. Redirect after successful sign-up and database write
      navigate("/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already in use. Please try logging in instead, or use a different email."
        );
        try {
          const signInMethods = await fetchSignInMethodsForEmail(Auth, email);
          if (signInMethods.length > 0) {
            setError(
              (prevError) =>
                `${prevError} It looks like you previously signed up with: ${signInMethods.join(
                  ", "
                )}. Please log in using one of these methods.`
            );
          }
        } catch (fetchError) {
          console.error("Error fetching sign-in methods:", fetchError);
        }
      } else if (err.code === "auth/weak-password") {
        setError(
          "Password is too weak. Please choose a stronger password (min 6 characters)."
        );
      } else if (err.code === "auth/invalid-email") {
        setError("The email address is not valid.");
      } else {
        setError(err.message);
      }
      console.error("Sign up error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <form onSubmit={handleSignUp} className="signup-form">
        <h2 style={{ textAlign: "center" }}>Opret Konto</h2>

        <input
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          id="password"
          placeholder="Kodeord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          id="confirmPassword"
          placeholder="Bekræft Kodeord"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading} className="signup-button">
          {loading ? "Opretter..." : "Opret Konto"}
        </button>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <p style={{ textAlign: "center" }}>
          Har du allerede en konto?{" "}
          <a
            onClick={() => navigate("/login")}
            style={{
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Log Ind
          </a>
        </p>
      </form>
    </main>
  );
}
