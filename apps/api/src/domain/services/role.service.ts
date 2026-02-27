import { roleRepo } from "../../infra/repositories/role.repo";

export const roleService = {
  listRoles() {
    return roleRepo.listAll();
  },
  getPermissionKeysForUser(roleIds: string[]): string[] {
    return roleRepo.getPermissionKeysByRoleIds(roleIds);
  },
};