import { useState } from "react";
import { useAuth } from "../../../app/providers/AuthContext.js";
import { RegisterInput } from "../validator.js";

export const useRegister = () => {
  const { register: contextRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = {
    genders: ["Male", "Female", "Other"],
    statuses: ["Active", "Inactive", "Pending"],
    classes: ["Grade 1", "Grade 2", "Grade 3", "SS1", "SS2", "SS3"],
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      // We expect contextRegister to return { success: boolean, error?: string }
      const result = await contextRegister(data);

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error || "Registration failed");
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error, options };
};
