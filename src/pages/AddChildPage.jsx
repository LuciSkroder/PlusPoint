import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Functions, Auth } from "../components/DataBase";
import { httpsCallable } from "firebase/functions";

function AddChildPage() {
  const [childEmail, setChildEmail] = useState("");
  const [childPassword, setChildPassword] = useState("");
  const [childDisplayName, setChildDisplayName] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { currentUser, loading: authLoading } = useAuth();
  const parentUid = currentUser?.uid;
  const addChildAccountCallable = httpsCallable(Functions, "addChildAccount");

  // --- NEW DIAGNOSTIC LOGS ---
  useEffect(() => {
    console.log("AddChildPage Rendered/Updated:");
    console.log("  AuthContext currentUser (from useAuth):", currentUser);
    console.log("  AuthContext loading (from useAuth):", authLoading);
    console.log(
      "  Firebase Auth SDK's current user (Auth.currentUser):",
      Auth.currentUser
    );
    if (currentUser) {
      console.log(
        "  currentUser has getIdToken method:",
        typeof currentUser.getIdToken === "function"
      );
    }
    console.log("-------------------------------------");
  }, [currentUser, authLoading]); // Log whenever these change

  const handleAddChild = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setError("");
    setSuccessMessage("");

    if (!currentUser || !parentUid) {
      setError(
        "Parent user not identified or authentication still processing. Please ensure you are logged in."
      );
      setLoadingForm(false);
      return;
    }

    let idToken;
    try {
      idToken = await currentUser.getIdToken(true); // You already confirmed this works
      console.log(
        "Explicitly retrieved ID Token for manual fetch:",
        idToken.substring(0, 20) + "..."
      );
    } catch (tokenError) {
      console.error("Error retrieving ID Token explicitly:", tokenError);
      setError(
        `Failed to get authentication token: ${tokenError.message}. Please log in again.`
      );
      setLoadingForm(false);
      return;
    }

    // --- NEW: Manual Fetch Request to bypass httpsCallable ---
    const functionUrl = `https://us-central1-pluspoint-f355e.cloudfunctions.net/addChildAccount`; // Your function's URL

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`, // Manually add the Authorization header
        },
        body: JSON.stringify({
          data: {
            // Callable functions wrap payload in a 'data' property
            childEmail: childEmail,
            childPassword: childPassword,
            childDisplayName: childDisplayName,
          },
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Check if the HTTP status code is 2xx
        if (responseData.result && responseData.result.success) {
          // Callable functions return result in 'result'
          setSuccessMessage(`Child "${childDisplayName}" added successfully!`);
          setChildEmail("");
          setChildPassword("");
          setChildDisplayName("");
        } else {
          // Handle Cloud Function application-level errors (if it returns error in result.message)
          setError(
            responseData.result?.message ||
              "Failed to add child via direct fetch (Cloud Function reported error)."
          );
        }
      } else {
        // Handle HTTP errors (like 401, 500, etc.)
        console.error(
          "Direct fetch HTTP error:",
          response.status,
          responseData
        );
        // Try to parse HttpsError style messages from the function
        if (responseData.error && responseData.error.message) {
          setError(`Failed to add child: ${responseData.error.message}`);
        } else {
          setError(
            `Failed to add child (HTTP ${response.status}): ${response.statusText}`
          );
        }
      }
    } catch (err) {
      console.error("Direct fetch network error:", err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoadingForm(false);
    }
    // --- END MANUAL FETCH ---
  };

  if (authLoading) {
    return <div>Loading user information...</div>; // Show a loading state while auth is being determined
  }

  if (!currentUser) {
    return <div>You must be logged in to add a child. Please log in.</div>; // Redirect or show message if not logged in
  }

  return (
    <div>
      <h2>Add a New Child Account</h2>
      {/* Display parent's email from currentUser from context */}
      <p>Logged in as: {currentUser?.email}</p>
      <form onSubmit={handleAddChild}>
        <div>
          <label htmlFor="childDisplayName">Child's Display Name:</label>
          <input
            type="text"
            id="childDisplayName"
            value={childDisplayName}
            onChange={(e) => setChildDisplayName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="childEmail">Child's Email:</label>
          <input
            type="email"
            id="childEmail"
            value={childEmail}
            onChange={(e) => setChildEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="childPassword">Child's Password:</label>
          <input
            type="password"
            id="childPassword"
            value={childPassword}
            onChange={(e) => setChildPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loadingForm}>
          {loadingForm ? "Adding Child..." : "Add Child"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
}

export default AddChildPage;
