import { createApp } from './app';
import { CommandBatcher } from './batching/command.batcher';
import { CommandHandler } from './handlers/command.handler';
import { CommandConsumer } from './kafka/command.consumer';
import { CommandProducer } from './kafka/command.producer';
import { kafka } from './kafka/kafka.config';
import { MemoryStore } from './store/memory.store';

const PORT = Number(process.env.PORT ?? 3000);

const start = async (): Promise<void> => {
  const store = new MemoryStore();

  const commandHandler = new CommandHandler(store);

  const batcher = new CommandBatcher(
      100,
      100,
      commands => {
        commandHandler.handleBatch(commands);
      }
    );

  const producer = kafka.producer();

  const consumer = kafka.consumer({
      groupId:
        'selection-command-consumer',
    });

  const commandProducer = new CommandProducer(producer);

  const commandConsumer = new CommandConsumer(
      consumer,
      batcher,
    );

  await commandProducer.connect();

  await commandConsumer.connect();

  await commandConsumer.run();

  const app = createApp({
    store,
    commandProducer,
  });

  app.listen(PORT, () => {
    console.log(
      `Server is running on port ${PORT}`,
    );

    console.log(
      `Swagger: http://localhost:${PORT}/api/docs`,
    );
  });
};

void start();