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

  // Initialize the callable function once
  const addChildAccountCallable = httpsCallable(Functions, "addChildAccount");

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
  }, [currentUser, authLoading]);

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
      // Use the callable function directly
      const result = await addChildAccountCallable({
        childEmail: childEmail,
        childPassword: childPassword,
        childDisplayName: childDisplayName,
        parentUid: parentUid, // Still good to pass for your internal logic validation
      });

      // Handle the result from the Cloud Function
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
      console.error("Error calling addChildAccount Cloud Function:", err);
      // HttpsError objects from callable functions have a 'code' and 'message'
      if (err.code && err.message) {
        setError(`Failed to add child: ${err.message}`);
      } else {
        setError(
          `Failed to add child: ${err.message || "An unknown error occurred."}`
        );
      }
    } finally {
      setLoadingForm(false);
    }
  };

  if (authLoading) {
    return <div>Loading user information...</div>;
  }

  if (!currentUser) {
    return <div>You must be logged in to add a child. Please log in.</div>;
  }

  return (
    <div>
      <h2>Add a New Child Account</h2>
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
