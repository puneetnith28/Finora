// Types for Finora application state and domain models
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
