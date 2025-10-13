import { useState, useEffect } from "react";
import User from "../components/User";

import { ref, onValue, off } from "firebase/database";
import { DataBase } from "../components/DataBase";

export default function HomePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const usersRef = ref(DataBase, "childrenProfiles");

    // 2. Set up a real-time listener using onValue
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const usersData = [];
        if (snapshot.exists()) {
          // Iterate over the children of the snapshot
          snapshot.forEach((childSnapshot) => {
            usersData.push({
              id: childSnapshot.key, // The unique key for each user
              ...childSnapshot.val(), // The actual user data
            });
          });
        }

        // Sort the users after fetching
        usersData.sort((user1, user2) => user1.name.localeCompare(user2.name));

        setUsers(usersData);
        setLoading(false); // Data loaded, set loading to false
      },
      (error) => {
        // Handle any errors during the fetch
        console.error("Error fetching users from Firebase:", error);
        setLoading(false); // Stop loading even if there's an error
      }
    );

    // 3. Cleanup function: important to unsubscribe when the component unmounts
    return () => {
      off(usersRef, "value", unsubscribe); // Unsubscribe from the 'value' event on usersRef
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  if (loading) {
    return <p>Loading users for PlusPoint...</p>;
  }

  // Handle case where no users are found
  if (users.length === 0 && !loading) {
    return <p>No users found in your database.</p>;
  }

  return (
    <main className="page">
      <section className="grid">
        {users.map((user) => (
          // Ensure your User component can handle the 'user' prop as expected
          <User key={user.id} user={user} />
        ))}
      </section>
    </main>
  );
}
