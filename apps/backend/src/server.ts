import { createApp } from './app';
import { CommandBatcher } from './batching/command.batcher';
import { CommandHandler } from './handlers/command.handler';
import { CommandConsumer } from './kafka/command.consumer';
import { CommandProducer } from './kafka/command.producer';
import { kafka } from './kafka/kafka.config';
import { CommandStore } from './store/command.store';
import { MemoryStore } from './store/memory.store';

const PORT = Number(process.env.PORT ?? 3000);

const start =
  async (): Promise<void> => {
    const store = new MemoryStore();

    const commandStore = new CommandStore();

    const commandHandler = new CommandHandler(
        store,
        commandStore,
      );

    const addBatcher = new CommandBatcher(
        10_000,
        commands => {
          commandHandler.handleBatch(
            commands,
          );
        },
      );

    const mutationBatcher = new CommandBatcher(
        1_000,
        commands => {
          commandHandler.handleBatch(
            commands,
          );
        },
      );

    const producer =
      kafka.producer();

    const consumer =
      kafka.consumer({
        groupId:
          'selection-command-consumer',
      });

    const commandProducer = new CommandProducer(
        producer,
      );

    const commandConsumer = new CommandConsumer(
        consumer,
        addBatcher,
        mutationBatcher,
      );

    await commandProducer.connect();

    console.log(
      'Kafka producer connected',
    );

    await commandConsumer.connect();

    console.log(
      'Kafka consumer connected',
    );

    await commandConsumer.run();

    console.log(
      'Kafka consumer started',
    );

    const app = createApp({
      store,
      commandStore,
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