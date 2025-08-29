export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
}

export interface AuthData {
  user: User | null;
  isAuthenticated: boolean;
  currentOrganization: Organization | null;
  personalOrganization: Organization | null;
  organizations: Organization[] | null;
  isLoading: boolean;
}

export interface InitialAuthUser {
  user: User | null;
}

export interface InitialAuthData {
  user: User | null;
  currentOrganization: Organization | null;
  personalOrganization: Organization | null;
  organizations: Organization[] | null;
}
