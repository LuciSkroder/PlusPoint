import { useState, useEffect } from "react";
import { Auth, DataBase } from "../components/DataBase";
import {
  ref,
  get,
  onValue,
  update,
  push,
  serverTimestamp,
} from "firebase/database";

// Helper function to get child's parent UID
async function getChildParentUid(childUid) {
  const childProfileRef = ref(
    DataBase,
    `childrenProfiles/${childUid}/parentUid`
  );
  const snapshot = await get(childProfileRef);
  return snapshot.val(); // Returns parentUid or null
}

// Helper function to get child's current points
async function getChildPoints(childUid) {
  const pointsRef = ref(DataBase, `childrenProfiles/${childUid}/points`);
  const snapshot = await get(pointsRef);
  return snapshot.val() || 0; // Return points or 0 if not set
}

async function buyShopItem(item, parentUid) {
  const user = Auth.currentUser;
  if (!user) throw new Error("No authenticated user.");
  if (!parentUid) throw new Error("Parent UID not available for purchase.");

  const childUid = user.uid;
  const itemPrice = item.price;

  try {
    const currentPoints = await getChildPoints(childUid);

    if (currentPoints < itemPrice) {
      alert(
        `You don't have enough points to buy ${item.name}! You need ${itemPrice} but only have ${currentPoints}.`
      );
      return;
    }

    // Deduct points
    const newPoints = currentPoints - itemPrice;
    const childPointsRef = ref(DataBase, `childrenProfiles/${childUid}`);
    await update(childPointsRef, { points: newPoints });

    // Record purchase
    const purchasesRef = ref(
      DataBase,
      `childrenProfiles/${childUid}/purchases`
    );
    await push(purchasesRef, {
      itemId: item.id,
      itemName: item.name,
      price: itemPrice,
      timestamp: serverTimestamp(),
      parentUid: parentUid,
    });

    alert(
      `Successfully bought ${item.name} for ${itemPrice} points! You now have ${newPoints} points.`
    );
    console.log(
      `Child ${childUid} bought ${item.name}. New points: ${newPoints}.`
    );

    // **Parent Notification (Prototype Simplification)**
    // For this prototype, we're skipping direct client-side parent notification.
    // In a real app, this is where a Cloud Function would trigger an FCM message to the parent.
    // For now, the parent could see the purchase in their child's profile in the database.
  } catch (error) {
    console.error("Error during buy operation:", error);
    alert("Failed to complete purchase: " + error.message);
  }
}

function subscribeToChildShop(onItemsChanged) {
  const user = Auth.currentUser;
  if (!user) {
    console.error("No authenticated user (child) for shop viewing.");
    onItemsChanged([]);
    return () => {};
  }

  let unsubscribeShop = () => {};

  getChildParentUid(user.uid)
    .then((parentUid) => {
      if (parentUid) {
        const parentShopRef = ref(DataBase, `shop/${parentUid}`);
        unsubscribeShop = onValue(parentShopRef, (snapshot) => {
          const itemsData = snapshot.val();
          const items = [];
          if (itemsData) {
            Object.keys(itemsData).forEach((key) => {
              items.push({ ...itemsData[key], id: key });
            });
          }
          onItemsChanged(items);
        });
      } else {
        console.warn(
          `No parent UID found for child ${user.uid}. Cannot display shop.`
        );
        onItemsChanged([]);
      }
    })
    .catch((error) => {
      console.error("Error fetching parent UID:", error);
      onItemsChanged([]);
    });

  return () => {
    unsubscribeShop();
  };
}

export default function ChildShopViewer() {
  const [shopItems, setShopItems] = useState([]);
  const [childPoints, setChildPoints] = useState(0);
  const [parentUid, setParentUid] = useState(null);

  useEffect(() => {
    const user = Auth.currentUser;
    if (user) {
      const pointsRef = ref(DataBase, `childrenProfiles/${user.uid}/points`);
      const unsubscribePoints = onValue(pointsRef, (snapshot) => {
        setChildPoints(snapshot.val() || 0);
      });

      getChildParentUid(user.uid).then((fetchedParentUid) => {
        if (fetchedParentUid) {
          setParentUid(fetchedParentUid);
          const unsubscribeShop = subscribeToChildShop(setShopItems);
          return () => {
            unsubscribePoints();
            unsubscribeShop();
          };
        } else {
          unsubscribePoints();
          console.warn("Parent UID not found for this child.");
        }
      });
    } else {
      setShopItems([]);
      setChildPoints(0);
    }
    return () => {};
  }, []);

  const handleBuyItem = async (item) => {
    // Pass the parentUid to the buyShopItem function
    await buyShopItem(item, parentUid);
  };

  return (
    <div>
      <h2>Your Shop</h2>
      <p>
        Your current points: <strong>{childPoints}</strong>
      </p>
      {shopItems.length === 0 ? (
        <p>Your parent hasn't added any items to the shop yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {shopItems.map((item) => (
            <li key={item.id}>
              <h4>{item.name}</h4>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
              <p>{item.description}</p>
              <p>
                Cost: <strong>{item.price} points</strong>
              </p>
              <button
                onClick={() => handleBuyItem(item)}
                disabled={childPoints < item.price} // Disable button if not enough points
              >
                Buy
              </button>
              {childPoints < item.price && (
                <span style={{ marginLeft: "10px", color: "red" }}>
                  Not enough points!
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
