import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice.js";
import { isAdmin, isProvider } from "../utils/helpers.js";
import { isTokenValid } from "../utils/session.js";

export const useAuth = () => {
  const { user, token, loading } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  return {
    user,
    token,
    loading,
    isAuthenticated: !!user && isTokenValid(token),
    isAdmin: user ? isAdmin(user.role) : false,
    isProvider: user ? isProvider(user.role) : false,
    logout: () => dispatch(logout()),
  };
};
