export type UserRole =
  | "guest"
  | "customer"
  | "professional_pending"
  | "professional_approved"
  | "professional_suspended"
  | "partner_manager"
  | "content_editor"
  | "customer_support"
  | "order_manager"
  | "training_manager"
  | "administrator"
  | "super_administrator";

export interface AuthUser {
  id: string;
  email: string;
  roles: UserRole[];
  locale: string;
  emailVerifiedAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  locale?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
