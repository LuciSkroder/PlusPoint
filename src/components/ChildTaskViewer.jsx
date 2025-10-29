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
  }, [currentUser]); // Re-run effect if currentUser changes

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
    <div       
      onClick={() => navigate("/taskpage")}
      style={{ cursor: "pointer" }}
    >

      <h2>Your Assigned Tasks</h2>
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
            <h3>
              {task.name} ({task.points} points)
            </h3>
            <p>
              <strong>Description:</strong> {task.description}
            </p>
            <p>
              <strong>Room:</strong> {task.room}
            </p>
            <p>
              <strong>Assigned Day:</strong> {task.assignedDay}
            </p>
            <p>
              <strong>Repeat:</strong> {task.repeat.replace(/_/g, " ")}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </p>
            {task.completedAt && (
              <p>
                <strong>Completed On:</strong>{" "}
                {new Date(task.completedAt).toLocaleDateString()}
              </p>
            )}

            {task.status === "pending" && (
              <div className="button-child"
                onClick={() => handleMarkAsCompleted(task.id)}
                style={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  padding: "10px 15px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Mark as Completed
              </div>
            )}
            {task.status === "completed" && (
              <p style={{ color: "green", fontWeight: "bold" }}>
                Awaiting Parent Verification
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
