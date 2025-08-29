export type OrganizationType = "personal" | "hospital";

export interface SyncUserRequest {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  organizations: Organization[];
  personal_organization: Organization;
}

export interface SyncUserResponse {
  message: string;
  user: User;
}
