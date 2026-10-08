import type {
    GetSelectedQuery,
    GetSelectedResponse,
    ReorderItemRequest,
    ReorderItemResponse,
    SelectItemRequest,
    SelectItemResponse,
    UnselectItemRequest,
    UnselectItemResponse,
} from '@app/contracts';

import { apiClient } from './client';

export const selectedApi = {
  getSelected: (
    query: GetSelectedQuery,
    signal?: AbortSignal,
  ): Promise<GetSelectedResponse> => {
    const params = new URLSearchParams();

    if (query.cursor) {
      params.set('cursor', query.cursor);
    }

    if (query.filter) {
      params.set('filter', query.filter);
    }

    params.set('limit', String(query.limit ?? 20));

    return apiClient<GetSelectedResponse>(
      `/selected?${params.toString()}`,
      { signal },
    );
  },

  select: (
    payload: SelectItemRequest,
  ): Promise<SelectItemResponse> =>
    apiClient<SelectItemResponse>('/selected/select', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  unselect: (
    payload: UnselectItemRequest,
  ): Promise<UnselectItemResponse> =>
    apiClient<UnselectItemResponse>('/selected/unselect', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  reorder: (
    payload: ReorderItemRequest,
  ): Promise<ReorderItemResponse> =>
    apiClient<ReorderItemResponse>('/selected/reorder', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};