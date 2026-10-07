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

  console.log('Kafka producer connected');

  await commandConsumer.connect();

  console.log('Kafka consumer connected');

  await commandConsumer.run();

  console.log('Kafka consumer started');

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

start().catch(error => {
  console.error(
    'Failed to start application:',
    error,
  );

  process.exit(1);
});

void start();