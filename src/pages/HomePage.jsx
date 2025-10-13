import { useState, useEffect } from "react";
import User from "../components/User"; // Assuming this path is correct

// Import specific functions for querying Realtime Database
import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

// Import your initialized Firebase services from your component file
import { DataBase, Auth } from "../components/DataBase"; // Now importing Auth as well!

export default function HomePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to hold any error messages

  useEffect(() => {
    // 1. Get the authenticated user from the exported Auth instance
    const currentUser = Auth.currentUser; // Use the exported Auth instance directly

    if (!currentUser) {
      // Handle the case where no user is logged in
      setLoading(false);
      setError("Please log in to view child accounts.");
      return; // Stop the effect if no user is authenticated
    }

    const parentUid = currentUser.uid;

    // 2. Create a query to find children profiles where 'parentUid' matches the current user's UID
    const childrenProfilesRef = ref(DataBase, "childrenProfiles");
    const parentChildrenQuery = query(
      childrenProfilesRef,
      orderByChild("parentUid"), // Order by the 'parentUid' field
      equalTo(parentUid) // Filter where 'parentUid' equals the current user's UID
    );

    // 3. Set up a real-time listener using onValue on the query
    const unsubscribe = onValue(
      parentChildrenQuery, // Listen to the results of the query
      (snapshot) => {
        const usersData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            usersData.push({
              id: childSnapshot.key, // The unique key for each child profile
              ...childSnapshot.val(), // The actual child profile data
            });
          });
        }

        // Sort the users by display name (or any other field)
        // Ensure displayName exists before trying to localeCompare it
        usersData.sort((user1, user2) =>
          (user1.displayName || "").localeCompare(user2.displayName || "")
        );

        setUsers(usersData);
        setLoading(false);
        setError(null); // Clear any previous errors on successful fetch
      },
      (dbError) => {
        // Handle any errors during the fetch (e.g., permission denied)
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
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Render logic based on loading, error, or data
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
