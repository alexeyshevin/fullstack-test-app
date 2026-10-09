import { useInfiniteQuery } from '@tanstack/react-query';

import { selectedApi } from '../api/selected.api';
import { queryKeys } from '../lib/queryKeys';

export const useSelectedItems = (filter: string) => {
  const query = useInfiniteQuery({
    queryKey: queryKeys.selected.list(filter),

    initialPageParam: null as string | null,

    queryFn: ({ pageParam, signal }) =>
      selectedApi.getSelected(
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