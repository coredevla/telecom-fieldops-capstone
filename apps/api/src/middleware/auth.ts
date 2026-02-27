import type { NextFunction, Request, Response } from 'express';
import { authService } from '../domain/services/auth.service';
import { ApiError } from '../domain/errors/apiError';
import { userRepository } from '../infra/repositories/user.repo';

const extractBearerToken = (req: Request): string => {
  const header = req.headers.authorization;
  if (!header) {
    throw new ApiError(401, 'Unauthorized', 'Missing Bearer token.', 'urn:telecom:error:missing-token');
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Unauthorized', 'Invalid Authorization header.', 'urn:telecom:error:invalid-token');
  }

  return token;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = extractBearerToken(req);
    const claims = authService.verifyAccessToken(token);
    const user = userRepository.findById(claims.userId);

    if (!user) {
      throw new ApiError(401, 'Unauthorized', 'Invalid token subject.', 'urn:telecom:error:invalid-token');
    }

    if (user.blocked) {
      throw new ApiError(403, 'Forbidden', 'User is blocked.', 'urn:telecom:error:user-blocked');
    }

    const currentPermissions = userRepository.getPermissionKeysForRoles(user.roles);

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles,
      permissions: currentPermissions,
      blocked: user.blocked,
      tokenJti: claims.jti,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export function auth() {
  return authenticate;
}
