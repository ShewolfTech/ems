import type { DomainRegistry } from "../../../types/domain.js";

import { AuthProvider } from "../context/AuthProvider.js";

export const authRegistry: DomainRegistry = {
  name: "auth",
    providers: [
    {
      id: "auth-provider",
      component: AuthProvider
    }
  ]
};
