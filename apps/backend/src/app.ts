import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { createItemsRouter } from './routes/items.routes';
import { createSelectedItemsRouter } from './routes/selected-items.routes';
import { ItemsService } from './services/item.service';
import { SelectedItemsService } from './services/selected-items.service';
import { MemoryStore } from './store/memory.store';
import { openApiDocument } from './swagger/openapi';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const store = new MemoryStore();

  const itemsService =
    new ItemsService(store);

  const selectedItemsService =
    new SelectedItemsService(store);

  app.use(
    '/api/items',
    createItemsRouter(itemsService),
  );

  app.use(
    '/api/selected',
    createSelectedItemsRouter(
      selectedItemsService,
    ),
  );

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument),
  );

  return app;
};