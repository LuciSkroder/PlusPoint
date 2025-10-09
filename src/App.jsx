import { Route, Routes, BrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import NavBar from "./components/NavBar";
import UserDetailPage from "./pages/UserDetailPage";
import UserUpdatePage from "./pages/UserUpdatePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

export default function App() {
  return (
    <BrowserRouter className="app">
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/signup" element={<SignUpPage />}></Route>
        <Route path="/forgotpassword" element={<ForgotPasswordPage />}></Route>
        <Route path="/create" element={<CreatePage />}></Route>
        <Route path="/users/:id" element={<UserDetailPage />}></Route>
        <Route path="/users/:id/update" element={<UserUpdatePage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
