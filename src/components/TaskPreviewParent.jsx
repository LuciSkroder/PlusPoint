import { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import "../css/taskpage.css";

export default function ParentTaskViewer() {
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
        setError(
          "Kunne ikke indlæse opgaver til godkendelse. Prøv venligst igen."
        );
        setLoading(false);
      }
    );

    return () => {
      off(parentTasksQuery, "value", unsubscribeTasks);
    };
  }, [parentUid]);

  if (loading) {
    return <div>Loading tasks for verification...</div>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="taskView-parent">
      <h2>Opgaver der Afventer Godkendelse</h2>
      {pendingTasks.length === 0 ? (
        <p>Ingen opgaver afventer godkendelse. Alt er opdateret!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pendingTasks.map((task) => (
            <li key={task.id}>
              <div>
                <h3>{task.name}</h3>
                <h3>{task.points}⭐</h3>
              </div>
              <p>
                {childDisplayNames[task.assignedToChildUid] ||
                  task.assignedToChildUid}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
