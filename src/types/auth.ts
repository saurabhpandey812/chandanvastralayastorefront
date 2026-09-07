export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  createdAt: string;
  gender?: 'Male' | 'Female' | 'Other';
}

export type AuthResult = { ok: true } | { ok: false; error: string };
