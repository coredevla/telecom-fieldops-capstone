import type { Role } from '../../domain/models/types';

const ROLES: Role[] = [
    { id: "role_admin", name: "Administrator", permissionKeys: ["roles:read", "roles:write", "users:read", "users:write", "users:block"] },
    { id: "role_sales", name: "Sales", permissionKeys: ["roles:read", "users:read"] },
];

export function roleRepository(){
    return {
        listAll(): Role[] {
          return [...ROLES];
        },
        findById(id: string): Role | undefined {
          return ROLES.find((r) => r.id === id);
        },
        getPermissionKeysByRoleIds(roleIds: string[]): string[] {
          const set = new Set<string>();
          for (const roleId of roleIds) {
            const role = ROLES.find((r) => r.id === roleId);
            if (role) role.permissionKeys.forEach((k) => set.add(k));
          }
          return Array.from(set);
        },
    };
}

export const roleRepo = roleRepository();
