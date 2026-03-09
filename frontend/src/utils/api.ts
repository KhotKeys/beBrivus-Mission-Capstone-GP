// API utility functions for handling paginated responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Extract results from paginated response or return empty array
export const extractResults = <T>(data: PaginatedResponse<T> | undefined): T[] => {
  return data?.results || [];
};

// Type guard to check if data is paginated
export const isPaginated = <T>(data: any): data is PaginatedResponse<T> => {
  return data && typeof data === 'object' && Array.isArray(data.results);
};
