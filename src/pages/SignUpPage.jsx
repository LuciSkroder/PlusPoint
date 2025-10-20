import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { Auth, DataBase } from "../components/DataBase";
import { useNavigate } from "react-router";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      // 1. Create the user's Firebase Authentication account (only call once!)
      const userCredential = await createUserWithEmailAndPassword(
        Auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Signed up successfully!");

      // 2. Write the new user's profile to the Realtime Database
      if (user) {
        const userProfileRef = ref(DataBase, `users/${user.uid}`);
        await set(userProfileRef, {
          email: user.email,
          name: "New Parent User", // Or prompt for name in the form
          children: {}, // Initialize with an empty children object
        });
        console.log("User profile created in Realtime Database.");
      }

      // 3. Redirect after successful sign-up and database write
      navigate("/dashboard"); // Redirect to dashboard or wherever new users go
    } catch (err) {
      // Handle any errors that occur during Auth creation or DB writing
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
        }
      } else if (err.code === "auth/weak-password") {
        setError(
          "Password is too weak. Please choose a stronger password (min 6 characters)."
        );
      } else {
        // Catch any other Firebase errors or network issues
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
