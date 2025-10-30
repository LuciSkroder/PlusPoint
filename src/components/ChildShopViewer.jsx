import { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
import {
  ref,
  get,
  onValue,
  push,
  update,
  serverTimestamp,
} from "firebase/database";
import "../css/shop.css";

// Helper functions
async function getChildParentUid(childUid) {
  const snapshot = await get(
    ref(DataBase, `childrenProfiles/${childUid}/parentUid`)
  );
  return snapshot.val();
}

async function getChildPoints(childUid) {
  const snapshot = await get(
    ref(DataBase, `childrenProfiles/${childUid}/points`)
  );
  return snapshot.val() || 0;
}

async function buyShopItem(item, parentUid) {
  const user = Auth.currentUser;
  if (!user) throw new Error("No authenticated user.");
  if (!parentUid) throw new Error("Parent UID not available.");

  const childUid = user.uid;
  const currentPoints = await getChildPoints(childUid);

  if (currentPoints < item.price) {
    alert(`Not enough points to buy ${item.name}`);
    return;
  }

  // Deduct points
  await update(ref(DataBase, `childrenProfiles/${childUid}`), {
    points: currentPoints - item.price,
  });

  // Record purchase
  await push(ref(DataBase, `childrenProfiles/${childUid}/purchases`), {
    itemId: item.id,
    itemName: item.name,
    price: item.price,
    timestamp: serverTimestamp(),
    parentUid,
  });

  // Notify parent
  await push(ref(DataBase, `notifications/${parentUid}`), {
    type: "purchase",
    childUid,
    childName: user.displayName || "Unknown Child",
    itemName: item.name,
    price: item.price,
    timestamp: serverTimestamp(),
    read: false,
  });

  alert(`Successfully bought ${item.name}!`);
}

// Component
export default function ChildShopViewer() {
  const [shopItems, setShopItems] = useState([]);
  const [childPoints, setChildPoints] = useState(0);
  const [parentUid, setParentUid] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [showPurchases, setShowPurchases] = useState(false);

  useEffect(() => {
    const user = Auth.currentUser;
    if (!user) return;

    const pointsRef = ref(DataBase, `childrenProfiles/${user.uid}/points`);
    const unsubscribePoints = onValue(pointsRef, (snapshot) => {
      setChildPoints(snapshot.val() || 0);
    });

    getChildParentUid(user.uid).then((uid) => {
      if (uid) {
        setParentUid(uid);

        // Subscribe to shop
        const shopRef = ref(DataBase, `shop/${uid}`);
        const unsubscribeShop = onValue(shopRef, (snapshot) => {
          const data = snapshot.val() || {};
          const items = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          setShopItems(items);
        });

        // Subscribe to purchases
        const purchasesRef = ref(
          DataBase,
          `childrenProfiles/${user.uid}/purchases`
        );
        const unsubscribePurchases = onValue(purchasesRef, (snapshot) => {
          const data = snapshot.val() || {};
          const list = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setPurchases(list);
        });

        return () => {
          unsubscribePoints();
          unsubscribeShop();
          unsubscribePurchases();
        };
      } else {
        unsubscribePoints();
      }
    });
  }, []);

  const handleBuyItem = async (item) => {
    if (!parentUid) return;
    await buyShopItem(item, parentUid);
  };

  return (
    <div className="shop-manager-container">
      <div className="button-container">
        <button
          onClick={() => setShowPurchases(!showPurchases)}
          style={{ position: "absolute", top: "10px", left: "10px" }}
        >
          {showPurchases ? "Hide Purchases" : "View My Purchases"}
        </button>

        <h2>Your Shop</h2>
        <p>
          Current points: <strong>{childPoints}</strong>
        </p>
      </div>

      {showPurchases ? (
        <div className="shop-items">
          {purchases.length === 0 ? (
            <p>You haven't bought anything yet.</p>
          ) : (
            <ul>
              {purchases.map((purchase) => (
                <li key={purchase.id}>
                  <h4>{purchase.itemName}</h4>
                  <p>Price: {purchase.price} points</p>
                  <p>
                    Bought on: {new Date(purchase.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="shop-items">
          {shopItems.length === 0 ? (
            <p>Your parent hasn't added any items yet.</p>
          ) : (
            <ul>
              {shopItems.map((item) => (
                <li key={item.id}>
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
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={childPoints < item.price}
                    >
                      {childPoints < item.price ? "Not enough points" : "Buy"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
