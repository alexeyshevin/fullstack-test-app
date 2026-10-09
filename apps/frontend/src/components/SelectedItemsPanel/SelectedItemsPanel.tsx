import {
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useUnselectItem } from '../../hooks/useItemMutations';
import { usePendingItemActions } from '../../hooks/usePendingItemActions';
import { useSelectedItems } from '../../hooks/useSelectedItems';
import { InfiniteScrollList } from '../InfiniteScrollList/InfiniteScrollList';
import { ItemRow } from '../ItemRow/ItemRow';

export const SelectedItemsPanel = () => {
  const [filter, setFilter] = useState('');
  const [actionError, setActionError] =
    useState<string | null>(null);

  const debouncedFilter = useDebounce(filter);

  const {
    items,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    refetch,
  } = useSelectedItems(debouncedFilter);

  const unselectItem = useUnselectItem();

  const { pendingIds, setPending } =
    usePendingItemActions();

  const handleUnselect = async (id: number) => {
    if (pendingIds.has(id)) {
      return;
    }

    setPending(id, true);
    setActionError(null);

    try {
      await unselectItem.mutateAsync({ id });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to remove selection',
      );
    } finally {
      setPending(id, false);
    }
  };

  const handleLoadMore = () => {
    if (
      !hasNextPage ||
      isFetching ||
      isFetchingNextPage
    ) {
      return;
    }

    void fetchNextPage();
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">
            Выбранные элементы
          </Typography>

          <TextField
            label="Filter by ID"
            size="small"
            fullWidth
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          />

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void refetch()}
            disabled={isFetching}
            sx={{ alignSelf: 'flex-start' }}
          >
            Обновить
          </Button>

          {actionError && (
            <Alert
              severity="error"
              onClose={() => setActionError(null)}
            >
              {actionError}
            </Alert>
          )}

          {isError && (
            <Alert severity="error">
              {error.message}

              <Button
                size="small"
                onClick={() => void refetch()}
              >
                Повторить
              </Button>
            </Alert>
          )}
        </Stack>
      </Box>

      <InfiniteScrollList
        hasMore={Boolean(hasNextPage)}
        isLoading={isLoading}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={handleLoadMore}
        isEmpty={!isError && items.length === 0}
        emptyMessage='No selected items'
      >
        {items.map((item) => (
          <ItemRow
            key={item.id}
            id={item.id}
            actionLabel='Remove'
            isPending={pendingIds.has(item.id)}
            onAction={() =>
              void handleUnselect(item.id)
            }
          />
        ))}
      </InfiniteScrollList>
    </Paper>
  );
};