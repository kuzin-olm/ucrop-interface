import type { AuthUser } from '@/features/auth/model/types';
import type { Employee } from '../model/types';
import { parseEmployeeRole } from './roles';

export function toEmployee(user: AuthUser): Employee {
  return {
    id: user.id,
    organizationId: user.organizationId,
    fullName: user.name,
    email: user.email,
    role: parseEmployeeRole(user.role),
    status: user.status === 'inactive' ? 'inactive' : 'active',
    lastLoginAt: user.lastLoginAt,
    invitePending: Boolean(user.inviteToken),
  };
}
