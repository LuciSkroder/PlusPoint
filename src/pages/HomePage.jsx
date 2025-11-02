import { useState, useEffect } from "react";
import User from "../components/User";
import ChildShopViewer from "../components/ChildShopViewer";
import ShopManager from "../components/ShopManager";
import TaskPreviewChild from "../components/TaskPreviewChild";
import TaskVerifier from "../components/TaskVerifier";
import Karousel from "../components/Karousel";
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
import ParentTaskViewer from "../components/TaskPreviewParent";
import ProfilBillede from "../components/ProfilBillede";

export default function HomePage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [childrenForParent, setChildrenForParent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);

  function handleAddChildClick() {
    navigate("/addchild");
  }

  function handleShopClick() {
    navigate("/shop");
  }

  function handleLevelClick() {
    navigate("/level");
  }

  // Toggle body class when edit mode changes
  useEffect(() => {
    if (editMode) {
      document.body.classList.add("edit-mode-active");
    } else {
      document.body.classList.remove("edit-mode-active");
    }

    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove("edit-mode-active");
    };
  }, [editMode]);

  useEffect(() => {
    const unsubscribeAuth = Auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      setError(null);
      setChildrenForParent([]);

      if (!user) {
        setUserRole(null);
        setLoading(false);
        setError("Log venligst ind for at bruge PlusPoint.");
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
                "Kunne ikke indlæse børnekonti. Sørg for at du er logget ind og har tilladelse."
              );
            }
          );

          return () =>
            off(parentChildrenQuery, "value", unsubscribeParentChildren);
        }
      } catch (err) {
        console.error("Error determining user role:", err);
        setError("Kunne ikke bestemme brugerrolle. Prøv venligst igen.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <main className="page">
      {userRole === "child" && (
        <section className="child-home">
          {!editMode && (
            <div className="home-boxes">
              <div className="home-box-left">
                <button className="home-box" onClick={handleShopClick}>
                  <img src="./img/shopping-cart.svg" />
                </button>
                <button className="home-box" onClick={handleLevelClick}>
                  <img src="./img/level.png" />
                </button>
              </div>
              <div className="home-box-right">
                <button
                  onClick={() => navigate("/taskpage")}
                  style={{ cursor: "pointer" }}
                >
                  <TaskPreviewChild />
                </button>
              </div>
            </div>
          )}
          <Karousel onEditModeChange={setEditMode} />
        </section>
      )}

      {!loading && !error && userRole === "parent" && (
        <section className="forældre-home">
          <div className="home-boxes">
            <div className="home-box-left">
              <button className="home-box">
                <img
                  src="./img/shopping-cart.svg"
                  onClick={() => navigate("/shop")}
                />
              </button>
              <button className="home-box" onClick={() => navigate("/create")}>
                <img src="./img/to-do.svg" />
              </button>
            </div>
            <div className="home-box-right">
              <button
                className="home-box-parent"
                onClick={() => navigate("/taskpage")}
                style={{ cursor: "pointer" }}
              >
                {<ParentTaskViewer />}
              </button>
            </div>
          </div>
          <section className="børne-accounts">
            <h2>Dine Børnekonti:</h2>
            {childrenForParent.length === 0 ? (
              <p>Ingen børnekonti fundet linket til din profil.</p>
            ) : (
              <>
                <section className="grid">
                  {childrenForParent.map((childUser) => (
                    <div
                      key={childUser.id}
                      className={`user-card ${
                        showDetails === childUser.id ? "active" : ""
                      }`}
                      onClick={() =>
                        setShowDetails(
                          childUser.id === showDetails ? null : childUser.id
                        )
                      }
                    >
                      <ProfilBillede
                        userId={childUser.id}
                        className="user-avatar"
                      />
                      <div className="user-info">
                        <h3 className="user-name">
                          {childUser.displayName || "Intet navn"}
                        </h3>
                        {showDetails === childUser.id && (
                          <p className="user-email">
                            {childUser.email || "Ingen email tilgængelig"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
                <button className="add-child-btn" onClick={handleAddChildClick}>
                  Tilføj Barn
                </button>
              </>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
