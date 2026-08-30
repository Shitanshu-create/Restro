import { useContext } from "react";
import { AuthContext } from "../services/authContext.jsx";
import { loginUser, registerUser, logoutUser } from "../api/auth.api.js";



export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading } = context;

  
  const handleRegister = async ({ name, email, password, role = "waiter" }) => {
    try {
      const userData = { name, email, password, role };
      const res = await registerUser(userData);
      if (res.success) {
        if (res.user && res.user.isActive) {
          setUser(res.user);
        }
        return { success: true, message: res.message, user: res.user };
      }

      return { success: false, message: res.message };

    } catch (err) {
      console.error("Register hook failed:", err);
      return { success: false, message: "An unexpected error occurred" };
    }
  }


  const handleLogin = async ({ email, password }) => {
    try {
      const userData = {email, password}
      const res = await loginUser(userData);
      if (res.success && res.user) {
        sessionStorage.clear();
        setUser(res.user);
        return { success: true, user: res.user };;
      }
      return { success: false, message: res.message };
    } catch (err) {
      console.error("Login hook failed:", err);
      return { success: false, message: "An unexpected error occurred" };
    }
  }


  const handleLogout = async () => {
    try {
      await logoutUser();
      sessionStorage.clear();
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error("Logout failed:", err);
      setUser(null);
      return { success: false, message: "Logout may not have completed on server" };
    }
  }



  return { user, loading, handleLogin, handleRegister, handleLogout };
}
