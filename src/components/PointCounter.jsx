import { useState, useEffect } from "react";
import { DataBase, Auth } from "./DataBase";
import { ref, get, onValue, off } from "firebase/database";

export default function PointCounter() {
    const [point, setPoint] = useState(0);
    const [bruger, setBruger] = useState(null);
useEffect(() => {
    const checkLogin = Auth.onAuthStateChanged((user) => {
        setBruger(user);
        if (user) {
            const pointUpdate = ref(DataBase, `childrenProfiles/${user.uid}/points`);
});

    return (
        <div className="point-tæller">
            <p>{point} ★</p>
        </div>
    );

}