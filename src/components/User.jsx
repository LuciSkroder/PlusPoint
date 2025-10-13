import { useNavigate } from "react-router";

export default function User({ user }) {
  const navigate = useNavigate();

  function handleClick() {
    // Navigates to the child's specific profile page using their ID
    navigate(`/users/${user.id}`);
  }

  // Updated to use 'user.email'
  function getInitials() {
    if (!user?.email) return ""; // Check for user.email
    const emailParts = user.email.split("@");
    if (emailParts.length > 0 && emailParts[0].length > 0) {
      return emailParts[0]; // Return the part before the '@'
    }
    return ""; // Return empty if no email or no part before '@'
  }

  return (
    <article className="user-card" onClick={handleClick}>
      {/* Assuming 'image' might be added to childrenProfiles later, or use a default */}
      <img
        src={
          user.image || "https://placehold.co/600x400?text=No+Image" // Changed placeholder text
        }
        alt={user.displayName || "Child Profile"} // Use displayName for alt text
      />
      <h2>
        {user.displayName}{" "}
        {user.email ? `(${getInitials()})` : "(No Email Initials)"}
      </h2>
      {/* 'title' is not part of childrenProfiles data, so we might omit or keep as placeholder */}
      {/* <p className="title">{user.title ? user.title : "No Title"}</p> */}
      <p>
        {user.email ? ( // Use user.email for the mailto link
          <a href={`mailto:${user.email}`}>{user.email}</a>
        ) : (
          "No email"
        )}
      </p>
      {/* Optionally, display points */}
      {user.hasOwnProperty("points") && <p>Points: {user.points}</p>}
    </article>
  );
}
