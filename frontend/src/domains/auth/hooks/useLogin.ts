import { useState } from "react";
import { useAuthContext } from "../../../app/providers/AuthContext.js";
import { LoginInput } from "../validator.js";

/**
 * useLogin Hook
 * Manages the UI state for the login process (loading, errors).
 * Communicates with the global AuthContext for session management.
 */
export const useLogin = () => {
  const { login: contextLogin } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await contextLogin(data);

      // Handle both success and failure explicitly
      if (result?.success) {
        return { success: true };
      } else {
        const message = result?.error || "Invalid credentials";
        setError(message);
        return { success: false, error: message };
      }
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error, setError };
};

export default useLogin;
