// ⚠️ Auto-generated Registry. Do not edit manually.
import { z } from "zod";
import { PermissionsSchema } from "../domains/permissions/validator.js";


export const DomainRegistry = {
  permissions: {
    resource: "permissions",
    interface: "Permissions",
    schema: PermissionsSchema,
    path: "../domains/permissions",
    isMenuAvailable: true,
  },
} as const;

export type DomainName = keyof typeof DomainRegistry;
