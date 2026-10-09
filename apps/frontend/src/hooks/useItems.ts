import { useInfiniteQuery } from '@tanstack/react-query';

import { itemsApi } from '../api/items.api';
import { queryKeys } from '../lib/queryKeys';

export const useItems = (filter: string) => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.items.list(filter),

    initialPageParam: null as string | null,

    queryFn: ({ pageParam, signal }) =>
      itemsApi.getItems(
        {
          cursor: pageParam ?? undefined,
          filter: filter || undefined,
          limit: 20,
        },
        signal,
      ),

    getNextPageParam: (lastPage) =>
      lastPage.hasMore
        ? (lastPage.nextCursor ?? undefined)
        : undefined,
  });

  const items =
    query.data?.pages.flatMap(
      (page) => page.items,
    ) ?? [];

  return {
    ...query,
    items,
  };
};