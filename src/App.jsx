import { Route, Routes, BrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NavBar from "./components/NavBar";
import UserDetailPage from "./pages/UserDetailPage";
import UserUpdatePage from "./pages/UserUpdatePage";

export default function App() {
  return (
    <BrowserRouter className="app">
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/create" element={<CreatePage />}></Route>
        <Route path="/users/:id" element={<UserDetailPage />}></Route>
        <Route path="/users/:id/update" element={<UserUpdatePage />}></Route>
      </Routes>
      <HomePage></HomePage>
    </BrowserRouter>
  );
}
