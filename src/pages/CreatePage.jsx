import { useState } from "react";
import { useNavigate } from "react-router";

export default function CreatePage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [mail, setMail] = useState("");
  const [image, setImage] = useState("");

  const navigate = useNavigate();

  function handleCancel() {
    navigate(+0);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newUser = {
      id: Date.now().toString(),
      name: name,
      title: title,
      mail: mail,
      image: image,
    };

    const data = localStorage.getItem("users");
    const usersData = JSON.parse(data) || [];

    usersData.push(newUser);
    localStorage.setItem("users", JSON.stringify(usersData));

    navigate("/");
  }

  return (
    <main className="page">
      <h1>Creat New User</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Type a name"
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          placeholder="Type a title"
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="mail">Mail</label>
        <input
          id="mail"
          type="text"
          placeholder="Type a mail"
          onChange={(e) => setMail(e.target.value)}
        />
        <label htmlFor="image">Image URL</label>
        <input
          id="image"
          type="url"
          placeholder="Paste image url"
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
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button>Create</button>
        </section>
      </form>
    </main>
  );
}
