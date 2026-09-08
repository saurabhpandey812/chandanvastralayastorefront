import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResult, PublicUser } from '@/types/auth';
import { api } from '@/lib/api';

interface AuthState {
  user: PublicUser | null;
  hydrate: () => Promise<void>;
  signup: (input: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }) => Promise<AuthResult>;
  login: (id: string, password: string) => Promise<AuthResult>;
  updateProfile: (input: {
    name: string;
    email: string;
    mobile: string;
    gender?: PublicUser['gender'];
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      hydrate: async () => {
        const res = await api<PublicUser>('/api/auth/me');
        if (!res.ok) {
          set({ user: null });
          return;
        }
        const current = get().user;
        set({
          user: {
            ...res.data,
            gender: res.data.gender || current?.gender,
            mobile: res.data.mobile || current?.mobile || '',
          },
        });
      },

      signup: async (input) => {
        const res = await api<{ user?: PublicUser }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        if (!res.ok || !res.data.user) {
          return { ok: false, error: res.ok ? 'Could not create account' : res.error };
        }
        set({ user: res.data.user });
        return { ok: true };
      },

      login: async (id, password) => {
        const res = await api<{ user?: PublicUser }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ id, password }),
        });
        if (!res.ok || !res.data.user) {
          return { ok: false, error: res.ok ? 'Could not sign in' : res.error };
        }
        set({ user: res.data.user });
        return { ok: true };
      },

      updateProfile: async (input) => {
        const res = await api<PublicUser>('/api/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify(input),
        });
        if (!res.ok) return { ok: false, error: res.error };
        set({ user: res.data });
        return { ok: true };
      },

      logout: async () => {
        await api('/api/auth/logout', { method: 'POST' });
        set({ user: null });
      },
    }),
    {
      name: 'chandan-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}
