import { getDb } from '../db/connection';
import type { AuditEvent } from '../../domain/models/types';

export const auditRepository = {
  insert(event: AuditEvent): AuditEvent {
    getDb().audits.push(event);
    return event;
  },

  list(): AuditEvent[] {
    return [...getDb().audits];
  },
};
