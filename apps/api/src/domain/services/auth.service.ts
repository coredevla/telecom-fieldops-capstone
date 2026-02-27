import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import {
  AUDIT_ACTIONS,
  type AccessTokenClaims,
  type LoginResponse,
  type RefreshTokenClaims,
} from '../models/types';
import { userRepository } from '../../infra/repositories/user.repo';
import { ApiError } from '../errors/apiError';
import { auditService } from './audit.service';

const unixNow = (): number => Math.floor(Date.now() / 1000);

const getUserOrThrow = (userId: string) => {
  const user = userRepository.findById(userId);
  if (!user) {
    throw new ApiError(401, 'Unauthorized', 'Invalid token subject.', 'urn:telecom:error:invalid-token');
  }

  return user;
};

const validateRefreshTokenNotRevoked = (jti: string): void => {
  if (userRepository.isRefreshTokenRevoked(jti)) {
    throw new ApiError(401, 'Unauthorized', 'Refresh token was revoked.', 'urn:telecom:error:token-revoked');
  }
};

export const authService = {
  login(email: string, password: string, correlationId: string): LoginResponse {
    const user = userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(
        401,
        'Unauthorized',
        'Invalid email or password.',
        'urn:telecom:error:invalid-credentials',
      );
    }

    const passwordMatches = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(
        401,
        'Unauthorized',
        'Invalid email or password.',
        'urn:telecom:error:invalid-credentials',
      );
    }

    if (user.blocked) {
      throw new ApiError(403, 'Forbidden', 'User is blocked.', 'urn:telecom:error:user-blocked');
    }

    const permissions = userRepository.getPermissionKeysForRoles(user.roles);
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles,
        permissions,
        blocked: user.blocked,
        type: 'access',
      },
      env.jwt.accessSecret,
      {
        expiresIn: env.jwt.accessExpiresInSeconds,
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
        jwtid: accessJti,
        subject: user.id,
      },
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      env.jwt.refreshSecret,
      {
        expiresIn: env.jwt.refreshExpiresInSeconds,
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
        jwtid: refreshJti,
        subject: user.id,
      },
    );

    auditService.record({
      actorUserId: user.id,
      action: AUDIT_ACTIONS.USER_LOGIN,
      entityType: 'user',
      entityId: user.id,
      before: null,
      after: { login: true },
      correlationId,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: env.jwt.accessExpiresInSeconds,
      refreshExpiresIn: env.jwt.refreshExpiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
        blocked: user.blocked,
        roles: user.roles,
        permissions,
      },
    };
  },

  verifyAccessToken(token: string): AccessTokenClaims {
    let decoded: jwt.JwtPayload | string;

    try {
      decoded = jwt.verify(token, env.jwt.accessSecret, {
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      });
    } catch {
      throw new ApiError(401, 'Unauthorized', 'Invalid access token.', 'urn:telecom:error:invalid-token');
    }

    if (typeof decoded === 'string') {
      throw new ApiError(401, 'Unauthorized', 'Invalid access token.', 'urn:telecom:error:invalid-token');
    }

    if (decoded.type !== 'access') {
      throw new ApiError(401, 'Unauthorized', 'Invalid token type.', 'urn:telecom:error:invalid-token');
    }

    if (!decoded.userId || !decoded.jti || !Array.isArray(decoded.roles) || !Array.isArray(decoded.permissions)) {
      throw new ApiError(401, 'Unauthorized', 'Malformed access token.', 'urn:telecom:error:invalid-token');
    }

    return decoded as AccessTokenClaims;
  },

  refresh(refreshToken: string): LoginResponse {
    let decoded: jwt.JwtPayload | string;

    try {
      decoded = jwt.verify(refreshToken, env.jwt.refreshSecret, {
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      });
    } catch {
      throw new ApiError(401, 'Unauthorized', 'Invalid refresh token.', 'urn:telecom:error:invalid-token');
    }

    if (typeof decoded === 'string' || decoded.type !== 'refresh' || !decoded.jti) {
      throw new ApiError(401, 'Unauthorized', 'Invalid refresh token.', 'urn:telecom:error:invalid-token');
    }

    const payload = decoded as RefreshTokenClaims;
    const userId = payload.userId ?? decoded.sub;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'Invalid refresh token.', 'urn:telecom:error:invalid-token');
    }

    validateRefreshTokenNotRevoked(payload.jti as string);
    const user = getUserOrThrow(userId);

    if (user.blocked) {
      throw new ApiError(403, 'Forbidden', 'User is blocked.', 'urn:telecom:error:user-blocked');
    }

    userRepository.revokeRefreshToken({
      jti: payload.jti as string,
      userId,
      exp: payload.exp ?? unixNow(),
      revokedAt: new Date().toISOString(),
    });

    const permissions = userRepository.getPermissionKeysForRoles(user.roles);
    const newAccessJti = uuidv4();
    const newRefreshJti = uuidv4();

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles,
        permissions,
        blocked: user.blocked,
        type: 'access',
      },
      env.jwt.accessSecret,
      {
        expiresIn: env.jwt.accessExpiresInSeconds,
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
        jwtid: newAccessJti,
        subject: user.id,
      },
    );

    const rotatedRefreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      env.jwt.refreshSecret,
      {
        expiresIn: env.jwt.refreshExpiresInSeconds,
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
        jwtid: newRefreshJti,
        subject: user.id,
      },
    );

    return {
      accessToken,
      refreshToken: rotatedRefreshToken,
      tokenType: 'Bearer',
      expiresIn: env.jwt.accessExpiresInSeconds,
      refreshExpiresIn: env.jwt.refreshExpiresInSeconds,
      user: {
        id: user.id,
        email: user.email,
        blocked: user.blocked,
        roles: user.roles,
        permissions,
      },
    };
  },

  logout(refreshToken: string, actorUserId: string | null, correlationId: string): void {
    let decoded: jwt.JwtPayload | string;

    try {
      decoded = jwt.verify(refreshToken, env.jwt.refreshSecret, {
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      });
    } catch {
      throw new ApiError(401, 'Unauthorized', 'Invalid refresh token.', 'urn:telecom:error:invalid-token');
    }

    if (typeof decoded === 'string' || decoded.type !== 'refresh' || !decoded.jti) {
      throw new ApiError(401, 'Unauthorized', 'Invalid refresh token.', 'urn:telecom:error:invalid-token');
    }

    const userId = decoded.userId as string | undefined;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized', 'Invalid refresh token.', 'urn:telecom:error:invalid-token');
    }

    userRepository.revokeRefreshToken({
      jti: decoded.jti,
      userId,
      exp: decoded.exp ?? unixNow(),
      revokedAt: new Date().toISOString(),
    });

    auditService.record({
      actorUserId: actorUserId ?? userId,
      action: AUDIT_ACTIONS.USER_LOGOUT,
      entityType: 'user',
      entityId: userId,
      before: { logout: false },
      after: { logout: true },
      correlationId,
    });
  },
};
