import { Box, Button, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
  id: number;
  actionLabel: string;
  onAction: () => void;
  isPending?: boolean;
  disabled?: boolean;
  leading?: ReactNode;
};

export const ItemRow = ({
  id,
  actionLabel,
  onAction,
  isPending = false,
  disabled = false,
  leading,
}: Props) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 2,
        py: 1,
        mb: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
        }}
      >
        {leading}

        <Typography
          sx={{ fontWeight: 500 }}
          noWrap
        >
          ID: {id}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        size="small"
        onClick={onAction}
        disabled={disabled || isPending}
        loading={isPending}
      >
        {actionLabel}
      </Button>
    </Paper>
  );
};