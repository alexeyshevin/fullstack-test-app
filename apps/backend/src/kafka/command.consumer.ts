import type { Command } from '@app/contracts';
import type { Consumer } from 'kafkajs';
import type { CommandBatcher } from '../batching/command.batcher';
import type { PendingItemsStore } from '../store/pending-items.store';
import { COMMANDS_TOPIC } from './kafka.config';

export class CommandConsumer {
  constructor(
    private readonly consumer: Consumer,

    private readonly addBatcher:
      CommandBatcher,

    private readonly mutationBatcher:
      CommandBatcher,
    private readonly pendingItemsStore: PendingItemsStore,
  ) {}

  public async connect(): Promise<void> {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: COMMANDS_TOPIC,
      fromBeginning: false,
    });
  }

  public async run(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        const command =
          JSON.parse(
            message.value.toString(),
          ) as Command;

        if (command.type === 'ADD_ITEM' || this.pendingItemsStore.has(command.payload.id)) {
          this.addBatcher.add(command);
          return;
        }

        this.mutationBatcher.add(command);
      },
    });
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}