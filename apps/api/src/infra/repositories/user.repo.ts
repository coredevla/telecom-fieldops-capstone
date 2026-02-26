import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection';
import type { RefreshTokenRecord, Role, User } from '../../domain/models/types';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  blocked?: boolean;
  roles: string[];
}

export interface UpdateUserInput {
  email?: string;
  passwordHash?: string;
  blocked?: boolean;
  roles?: string[];
}

export const userRepository = {
  listUsers(): User[] {
    return Array.from(getDb().users.values());
  },

  findById(id: string): User | null {
    return getDb().users.get(id) ?? null;
  },

  findByEmail(email: string): User | null {
    const target = normalizeEmail(email);
    return this.listUsers().find((user) => normalizeEmail(user.email) === target) ?? null;
  },

  create(input: CreateUserInput): User {
    const id = `usr-${uuidv4()}`;
    const created: User = {
      id,
      email: normalizeEmail(input.email),
      passwordHash: input.passwordHash,
      blocked: input.blocked ?? false,
      roles: input.roles,
    };
    getDb().users.set(created.id, created);
    return created;
  },

  update(id: string, input: UpdateUserInput): User | null {
    const current = this.findById(id);
    if (!current) {
      return null;
    }

    const updated: User = {
      ...current,
      ...(input.email ? { email: normalizeEmail(input.email) } : {}),
      ...(input.passwordHash ? { passwordHash: input.passwordHash } : {}),
      ...(typeof input.blocked === 'boolean' ? { blocked: input.blocked } : {}),
      ...(input.roles ? { roles: input.roles } : {}),
    };

    getDb().users.set(updated.id, updated);
    return updated;
  },

  block(id: string): User | null {
    return this.update(id, { blocked: true });
  },

  listRoles(): Role[] {
    return Array.from(getDb().roles.values());
  },

  findRoleByName(name: string): Role | null {
    return this.listRoles().find((role) => role.name === name) ?? null;
  },

  validateRoleNames(roleNames: string[]): boolean {
    return roleNames.every((name) => this.findRoleByName(name) !== null);
  },

  getPermissionKeysForRoles(roleNames: string[]): string[] {
    const keys = new Set<string>();

    for (const roleName of roleNames) {
      const role = this.findRoleByName(roleName);
      if (!role) {
        continue;
      }

      for (const permission of role.permissionKeys) {
        keys.add(permission);
      }
    }

    return Array.from(keys);
  },

  revokeRefreshToken(record: RefreshTokenRecord): void {
    getDb().revokedRefreshTokens.set(record.jti, record);
  },

  isRefreshTokenRevoked(jti: string): boolean {
    return getDb().revokedRefreshTokens.has(jti);
  },
};
