import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResult, AuthUser } from '@/types/auth';
import { syncRegisteredCustomer } from '@/lib/adminSync';
import { isStrongPassword } from '@/lib/validation';

interface AuthState {
  users: AuthUser[];
  user: AuthUser | null;
  signup: (input: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }) => AuthResult;
  login: (id: string, password: string) => AuthResult;
  updateProfile: (input: {
    name: string;
    email: string;
    mobile: string;
    gender?: AuthUser['gender'];
    currentPassword?: string;
    newPassword?: string;
  }) => AuthResult;
  logout: () => void;
}

const demoUser: AuthUser = {
  id: 'u-demo',
  name: 'Saurabh Pandey',
  email: 'saurabh@aaraish.com',
  mobile: '9876543210',
  password: 'Aaraish@123',
  createdAt: '2026-08-01T10:00:00.000Z',
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [demoUser],
      user: null,

      signup: ({ name, email, mobile, password }) => {
        const users = get().users;
        if (users.some((u) => norm(u.email) === norm(email))) {
          return { ok: false, error: 'An account with this email already exists' };
        }
        if (users.some((u) => u.mobile === mobile)) {
          return { ok: false, error: 'An account with this mobile number already exists' };
        }
        const user: AuthUser = {
          id: `u-${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          mobile,
          password,
          createdAt: new Date().toISOString(),
        };
        set({ users: [...users, user], user });
        void syncRegisteredCustomer({
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          createdAt: user.createdAt,
        });
        return { ok: true };
      },

      login: (id, password) => {
        const key = norm(id);
        const found = get().users.find(
          (u) => norm(u.email) === key || u.mobile === id.trim()
        );
        if (!found || found.password !== password) {
          return { ok: false, error: 'Incorrect email/mobile or password' };
        }
        set({ user: found });
        void syncRegisteredCustomer({
          id: found.id,
          name: found.name,
          email: found.email,
          mobile: found.mobile,
          createdAt: found.createdAt,
        });
        return { ok: true };
      },

      updateProfile: ({ name, email, mobile, gender, currentPassword, newPassword }) => {
        const current = get().user;
        if (!current) return { ok: false, error: 'Please log in to edit your profile' };

        const users = get().users;
        if (users.some((u) => u.id !== current.id && norm(u.email) === norm(email))) {
          return { ok: false, error: 'Another account already uses this email' };
        }
        if (users.some((u) => u.id !== current.id && u.mobile === mobile)) {
          return { ok: false, error: 'Another account already uses this mobile number' };
        }

        let password = current.password;
        if (newPassword) {
          if (!currentPassword) return { ok: false, error: 'Enter your current password' };
          if (currentPassword !== current.password) {
            return { ok: false, error: 'Current password is incorrect' };
          }
          if (!isStrongPassword(newPassword)) {
            return { ok: false, error: 'New password must be 8+ characters with letters and a number' };
          }
          password = newPassword;
        }

        const user: AuthUser = {
          ...current,
          name: name.trim(),
          email: email.trim(),
          mobile,
          gender,
          password,
        };
        set({
          user,
          users: users.map((u) => (u.id === current.id ? user : u)),
        });
        void syncRegisteredCustomer({
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          createdAt: user.createdAt,
        });
        return { ok: true };
      },

      logout: () => set({ user: null }),
    }),
    { name: 'aaraish-auth' }
  )
);

export function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}
