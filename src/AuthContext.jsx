import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Auth } from "./components/DataBase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track if auth state is still loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(Auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Auth state has been determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading, // Provide loading state as well
  };

  // Only render children when authentication state has been determined
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}{" "}
      {/* Render children only after auth state is known */}
      {loading && <div>Loading authentication...</div>} {/* Or a spinner */}
    </AuthContext.Provider>
  );
}
