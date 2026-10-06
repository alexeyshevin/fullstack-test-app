import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { CommandBatcher } from './batching/command.batcher';
import { CommandHandler } from './handlers/command.handler';
import { CommandConsumer } from './kafka/command.consumer';
import { CommandProducer } from './kafka/command.producer';
import { kafka } from './kafka/kafka.config';
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

  const commandHandler = new CommandHandler(store);

const batcher =
  new CommandBatcher(
    100,
    100,
    commands => {
      commandHandler.handleBatch(commands);
    },
  );

const producer =
  kafka.producer();

const consumer =
  kafka.consumer({
    groupId: 'selection-command-consumer',
  });

const commandProducer =
  new CommandProducer(producer);

const commandConsumer =
  new CommandConsumer(
    consumer,
    batcher,
  );

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