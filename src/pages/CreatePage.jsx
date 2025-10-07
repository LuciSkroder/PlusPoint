import React, { useState } from "react";
import { useNavigate } from "react-router";

import { ref, push } from "firebase/database";
import { DataBase } from "../components/DataBase";

export default function CreatePage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [mail, setMail] = useState("");
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  function handleCancel() {
    navigate("/"); // Navigates back one step in history
  }

  async function handleSubmit(e) {
    // Make the function async
    e.preventDefault();
    setIsSubmitting(true); // Disable button and show loading

    const newUser = {
      // Firebase's push() will generate the ID, so we don't need Date.now().toString() here
      name: name,
      title: title,
      mail: mail,
      image: image,
      createdAt: Date.now(), // Optional: add a timestamp for when it was created
    };

    try {
      // 1. Get a reference to the 'users' path in your Realtime Database
      const usersRef = ref(DataBase, "users");

      // 2. Use push() to add a new user. It automatically generates a unique key.
      await push(usersRef, newUser);

      console.log("User added to Firebase successfully!");
      navigate("/"); // Navigate to the home page after successful submission
    } catch (error) {
      console.error("Error adding user to Firebase:", error);
      alert("Failed to create user. Please try again."); // Provide user feedback
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  }

  return (
    <main className="page">
      <h1>Create New User</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Type a name"
          value={name} // Make controlled components
          onChange={(e) => setName(e.target.value)}
          required // Add basic validation
        />
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          placeholder="Type a title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="mail">Mail</label>
        <input
          id="mail"
          type="email" // Use type="email" for better validation
          placeholder="Type a mail"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          required
        />
        <label htmlFor="image">Image URL</label>
        <input
          id="image"
          type="url"
          placeholder="Paste image url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <label></label>
        <img
          id="preview"
          className="image-preview"
          src={
            image
              ? image
              : "https://placehold.co/600x400?text=Paste+an+image+URL"
          }
          alt="Choose"
          onError={(e) =>
            (e.target.src =
              "https://placehold.co/600x400?text=Error+loading+image")
          }
        />
        <section className="btns">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </section>
      </form>
    </main>
  );
}
