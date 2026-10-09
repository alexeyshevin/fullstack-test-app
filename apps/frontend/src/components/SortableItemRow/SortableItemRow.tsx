import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { ItemRow } from '../ItemRow/ItemRow';

type Props = {
  id: number;
  onUnselect: () => void;
  isPending?: boolean;
  disabled?: boolean;
};

export const SortableItemRow = ({
  id,
  onUnselect,
  isPending = false,
  disabled = false,
}: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: disabled || isPending,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <ItemRow
        id={id}
        actionLabel='Remove'
        onAction={onUnselect}
        isPending={isPending}
        disabled={disabled}
        leading={
          <IconButton
            ref={setActivatorNodeRef}
            size="small"
            disabled={disabled || isPending}
            aria-label={`Move item ${id}`}
            sx={{ cursor: 'grab', touchAction: 'none' }}
            {...attributes}
            {...listeners}
          >
            <DragIndicatorIcon />
          </IconButton>
        }
      />
    </div>
  );
};