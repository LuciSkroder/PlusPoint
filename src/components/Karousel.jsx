import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Auth, DataBase } from "./DataBase";
import { ref, onValue, set } from "firebase/database";
import carouselData from "../data/karousel.json";
import "../css/karousel.css";

export default function Karousel({ items = carouselData, onEditModeChange }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [aktivKategori, setAktivKategori] = useState("hats");
  const [loading, setLoading] = useState(true);
  const [equippedItems, setEquippedItems] = useState({
    bukser: null,
    hats: null,
    shirts: null,
  });

  const [tilpasningData, setTilpasningData] = useState({
    bukser: [],
    hats: [],
    shirts: [],
  });

  const [unlockedItems, setUnlockedItems] = useState({
    bukser: [],
    hats: [],
    shirts: [],
  });

  useEffect(() => {
    if (!editMode) return;

    const TilpasningRef = ref(DataBase, "avatarCustomizations");

    const unsubscribe = onValue(TilpasningRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTilpasningData({
          hats: data.hats ? Object.values(data.hats) : [],
          bukser: data.bukser ? Object.values(data.bukser) : [],
          shirts: data.shirts ? Object.values(data.shirts) : [],
        });
      }
    });

    return () => unsubscribe();
  }, [editMode]);

  useEffect(() => {
    const currentUser = Auth.currentUser;
    if (!currentUser || !editMode) return;

    const childProfileRef = ref(
      DataBase,
      `childrenProfiles/${currentUser.uid}/avatar/owned`
    );

    const unsubscribe = onValue(childProfileRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUnlockedItems({
          hats: data.hats ? Object.keys(data.hats) : [],
          bukser: data.bukser ? Object.keys(data.bukser) : [],
          shirts: data.shirts ? Object.keys(data.shirts) : [],
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [editMode]);

  useEffect(() => {
    const currentUser = Auth.currentUser;
    if (!currentUser) return;

    const equippedRef = ref(
      DataBase,
      `childrenProfiles/${currentUser.uid}/avatar/equipped`
    );

    const unsubscribe = onValue(equippedRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setEquippedItems({
          hats: data.hats || null,
          bukser: data.bukser || null,
          shirts: data.shirts || null,
        });
      } else {
        setEquippedItems({
          hats: null,
          bukser: null,
          shirts: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const erDenUnlocked = (item) => {
    const itemKey = item.id || item.name?.toLowerCase().replace(/\s+/g, "_");
    return unlockedItems[aktivKategori].includes(itemKey);
  };

  const erDenEquipped = (item) => {
    const itemKey = item.id || item.name?.toLowerCase().replace(/\s+/g, "_");
    return equippedItems[aktivKategori] === itemKey;
  };

  const toggleEditMode = () => {
    const newMode = !editMode;
    setEditMode(newMode);
    if (onEditModeChange) {
      onEditModeChange(newMode);
    }
  };

  const handleShopClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("omdiregere til shop");
    navigate("/shop");
  };

  const handleTilpasningClick = (item, låstOp) => {
    if (låstOp) {
      console.log(`Selected ${aktivKategori}:`, item);
      const currentUser = Auth.currentUser;
      if (!currentUser) return;

      const itemKey = item.id || item.name?.toLowerCase().replace(/\s+/g, "_");

      const duHarDenpå = equippedItems[aktivKategori] === itemKey;

      const equippedRef = ref(
        DataBase,
        `childrenProfiles/${currentUser.uid}/avatar/equipped/${aktivKategori}`
      );

      if (duHarDenpå) {
        set(equippedRef, null);
        console.log(`Unequip ${aktivKategori}:`, item);
        return;
      } else {
        set(equippedRef, itemKey);
        console.log(`Equipped ${aktivKategori}:`, item);
      }
    } else {
      console.log("denne tilpasning er låst");
    } //evt. redirec ttil shop
  };

  const length = items.length;
  const next = () => setActive((prev) => (prev + 1) % length);
  const prev = () => setActive((prev) => (prev - 1 + length) % length);

  if (length === 0) {
    return <div className="karousel-box">Ingen items</div>;
  }

  return (
    <>
      <div className={`karousel-box ${editMode ? "edit-mode" : ""}`}>
        <div className="karousel-main">
          <img
            src={items[(active - 1 + length) % length].image}
            className="karousel-image side left"
          />
          <div className="avatar-wrapper">
            <img
              src={items[active].image}
              className="karousel-image active"
            />
            <div
              className={`equipped-preview-overlay ${
                editMode ? "edit-mode" : ""
              }`}
            >
              <div className="equipped-item">
                <span className="label">Hat:</span>
                <span className="value">{equippedItems.hats || "None"}</span>
              </div>
              <div className="equipped-item">
                <span className="label">Shirt:</span>
                <span className="value">{equippedItems.shirts || "None"}</span>
              </div>
              <div className="equipped-item">
                <span className="label">Pants:</span>
                <span className="value">{equippedItems.bukser || "None"}</span>
              </div>
            </div>
          </div>
          <img
            src={items[(active + 1) % length].image}
            className="karousel-image side right"
            onClick={() =>
              (window.location.href =
                items[(active + 1) % length].links[0]?.url || "#")
            }
          />
        </div>
        <div className={`arrows ${editMode ? "edit-mode" : ""}`}>
          <button className="prev-arrow" onClick={prev}>
            🡸
          </button>
          <button className={`edit ${editMode ? "edit-mode" : ""}`} onClick={toggleEditMode}>
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
            <section className="kategorier">
              <button
                className={aktivKategori === "hats" ? "active" : ""}
                onClick={() => setAktivKategori("hats")}
              >
                Hatte
              </button>
              <button
                className={aktivKategori === "shirts" ? "active" : ""}
                onClick={() => setAktivKategori("shirts")}
              >
                Trøjer
              </button>
              <button
                className={aktivKategori === "bukser" ? "active" : ""}
                onClick={() => setAktivKategori("bukser")}
              >
                Bukser
              </button>
            </section>

            <div className="custom-buttons">
              {loading ? (
                <p style={{ color: "white", gridColumn: "1 / 1" }}>loader...</p>
              ) : tilpasningData[aktivKategori].length === 0 ? (
                <p style={{ color: "white", gridColumn: "1 / -1" }}>
                  {" "}
                  Ingen {aktivKategori} tilgængelig endnu
                </p>
              ) : (
                tilpasningData[aktivKategori]
                  .sort((a, b) => {
                    // Get item keys for comparison
                    const aKey =
                      a.id || a.name?.toLowerCase().replace(/\s+/g, "_");
                    const bKey =
                      b.id || b.name?.toLowerCase().replace(/\s+/g, "_");

                    // Check if items are unlocked
                    const aUnlocked =
                      unlockedItems[aktivKategori].includes(aKey);
                    const bUnlocked =
                      unlockedItems[aktivKategori].includes(bKey);

                    // Unlocked items come first
                    if (aUnlocked && !bUnlocked) return -1;
                    if (!aUnlocked && bUnlocked) return 1;

                    return 0;
                  })
                  .map((item) => {
                    const låstOp = erDenUnlocked(item);
                    const equipped = erDenEquipped(item);
                    return (
                      <button
                        key={item.id || item.name}
                        onClick={(e) => {
                          if (!låstOp) {
                            handleShopClick(e);
                          } else {
                            handleTilpasningClick(item, låstOp);
                          }
                        }}
                        className={`customization-item ${
                          låstOp ? "låstop" : "ikkelåstop"
                        } ${equipped ? "equipped-item" : ""}`}
                        title={
                          equipped
                            ? `Du har den på`
                            : låstOp
                            ? `Brug ${item.name}`
                            : `Køb ${item.name} i shoppen (${item.price} point)`
                        }
                      >
                        <span className="item-navn">{item.name}</span>
                        {equipped && låstOp && (
                          <span className="equipped-indicator">✓</span>
                        )}

                        {!låstOp && (
                          <div
                            className="låst-overlay"
                            onClick={handleShopClick}
                          >
                            <span className="låst-icon">🔒</span>
                            <span className="låst-price">{item.price}</span>
                          </div>
                        )}
                      </button>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
