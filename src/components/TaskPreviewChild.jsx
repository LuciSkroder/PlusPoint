import React, { useState, useEffect } from "react";
import { Auth, DataBase } from "./DataBase";
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
  const currentUser = Auth.currentUser;

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (!currentUser) {
      setError("You must be logged in as a child to view tasks.");
      setLoading(false);
      return;
    }

    const childUid = currentUser.uid;
    const tasksRef = ref(DataBase, "tasks");

    const childTasksQuery = query(
      tasksRef,
      orderByChild("assignedToChildUid"),
      equalTo(childUid)
    );

    const unsubscribe = onValue(
      childTasksQuery,
      (snapshot) => {
        const tasksData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const taskData = childSnapshot.val();
            if (
              taskData.status === "pending" ||
              taskData.status === "completed"
            ) {
              tasksData.push({
                id: childSnapshot.key,
                ...taskData,
              });
            }
          });
        }
        setAssignedTasks(tasksData);
        setLoading(false);
        setError(null);
      },
      (dbError) => {
        console.error("Error fetching child's tasks:", dbError);
        setError("Kunne ikke indlæse opgaver. Prøv venligst igen.");
        setLoading(false);
      }
    );

    return () => {
      off(childTasksQuery, "value", unsubscribe);
    };
  }, [currentUser]);

  const handleMarkAsCompleted = async (taskId) => {
    if (!currentUser) {
      setError("You must be logged in to mark tasks as complete.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to mark this task as completed?")
    ) {
      return;
    }

    try {
      const taskRef = ref(DataBase, `tasks/${taskId}`);
      await update(taskRef, {
        status: "completed",
        completedAt: serverTimestamp(),
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
        Du har ingen opgaver tildelt i øjeblikket. Godt klaret, eller spørg dine
        forældre om flere!
      </p>
    );
  }

  return (
    <div className="taskView-child">
      <h2>{currentDate}</h2>

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
                <img src="./public/img/pending.svg" alt="Completed" />
              ) : (
                <img src="./public/img/Cirkel.svg" alt="Pending" />
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
