import { Router } from "express";
import Roles from "./roles/index.js";
import RolePermissions from "./role_permissions/index.js";
import RoutePermissions from "./route_permissions/index.js";
import Staff from "./staff/index.js";
import Users from "./users/index.js";
import UserPermissions from "./user_permissions/index.js";
import UserRoles from "./user_roles/index.js";

const router = Router();

router.use("/roles", Roles);
router.use("/role-permissions", RolePermissions);
router.use("/route-permissions", RoutePermissions);
router.use("/staff", Staff);
router.use("/users", Users);
router.use("/user-permissions", UserPermissions);
router.use("/user-roles", UserRoles);

export default router;
