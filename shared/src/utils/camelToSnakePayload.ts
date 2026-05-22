/**
 * Convert camelCase keys to snake_case for API payloads.
 * Handles audit/system fields and nested objects.
 */
export function camelToSnakePayload(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== "object") return obj;

  const toSnake = (key: string) =>
    key
      .replace(/([a-z])([A-Z])/g, "$1_$2") // insert underscore before capital letters
      .toLowerCase();

  return Object.entries(obj).reduce((acc: any, [key, value]) => {
    const snakeKey = toSnake(key);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      acc[snakeKey] = camelToSnakePayload(value); // recurse for nested objects
    } else {
      acc[snakeKey] = value;
    }

    return acc;
  }, {});
}
