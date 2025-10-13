import { useState, useEffect } from "react";
import User from "../components/User";
import { DataBase, Auth } from "../components/DataBase";

// Import specific functions for querying Realtime Database
import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

export default function HomePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to hold any error messages

  useEffect(() => {
    // 1. Get the authenticated user from the exported Auth instance
    const currentUser = Auth.currentUser; // Use the exported Auth instance directly

    if (!currentUser) {
      setLoading(false);
      setError("Please log in to view child accounts.");
      return;
    }

    const parentUid = currentUser.uid;

    // 2. Create a query to find children profiles where 'parentUid' matches the current user's UID
    const childrenProfilesRef = ref(DataBase, "childrenProfiles");
    const parentChildrenQuery = query(
      childrenProfilesRef,
      orderByChild("parentUid"),
      equalTo(parentUid)
    );

    // 3. Set up a real-time listener using onValue on the query
    const unsubscribe = onValue(
      parentChildrenQuery,
      (snapshot) => {
        const usersData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            usersData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(), // The actual child profile data
            });
          });
        }

        usersData.sort((user1, user2) =>
          (user1.displayName || "").localeCompare(user2.displayName || "")
        );

        setUsers(usersData);
        setLoading(false);
        setError(null);
      },
      (dbError) => {
        console.error("Error fetching child accounts:", dbError);
        setLoading(false);
        setError(
          "Failed to load child accounts. Please ensure you are logged in and have permission."
        );
      }
    );

    // 4. Cleanup function: important to unsubscribe when the component unmounts
    return () => {
      off(parentChildrenQuery, "value", unsubscribe);
    };
  }, []);

  if (loading) {
    return <p>Loading child accounts for PlusPoint...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (users.length === 0) {
    return <p>No child accounts found for you in the database.</p>;
  }

  return (
    <main className="page">
      <section className="grid">
        {users.map((user) => (
          <User key={user.id} user={user} />
        ))}
      </section>
    </main>
  );
}
