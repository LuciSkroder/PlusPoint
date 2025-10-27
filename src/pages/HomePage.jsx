import { useState, useEffect } from "react";
import User from "../components/User";
import ChildShopViewer from "../components/ChildShopViewer";
import ShopManager from "../components/ShopManager";
import ChildTaskViewer from "../components/ChildTaskViewer";
import TaskVerifier from "../components/TaskVerifier";
import { DataBase, Auth } from "../components/DataBase";
import { useNavigate } from "react-router";
import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";

export default function HomePage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [childrenForParent, setChildrenForParent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(null);

  function handleAddChildClick() {
    navigate("/addchild");
  }

  // Firebase auth + role handling
  useEffect(() => {
    const unsubscribeAuth = Auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      setError(null);
      setChildrenForParent([]);

      if (!user) {
        setUserRole(null);
        setLoading(false);
        setError("Please log in to use PlusPoint.");
        return;
      }

      const currentUserUid = user.uid;

      try {
        const childProfileRef = ref(
          DataBase,
          `childrenProfiles/${currentUserUid}/parentUid`
        );
        const snapshot = await get(childProfileRef);

        if (snapshot.exists()) {
          setUserRole("child");
          setLoading(false);
        } else {
          setUserRole("parent");

          const childrenProfilesRef = ref(DataBase, "childrenProfiles");
          const parentChildrenQuery = query(
            childrenProfilesRef,
            orderByChild("parentUid"),
            equalTo(currentUserUid)
          );

          const unsubscribeParentChildren = onValue(
            parentChildrenQuery,
            (parentChildrenSnapshot) => {
              const childrenData = [];
              if (parentChildrenSnapshot.exists()) {
                parentChildrenSnapshot.forEach((childSnap) => {
                  childrenData.push({
                    id: childSnap.key,
                    ...childSnap.val(),
                  });
                });
              }

              childrenData.sort((user1, user2) =>
                (user1.displayName || "").localeCompare(user2.displayName || "")
              );

              setChildrenForParent(childrenData);
              setLoading(false);
            },
            (dbError) => {
              console.error("Error fetching child accounts:", dbError);
              setLoading(false);
              setError(
                "Failed to load child accounts. Please ensure you are logged in and have permission."
              );
            }
          );

          return () =>
            off(parentChildrenQuery, "value", unsubscribeParentChildren);
        }
      } catch (err) {
        console.error("Error determining user role:", err);
        setError("Could not determine user role. Please try again.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // PWA install button
  useEffect(() => {
    let deferredPrompt;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent Chrome from auto-showing prompt
      deferredPrompt = e;

      const installBtn = document.getElementById("install-btn");
      if (installBtn) installBtn.style.display = "block";

      installBtn.addEventListener("click", async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("User response to PWA install:", outcome);
        deferredPrompt = null;
        installBtn.style.display = "none";
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  if (loading) {
    return <p>Loading child accounts for PlusPoint...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <main className="page">
      {/* PWA Install Button */}
      <button
        id="install-btn"
        style={{
          display: "none",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          zIndex: 1000,
        }}
      >
        Install App
      </button>

      {userRole === "child" && (
        <>
          <h1>Welcome, Child!</h1>
          <ChildShopViewer />
          <ChildTaskViewer />
        </>
      )}

      {userRole === "parent" && (
        <>
          <h1>Welcome, Parent!</h1>
          <div className="home-boxes">
            <h2 className="home-box">
              <img src="../../public/img/shopping-cart.svg" />
            </h2>
            <h2 className="home-box">
              <img src="../../public/img/to-do.svg" />
            </h2>
            <TaskVerifier />
          </div>
          <h2>Your Child Accounts:</h2>
          {childrenForParent.length === 0 ? (
            <p>No child accounts found linked to your profile.</p>
          ) : (
            <section className="grid">
              {childrenForParent.map((childUser) => (
                <User key={childUser.id} user={childUser} />
              ))}
              <button className="add-child-btn" onClick={handleAddChildClick}>
                Tilføj Barn
              </button>
            </section>
          )}
        </>
      )}
    </main>
  );
}
