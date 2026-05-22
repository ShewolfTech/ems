// Shared API response shapes

export type ApiSuccess<T> = {
  data: T;
  status: "success";
};

export type ApiError = {
  error: string;
  code?: string | number;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
