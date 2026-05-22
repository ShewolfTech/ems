/**
 * 🛡️ System fields that should never be overridden by form casting
 */
const SYSTEM_FIELDS = [
  "id",
  "schoolId",
  "school_id",
  "userId",
  "user_id",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "created_at",
  "updated_at",
  "deleted_at",
  "createdBy",
  "updatedBy",
  "deletedBy",
  "created_by",
  "updated_by",
  "deleted_by",
  "isDeleted",
  "is_deleted",
];

export type MetadataField = {
  name: string;
  uiType: string;
  label?: string;
  required?: boolean;
};

export type Metadata = {
  resource: string;
  label: string;
  fields: MetadataField[];
};

// Convert camelCase → snake_case
const toSnake = (key: string) =>
  key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

/**
 * Cast raw FormData values into correct types based on metadata.
 * ✅ Handles both camelCase and snake_case keys.
 */
export function castWithMetadata(
  rawData: Record<string, FormDataEntryValue>,
  metadata: Metadata,
) {
  const castedData: Record<string, any> = {};

  metadata.fields
    .filter((f) => !SYSTEM_FIELDS.includes(f.name) && !SYSTEM_FIELDS.includes(toSnake(f.name)))
    .forEach((meta) => {
      const snakeName = toSnake(meta.name);

      // Look for camelCase first, then snake_case
      const val = rawData[meta.name] ?? rawData[snakeName];

      if (val === "" || val === undefined || val === null) {
        castedData[snakeName] = null;
        return;
      }

      switch (meta.uiType) {
        case "select":
        case "number": {
          const num = Number(val);
          castedData[snakeName] = isNaN(num) ? null : num;
          break;
        }
        case "date": {
          const dateObj = new Date(val as string);
          castedData[snakeName] = !isNaN(dateObj.getTime()) ? dateObj : null;
          break;
        }
        case "boolean": {
          const strVal = String(val).toLowerCase();
          castedData[snakeName] =
            strVal === "on" || strVal === "true" || strVal === "1";
          break;
        }
        default:
          castedData[snakeName] = val;
      }
    });

  return castedData;
}
