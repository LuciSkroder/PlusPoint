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
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (notifId) => {
    const user = Auth.currentUser;
    if (!user) return;
    remove(ref(DataBase, `notifications/${user.uid}/${notifId}`));
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
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
    <div className="shop-manager-container">
      <div className="button-container">
        <button
          className="notification-btn"
          onClick={() => setShowNotifPopup(!showNotifPopup)}
        >
          Notifications
          {notifications.some((n) => !n.read) && (
            <span className="notification-badge">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </button>

        <button
          className={`create-reward-btn ${showForm ? "hidden" : ""}`}
          onClick={() => setShowForm(!showForm)}
        >
          Create New Reward
        </button>
      </div>

      {showNotifPopup && (
        <div className="notification-popup">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.read ? "read" : "unread"}`}
              >
                <p>
                  {n.childName} bought {n.itemName} for {n.price} points
                </p>
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)}>Mark as Read</button>
                  <button onClick={() => dismissNotification(n.id)}>Dismiss</button>
                )}
              </div>
            ))
          )}
          <button
            className="notification-close-btn"
            onClick={() => setShowNotifPopup(false)}
          >
            Close
          </button>
        </div>
      )}

      <form
        className={`shop-form ${showForm ? "visible" : ""}`}
        onSubmit={handleAddItem}
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
        <button
          type="button"
          className="cancel-btn"
          onClick={() => setShowForm(!showForm)}
        >
          Cancel
        </button>
      </form>

      <div className={`shop-items ${showForm ? "hidden" : ""}`}>
        <h3>Current Shop Items</h3>
        {shopItems.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <ul>
            {shopItems.map((item) => (
              <li key={item.id} className="shop-item-edit">
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
                        className="shop-item-image"
                      />
                    )}
                    <p>{item.description}</p>
                    <p>Cost: {item.price} points</p>
                    <div>
                      <button onClick={() => setEditItem({ ...item })}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)}>
                        Delete
                      </button>
                    </div>
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
