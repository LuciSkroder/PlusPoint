import { useState, useEffect } from "react";
import User from "../components/User";
import ChildShopViewer from "../components/ChildShopViewer";
import ShopManager from "../components/ShopManager";
import ChildTaskViewer from "../components/ChildTaskViewer";
import TaskVerifier from "../components/TaskVerifier";
import Karousel from "../components/karousel";
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

  return (
    <main className="page">
      {userRole === "child" && (
        <section className="child-home">
          <div className="home-boxes">
            <div className="home-box-left">
              <button className="home-box">
                <img src="../../public/img/shopping-cart.svg" />
              </button>
              <button className="home-box" onClick={() => navigate("/create")}>
                <img src="../../public/img/to-do.svg" />
              </button>
            </div>
            <div className="home-box-right">
              <button>
                <ChildTaskViewer />
              </button>
            </div>
          </div>
          <Karousel />
        </section>
      )}

      {!loading && !error && userRole === "parent" && (
        <main>
          <div className="home-boxes">
            <div className="home-box-left">
              <button className="home-box">
                <img
                  src="../../public/img/shopping-cart.svg"
                  onClick={() => navigate("/shop")}
                />
              </button>
              <button className="home-box" onClick={() => navigate("/create")}>
                <img src="../../public/img/to-do.svg" />
              </button>
            </div>
            <div className="home-box-right">
              <button>{<TaskVerifier />}</button>
            </div>
          </div>
          <h2>Your Child Accounts:</h2>
          {childrenForParent.length === 0 ? (
            <p>No child accounts found linked to your profile.</p>
          ) : (
            <section className="grid">
              {childrenForParent.map((childUser) => (
                <div
                  key={childUser.id}
                  className="user-card"
                  onClick={() =>
                    setShowDetails(
                      childUser.id === showDetails ? null : childUser.id
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src="/img/icon-yellow.svg"
                    alt="User Avatar"
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <h3 className="user-name">
                      {childUser.displayName || "No Name"}
                    </h3>
                    {showDetails === childUser.id && (
                      <p className="user-email">
                        {childUser.email || "No email available"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <button className="add-child-btn" onClick={handleAddChildClick}>
                Tilføj Barn
              </button>
            </section>
          )}
        </main>
      )}
    </main>
  );
}
