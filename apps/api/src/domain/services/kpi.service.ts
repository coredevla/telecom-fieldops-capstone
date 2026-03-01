import { inventoryService } from './invetory.service';
import { workOrderRepository } from '../../infra/repositories/workorder.repo';
import { userRepository } from '../../infra/repositories/user.repo';
import type { WorkOrder, WorkOrderStatus } from '../models/types';

const VALID_STATUSES = new Set<WorkOrderStatus>([
  'DRAFT',
  'SUBMITTED',
  'ELIGIBILITY_CHECK',
  'INVENTORY_RESERVATION',
  'ON_HOLD',
  'SCHEDULED',
  'IN_PROGRESS',
  'VERIFICATION',
  'COMPLETED',
  'REJECTED',
  'IN_REVIEW',
  'TECH_ASSIGNMENT',
  'PRODUCT_SELECTION',
  'PAYMENT_CONFIRMATION',
  'FULFILLMENT',
  'DELIVERY',
  'PAYMENT_VALIDATION',
  'RECEIPT_ISSUED',
  'PLAN_CHANGE',
  'TRIAGE',
  'FIELD_DISPATCH',
  'CONFLICT',
  'CANCELLED',
]);

const TERMINAL_STATUSES = new Set<WorkOrderStatus>(['COMPLETED', 'REJECTED', 'CANCELLED']);
const CRITICAL_THRESHOLD = 10;

const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSameLocalDay = (a: Date, b: Date): boolean => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};

const round = (value: number): number => Math.round(value * 100) / 100;

const calcHoursBetween = (start: Date, end: Date): number => (end.getTime() - start.getTime()) / (1000 * 60 * 60);

const isValidForKpi = (workOrder: WorkOrder): boolean => {
  if (!VALID_STATUSES.has(workOrder.status)) {
    return false;
  }

  const createdAt = parseDate(workOrder.createdAt);
  if (!createdAt) {
    return false;
  }

  if (workOrder.createdByUserId) {
    const creator = userRepository.findById(workOrder.createdByUserId);
    if (!creator || creator.blocked) {
      return false;
    }
  }

  return true;
};

export const kpiService = {
  getDashboardKpis() {
    const now = new Date();
    const validWorkOrders = workOrderRepository.listAll().filter(isValidForKpi);
    const totalValid = validWorkOrders.length;

    const createdTodayByType = validWorkOrders.reduce<Record<string, number>>((acc, current) => {
      const createdAt = parseDate(current.createdAt);
      if (!createdAt || !isSameLocalDay(createdAt, now)) {
        return acc;
      }
      acc[current.type] = (acc[current.type] ?? 0) + 1;
      return acc;
    }, {});

    const completedToday = validWorkOrders.filter((item) => {
      if (item.status !== 'COMPLETED') {
        return false;
      }
      const completedAt = parseDate(item.completedAt);
      return completedAt ? isSameLocalDay(completedAt, now) : false;
    }).length;

    const cancelledTotal = validWorkOrders.filter((item) => item.status === 'CANCELLED').length;
    const cancellationRate = totalValid > 0 ? round((cancelledTotal / totalValid) * 100) : 0;

    const cycleHoursByType = validWorkOrders.reduce<Record<string, number[]>>((acc, current) => {
      if (current.status !== 'COMPLETED') {
        return acc;
      }
      const createdAt = parseDate(current.createdAt);
      const completedAt = parseDate(current.completedAt);
      if (!createdAt || !completedAt || completedAt < createdAt) {
        return acc;
      }
      const list = acc[current.type] ?? [];
      list.push(calcHoursBetween(createdAt, completedAt));
      acc[current.type] = list;
      return acc;
    }, {});

    const avgCycleHoursByType = Object.entries(cycleHoursByType).reduce<Record<string, number>>(
      (acc, [type, durations]) => {
        const total = durations.reduce((sum, current) => sum + current, 0);
        acc[type] = durations.length > 0 ? round(total / durations.length) : 0;
        return acc;
      },
      {},
    );

    const backlogByStatus = validWorkOrders.reduce<Record<string, number>>((acc, current) => {
      if (TERMINAL_STATUSES.has(current.status)) {
        return acc;
      }
      acc[current.status] = (acc[current.status] ?? 0) + 1;
      return acc;
    }, {});

    const branches = inventoryService.listBranches();
    const allInventory = inventoryService.listAllInventory();

    const criticalInventoryByBranch = branches.map((branch) => {
      const criticalItems = allInventory.filter(
        (row) => row.branchId === branch.id && row.qtyAvailable <= CRITICAL_THRESHOLD,
      );

      return {
        branchId: branch.id,
        branchName: branch.name,
        threshold: CRITICAL_THRESHOLD,
        criticalItems: criticalItems.length,
      };
    });

    const topReservedProducts = allInventory
      .filter((item) => item.qtyReserved > 0)
      .reduce<Record<string, { productId: string; productName: string; reservedQty: number }>>((acc, current) => {
        const existing = acc[current.productId] ?? {
          productId: current.productId,
          productName: current.productName,
          reservedQty: 0,
        };
        existing.reservedQty += current.qtyReserved;
        acc[current.productId] = existing;
        return acc;
      }, {});

    const top5ReservedProducts = Object.values(topReservedProducts)
      .sort((a, b) => b.reservedQty - a.reservedQty)
      .slice(0, 5);

    const claimsByFailureCategory = validWorkOrders
      .filter((item) => item.type === 'CLAIM_TROUBLESHOOT')
      .reduce<Record<string, number>>((acc, current) => {
        const category = current.status === 'CONFLICT' ? 'CONFLICT' : 'UNSPECIFIED';
        acc[category] = (acc[category] ?? 0) + 1;
        return acc;
      }, {});

    const claimResolutionDurations = validWorkOrders
      .filter((item) => item.type === 'CLAIM_TROUBLESHOOT' && item.status === 'COMPLETED')
      .map((item) => {
        const createdAt = parseDate(item.createdAt);
        const completedAt = parseDate(item.completedAt);
        if (!createdAt || !completedAt || completedAt < createdAt) {
          return null;
        }
        return calcHoursBetween(createdAt, completedAt);
      })
      .filter((item): item is number => item !== null);

    const avgClaimResolutionHours =
      claimResolutionDurations.length > 0
        ? round(claimResolutionDurations.reduce((sum, current) => sum + current, 0) / claimResolutionDurations.length)
        : 0;

    const installationSet = new Set(['NEW_SERVICE_INSTALL', 'SERVICE_UPGRADE']);
    const installationWorkOrders = validWorkOrders.filter((item) => installationSet.has(item.type));
    const failedInstallationCount = installationWorkOrders.filter((item) =>
      item.status === 'REJECTED' || item.status === 'CONFLICT',
    ).length;
    const failedInstallationRate =
      installationWorkOrders.length > 0 ? round((failedInstallationCount / installationWorkOrders.length) * 100) : 0;

    const totalCreatedToday = Object.values(createdTodayByType).reduce((sum, current) => sum + current, 0);
    const totalBacklog = Object.values(backlogByStatus).reduce((sum, current) => sum + current, 0);
    const totalCriticalItems = criticalInventoryByBranch.reduce((sum, current) => sum + current.criticalItems, 0);

    return {
      generatedAt: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      source: {
        workOrders: 'apps/api/src/infra/repositories/workorder.repo.ts',
        inventory: 'apps/api/src/domain/services/invetory.service.ts',
        users: 'apps/api/src/infra/repositories/user.repo.ts',
      },
      kpis: {
        kpi01CreatedTodayByType: {
          formula: 'count(workOrders where createdAt=today) grouped by type',
          total: totalCreatedToday,
          byType: createdTodayByType,
        },
        kpi02CompletedToday: {
          formula: 'count(workOrders where status=COMPLETED and completedAt=today)',
          value: completedToday,
        },
        kpi03CancellationRate: {
          formula: 'cancelled / total_valid * 100',
          cancelled: cancelledTotal,
          totalValid,
          percentage: cancellationRate,
        },
        kpi04AvgCycleHoursByType: {
          formula: 'avg(hours(createdAt -> completedAt)) grouped by type',
          byType: avgCycleHoursByType,
        },
        kpi05BacklogByStatus: {
          formula: 'count(valid workOrders in non terminal statuses)',
          byStatus: backlogByStatus,
        },
        kpi06CriticalInventoryByBranch: {
          formula: `count(inventory where qtyAvailable <= ${CRITICAL_THRESHOLD}) grouped by branch`,
          byBranch: criticalInventoryByBranch,
        },
        kpi07TopReservedProducts: {
          formula: 'top 5 by sum(qtyReserved) across inventory rows',
          top5: top5ReservedProducts,
        },
        kpi08ClaimsByFailureCategory: {
          formula: 'count(claim workorders) grouped by failure category',
          byCategory: claimsByFailureCategory,
        },
        kpi09AvgClaimResolutionHours: {
          formula: 'avg(hours(createdAt -> completedAt)) for completed CLAIM_TROUBLESHOOT',
          value: avgClaimResolutionHours,
        },
        kpi10FailedInstallationsRate: {
          formula: 'failed installations(REJECTED|CONFLICT) / installation total * 100',
          failedCount: failedInstallationCount,
          totalInstallations: installationWorkOrders.length,
          percentage: failedInstallationRate,
        },
      },
      cards: [
        { id: 'kpi01', label: 'Solicitudes creadas hoy', value: totalCreatedToday },
        { id: 'kpi02', label: 'Solicitudes completadas hoy', value: completedToday },
        { id: 'kpi03', label: 'Tasa cancelacion', value: cancellationRate, unit: 'percent' },
        { id: 'kpi05', label: 'Backlog total', value: totalBacklog },
        { id: 'kpi06', label: 'Inventario critico', value: totalCriticalItems },
        { id: 'kpi07', label: 'Productos reservados activos', value: top5ReservedProducts.length },
        { id: 'kpi09', label: 'Resolucion reclamos (h)', value: avgClaimResolutionHours, unit: 'hours' },
        { id: 'kpi10', label: 'Instalaciones fallidas %', value: failedInstallationRate, unit: 'percent' },
      ],
      validationRules: [
        'Only valid work order statuses are counted',
        'Work orders with invalid dates are excluded',
        'If createdByUserId exists, the user must exist and not be blocked (RB-06)',
      ],
    };
  },
};
