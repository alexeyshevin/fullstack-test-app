import type {
    AddItemRequest,
    AddItemResponse,
    GetItemsQuery,
    GetItemsResponse,
} from '@app/contracts';

import { apiClient } from './client';

export const itemsApi = {
  getItems: (
    query: GetItemsQuery,
    signal?: AbortSignal,
  ): Promise<GetItemsResponse> => {
    const params = new URLSearchParams();

    if (query.cursor) {
      params.set('cursor', query.cursor);
    }

    if (query.filter) {
      params.set('filter', query.filter);
    }

    params.set('limit', String(query.limit ?? 20));

    return apiClient<GetItemsResponse>(
      `/items?${params.toString()}`,
      { signal },
    );
  },

  addItem: (
    payload: AddItemRequest,
  ): Promise<AddItemResponse> =>
    apiClient<AddItemResponse>('/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};