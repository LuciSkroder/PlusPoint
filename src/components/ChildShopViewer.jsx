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
  const itemPrice = item.price;

  const currentPoints = await getChildPoints(childUid);
  if (currentPoints < itemPrice) {
    alert(`Not enough points to buy ${item.name}`);
    return;
  }

  await update(ref(DataBase, `childrenProfiles/${childUid}`), {
    points: currentPoints - itemPrice,
  });

  const purchasesRef = ref(DataBase, `childrenProfiles/${childUid}/purchases`);
  await push(purchasesRef, {
    itemId: item.id,
    itemName: item.name,
    price: itemPrice,
    timestamp: serverTimestamp(),
    parentUid,
  });

  await push(ref(DataBase, `notifications/${parentUid}`), {
    type: "purchase",
    childUid,
    childName: user.displayName || "Unknown Child",
    itemName: item.name,
    price: itemPrice,
    timestamp: serverTimestamp(),
    read: false,
  });

  alert(`Successfully bought ${item.name}!`);
}

function subscribeToChildShop(onItemsChanged) {
  const user = Auth.currentUser;
  if (!user) {
    onItemsChanged([]);
    return () => {};
  }

  let unsubscribe = () => {};
  getChildParentUid(user.uid).then((parentUid) => {
    if (parentUid) {
      const parentShopRef = ref(DataBase, `shop/${parentUid}`);
      unsubscribe = onValue(parentShopRef, (snapshot) => {
        const data = snapshot.val() || {};
        const items = Object.keys(data).map((key) => ({
          ...data[key],
          id: key,
        }));
        onItemsChanged(items);
      });
    } else {
      onItemsChanged([]);
    }
  });
  return () => unsubscribe();
}

export default function ChildShopViewer() {
  const [shopItems, setShopItems] = useState([]);
  const [childPoints, setChildPoints] = useState(0);
  const [parentUid, setParentUid] = useState(null);

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
        const unsubscribeShop = subscribeToChildShop(setShopItems);
        return () => {
          unsubscribePoints();
          unsubscribeShop();
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
    <div>
      <h2>Your Shop</h2>
      <p>
        Your current points: <strong>{childPoints}</strong>
      </p>
      {shopItems.length === 0 ? (
        <p>Your parent hasn't added any items yet.</p>
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
                disabled={childPoints < item.price}
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
