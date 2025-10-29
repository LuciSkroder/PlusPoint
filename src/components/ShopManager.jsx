import { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
import { ref, push, update, remove, onValue } from "firebase/database";
import "../css/shop.css";

function subscribeToParentShop(onItemsChanged) {
  const user = Auth.currentUser;
  if (!user) return () => {};
  const parentShopRef = ref(DataBase, `shop/${user.uid}`);
  return onValue(parentShopRef, (snapshot) => {
    const data = snapshot.val() || {};
    const items = Object.keys(data).map((key) => ({ ...data[key], id: key }));
    onItemsChanged(items);
  });
}

async function addShopItem(newItem) {
  const user = Auth.currentUser;
  if (!user) return;
  const parentShopRef = ref(DataBase, `shop/${user.uid}`);
  await push(parentShopRef, newItem);
}

async function updateShopItem(itemId, updatedData) {
  const user = Auth.currentUser;
  if (!user) return;
  const itemRef = ref(DataBase, `shop/${user.uid}/${itemId}`);
  await update(itemRef, updatedData);
}

async function deleteShopItem(itemId) {
  const user = Auth.currentUser;
  if (!user) return;
  const itemRef = ref(DataBase, `shop/${user.uid}/${itemId}`);
  await remove(itemRef);
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
  const [notifications, setNotifications] = useState([]);
  const [showNotifPopup, setShowNotifPopup] = useState(false);

  useEffect(() => {
    const unsubscribeShop = subscribeToParentShop(setShopItems);
    return () => unsubscribeShop();
  }, []);

  useEffect(() => {
    const user = Auth.currentUser;
    if (!user) return;
    const notifRef = ref(DataBase, `notifications/${user.uid}`);
    const unsubscribeNotif = onValue(notifRef, (snapshot) => {
      const data = snapshot.val() || {};
      const notifs = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      const unread = notifs.filter((n) => !n.read);
      if (unread.length > 0) setShowNotifPopup(true);
      setNotifications(notifs);
    });
    return () => unsubscribeNotif();
  }, []);

  const markAsRead = (notifId) => {
    const user = Auth.currentUser;
    if (!user) return;
    update(ref(DataBase, `notifications/${user.uid}/${notifId}`), {
      read: true,
    });
    setShowNotifPopup(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    await addShopItem(newItem);
    setNewItem({ name: "", price: 0, description: "", imageUrl: "" });
    setShowForm(false);
  };

  const handleUpdateItem = async (itemId, data) => {
    await updateShopItem(itemId, data);
    setEditItem(null);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure?")) {
      await deleteShopItem(itemId);
    }
  };

  return (
    <div>
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <button onClick={() => setShowForm(!showForm)}>
          Create New Reward
        </button>
        {notifications.some((n) => !n.read) && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
            }}
          >
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </div>

      {showNotifPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#fff",
            border: "1px solid #ccc",
            padding: "15px",
            boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
        >
          <h4>New Purchase!</h4>
          {notifications
            .filter((n) => !n.read)
            .map((n) => (
              <div key={n.id} style={{ marginBottom: "8px" }}>
                <p>
                  {n.childName} bought {n.itemName} for {n.price} points
                </p>
                <button onClick={() => markAsRead(n.id)}>Dismiss</button>
              </div>
            ))}
        </div>
      )}

      <form className={showForm ? "visible" : ""} onSubmit={handleAddItem}>
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
          placeholder="Description"
          value={newItem.description}
          onChange={(e) =>
            setNewItem({ ...newItem, description: e.target.value })
          }
        ></textarea>
        <input
          type="text"
          placeholder="Image URL"
          value={newItem.imageUrl || ""}
          onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
        />
        <button type="submit">Add Item</button>
      </form>

      <div className={`shop-items ${showForm ? "hidden" : ""}`}>
        <h3>Current Shop Items</h3>
        {shopItems.length === 0 ? (
          <p>No items yet.</p>
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
                        style={{ maxWidth: "100px" }}
                      />
                    )}
                    <p>{item.description}</p>
                    <p>Cost: {item.price} points</p>
                    <button onClick={() => setEditItem({ ...item })}>
                      Edit
                    </button>
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
