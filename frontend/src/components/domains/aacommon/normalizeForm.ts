// frontend/src/components/domains/aacommon/normalizeForm.ts
export function normalizeForm<T>(
  formValues: Record<string, any>,
  formFields: string[],
  context: { schoolId: number; userId: number }
): T {
  const payload: any = {};

  for (const key of formFields) {
    const value = formValues[key];

    if (value === undefined || value === null) {
      payload[key] = undefined;
      continue;
    }

    if (typeof value === "string" && /^\d+$/.test(value)) {
      payload[key] = Number(value); // numeric strings → number
    } else if (key.toLowerCase().includes("date")) {
      payload[key] = value instanceof Date ? value : new Date(value); // date fields
    } else if (key.toLowerCase().startsWith("is")) {
      payload[key] = Boolean(value); // boolean flags
    } else {
      payload[key] = value;
    }
  }

  // System defaults
  payload.schoolId = context.schoolId;
  payload.createdBy = context.userId;
  payload.updatedBy = context.userId;
  payload.createdAt = new Date();
  payload.updatedAt = new Date();
  payload.isActive = true;
  payload.isDeleted = false;

  return payload as T;
}
