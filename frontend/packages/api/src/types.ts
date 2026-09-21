export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}
