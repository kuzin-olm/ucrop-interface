export const employeeKeys = {
  all: (organizationId: string) => ['employees', organizationId] as const,
};
