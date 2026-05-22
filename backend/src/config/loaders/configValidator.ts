// src/config/loaders/configValidator.ts
export const validateConfig = (config: Record<string, unknown>) => {
  // Logic to validate config object
  if (!config) throw new Error("Invalid config");
  return true;
};
