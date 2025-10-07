import { useParams } from "react-router";
import { useEffect, useState } from "react";
import User from "../components/User";
import { useNavigate } from "react-router";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState({});

  useEffect(() => {
    const data = localStorage.getItem("users");
    const usersData = JSON.parse(data) || [];
    const user = usersData.find((user) => String(user.id) === id);
    setUser(user);
  }, []);

  const navigate = useNavigate();
  function showUpdate() {
    navigate(`/users/${id}/update`);
  }

  return (
    <main id="user-page" className="page">
      <section className="container">
        <h1>{user.name}</h1>
        <User user={user} />
        <div>
          <button className="btn-cancel">Delete user</button>
          <button onClick={showUpdate}>Update user</button>
        </div>
      </section>
    </main>
  );
}
