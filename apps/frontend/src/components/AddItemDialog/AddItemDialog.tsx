import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from '@mui/material';
import { useState } from 'react';
import { useAddItem } from '../../hooks/useItemMutations';

type Props = {
  open: boolean;
  onClose: () => void;
};

export const AddItemDialog = ({
  open,
  onClose,
}: Props) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(
    null,
  );

  const addItem = useAddItem();

  const handleClose = () => {
    if (addItem.isPending) {
      return;
    }

    setValue('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const id = Number(value);

    if (value.trim() === '' || !Number.isSafeInteger(id)) {
      setError('ID must be a safe integer');
      return;
    }

    setError(null);

    try {
      await addItem.mutateAsync({ id });
      setValue('');
      setError(null);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to add element',
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        Add item
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Element ID"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            type="number"
            fullWidth
            disabled={addItem.isPending}
            slotProps={{
              htmlInput: {
                step: 1,
              },
            }}
          />

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {addItem.isPending && (
            <Alert
              severity="info"
              icon={<CircularProgress size={18} />}
            >
              Command has been sent. Waiting for result...
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={addItem.isPending}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          loading={addItem.isPending}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};