export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}
