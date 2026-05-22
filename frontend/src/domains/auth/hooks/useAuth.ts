import { useAuth as useAuthContext } from "../context/AuthProvider.js";

// Re-export for consistency
export const useAuth = () => useAuthContext();
