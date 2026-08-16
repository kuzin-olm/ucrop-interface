import { authRepository } from '@/features/auth/api/authRepository';
import { toEmployee } from '../lib/mapEmployee';
import type { Employee, InviteEmployeeInput, UpdateEmployeeInput } from '../model/types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export const employeeRepository = {
  async list(organizationId: string): Promise<Employee[]> {
    await delay(400);
    return authRepository.listByOrganization(organizationId).map(toEmployee);
  },

  async invite(input: InviteEmployeeInput): Promise<Employee> {
    await delay(280);
    return toEmployee(
      authRepository.inviteEmployee({
        organizationId: input.organizationId,
        name: input.fullName,
        email: input.email,
        role: input.role,
        status: input.status,
        inviteToken: input.inviteToken,
        inviteExpiresAt: input.inviteExpiresAt,
      }),
    );
  },

  async update(input: UpdateEmployeeInput): Promise<Employee> {
    await delay(250);
    return toEmployee(
      authRepository.updateEmployee({
        id: input.id,
        name: input.fullName,
        role: input.role,
        status: input.status,
      }),
    );
  },

  getInvite(token: string) {
    return authRepository.getInvite(token);
  },
};
