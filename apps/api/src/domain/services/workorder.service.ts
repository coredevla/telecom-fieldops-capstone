import { ApiError } from '../errors/apiError';
import type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderType,
  WorkOrderItem,
} from '../models/types';
import { workOrderRepository } from '../../infra/repositories/workorder.repo';
import { inventoryService } from './invetory.service';
import { validateTransition, allowedTransitions } from '../stateMachine/workOrderStateMachine';
import { auditService } from './audit.service';
import { AUDIT_ACTIONS } from '../models/types';

export interface CreateWorkOrderPayload {
  type: WorkOrderType;
  customerId: string;
  branchId?: string;
  planId?: string;
  items?: WorkOrderItem[];
}

export interface UpdateWorkOrderStatusPayload {
  newStatus: WorkOrderStatus;
  baseVersion: number;
}

export const workOrderService = {
  async listWorkOrders(): Promise<Array<WorkOrder & { allowedTransitions: WorkOrderStatus[] }>> {
    const list = await workOrderRepository.listAll();
    return list.map((wo) => ({
      ...wo,
      allowedTransitions: allowedTransitions(wo.type, wo.status),
    }));
  },

  async getWorkOrder(id: string): Promise<(WorkOrder & { allowedTransitions: WorkOrderStatus[] }) | null> {
    const wo = await workOrderRepository.findById(id);
    if (!wo) return null;
    return { ...wo, allowedTransitions: allowedTransitions(wo.type, wo.status) };
  },

  async createWorkOrder(payload: CreateWorkOrderPayload, actorUserId: string | null, correlationId: string) {
    const created = await workOrderRepository.create(payload);
    await auditService.record({
      actorUserId,
      action: AUDIT_ACTIONS.WORKORDER_CREATED,
      entityType: 'WorkOrder',
      entityId: created.id,
      before: null,
      after: created as unknown as Record<string, unknown>,
      correlationId,
    });
    return created;
  },

  async updateStatus(
    id: string,
    input: UpdateWorkOrderStatusPayload,
    actorUserId: string | null,
    correlationId: string,
  ) {
    const wo = await workOrderRepository.findById(id);
    if (!wo) {
      throw new ApiError(404, 'Not Found', 'Work order not found', 'urn:telecom:error:workorder-not-found');
    }

    // optimistic locking
    if (input.baseVersion !== wo.version) {
      throw new ApiError(
        409,
        'Conflict',
        'Version mismatch',
        'urn:telecom:error:version_mismatch',
      );
    }

    validateTransition(wo.type, wo.status, input.newStatus);

    // inventory reservation side effect
    if (input.newStatus === 'INVENTORY_RESERVATION' && wo.items && wo.items.length > 0) {
      try {
        await inventoryService.reserveForRequest({
          workOrderId: wo.id,
          branchId: wo.branchId ?? '',
          items: wo.items,
        });
      } catch (err) {
        if (err instanceof ApiError && err.message.includes('Insufficient stock')) {
          throw new ApiError(
            409,
            'Conflict',
            'stock_insufficient',
            'urn:telecom:error:stock_insufficient',
          );
        }
        throw err;
      }
    }

    // RB-05: cancelar debe liberar inventario
    if (input.newStatus === 'CANCELLED') {
      try {
        inventoryService.releaseForRequest(wo.id);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // no reservation existed, idempotent
        } else {
          throw err;
        }
      }
    }

    const before = { status: wo.status, version: wo.version };
    const updated = await workOrderRepository.update(id, {
      status: input.newStatus,
      version: wo.version + 1,
    });
    if (!updated) {
      throw new ApiError(500, 'Internal Server Error', 'Unable to update work order', 'urn:telecom:error:internal');
    }

    await auditService.record({
      actorUserId,
      action: AUDIT_ACTIONS.WORKORDER_STATUS,
      entityType: 'WorkOrder',
      entityId: id,
      before,
      after: { status: updated.status, version: updated.version },
      correlationId,
    });

    return updated;
  },
};
