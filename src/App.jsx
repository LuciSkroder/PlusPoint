import { Route, Routes, BrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import CreateTaskPage from "./pages/CreateTaskPage";
import NavBar from "./components/NavBar";
import UserDetailPage from "./pages/UserDetailPage";
import UserUpdatePage from "./pages/UserUpdatePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AddChildPage from "./pages/AddChildPage";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoutes";
import BottomNav from "./components/BottomNav";

export default function App() {
  const basename = process.env.NODE_ENV === "production" ? "/PlusPoint" : "/";

  return (
    <AuthProvider>
      <BrowserRouter basename={basename} className="app">
        <NavBar></NavBar>
        <Routes>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/signup" element={<SignUpPage />}></Route>
          <Route
            path="/forgotpassword"
            element={<ForgotPasswordPage />}
          ></Route>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/addchild"
            element={
              <ProtectedRoute>
                <AddChildPage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateTaskPage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <UserDetailPage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/users/:id/update"
            element={
              <ProtectedRoute>
                <UserUpdatePage />
              </ProtectedRoute>
            }
          ></Route>
        </Routes>
        <BottomNav></BottomNav>
      </BrowserRouter>
    </AuthProvider>
  );
}
