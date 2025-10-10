import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Functions } from "../components/DataBase";
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

  // Initialize the callable function once
  const addChildAccountCallable = httpsCallable(Functions, "addChildAccount");

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

    try {
      const result = await addChildAccountCallable({
        childEmail: childEmail,
        childPassword: childPassword,
        childDisplayName: childDisplayName,
        parentUid: parentUid,
      });

      if (result.data && result.data.success) {
        setSuccessMessage(`Child "${childDisplayName}" added successfully!`);
        setChildEmail("");
        setChildPassword("");
        setChildDisplayName("");
      } else {
        setError(
          result.data?.message ||
            "Failed to add child (Cloud Function reported error)."
        );
      }
    } catch (err) {
      // Handle HttpsError objects from callable functions
      // The error object has 'code' and 'message' properties for HttpsError
      if (err.code && err.message) {
        setError(`Failed to add child: ${err.message}`);
      } else {
        // Fallback for unexpected errors
        setError(
          `Failed to add child: ${err.message || "An unknown error occurred."}`
        );
      }
    } finally {
      setLoadingForm(false);
    }
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
