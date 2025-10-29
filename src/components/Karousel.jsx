import React, { useState } from "react";
import carouselData from "../data/karousel.json";
import "../css/karousel.css";

export default function Karousel({ items = carouselData, onEditModeChange }) {
  const [active, setActive] = useState(0);
  const [editMode, setEditMode] = useState(false);

  const toggleEditMode = () => {
    const newMode = !editMode;
    setEditMode(newMode);
    if (onEditModeChange) {
      onEditModeChange(newMode);
    }
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
        </div>
        <div className={`arrows ${editMode ? "edit-mode" : ""}`}>
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

      {editMode && (
        <div className="customize-box-wrapper">
          <div className="customize-box">
            <div className="custom-buttons">
              <button>1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button>6</button>
              <button>7</button>
              <button>8</button>
              <button>9</button>
              <button>10</button>
              <button>11</button>
              <button>12</button>
              <button>13</button>
              <button>14</button>
              <button>15</button>
              <button>16</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
