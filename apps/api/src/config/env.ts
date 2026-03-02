import 'dotenv/config';
import { randomBytes } from 'crypto';

const parseIntWithDefault = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBooleanWithDefault = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return fallback;
};

const runtimeSecret = (): string => randomBytes(48).toString('hex');

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET ?? runtimeSecret();
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET ?? runtimeSecret();
const RESOLVED_PORT = parseIntWithDefault(process.env.PORT, 3000);
const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const DEFAULT_API_PUBLIC_URL = process.env.API_PUBLIC_URL ?? `http://localhost:${RESOLVED_PORT}`;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: RESOLVED_PORT,
  PORT: RESOLVED_PORT,
  JWT_SECRET: process.env.JWT_SECRET ?? ACCESS_TOKEN_SECRET,
  FRONTEND_URL: DEFAULT_FRONTEND_URL,
  API_PUBLIC_URL: DEFAULT_API_PUBLIC_URL,
  jwt: {
    issuer: process.env.JWT_ISSUER ?? 'telecom-fieldops-api',
    audience: process.env.JWT_AUDIENCE ?? 'telecom-fieldops-clients',
    accessSecret: ACCESS_TOKEN_SECRET,
    refreshSecret: REFRESH_TOKEN_SECRET,
    accessExpiresInSeconds: 60 * 60,
    refreshExpiresInSeconds: 60 * 60 * 24 * 7,
  },
  auth: {
    bcryptRounds: parseIntWithDefault(process.env.BCRYPT_ROUNDS, 10),
  },
  oauth: {
    auth0: {
      domain: process.env.OAUTH_AUTH0_DOMAIN ?? '',
      clientId: process.env.OAUTH_AUTH0_CLIENT_ID ?? '',
      clientSecret: process.env.OAUTH_AUTH0_CLIENT_SECRET ?? '',
      audience: process.env.OAUTH_AUTH0_AUDIENCE ?? '',
      scope: process.env.OAUTH_AUTH0_SCOPE ?? 'openid profile email',
      passwordGrantEnabled: parseBooleanWithDefault(process.env.OAUTH_AUTH0_PASSWORD_GRANT_ENABLED, false),
      connection: process.env.OAUTH_AUTH0_CONNECTION ?? '',
    },
  },
} as const;
