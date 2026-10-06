import type { Command } from '@app/contracts';
import type { Producer } from 'kafkajs';

import { COMMANDS_TOPIC } from './kafka.config';

export class CommandProducer {
  constructor(
    private readonly producer: Producer,
  ) {}

  public async connect(): Promise<void> {
    await this.producer.connect();
  }

  public async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  public async send(
    command: Command,
  ): Promise<void> {
    await this.producer.send({
      topic: COMMANDS_TOPIC,
      messages: [
        {
          key: 'selection-state',
          value: JSON.stringify(command),
        },
      ],
    });
  }
}