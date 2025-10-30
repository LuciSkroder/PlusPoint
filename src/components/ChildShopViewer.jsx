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
    cashedIn: false,
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
  const [cashedInItems, setCashedInItems] = useState(new Set());
  const [viewMode, setViewMode] = useState("shop"); // "shop", "purchases", "styling"

  useEffect(() => {
    const user = Auth.currentUser;
    if (!user) return;

    const pointsRef = ref(DataBase, `childrenProfiles/${user.uid}/points`);
    const unsubscribePoints = onValue(pointsRef, (snapshot) => {
      setChildPoints(snapshot.val() || 0);
    });

    let unsubscribeShop = () => {};
    let unsubscribePurchases = () => {};

    getChildParentUid(user.uid).then((uid) => {
      if (uid) {
        setParentUid(uid);

        // Subscribe to shop
        const shopRef = ref(DataBase, `shop/${uid}`);
        unsubscribeShop = onValue(shopRef, (snapshot) => {
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
        unsubscribePurchases = onValue(purchasesRef, (snapshot) => {
          const data = snapshot.val() || {};
          const list = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setPurchases(list);
        });
      }
    });

    return () => {
      unsubscribePoints();
      unsubscribeShop();
      unsubscribePurchases();
    };
  }, []);

  const handleBuyItem = async (item) => {
    if (!parentUid) return;
    await buyShopItem(item, parentUid);
  };

  const handleCashIn = async (purchase) => {
    const confirmed = window.confirm(
      "Are you sure you want to cash this reward in now?"
    );

    if (confirmed) {
      // Hide immediately with CSS
      setCashedInItems((prev) => new Set([...prev, purchase.id]));

      // Update database
      await update(
        ref(
          DataBase,
          `childrenProfiles/${Auth.currentUser.uid}/purchases/${purchase.id}`
        ),
        {
          cashedIn: true,
        }
      );

      alert(`${purchase.itemName} has been cashed in!`);
    }
  };

  // Generate 10 empty styling boxes
  const generateStylingBoxes = () => {
    return Array.from({ length: 10 }, (_, index) => ({
      id: `styling-${index}`,
      name: `Item ${index + 1}`,
      description: "Sample description",
      price: (index + 1) * 10,
      imageUrl: "",
    }));
  };

  const getButtonStyle = (mode) => ({
    width: "32%",
    backgroundColor: viewMode === mode ? "#febe2c" : "white",
    color: viewMode === mode ? "white" : "#febe2c",
    border: "2px solid #febe2c",
  });

  return (
    <div className="shop-manager-container">
      <div className="button-container">
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="create-reward-btn"
            onClick={() => setViewMode("shop")}
            style={getButtonStyle("shop")}
          >
            Shop
          </button>

          <button
            className="create-reward-btn"
            onClick={() => setViewMode("purchases")}
            style={getButtonStyle("purchases")}
          >
            Purchases
          </button>

          <button
            className="create-reward-btn"
            onClick={() => setViewMode("styling")}
            style={getButtonStyle("styling")}
          >
            Styling
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2>Your Shop</h2>
        <p>
          Current points: <strong>{childPoints}</strong>
        </p>
      </div>

      {viewMode === "purchases" ? (
        <div className="shop-items">
          {purchases.filter((p) => !p.cashedIn && !cashedInItems.has(p.id))
            .length === 0 ? (
            <p>You haven't bought anything yet.</p>
          ) : (
            <ul>
              {purchases.map((purchase) => (
                <li
                  key={purchase.id}
                  className={
                    purchase.cashedIn || cashedInItems.has(purchase.id)
                      ? "cashed-in"
                      : ""
                  }
                >
                  <h4>{purchase.itemName}</h4>
                  <p>Price: {purchase.price} points</p>
                  <p>
                    Bought on: {new Date(purchase.timestamp).toLocaleString()}
                  </p>
                  <div>
                    <button
                      onClick={() => handleCashIn(purchase)}
                      disabled={
                        purchase.cashedIn || cashedInItems.has(purchase.id)
                      }
                    >
                      {purchase.cashedIn || cashedInItems.has(purchase.id)
                        ? "Cashed In"
                        : "Cash In"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : viewMode === "styling" ? (
        <div className="shop-items">
          <ul>
            {generateStylingBoxes().map((item) => (
              <li key={item.id}>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p>Cost: {item.price} points</p>
                <div>
                  <button disabled>Sample Button</button>
                </div>
              </li>
            ))}
          </ul>
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
