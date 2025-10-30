import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/root.css";
import "./css/homepage.css";
import "./css/shop.css";
import "./css/task.css";
import "./css/login.css";
import "./css/taskpage.css";
import "./css/taskpreview.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
