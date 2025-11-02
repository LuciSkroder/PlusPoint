import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { ref, get } from "firebase/database";
import { DataBase } from "./DataBase";

export default function ProfilePicture({
  size = 200,
  className = "",
  onClick,
}) {
  const { currentUser } = useAuth();
  const [brugerData, setUserData] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const userRef = ref(DataBase, `users/${currentUser.uid}`);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
          setUserData(userSnapshot.val());
        } else {
          const childRef = ref(DataBase, `childrenProfiles/${currentUser.uid}`);
          const childSnapshot = await get(childRef);
          if (childSnapshot.exists()) {
            setUserData(childSnapshot.val());
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const imageUrl =
    brugerData?.image ||
    brugerData?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      brugerData?.displayName || brugerData?.name || brugerData?.email || "User"
    )}&size=${size}&background=febe2c&color=222222`;

  return (
    <img src={imageUrl} alt="Profile" className={className} onClick={onClick} />
  );
}
