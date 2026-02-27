import { v4 as uuidv4 } from 'uuid';
import type { AuditAction } from '../models/types';
import { auditRepository } from '../../infra/repositories/audit.repo';

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
  record(input: RecordAuditInput): void {
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

  list() {
    return auditRepository.list();
  },
};
