import {
  Box,
  Container,
  Typography
} from '@mui/material';
import { ItemsPanel } from '../components/ItemsPanel/ItemsPanel';
import { SelectedItemsPanel } from '../components/SelectedItemsPanel/SelectedItemsPanel';

export const App = () => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        py: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 600 }}
      >
        Items management
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gridTemplateRows: {
            xs: 'minmax(350px, 1fr) minmax(350px, 1fr)',
            md: 'minmax(0, 1fr)',
          },
          gap: 2,
          flex: 1,
          minHeight: 0,
        }}
      >
        <ItemsPanel />
        <SelectedItemsPanel />
      </Box>
    </Container>
  );
};