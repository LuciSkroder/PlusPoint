import { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  update,
  get,
} from "firebase/database";

export default function TaskVerifier() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [childDisplayNames, setChildDisplayNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = Auth.currentUser;
  const parentUid = currentUser?.uid;

  useEffect(() => {
    if (!parentUid) {
      setError("You must be logged in as a parent to verify tasks.");
      setLoading(false);
      return;
    }

    const childrenRef = ref(DataBase, "childrenProfiles");
    get(query(childrenRef, orderByChild("parentUid"), equalTo(parentUid)))
      .then((snapshot) => {
        const namesMap = {};
        if (snapshot.exists()) {
          snapshot.forEach((childSnap) => {
            namesMap[childSnap.key] =
              childSnap.val().displayName || "Unknown Child";
          });
        }
        setChildDisplayNames(namesMap);
      })
      .catch((err) => console.error("Error fetching child names:", err));

    const tasksRef = ref(DataBase, "tasks");
    const parentTasksQuery = query(
      tasksRef,
      orderByChild("createdByParentUid"),
      equalTo(parentUid)
    );

    const unsubscribeTasks = onValue(
      parentTasksQuery,
      (snapshot) => {
        const tasksData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const task = {
              id: childSnapshot.key,
              ...childSnapshot.val(),
            };
            if (task.status === "completed") {
              tasksData.push(task);
            }
          });
        }
        setPendingTasks(tasksData);
        setLoading(false);
        setError(null);
      },
      (dbError) => {
        console.error("Error fetching parent's tasks:", dbError);
        setError("Failed to load tasks for verification. Please try again.");
        setLoading(false);
      }
    );

    return () => {
      off(parentTasksQuery, "value", unsubscribeTasks);
    };
  }, [parentUid]);

  const handleApproveTask = async (task) => {
    if (!parentUid) {
      setError("Authentication error. Please log in again.");
      return;
    }

    if (
      !window.confirm(
        `Approve "${task.name}" for ${
          childDisplayNames[task.assignedToChildUid]
        } and award ${task.points} points?`
      )
    ) {
      return;
    }

    try {
      // 1. Mark task as "verified"
      const taskUpdateRef = ref(DataBase, `tasks/${task.id}`);
      await update(taskUpdateRef, { status: "verified" });

      // 2. Award points to the child
      const childPointsRef = ref(
        DataBase,
        `childrenProfiles/${task.assignedToChildUid}/points`
      );
      const snapshot = await get(childPointsRef);
      const currentPoints = snapshot.val() || 0;
      const newPoints = currentPoints + task.points;

      await update(
        ref(DataBase, `childrenProfiles/${task.assignedToChildUid}`),
        { points: newPoints }
      );

      alert(
        `Task "${task.name}" approved! ${task.points} points awarded to ${
          childDisplayNames[task.assignedToChildUid]
        }.`
      );
    } catch (err) {
      console.error("Error approving task:", err);
      setError(
        `Failed to approve task: ${err.message || "An unknown error occurred."}`
      );
    }
  };

  const handleDenyTask = async (task) => {
    if (!parentUid) {
      setError("Authentication error. Please log in again.");
      return;
    }

    if (
      !window.confirm(
        `Deny "${task.name}" for ${
          childDisplayNames[task.assignedToChildUid]
        }? The task will be reset to pending.`
      )
    ) {
      return;
    }

    try {
      // Mark task as "pending" or "denied" (choosing "pending" to allow re-completion)
      const taskUpdateRef = ref(DataBase, `tasks/${task.id}`);
      await update(taskUpdateRef, { status: "pending", completedAt: null });
      alert(`Task "${task.name}" denied. Status reset to pending.`);
    } catch (err) {
      console.error("Error denying task:", err);
      setError(
        `Failed to deny task: ${err.message || "An unknown error occurred."}`
      );
    }
  };

  if (loading) {
    return <div>Loading tasks for verification...</div>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>Tasks Awaiting Your Verification</h2>
      {pendingTasks.length === 0 ? (
        <p>No tasks currently awaiting your verification. All caught up!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pendingTasks.map((task) => (
            <li key={task.id}>
              <h3>
                {task.name} ({task.points} points)
              </h3>
              <p>
                <strong>Assigned to:</strong>{" "}
                {childDisplayNames[task.assignedToChildUid] ||
                  task.assignedToChildUid}
              </p>
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
                <strong>Status:</strong>{" "}
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </p>
              {task.completedAt && (
                <p>
                  <strong>Child marked complete:</strong>{" "}
                  {new Date(task.completedAt).toLocaleString()}
                </p>
              )}

              <div style={{ marginTop: "10px" }}>
                <button onClick={() => handleApproveTask(task)}>
                  Approve & Award Points
                </button>
                <button onClick={() => handleDenyTask(task)}>
                  Deny & Reset
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
