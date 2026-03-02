/**
 * Runs test files in a fixed order so that tests depending on seed data (admin/ventas)
 * run before z-user-management.test.ts, which wipes users/roles.
 * Order: auth-rbac, kpi-dashboard, sync-import, z-user-management
 */
const Sequencer = require('@jest/test-sequencer').default;

const ORDER = [
  'auth-rbac.test.ts',
  'kpi-dashboard.test.ts',
  'sync-import.test.ts',
  'z-user-management.test.ts',
];

class CustomSequencer extends Sequencer {
  sort(tests) {
    return [...tests].sort((a, b) => {
      const nameA = a.path.replace(/^.*[\\/]/, '');
      const nameB = b.path.replace(/^.*[\\/]/, '');
      const idxA = ORDER.indexOf(nameA);
      const idxB = ORDER.indexOf(nameB);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }
}

module.exports = CustomSequencer;
