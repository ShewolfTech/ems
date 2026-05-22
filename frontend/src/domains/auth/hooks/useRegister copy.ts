import { useState } from "react";
import { useAuth } from "../../../app/providers/AuthContext.js";
import { RegisterInput } from "../validator.js";

export const useRegister = () => {
  const { register: contextRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Constants for your requested dropdowns
  const options = {
    genders: ["Male", "Female", "Other"],
    statuses: ["Active", "Inactive", "Pending"],
    classes: ["Grade 1", "Grade 2", "Grade 3", "SS1", "SS2", "SS3"], // Customize as needed
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await contextRegister(data);
      return { success: true };
    } catch (err: any) {
      setError(err.message || "Registration failed");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error, options };
};
