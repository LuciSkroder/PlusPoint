import React, { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
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
      setError("Du skal være logget ind for at markere opgaver som færdige.");
      return;
    }

    if (
      !window.confirm(
        "Er du sikker på, at du vil markere denne opgave som færdig?"
      )
    ) {
      return;
    }

    try {
      const taskRef = ref(DataBase, `tasks/${taskId}`);
      await update(taskRef, {
        status: "completed",
        completedAt: serverTimestamp(),
      });
      alert("Opgave markeret som færdig!");
    } catch (err) {
      console.error("Error marking task as completed:", err);
      setError(
        "Kunne ikke markere opgave som færdig: " +
          (err.message || "Der opstod en ukendt fejl.")
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

  const cancelCompletedTask = async (taskId) => {
    if (!currentUser) {
      setError("Du skal være logget ind for at markere opgaver som færdige.");
      return;
    }
    if (
      !window.confirm("Er du sikker på, at du vil annullere færdiggørelsen?")
    ) {
      return;
    }

    try {
      const taskRef = ref(DataBase, `tasks/${taskId}`);
      await update(taskRef, {
        status: "pending",
      });
    } catch (err) {
      console.error("Error marking task as canceled:", err);
      setError(
        "Kunne ikke annullere opgave: " +
          (err.message || "Der opstod en ukendt fejl.")
      );
    }
  };

  return (
    <div className="task-box-barn">
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
            <p className="description-box">{task.description}</p>
            <p className="info-box">
              <strong>Assigned Day:</strong> {task.assignedDay}
            </p>
            <p className="info-box">
              <strong>Repeat:</strong> {task.repeat.replace(/_/g, " ")}
            </p>
            <p className="info-box">
              <strong>Status:</strong>{" "}
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </p>

            {task.status === "pending" && (
              <div
                className="button-child"
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
                Markér som Færdig
              </div>
            )}
            {task.status === "completed" && (
              <div>
                <p style={{ color: "green", fontWeight: "bold" }}>
                  Afventer Forældre godkendelse
                </p>

                <button onClick={() => cancelCompletedTask(task.id)}>
                  Annuller
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
