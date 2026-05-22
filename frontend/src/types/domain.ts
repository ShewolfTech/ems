// frontend/src/types/domain.ts

import type { ReactNode, ComponentType } from "react";

export type DomainRoute = {
  path: string;
  element: ReactNode;
};

export type DomainProvider = {
  id: string;
  component: ComponentType<any>;
};

export type DomainComponent = {
  id: string;
  component: ComponentType<any>;
};

export type DomainRegistry = {
  name: string;
  routes?: DomainRoute[];
  providers?: DomainProvider[];
  components?: DomainComponent[];
};
