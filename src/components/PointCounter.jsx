import { useState, useEffect } from "react";
import { DataBase, Auth } from "./DataBase";
import { ref, get, onValue, off } from "firebase/database";

export default function PointCounter() {
    const [point, setPoint] = useState(0);
    const [bruger, setBruger] = useState(null);
                const pointHent = ref(DataBase, `childrenProfiles/${user.uid}/points`);
                const pointUpdate = onValue(pointHent, (snapshot) => {
                    const point = snapshot.val() || 0;
                    setPoint(point);
                });
                return () => off(pointHent, "value", pointUpdate);
            } else {
                setPoint(0);
            }
        });      
        return () => checkLogin();
    }, []);

    return (
        <div className="point-tæller">
            <p>{point} ★</p>
        </div>
    );
} 