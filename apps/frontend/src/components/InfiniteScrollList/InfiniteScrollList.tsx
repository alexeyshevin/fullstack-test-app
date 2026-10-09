import { Box, CircularProgress, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type Props = {
  children: ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
  emptyMessage?: string;
  isEmpty?: boolean;
};

export const InfiniteScrollList = ({
  children,
  hasMore,
  isLoading,
  isFetchingMore,
  onLoadMore,
  emptyMessage = 'Elements are not found',
  isEmpty = false,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const root = containerRef.current;
    const sentinel = sentinelRef.current;

    if (
      !root ||
      !sentinel ||
      !hasMore ||
      isLoading ||
      isFetchingMore
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      {
        root,
        rootMargin: '0px 0px 150px 0px',
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMore,
    isLoading,
    isFetchingMore,
  ]);

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        px: 2,
        py: 1,
      }}
    >
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      ) : isEmpty ? (
        <Typography
          color='text.secondary'
          sx={{ py: 4, textAlign: 'center' }}
        >
          {emptyMessage}
        </Typography>
      ) : (
        children
      )}

      <Box
        ref={sentinelRef}
        sx={{ height: 1 }}
      />

      {isFetchingMore && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 2,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};