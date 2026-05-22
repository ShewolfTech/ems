import api from "@/utils/api.js";

/**
 * Fetches potential approvers for leave requests
 * Returns users who can approve leave requests (active, non-deleted users in the school)
 * 
 * @returns Promise with array of approvers containing id, first_name, last_name, email
 */
export const fetchApprovers = async () => {
  const response = await api.get("/attendances/leaves/approvers");
  return response.data;
};

/**
 * Formats an approver for display
 * @param approver - Approver object with first_name, last_name
 * @returns Formatted display name
 */
export const formatApproverName = (approver: { first_name?: string; last_name?: string; name?: string }) => {
  if (approver.first_name || approver.last_name) {
    return `${approver.first_name || ''} ${approver.last_name || ''}`.trim();
  }
  return approver.name || 'Unknown';
};

/**
 * Creates options array for select dropdowns
 * @param approvers - Array of approver objects
 * @returns Array of { value, label } objects
 */
export const createApproverOptions = (approvers: any[]) => {
  return approvers.map((approver: any) => ({
    value: approver.id,
    label: formatApproverName(approver)
  }));
};
