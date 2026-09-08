import { jsonFile } from './jsonFile';
import { hashSecret } from './session';
import { PublicUser } from '@/types/auth';

export type StoredUser = PublicUser & { passwordHash: string };

const seedUsers: StoredUser[] = [];

const store = jsonFile<StoredUser[]>('users.json', seedUsers);

function same(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function toPublic(user: StoredUser): PublicUser {
  const { passwordHash: _hash, ...profile } = user;
  return profile;
}

export async function ensureDemoUser() {
  const passwordHash = await hashSecret('Chandan@123');
  const demo: StoredUser = {
    id: 'u-demo',
    name: 'Saurabh Pandey',
    email: 'saurabh@chandanvastralaya.com',
    mobile: '9876543210',
    createdAt: '2026-08-01T10:00:00.000Z',
    passwordHash,
  };

  await store.update((users) => {
    const byId = users.findIndex((u) => u.id === demo.id);
    const byEmail = users.findIndex((u) => same(u.email, demo.email));
    const idx = byId >= 0 ? byId : byEmail;
    if (idx === -1) return [demo, ...users];

    const current = users[idx];
    if (
      current.id === demo.id &&
      current.email === demo.email &&
      current.mobile === demo.mobile &&
      current.passwordHash === passwordHash
    ) {
      return users;
    }

    const next = [...users];
    next[idx] = { ...current, ...demo };
    return next;
  });
}

export async function findByEmail(email: string) {
  await ensureDemoUser();
  const users = await store.read();
  return users.find((u) => same(u.email, email)) ?? null;
}

export async function findByLogin(id: string) {
  await ensureDemoUser();
  const key = id.trim().toLowerCase();
  const users = await store.read();
  return (
    users.find((u) => same(u.email, key) || u.mobile === id.trim()) ?? null
  );
}

export async function findById(id: string) {
  await ensureDemoUser();
  const users = await store.read();
  return users.find((u) => u.id === id) ?? null;
}

export async function findByIdOrEmail(id?: string | null, email?: string | null) {
  await ensureDemoUser();
  const users = await store.read();
  if (id) {
    const byId = users.find((u) => u.id === id);
    if (byId) return byId;
  }
  if (email) {
    return users.find((u) => same(u.email, email)) ?? null;
  }
  return null;
}

export async function createUser(input: {
  name: string;
  email: string;
  mobile: string;
  password: string;
}) {
  await ensureDemoUser();
  const email = input.email.trim().toLowerCase();
  const mobile = input.mobile.trim();
  const users = await store.read();
  if (users.some((u) => same(u.email, email))) {
    throw new Error('An account with this email already exists');
  }
  if (users.some((u) => u.mobile === mobile)) {
    throw new Error('An account with this mobile number already exists');
  }
  const user: StoredUser = {
    id: `u-${Date.now()}`,
    name: input.name.trim(),
    email,
    mobile,
    createdAt: new Date().toISOString(),
    passwordHash: await hashSecret(input.password),
  };
  await store.write([user, ...users]);
  return user;
}

export async function upsertFromApi(input: {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  gender?: PublicUser['gender'];
}) {
  await ensureDemoUser();
  let saved: StoredUser | null = null;
  await store.update(async (users) => {
    const idx = users.findIndex((u) => u.id === input.id || same(u.email, input.email));
    if (idx >= 0) {
      const next: StoredUser = {
        ...users[idx],
        id: input.id,
        name: input.name,
        email: input.email.trim().toLowerCase(),
        mobile: input.mobile || users[idx].mobile,
        gender: input.gender ?? users[idx].gender,
      };
      const copy = [...users];
      copy[idx] = next;
      saved = next;
      return copy;
    }
    const created: StoredUser = {
      id: input.id,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      mobile: input.mobile || '',
      gender: input.gender,
      createdAt: new Date().toISOString(),
      passwordHash: await hashSecret(`api-${input.id}`),
    };
    saved = created;
    return [created, ...users];
  });
  return saved!;
}

export async function updateUser(
  userId: string,
  patch: {
    name: string;
    email: string;
    mobile: string;
    gender?: PublicUser['gender'];
    currentPassword?: string;
    newPassword?: string;
  },
  sessionEmail?: string
) {
  await ensureDemoUser();
  let updated: StoredUser | null = null;
  await store.update(async (users) => {
    let idx = users.findIndex((u) => u.id === userId);
    if (idx < 0 && sessionEmail) {
      idx = users.findIndex((u) => same(u.email, sessionEmail));
    }
    if (idx < 0) {
      idx = users.findIndex((u) => same(u.email, patch.email));
    }

    if (users.some((u, i) => i !== idx && same(u.email, patch.email))) {
      throw new Error('Another account already uses this email');
    }
    if (
      patch.mobile &&
      users.some((u, i) => i !== idx && u.mobile && u.mobile === patch.mobile)
    ) {
      throw new Error('Another account already uses this mobile number');
    }

    if (idx < 0) {
      const created: StoredUser = {
        id: userId || `u-${Date.now()}`,
        name: patch.name.trim(),
        email: patch.email.trim().toLowerCase(),
        mobile: patch.mobile.trim(),
        gender: patch.gender,
        createdAt: new Date().toISOString(),
        passwordHash: await hashSecret(patch.newPassword || `api-${userId}`),
      };
      updated = created;
      return [created, ...users];
    }

    const current = users[idx];
    let passwordHash = current.passwordHash;
    if (patch.newPassword) {
      const currentHash = await hashSecret(patch.currentPassword || '');
      if (currentHash !== current.passwordHash) {
        throw new Error('Current password is incorrect');
      }
      passwordHash = await hashSecret(patch.newPassword);
    }
    const next: StoredUser = {
      ...current,
      id: current.id || userId,
      name: patch.name.trim(),
      email: patch.email.trim().toLowerCase(),
      mobile: patch.mobile.trim(),
      gender: patch.gender ?? current.gender,
      passwordHash,
    };
    const copy = [...users];
    copy[idx] = next;
    updated = next;
    return copy;
  });
  return updated;
}

export async function verifyPassword(user: StoredUser, password: string) {
  return (await hashSecret(password)) === user.passwordHash;
}
