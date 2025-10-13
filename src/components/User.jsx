import { useNavigate } from "react-router";

export default function User({ user }) {
  const navigate = useNavigate();

  function handleClick() {
    // Navigates to the child's specific profile page using their ID
    navigate(`/users/${user.id}`);
  }

  return (
    <article className="user-card" onClick={handleClick}>
      <img
        src={user.image || "https://placehold.co/600x400?text=No+Image"}
        alt={user.displayName || "Child Profile"}
      />
      <h2>
        {user.displayName}
        {user.email}
      </h2>
      {user.hasOwnProperty("points") && <p>Points: {user.points}</p>}
    </article>
  );
}
