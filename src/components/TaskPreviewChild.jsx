import React, { useState, useEffect } from "react";
import { Auth, DataBase } from "./DataBase";
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

  const handleMarkAsCompleted = async (taskId) => {
    if (!currentUser) {
      setError("You must be logged in to mark tasks as complete.");
      return;
    }

    // Optional: Add a confirmation dialog
    if (
      !window.confirm("Are you sure you want to mark this task as completed?")
    ) {
      return;
    }

    try {
      const taskRef = ref(DataBase, `tasks/${taskId}`);
      await update(taskRef, {
        status: "completed",
        completedAt: serverTimestamp(), // Use Firebase's server timestamp
      });
      alert("Task marked as completed!");
    } catch (err) {
      console.error("Error marking task as completed:", err);
      setError(
        "Failed to mark task as completed: " +
          (err.message || "An unknown error occurred.")
      );
    }
  };

  if (loading) {
    return <div>Loading your tasks...</div>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (assignedTasks.length === 0) {
    return (
      <p>
        You currently have no tasks assigned. Great job, or ask your parent for
        more!
      </p>
    );
  }

  return (
    <div className="taskView-child">
      <h2>Current Time</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {assignedTasks.map((task) => (
          <li
            key={task.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: task.status === "completed" ? "#e0ffe0" : "#fff",
            }}
          >
            <p>
              {task.status === "completed" ? (
                <img src="/img/pending.svg" alt="Completed" />
              ) : (
                <img src="/img/cirkel.svg" alt="Pending" />
              )}
            </p>

            <h3>{task.name}</h3>

            <h3>{task.points}⭐</h3>
          </li>
        ))}
      </ul>
    </div>
  );
}
