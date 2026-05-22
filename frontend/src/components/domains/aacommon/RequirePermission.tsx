import React from "react";

interface RequirePermissionProps {
  permission: string;    // e.g., "students.read"
  permissions: string[]; // e.g., ["studentsmgt.students.read", "studentsmgt.enrollments.manage"]
  children: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  permissions,
  children,
}) => {
  if (!permissions || !Array.isArray(permissions)) return null;

  // Split the requested permission into resource + action
  const parts = permission.split(/[.:]/);
  const resource = parts.length > 1 ? parts[parts.length - 2].toLowerCase() : parts[0].toLowerCase();
  const action = parts[parts.length - 1].toLowerCase();

  const hasAccess = permissions.some((p) => {
    const pParts = p.split(/[.:]/);
    const pResource = pParts.length >= 3 ? pParts[1].toLowerCase() : pParts[0].toLowerCase();
    const pAction = pParts[pParts.length - 1].toLowerCase();

    // Match exact resource+action OR master manage/admin keys
    return (
      (pResource === resource && pAction === action) ||
      (pResource === resource && (pAction === "manage" || pAction === "admin"))
    );
  });

  return hasAccess ? <>{children}</> : null;
};

export default RequirePermission;
