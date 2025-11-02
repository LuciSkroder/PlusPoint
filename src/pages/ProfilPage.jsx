import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { ref, get, set } from "firebase/database";
import { DataBase } from "../components/DataBase";
import ProfilePicture from "../components/ProfilBillede";
import "../css/profil.css";
import PointCounter from "../components/PointCounter";
import { useNavigate } from "react-router";

export default function Profil() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [brugerData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        const brugerRef = ref(DataBase, `users/${currentUser.uid}`);
        const brugerSnapshot = await get(brugerRef);

        if (brugerSnapshot.exists()) {
          setUserData(brugerSnapshot.val());
        } else {
          const brugerRef = ref(
            DataBase,
            `childrenProfiles/${currentUser.uid}`
          );
          const childSnapshot = await get(brugerRef);
          if (childSnapshot.exists()) {
            setUserData(childSnapshot.val());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (loading)
    return (
      <main>
        <p>Loading...</p>
      </main>
    );

  const profilnavn =
    brugerData?.displayName || brugerData?.name || brugerData?.email || "User";

  const handleProfileClick = () => {
    console.log("You have clicked the profile picture");

    if (!brugerData?.image && !brugerData?.profilePicture) {
      const imageUrl = prompt("Indtast billede URL:");

      if (imageUrl) {
        const userRef = ref(
          DataBase,
          `childrenProfiles/${currentUser.uid}/image`
        );
        set(userRef, imageUrl).then(() => {
          alert("Profilbillede opdateret!");
          window.location.reload();
        });
      }
    } else {
      const muligheder = prompt(
        "Vælg en handling:\n1 - Ændr billede\n2 - Fjern billede\nIndtast 1 eller 2:"
      );

      if (muligheder === "1") {
        const newImageUrl = prompt(
          "Indtast nyt billede URL:",
          brugerData?.image || brugerData?.profilePicture
        );

        if (
          newImageUrl &&
          newImageUrl !== brugerData?.image &&
          newImageUrl !== brugerData?.profilePicture
        ) {
          const userRef = ref(
            DataBase,
            `childrenProfiles/${currentUser.uid}/image`
          );
          set(userRef, newImageUrl).then(() => {
            alert("Profilbillede ændret!");
            window.location.reload();
          });
        }
      } else if (muligheder === "2") {
        const advarsel = confirm(
          "Er du sikker på at du vil fjerne profilbilledet?"
        );

        if (advarsel) {
          const userRef = ref(
            DataBase,
            `childrenProfiles/${currentUser.uid}/image`
          );
          set(userRef, null).then(() => {
            alert("Profilbillede fjernet!");
            window.location.reload();
          });
        }
      }
    }
  };

  return (
    <main>
      <header className="profil-header">
        <div className="profil-image-container" onClick={handleProfileClick}>
          <ProfilePicture size={200} className="profilbillede" />
          <div className="image-overlay">
            <span>✎</span>
          </div>
        </div>
        <h1>
          {profilnavn}
          <div className="point-profil">
            <PointCounter />
          </div>
        </h1>
        <div className="profil-box">
          <p>Klik på billedet for at ændre dit profilbillede</p>
        </div>
        <button onClick={() => navigate("/indstillinger")}>
          indstillinger ⚙️
        </button>
      </header>
    </main>
  );
}
