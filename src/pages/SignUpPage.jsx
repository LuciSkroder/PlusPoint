import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { Auth, DataBase } from "../components/DataBase"; // Ensure this path is correct
import { useNavigate } from "react-router-dom"; // Use react-router-dom for useNavigate

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New loading state for button/form
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors
    setLoading(true); // Set loading true while submission is in progress

    // Validate passwords match BEFORE sending to Firebase
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }

    // Basic password length check (Firebase will also validate, but client-side is faster UX)
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
          // You might want to get a display name from an input field instead of hardcoding
          displayName: "New Parent User",
          // Initialize with an empty children object, or an array, depending on your schema
          children: {},
        });
        console.log("User profile created in Realtime Database.");
      }

      // 3. Redirect after successful sign-up and database write
      navigate("/"); // Redirect to homepage or dashboard
    } catch (err) {
      // Handle any errors that occur during Auth creation or DB writing
      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already in use. Please try logging in instead, or use a different email."
        );
        // Optional: Provide more specific guidance on how they originally signed up
        try {
          // This call also requires the Auth instance
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
          // Don't overwrite the main error message if fetching methods fails
        }
      } else if (err.code === "auth/weak-password") {
        setError(
          "Password is too weak. Please choose a stronger password (min 6 characters)."
        );
      } else if (err.code === "auth/invalid-email") {
        setError("The email address is not valid.");
      } else {
        // Catch any other Firebase errors or network issues
        setError(err.message);
      }
      console.error("Sign up error:", err.message);
    } finally {
      setLoading(false); // Always stop loading when process is complete
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Sign Up</h2>
      <form
        onSubmit={handleSignUp}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 15px",
            backgroundColor: loading ? "#cccccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Already have an account?{" "}
        <a
          onClick={() => navigate("/login")}
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            color: "#007bff",
          }}
        >
          Log In
        </a>
      </p>
    </div>
  );
}
