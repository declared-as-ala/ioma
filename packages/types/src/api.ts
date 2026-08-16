export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorShape {
  statusCode: number;
  message: string;
  errorCode: string;
  details?: unknown;
}

export interface LocalizedText {
  en: string;
  fr: string;
  ar: string;
}
