import type { Command } from '@app/contracts';
import { MemoryStore } from '../store/memory.store';
export class CommandHandler {
  constructor(
    private readonly store: MemoryStore,
  ) {}

  public handleBatch(
    commands: Command[],
  ): void {
    if (commands.length === 0) {
      return;
    }

    for (const command of commands) {
      this.handle(command);
    }

    this.store.commit();
  }

  private handle(
    command: Command,
  ): void {
    switch (command.type) {
      case 'ADD_ITEM':
        this.store.addItem(
          command.payload.id,
        );
        break;

      case 'SELECT_ITEM':
        this.store.selectItem(
          command.payload.id,
        );
        break;

      case 'UNSELECT_ITEM':
        this.store.unselectItem(
          command.payload.id,
        );
        break;

      case 'REORDER_ITEM':
        this.store.reorderItem(
          command.payload.id,
          command.payload.targetId,
          command.payload.placement,
        );
        break;

      default:
        this.assertNever(command);
    }
  }

  private assertNever(
    value: never,
  ): never {
    throw new Error(
      `Unsupported command: ${JSON.stringify(value)}`,
    );
  }
}