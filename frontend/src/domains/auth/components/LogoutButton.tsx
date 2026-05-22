import React from "react";
import { useAuth } from "../context/AuthProvider.js";

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  return <button onClick={logout}>Logout</button>;
};
