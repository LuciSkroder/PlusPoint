import { useState, useEffect } from "react";
import { DataBase, Auth } from "./DataBase";
import { ref, get, onValue, off } from "firebase/database";
import { NavLink } from "react-router";

export default function PointCounter() {
    const [point, setPoint] = useState(0);
    const [rolle, setRolle] = useState(null);

    useEffect(() => {
        const checkLogin = Auth.onAuthStateChanged((user) => {
            if (user) {
                const barnCheck = ref(DataBase, `childrenProfiles/${user.uid}/parentUid`);
                get(barnCheck).then((snapshot) => {
                    if (snapshot.exists()) {
                        setRolle("barn");
                    } else {
                        setRolle("forælder");
                    }
                });
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
            {rolle === "barn" ? (<p>{point} ⭐</p>) : (
                <NavLink to="/"></NavLink>
            )}
        </div>
    );
} 