export interface AuthMembership {
  tenantCode: string;
  tenantName: string;
  role: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  isSuperadmin: boolean;
  memberships: AuthMembership[];
}
