import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthHeaders = (userId: number, role: string) => {
  api.defaults.headers['X-User-Id'] = userId.toString();
  api.defaults.headers['X-User-Role'] = role;
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Collaborator';
  managerId?: number | null;
}

export interface VacationRequest {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  description: string;
}

export const userApi = {
  getAllUsers: () => api.get<User[]>('/users'),
  getUserById: (id: number) => api.get<User>(`/users/${id}`),
  createUser: (user: Omit<User, 'id'>) => api.post<User>('/users', user),
  updateUser: (id: number, user: Omit<User, 'id'>) => api.put<User>(`/users/${id}`, user),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
  getUsersByManager: (managerId: number) => api.get<User[]>(`/users/manager/${managerId}`),
};

export const vacationRequestApi = {
  getAllRequests: () => api.get<VacationRequest[]>('/vacationrequests'),
  getRequestById: (id: number) => api.get<VacationRequest>(`/vacationrequests/${id}`),
  getRequestsByUserId: (userId: number) => api.get<VacationRequest[]>(`/vacationrequests/user/${userId}`),
  getRequestsForManager: (managerId: number) => api.get<VacationRequest[]>(`/vacationrequests/manager/${managerId}`),
  createRequest: (request: Omit<VacationRequest, 'id' | 'status'>) =>
    api.post<VacationRequest>('/vacationrequests', request),
  updateRequest: (id: number, request: Omit<VacationRequest, 'id' | 'status'>) =>
    api.put<VacationRequest>(`/vacationrequests/${id}`, request),
  deleteRequest: (id: number) => api.delete(`/vacationrequests/${id}`),
  approveRequest: (id: number) => api.post<VacationRequest>(`/vacationrequests/${id}/approve`),
  rejectRequest: (id: number) => api.post<VacationRequest>(`/vacationrequests/${id}/reject`),
  checkOverlap: (userId: number, startDate: string, endDate: string, excludeRequestId?: number) =>
    api.get<{ hasOverlap: boolean }>(`/vacationrequests/${userId}/check-overlap`, {
      params: { startDate, endDate, excludeRequestId }
    }),
};

export default api;