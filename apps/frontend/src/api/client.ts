import type { ApiErrorResponse } from '@app/contracts';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorResponse['error']['code'],
    message: string,
  ) {
    super(message);

    this.name = 'ApiError';
  }
}

export const apiClient = async <TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> => {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    },
  );

  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => null) as ApiErrorResponse | null;

    throw new ApiError(
      response.status,
      payload?.error.code ?? 'INTERNAL_ERROR',
      payload?.error.message ??
        `HTTP error: ${response.status}`,
    );
  }

  return response.json() as Promise<TResponse>;
};