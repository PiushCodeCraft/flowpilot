export type SystemRole = "ADMIN" | "USER";

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Membership {
  id: string;
  role: string;
  organization: Organization;
}

export interface User {
  id: string;
  name: string;
  email: string;
  systemRole: SystemRole;
  organization?: Organization;
  memberships?: Membership[];
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  user?: User;
  data?: T;
}