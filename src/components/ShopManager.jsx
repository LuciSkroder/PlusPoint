import { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
import { ref, push, update, remove, onValue } from "firebase/database";
import "../css/shop.css";

// Function to get the current parent's shop items
function subscribeToParentShop(onItemsChanged) {
  const user = Auth.currentUser;
  if (!user) {
    console.error("No authenticated user for shop management.");
    onItemsChanged([]);
    return () => {};
  }

  const parentShopRef = ref(DataBase, `shop/${user.uid}`);

  const unsubscribe = onValue(parentShopRef, (snapshot) => {
    const itemsData = snapshot.val();
    const items = [];
    if (itemsData) {
      Object.keys(itemsData).forEach((key) => {
        items.push({ ...itemsData[key], id: key });
      });
    }
    onItemsChanged(items);
  });

  return unsubscribe;
}

// Function to add a new shop item
async function addShopItem(newItem) {
  const user = Auth.currentUser;
  if (!user) throw new Error("No authenticated user.");

  const parentShopRef = ref(DataBase, `shop/${user.uid}`);
  await push(parentShopRef, newItem);
  console.log("Shop item added successfully!");
}

// Function to update an existing shop item
async function updateShopItem(itemId, updatedData) {
  const user = Auth.currentUser;
  if (!user) throw new Error("No authenticated user.");

  const itemRef = ref(DataBase, `shop/${user.uid}/${itemId}`);
  await update(itemRef, updatedData);
  console.log(`Shop item ${itemId} updated successfully!`);
}

// Function to delete a shop item
async function deleteShopItem(itemId) {
  const user = Auth.currentUser;
  if (!user) throw new Error("No authenticated user.");

  const itemRef = ref(DataBase, `shop/${user.uid}/${itemId}`);
  await remove(itemRef);
  console.log(`Shop item ${itemId} deleted successfully!`);
}

export default function ShopManager() {
  const [shopItems, setShopItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    description: "",
    imageUrl: "",
  });
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToParentShop(setShopItems);
    return () => unsubscribe();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      alert("Please fill in item name and a point reward");
      return;
    }
    try {
      await addShopItem(newItem);
      setNewItem({ name: "", price: 0, description: "", imageUrl: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item: " + error.message);
    }
  };

  const handleUpdateItem = async (itemId, data) => {
    try {
      await updateShopItem(itemId, data);
      setEditItem(null);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item: " + error.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteShopItem(itemId);
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item: " + error.message);
      }
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div>
      <button
        className={`create-reward-btn ${showForm ? "hidden" : ""}`}
        onClick={toggleForm}
      >
        Create New Reward
      </button>
      <form
        onSubmit={handleAddItem}
        className={`shop-form ${showForm ? "visible" : ""}`}
      >
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) =>
            setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })
          }
          min="1"
          required
        />
        <textarea
          placeholder="Description (Optional)"
          value={newItem.description}
          onChange={(e) =>
            setNewItem({ ...newItem, description: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Image URL (Optional)"
          value={newItem.imageUrl || ""}
          onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
        />
        <button type="submit">Add Item</button>
        <button type="button" className="cancel-btn" onClick={toggleForm}>
          Cancel
        </button>
      </form>

      <div className={`shop-items ${showForm ? "hidden" : ""}`}>
        <h3>Current Shop Items</h3>
        {shopItems.length === 0 ? (
          <p>You haven't added any items to your shop yet.</p>
        ) : (
          <ul>
            {shopItems.map((item) => (
              <li
                key={item.id}
                style={{
                  border: "1px solid #ccc",
                  margin: "10px 0",
                  padding: "10px",
                }}
              >
                {editItem && editItem.id === item.id ? (
                  // Edit form
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateItem(item.id, editItem);
                    }}
                  >
                    <input
                      type="text"
                      value={editItem.name}
                      onChange={(e) =>
                        setEditItem({ ...editItem, name: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      value={editItem.price}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <textarea
                      value={editItem.description}
                      onChange={(e) =>
                        setEditItem({
                          ...editItem,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                    <input
                      type="text"
                      value={editItem.imageUrl || ""}
                      onChange={(e) =>
                        setEditItem({ ...editItem, imageUrl: e.target.value })
                      }
                    />
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditItem(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h4>{item.name}</h4>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ maxWidth: "100px", height: "auto" }}
                      />
                    )}
                    <p> {item.description}</p>
                    <p>Cost: {item.price} points</p>
                    <button onClick={() => setEditItem({ ...item })}>
                      Edit
                    </button>{" "}
                    <button onClick={() => handleDeleteItem(item.id)}>
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
