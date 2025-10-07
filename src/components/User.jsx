import { useNavigate } from "react-router";

export default function User({ user }) {
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/users/${user.id}`);
  }

  function getInitials() {
    if (!user?.mail) return "";
    return user.mail?.split("@")[0];
  }

  return (
    <article className="user-card" onClick={handleClick}>
      <img
        src={
          user.image || "https://placehold.co/600x400?text=Error+loading+image"
        }
        alt={user.name}
      />
      <h2>
        {user.name} ({user.mail ? getInitials() : "No Initials"})
      </h2>
      <p className="title">{user.title ? user.title : "No Title"}</p>
      <p>
        {user.mail ? (
          <a href={`mailto:${user.mail}`}>{user.mail}</a>
        ) : (
          "No email"
        )}
      </p>
    </article>
  );
}
