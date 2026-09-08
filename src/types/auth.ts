export interface PublicUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
  gender?: 'Male' | 'Female' | 'Other';
}

export interface AuthUser extends PublicUser {
  password?: string;
}

export type AuthResult = { ok: true } | { ok: false; error: string };
