import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { DataBase } from "../components/DataBase";
import {
  ref,
  push,
  set,
  get,
  child,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import "../css/task.css";

export default function CreateTaskPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const parentUid = currentUser?.uid;

  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskRoom, setTaskRoom] = useState("");
  const [taskPoints, setTaskPoints] = useState(""); // Stored as string, parsed to int
  const [assignedDay, setAssignedDay] = useState("Vælg Dag"); // Default to "Vælg Dag"
  const [repeatFrequency, setRepeatFrequency] = useState("Vælg gentagelser"); // Default to "Vælg gentagelser"
  const [selectedChildUid, setSelectedChildUid] = useState("");

  const [childrenList, setChildrenList] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const daysOfWeek = [
    "Vælg dag",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const repeatOptions = [
    { value: "", label: "Vælg gentagelser" },
    { value: "never", label: "Never" },
    { value: "every_day", label: "Every Day" },
    { value: "every_other_day", label: "Every Other Day" },
    { value: "once_a_week", label: "Once a Week" },
    { value: "once_a_month", label: "Once a Month" },
    // You can add more options here, e.g., "twice_a_week", "every_weekday", etc.
  ];

  // Fetch children associated with the current parent
  useEffect(() => {
    if (parentUid) {
      setLoadingChildren(true);
      const childrenRef = query(
        ref(DataBase, "childrenProfiles"),
        orderByChild("parentUid"),
        equalTo(parentUid)
      );

      get(childrenRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const childrenData = snapshot.val();
            const loadedChildren = Object.keys(childrenData).map((uid) => ({
              uid,
              displayName: childrenData[uid].displayName,
            }));
            setChildrenList(loadedChildren);
            /* if (loadedChildren.length > 0) {
              setSelectedChildUid(loadedChildren[0].uid); // Select first child by default
            }*/ // fjernet for ikke at autoselekte for styling
          } else {
            setChildrenList([]);
          }
          setLoadingChildren(false);
        })
        .catch((err) => {
          console.error("Error fetching children:", err);
          setError("Failed to load children profiles.");
          setLoadingChildren(false);
        });
    } else if (!authLoading) {
      // If not authenticated and not loading, clear children
      setChildrenList([]);
      setLoadingChildren(false);
    }
  }, [parentUid, authLoading]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setError("");
    setSuccessMessage("");

    if (!currentUser || !parentUid) {
      setError("You must be logged in as a parent to create tasks.");
      setLoadingForm(false);
      return;
    }

    if (!selectedChildUid) {
      setError("Please select a child to assign the task to.");
      setLoadingForm(false);
      return;
    }

    const pointsValue = parseInt(taskPoints, 10);
    if (isNaN(pointsValue) || pointsValue < 0) {
      setError("Points value must be a non-negative number.");
      setLoadingForm(false);
      return;
    }

    try {
      const tasksRef = ref(DataBase, "tasks");
      const newTaskRef = push(tasksRef); // Generate a unique ID for the new task

      const newTask = {
        name: taskName,
        description: taskDescription,
        room: taskRoom,
        points: pointsValue, // Ensure points is a number
        assignedDay: assignedDay,
        repeat: repeatFrequency, // Use the selected repeat frequency
        assignedToChildUid: selectedChildUid,
        createdByParentUid: parentUid,
        status: "pending", // Initial status for a new task
        createdAt: new Date().toISOString(), // Timestamp for creation
      };

      await set(newTaskRef, newTask);

      setSuccessMessage(
        `Task "${taskName}" created successfully for ${
          childrenList.find((c) => c.uid === selectedChildUid)?.displayName
        }!`
      );
      // Clear form (except selected child for convenience)
      setTaskName("");
      setTaskDescription("");
      setTaskRoom("");
      setTaskPoints("");
      setAssignedDay("Vælg Dag"); // Reset assigned day
      setRepeatFrequency("never"); // Reset repeat frequency
    } catch (err) {
      console.error("Error creating task:", err);
      setError(
        `Failed to create task: ${err.message || "An unknown error occurred."}`
      );
    } finally {
      setLoadingForm(false);
    }
  };

  if (authLoading || loadingChildren) {
    return <div>Loading user and children information...</div>;
  }

  if (!currentUser) {
    return <div>You must be logged in to create tasks. Please log in.</div>;
  }

  if (childrenList.length === 0) {
    return (
      <div>
        <h2>Create a New Task</h2>
        <p>
          You don't have any child accounts linked yet. Please add a child
          first.
        </p>
        {/* You might want to add a link here to your AddChildPage */}
      </div>
    );
  }

  return (
    <div className="input-container-task">
      <h2>Create a New Task</h2>
      <p>
        <strong>Logget ind som</strong> <br /> {currentUser?.email}
      </p>

      <form onSubmit={handleCreateTask}>
        <div>
          <label htmlFor="childSelect"></label>
          <select
            id="childSelect"
            value={selectedChildUid}
            onChange={(e) => setSelectedChildUid(e.target.value)}
            required
            disabled={loadingForm}
          >
            <option value="">Vælg barn</option>
            {childrenList.map((child) => (
              <option key={child.uid} value={child.uid}>
                {child.displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="taskName"></label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            disabled={loadingForm}
            placeholder="Opgave Navn"
          />
        </div>

        <div>
          <label htmlFor="taskDescription"></label>
          <textarea
            id="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            disabled={loadingForm}
            placeholder="Beskrivelse"
          />
        </div>

        <div>
          <label htmlFor="taskRoom"></label>
          <input
            type="text"
            id="taskRoom"
            value={taskRoom}
            onChange={(e) => setTaskRoom(e.target.value)}
            disabled={loadingForm}
            placeholder="Rum (efterladt tom hvis ikke relevant)"
          />
        </div>

        <div>
          <label htmlFor="taskPoints"></label>
          <input
            type="number"
            id="taskPoints"
            value={taskPoints}
            onChange={(e) => setTaskPoints(e.target.value)}
            min="0"
            required
            disabled={loadingForm}
            placeholder="Point Værdi"
          />
        </div>

        <div>
          <label htmlFor="assignedDay"></label>
          <select
            id="assignedDay"
            value={assignedDay}
            onChange={(e) => setAssignedDay(e.target.value)}
            required
            disabled={loadingForm}
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="repeatFrequency"></label>
          <select
            id="repeatFrequency"
            value={repeatFrequency}
            onChange={(e) => setRepeatFrequency(e.target.value)}
            required
            disabled={loadingForm}
          >
            {repeatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loadingForm}>
          {loadingForm ? "Creating Task..." : "Create Task"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
}
