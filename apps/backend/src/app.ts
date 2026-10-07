import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import type { CommandProducer } from './kafka/command.producer';
import { createCommandsRouter } from './routes/commands.routes';
import { createItemsRouter } from './routes/items.routes';
import { createSelectedItemsRouter } from './routes/selected-items.routes';
import { ItemsService } from './services/item.service';
import { SelectedItemsService } from './services/selected-items.service';
import type { CommandStore } from './store/command.store';
import type { MemoryStore } from './store/memory.store';
import { PendingItemsStore } from './store/pending-items.store';
import { openApiDocument } from './swagger/openapi';

type CreateAppDependencies = {
  store: MemoryStore;
  commandStore: CommandStore;
  commandProducer: CommandProducer;
  pendingItemsStore: PendingItemsStore
};

export const createApp = ({
  store,
  commandStore,
  commandProducer,
  pendingItemsStore
}: CreateAppDependencies) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const itemsService =
    new ItemsService(store);

  const selectedItemsService =
    new SelectedItemsService(store);

  app.use(
    '/api/items',
    createItemsRouter(
      itemsService,
      commandProducer,
      commandStore,
      pendingItemsStore
    ),
  );

  app.use(
    '/api/selected',
    createSelectedItemsRouter(
      selectedItemsService,
      commandProducer,
      commandStore,
    ),
  );

  app.use(
    '/api/commands',
    createCommandsRouter(
      commandStore,
    ),
  );

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument),
  );

  return app;
};