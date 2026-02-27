import type { JwtPayload } from 'jsonwebtoken';

export const AUDIT_ACTIONS = {
  USER_LOGIN: 'AUD-01 USERLOGIN',
  USER_LOGOUT: 'AUD-02 USERLOGOUT',
  USER_BLOCKED: 'AUD-03 USERBLOCKED',
  ROLE_ASSIGNED: 'AUD-04 ROLEASSIGNED',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export interface Role {
  id: string;
  name: string;
  permissionKeys: string[];
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  blocked: boolean;
  roles: string[];
}

export interface UserPublic {
  id: string;
  email: string;
  blocked: boolean;
  roles: string[];
}

export interface RefreshTokenRecord {
  jti: string;
  userId: string;
  exp: number;
  revokedAt: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actorUserId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  correlationId: string;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  correlationId: string;
  errors?: Record<string, string[]>;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  blocked: boolean;
  tokenJti: string;
}

export interface AccessTokenClaims extends JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  blocked: boolean;
  jti: string;
  type: 'access';
}

export interface RefreshTokenClaims extends JwtPayload {
  userId: string;
  jti: string;
  type: 'refresh';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshExpiresIn: number;
  user: UserPublic & {
    permissions: string[];
  };
}

export interface LoggerContext {
  correlationId: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      user?: AuthenticatedUser;
    }
  }
}
