import React, { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
import { useNavigate } from "react-router";
import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  update,
  serverTimestamp,
} from "firebase/database";

export default function ChildTaskViewer() {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = Auth.currentUser; // Get the current user directly
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in as a child to view tasks.");
      setLoading(false);
      return;
    }

    const childUid = currentUser.uid;
    const tasksRef = ref(DataBase, "tasks");

    // Query for tasks where 'assignedToChildUid' matches the current child's UID
    const childTasksQuery = query(
      tasksRef,
      orderByChild("assignedToChildUid"),
      equalTo(childUid)
    );

    // Set up a real-time listener for these tasks
    const unsubscribe = onValue(
      childTasksQuery,
      (snapshot) => {
        const tasksData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            tasksData.push({
              id: childSnapshot.key, // The unique task ID
              ...childSnapshot.val(), // The task data
            });
          });
        }
        setAssignedTasks(tasksData);
        setLoading(false);
        setError(null); // Clear any previous errors
      },
      (dbError) => {
        console.error("Error fetching child's tasks:", dbError);
        setError("Failed to load tasks. Please try again.");
        setLoading(false);
      }
    );

    // Cleanup function: unsubscribe from the listener when the component unmounts
    return () => {
      off(childTasksQuery, "value", unsubscribe);
    };
  }, [currentUser]);

  return (
    <div>
        <h2>Current Time</h2>
    </div>
  )

}