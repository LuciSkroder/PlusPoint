import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { Auth } from "../components/DataBase";
import { useNavigate } from "react-router";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(Auth, email, password);
      console.log("Signed up successfully!");
      navigate("/dashboard"); // Redirect to dashboard or a success page
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already in use. Please try logging in instead, or use a different email."
        );

        // Optional: Provide more specific guidance on how they originally signed up
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
          // Fallback message if fetching methods fails
        }
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.");
      } else {
        setError(err.message);
      }
      console.error("Sign up error:", err.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
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
        <button type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Already have an account?{" "}
        <a
          onClick={() => navigate("/login")}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          Log In
        </a>
      </p>
    </div>
  );
}
