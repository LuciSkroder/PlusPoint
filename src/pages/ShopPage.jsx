import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { DataBase } from "../components/DataBase";
import ShopManager from "../components/ShopManager";
import ChildShopViewer from "../components/ChildShopViewer";
import ChildTaskViewer from "../components/ChildTaskViewer";

export default function ShopPage() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserUid, setCurrentUserUid] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    // Listen for auth state changes (handles page reloads, etc.)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user.uid);
        setCurrentUserUid(user.uid);
      } else {
        console.log("No user logged in.");
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        console.log("Fetching role for UID:", currentUserUid);
        const childProfileRef = ref(
          DataBase,
          `childrenProfiles/${currentUserUid}/parentUid`
        );
        const snapshot = await get(childProfileRef);
        console.log("Snapshot exists:", snapshot.exists());

        if (snapshot.exists()) {
          setUserRole("child");
        } else {
          setUserRole("parent");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserUid) {
      fetchRole();
    }
  }, [currentUserUid]);

  if (loading) return <p>Loading...</p>;
  if (userRole === "child")
    return (
      <main className="page">
        <ChildShopViewer />
      </main>
    );
  if (userRole === "parent") return <ShopManager />;
  return <p>Unable to determine user role.</p>;
}