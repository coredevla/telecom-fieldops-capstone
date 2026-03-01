import { v4 as uuidv4 } from 'uuid';
import type { AuditAction } from '../models/types';
import {
  auditRepository,
  type ListAuditOptions,
} from '../../infra/repositories/audit.repo';

interface RecordAuditInput {
  actorUserId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  correlationId: string;
}

export const auditService = {
  /** Records an audit event (async for compatibility with Prisma-based callers). */
  async record(input: RecordAuditInput): Promise<void> {
    auditRepository.insert({
      id: `aud-${uuidv4()}`,
      at: new Date().toISOString(),
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      before: input.before,
      after: input.after,
      correlationId: input.correlationId,
    });
  },

  list(opts?: ListAuditOptions) {
    return auditRepository.list(opts);
  },

  getById(id: string) {
    return auditRepository.getById(id);
  },

  getHistory(entityType: string, entityId: string) {
    return auditRepository.getHistory(entityType, entityId);
  },

  getByUser(actorUserId: string, limit?: number) {
    return auditRepository.getByUser(actorUserId, limit);
  },

  getByDateRange(from: string | Date, to: string | Date) {
    return auditRepository.getByDateRange(from, to);
  },
};
