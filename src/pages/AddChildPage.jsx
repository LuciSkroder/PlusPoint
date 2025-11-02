import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Functions } from "../components/DataBase";
import { httpsCallable } from "firebase/functions";
import "../css/addchild.css"

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
        setSuccessMessage(`Barn "${childDisplayName}" tilføjet med succes!`);
        setChildEmail("");
        setChildPassword("");
        setChildDisplayName("");
      } else {
        setError(
          result.data?.message ||
            "Kunne ikke tilføje barn (Cloud Function rapporterede fejl)."
        );
      }
    } catch (err) {
      if (err.code && err.message) {
        setError(`Kunne ikke tilføje barn: ${err.message}`);
      } else {
        setError(
          `Kunne ikke tilføje barn: ${err.message || "Der opstod en ukendt fejl."}`
        );
      }
    } finally {
      setLoadingForm(false);
    }
  };

  if (authLoading) {
    return <div>Indlæser brugerinformation...</div>;
  }

  if (!currentUser) {
    return <div>Du skal være logget ind for at tilføje et barn. Log venligst ind.</div>;
  }

  return (
    <div className="input-container">
      <h2>Tilføj børne konto</h2>
      <p><strong>Logget på med</strong> <br />{currentUser?.email}</p>
      <form onSubmit={handleAddChild}>
        <div>
          <label htmlFor="childDisplayName"></label>
          <input
            type="text"
            id="childDisplayName"
            value={childDisplayName}
            onChange={(e) => setChildDisplayName(e.target.value)}
            required
            placeholder="Barnets Navn"
          />
        </div>
        <div>
          <label htmlFor="childEmail"></label>
          <input
            type="email"
            id="childEmail"
            value={childEmail}
            onChange={(e) => setChildEmail(e.target.value)}
            required
            placeholder="Barnets Email"
          />
        </div>
        <div>
          <label htmlFor="childPassword"></label>
          <input
            type="password"
            id="childPassword"
            value={childPassword}
            onChange={(e) => setChildPassword(e.target.value)}
            required
            placeholder="Barnets kodeord"
          />
        </div>
        <button type="submit" disabled={loadingForm} className="add-child-submit">
          {loadingForm ? "Tilføjer Barn..." : "Tilføj Barn"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
}

export default AddChildPage;
