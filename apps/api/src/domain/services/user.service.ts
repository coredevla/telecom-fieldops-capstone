import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { AUDIT_ACTIONS, type UserPublic } from '../models/types';
import { ApiError } from '../errors/apiError';
import { userRepository } from '../../infra/repositories/user.repo';
import { auditService } from './audit.service';

export interface CreateUserPayload {
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  roles?: string[];
  blocked?: boolean;
}

const toPublicUser = (input: {
  id: string;
  email: string;
  blocked: boolean;
  roles: string[];
}): UserPublic => ({
  id: input.id,
  email: input.email,
  blocked: input.blocked,
  roles: [...input.roles],
});

export const userService = {
  listUsers(): UserPublic[] {
    return userRepository.listUsers().map(toPublicUser);
  },

  listRoles() {
    return userRepository.listRoles();
  },

  createUser(payload: CreateUserPayload): UserPublic {
    const existing = userRepository.findByEmail(payload.email);
    if (existing) {
      throw new ApiError(
        409,
        'Conflict',
        'A user with the same email already exists.',
        'urn:telecom:error:user-conflict',
      );
    }

    if (!userRepository.validateRoleNames(payload.roles)) {
      throw new ApiError(
        409,
        'Conflict',
        'One or more roles do not exist.',
        'urn:telecom:error:role-missing',
      );
    }

    const passwordHash = bcrypt.hashSync(payload.password, env.auth.bcryptRounds);
    const created = userRepository.create({
      email: payload.email,
      passwordHash,
      roles: payload.roles,
      blocked: false,
    });
    return toPublicUser(created);
  },

  updateUser(userId: string, payload: UpdateUserPayload, actorUserId: string, correlationId: string): UserPublic {
    const previous = userRepository.findById(userId);
    if (!previous) {
      throw new ApiError(404, 'Not Found', 'User not found.', 'urn:telecom:error:user-not-found');
    }

    if (payload.email && payload.email !== previous.email) {
      const existingWithEmail = userRepository.findByEmail(payload.email);
      if (existingWithEmail && existingWithEmail.id !== userId) {
        throw new ApiError(
          409,
          'Conflict',
          'A user with the same email already exists.',
          'urn:telecom:error:user-conflict',
        );
      }
    }

    if (payload.roles && !userRepository.validateRoleNames(payload.roles)) {
      throw new ApiError(
        409,
        'Conflict',
        'One or more roles do not exist.',
        'urn:telecom:error:role-missing',
      );
    }

    const updated = userRepository.update(userId, {
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.password
        ? { passwordHash: bcrypt.hashSync(payload.password, env.auth.bcryptRounds) }
        : {}),
      ...(typeof payload.blocked === 'boolean' ? { blocked: payload.blocked } : {}),
      ...(payload.roles ? { roles: payload.roles } : {}),
    });

    if (!updated) {
      throw new ApiError(404, 'Not Found', 'User not found.', 'urn:telecom:error:user-not-found');
    }

    const rolesChanged =
      Array.isArray(payload.roles) &&
      (payload.roles.length !== previous.roles.length ||
        payload.roles.some((role, idx) => role !== previous.roles[idx]));

    if (rolesChanged) {
      auditService.record({
        actorUserId,
        action: AUDIT_ACTIONS.ROLE_ASSIGNED,
        entityType: 'user',
        entityId: userId,
        before: { roles: previous.roles },
        after: { roles: updated.roles },
        correlationId,
      });
    }

    return toPublicUser(updated);
  },

  blockUser(userId: string, actorUserId: string, correlationId: string): UserPublic {
    const previous = userRepository.findById(userId);
    if (!previous) {
      throw new ApiError(404, 'Not Found', 'User not found.', 'urn:telecom:error:user-not-found');
    }

    const updated = userRepository.block(userId);

    if (!updated) {
      throw new ApiError(404, 'Not Found', 'User not found.', 'urn:telecom:error:user-not-found');
    }

    auditService.record({
      actorUserId,
      action: AUDIT_ACTIONS.USER_BLOCKED,
      entityType: 'user',
      entityId: userId,
      before: { blocked: previous.blocked },
      after: { blocked: updated.blocked },
      correlationId,
    });

    return toPublicUser(updated);
  },

  getUserPermissions(userId: string): string[] {
    const user = userRepository.findById(userId);
    if (!user) {
      return [];
    }

    return userRepository.getPermissionKeysForRoles(user.roles);
  },
};
