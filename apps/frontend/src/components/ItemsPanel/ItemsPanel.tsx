import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useSelectItem } from '../../hooks/useItemMutations';
import { useItems } from '../../hooks/useItems';
import { usePendingItemActions } from '../../hooks/usePendingItemActions';
import { AddItemDialog } from '../AddItemDialog/AddItemDialog';
import { InfiniteScrollList } from '../InfiniteScrollList/InfiniteScrollList';
import { ItemRow } from '../ItemRow/ItemRow';

export const ItemsPanel = () => {
  const [filter, setFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
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
  } = useItems(debouncedFilter);

  const selectItem = useSelectItem();

  const { pendingIds, setPending } =
    usePendingItemActions();

  const handleSelect = async (id: number) => {
    if (pendingIds.has(id)) {
      return;
    }

    setPending(id, true);
    setActionError(null);

    try {
      await selectItem.mutateAsync({ id });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to choose element',
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
            Available items
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

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              Update
            </Button>
          </Stack>

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
                Repeat
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
      >
        {items.map((item) => (
          <ItemRow
            key={item.id}
            id={item.id}
            actionLabel="Choose"
            isPending={pendingIds.has(item.id)}
            onAction={() =>
              void handleSelect(item.id)
            }
          />
        ))}
      </InfiniteScrollList>

      <AddItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Paper>
  );
};