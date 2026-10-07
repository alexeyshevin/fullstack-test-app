import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import type { CommandProducer } from './kafka/command.producer';
import { createItemsRouter } from './routes/items.routes';
import { createSelectedItemsRouter } from './routes/selected-items.routes';
import { ItemsService } from './services/item.service';
import { SelectedItemsService } from './services/selected-items.service';
import { MemoryStore } from './store/memory.store';
import { openApiDocument } from './swagger/openapi';

type CreateAppDependencies = {
  store: MemoryStore;
  commandProducer: CommandProducer;
};

export const createApp = ({
  store,
  commandProducer,
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
    ),
  );

  app.use(
    '/api/selected',
    createSelectedItemsRouter(
      selectedItemsService,
      commandProducer,
    ),
  );

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument),
  );

  return app;
};