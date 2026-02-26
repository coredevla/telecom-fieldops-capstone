import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import type { AuditEvent, RefreshTokenRecord, Role, User } from '../../domain/models/types';

export interface InMemoryDatabase {
  users: Map<string, User>;
  roles: Map<string, Role>;
  audits: AuditEvent[];
  revokedRefreshTokens: Map<string, RefreshTokenRecord>;
}

const createDefaultRoles = (): Role[] => [
  { id: 'role-admin', name: 'admin', permissionKeys: ['*'] },
  {
    id: 'role-tecnico',
    name: 'tecnico',
    permissionKeys: ['workorders:view-own', 'workorders:update-state'],
  },
  {
    id: 'role-supervisor',
    name: 'supervisor',
    permissionKeys: ['workorders:*', 'inventory:view'],
  },
  {
    id: 'role-ventas',
    name: 'ventas',
    permissionKeys: ['workorders:create', 'inventory:reserve'],
  },
];

const hashPassword = (plainPassword: string): string =>
  bcrypt.hashSync(plainPassword, env.auth.bcryptRounds);

const createDefaultUsers = (): User[] => [
  {
    id: 'usr-admin-01',
    email: 'admin@telecom.local',
    passwordHash: hashPassword('Admin123!'),
    blocked: false,
    roles: ['admin'],
  },
  {
    id: 'usr-tecnico-01',
    email: 'tecnico@telecom.local',
    passwordHash: hashPassword('Tecnico123!'),
    blocked: false,
    roles: ['tecnico'],
  },
  {
    id: 'usr-supervisor-01',
    email: 'supervisor@telecom.local',
    passwordHash: hashPassword('Supervisor123!'),
    blocked: false,
    roles: ['supervisor'],
  },
  {
    id: 'usr-ventas-01',
    email: 'ventas@telecom.local',
    passwordHash: hashPassword('Ventas123!'),
    blocked: false,
    roles: ['ventas'],
  },
];

const buildSeededDatabase = (): InMemoryDatabase => {
  const db: InMemoryDatabase = {
    users: new Map<string, User>(),
    roles: new Map<string, Role>(),
    audits: [],
    revokedRefreshTokens: new Map<string, RefreshTokenRecord>(),
  };

  for (const role of createDefaultRoles()) {
    db.roles.set(role.id, role);
  }

  for (const user of createDefaultUsers()) {
    db.users.set(user.id, user);
  }

  return db;
};

let database = buildSeededDatabase();

export const getDb = (): InMemoryDatabase => database;

export const resetDb = (): InMemoryDatabase => {
  database = buildSeededDatabase();
  return database;
};
