
export type UserRole = 'Admin' | 'Manager' | 'Collaborator';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

const roleToNumber: Record<UserRole, number> = {
  'Admin': 0,
  'Manager': 1,
  'Collaborator': 2
};

const numberToRole: Record<number, UserRole> = {
  0: 'Admin',
  1: 'Manager',
  2: 'Collaborator'
};

const statusToNumber: Record<RequestStatus, number> = {
  'Pending': 0,
  'Approved': 1,
  'Rejected': 2
};

const numberToStatus: Record<number, RequestStatus> = {
  0: 'Pending',
  1: 'Approved',
  2: 'Rejected'
};

export const convertRoleToNumber = (role: UserRole): number => {
  return roleToNumber[role] ?? 2;
};

export const convertNumberToRole = (roleNumber: number): UserRole => {
  return numberToRole[roleNumber] ?? 'Collaborator';
};

export const convertStatusToNumber = (status: RequestStatus): number => {
  return statusToNumber[status] ?? 0;
};

export const convertNumberToStatus = (statusNumber: number): RequestStatus => {
  return numberToStatus[statusNumber] ?? 'Pending';
};

export const convertUserFromBackend = (user: any) => ({
  ...user,
  role: convertNumberToRole(user.role)
});

export const convertRequestFromBackend = (request: any) => ({
  ...request,
  status: convertNumberToStatus(request.status)
});

export const convertUserForBackend = (user: any) => ({
  ...user,
  role: convertRoleToNumber(user.role)
});

export const convertRequestForBackend = (request: any) => ({
  ...request,
  status: request.status ? convertStatusToNumber(request.status) : undefined
});