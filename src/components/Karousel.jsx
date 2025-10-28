import React, { useState } from "react";
import carouselData from "../data/karousel.json";
import "../css/karousel.css";

export default function Karousel({ items = carouselData }) {
  const [active, setActive] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = () => setEditMode(!editMode);

  const length = items.length;

  const next = () => setActive((prev) => (prev + 1) % length);
  const prev = () => setActive((prev) => (prev - 1 + length) % length);

  if (length === 0) {
    return <div className="karousel-box">Ingen items</div>;
  }

  return (
    <div className="karousel-box">
      <img alt="" className="karousel-background" />
      <div className="karousel-main">
        <img
          src={items[(active - 1 + length) % length].image}
          className="karousel-image side left"
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
        />
      </div>
      <div className="arrows">
        <button className="prev-arrow" onClick={prev}>
          🡸
        </button>
        <button className="edit" onClick={toggleEditMode}>
          {editMode ? "Gem" : "Edit"}
          {/* hvis ved at redigere, vis "Gem", ellers "Rediger" */}
        </button>
        <button className="next-arrow" onClick={next}>
          🡺
        </button>
      </div>
    </div>
  );
}
