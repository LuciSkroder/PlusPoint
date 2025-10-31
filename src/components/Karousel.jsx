import React, { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
import { ref, onValue, get, update } from "firebase/database";
import carouselData from "../data/karousel.json";
import "../css/karousel.css";

export default function Karousel({ items = carouselData, onEditModeChange }) {
  const [active, setActive] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [childOwned, setChildOwned] = useState({});
  const [allCustomizations, setAllCustomizations] = useState({});
  const [equipped, setEquipped] = useState({});

  const toggleEditMode = () => {
    const newMode = !editMode;
    setEditMode(newMode);
    if (onEditModeChange) onEditModeChange(newMode);
  };

  useEffect(() => {
    const user = Auth.currentUser;
    if (!user) return;

    // Listen to child owned customizations
    const ownedRef = ref(DataBase, `childrenProfiles/${user.uid}/avatar/owned`);
    const unsubscribeOwned = onValue(ownedRef, (snapshot) => {
      setChildOwned(snapshot.val() || {});
    });

    // Listen to currently equipped items
    const equippedRef = ref(
      DataBase,
      `childrenProfiles/${user.uid}/avatar/equipped`
    );
    const unsubscribeEquipped = onValue(equippedRef, (snapshot) => {
      setEquipped(snapshot.val() || {});
    });

    // Fetch all available customizations
    get(ref(DataBase, "avatarCustomizations")).then((snapshot) => {
      setAllCustomizations(snapshot.val() || {});
    });

    return () => {
      unsubscribeOwned();
      unsubscribeEquipped();
    };
  }, []);

  const length = items.length;
  const next = () => setActive((prev) => (prev + 1) % length);
  const prev = () => setActive((prev) => (prev - 1 + length) % length);

  const handleEquip = (part, itemId) => {
    const user = Auth.currentUser;
    if (!user) return;
    if (childOwned[part]?.[itemId]) {
      update(
        ref(DataBase, `childrenProfiles/${user.uid}/avatar/equipped/${part}`),
        {
          itemId: true,
        }
      );
    }
  };

  const renderAvatarPreview = () => {
    return (
      <div className="avatar-preview">
        {/* Base avatar from carousel */}
        <img
          src={items[active].image}
          alt="Base avatar"
          className="avatar-base"
        />
        {/* Overlay equipped items */}
        {Object.entries(equipped).map(([part, itemObj]) => {
          if (!itemObj) return null;
          const itemId = Object.keys(itemObj)[0]; // equipped item id
          const itemData = allCustomizations[part]?.[itemId];
          if (!itemData) return null;
          return (
            <img
              key={part}
              src={itemData.imageUrl}
              alt={itemData.name}
              className={`avatar-part avatar-${part}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className={`karousel-box ${editMode ? "edit-mode" : ""}`}>
        <div className="karousel-main">
          {length > 0 && (
            <>
              <img
                src={items[(active - 1 + length) % length].image}
                className="karousel-image side left"
                onClick={() =>
                  (window.location.href =
                    items[(active - 1 + length) % length].links[0]?.url || "#")
                }
              />
              <img
                src={items[active].image}
                className="karousel-image active"
                onClick={() =>
                  (window.location.href = items[active].links[0]?.url || "#")
                }
              />
              <img
                src={items[(active + 1) % length].image}
                className="karousel-image side right"
                onClick={() =>
                  (window.location.href =
                    items[(active + 1) % length].links[0]?.url || "#")
                }
              />
            </>
          )}
        </div>

        {/* Live Avatar Preview */}
        {renderAvatarPreview()}

        <div className={`arrows ${editMode ? "edit-mode" : ""}`}>
          <button className="prev-arrow" onClick={prev}>
            🡸
          </button>
          <button className="edit" onClick={toggleEditMode}>
            {editMode ? "Gem" : "Edit"}
          </button>
          <button className="next-arrow" onClick={next}>
            🡺
          </button>
        </div>
      </div>

      {editMode && (
        <div className="customize-box-wrapper">
          <div className="customize-box">
            {Object.keys(allCustomizations).map((part) => (
              <div key={part}>
                <h4>{part}</h4>
                <div className="custom-buttons">
                  {Object.entries(allCustomizations[part]).map(
                    ([itemId, item]) => {
                      const owned = childOwned[part]?.[itemId];
                      return (
                        <button
                          key={itemId}
                          onClick={() => handleEquip(part, itemId)}
                          disabled={!owned}
                          style={{
                            opacity: owned ? 1 : 0.3,
                            cursor: owned ? "pointer" : "not-allowed",
                          }}
                        >
                          {item.name}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
