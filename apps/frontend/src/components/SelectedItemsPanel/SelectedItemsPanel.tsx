import type { ReorderItemRequest } from '@app/contracts';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Refresh as RefreshIcon } from '@mui/icons-material';
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
import { useReorderItem, useUnselectItem } from '../../hooks/useItemMutations';
import { usePendingItemActions } from '../../hooks/usePendingItemActions';
import { useSelectedItems } from '../../hooks/useSelectedItems';
import { InfiniteScrollList } from '../InfiniteScrollList/InfiniteScrollList';
import { SortableItemRow } from '../SortableItemRow/SortableItemRow';

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
  const reorderItem = useReorderItem();

  const { pendingIds, setPending } =
    usePendingItemActions();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),

    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const isReordering = reorderItem.isPending;

  const handleUnselect = async (id: number) => {
    if (pendingIds.has(id) || isReordering) {
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

  const handleDragEnd = async (
    event: DragEndEvent,
  ) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    if (isReordering || pendingIds.size > 0) {
      return;
    }

    const activeIndex = items.findIndex(
      (item) => item.id === active.id,
    );

    const overIndex = items.findIndex(
      (item) => item.id === over.id,
    );

    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    const payload: ReorderItemRequest = {
      id: Number(active.id),
      targetId: Number(over.id),
      placement:
        activeIndex < overIndex
          ? 'after'
          : 'before',
    };

    setActionError(null);

    try {
      await reorderItem.mutateAsync(payload);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to change items order',
      );
    }
  };

  const handleLoadMore = () => {
    if (
      !hasNextPage ||
      isFetching ||
      isFetchingNextPage ||
      isReordering
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
            Selected items
          </Typography>

          <TextField
            label="Filter by ID"
            size="small"
            fullWidth
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            disabled={isReordering}
          />

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void refetch()}
            disabled={isFetching || isReordering}
            sx={{ alignSelf: 'flex-start' }}
          >
            Update
          </Button>

          {isReordering && (
            <Alert severity="info">
              Saving new items order...
            </Alert>
          )}

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          void handleDragEnd(event);
        }}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
          disabled={
            isReordering ||
            pendingIds.size > 0 ||
            isFetching
          }
        >
          <InfiniteScrollList
            hasMore={Boolean(hasNextPage)}
            isLoading={isLoading}
            isFetchingMore={isFetchingNextPage}
            onLoadMore={handleLoadMore}
            isEmpty={!isError && items.length === 0}
            emptyMessage='No selected items'
          >
            {items.map((item) => (
              <SortableItemRow
                key={item.id}
                id={item.id}
                isPending={pendingIds.has(item.id)}
                disabled={
                  isReordering ||
                  pendingIds.size > 0 ||
                  isFetching
                }
                onUnselect={() =>
                  void handleUnselect(item.id)
                }
              />
            ))}
          </InfiniteScrollList>
        </SortableContext>
      </DndContext>
    </Paper>
  );
};