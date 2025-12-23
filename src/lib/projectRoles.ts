export const PROJECT_ROLE_CODES = [
  "CREATOR",
  "LEGAL",
  "ADMIN_OPS",
  "AUDITOR",
] as const;

export type ProjectRoleCode = (typeof PROJECT_ROLE_CODES)[number];

export const PROJECT_ROLE_LABELS: Record<ProjectRoleCode, string> = {
  CREATOR: "Creator (Issuer)",
  LEGAL: "Legal",
  ADMIN_OPS: "Admin & Ops",
  AUDITOR: "Auditor",
};

export function isProjectRole(role: string): role is ProjectRoleCode {
  return PROJECT_ROLE_CODES.includes(role as ProjectRoleCode);
}
