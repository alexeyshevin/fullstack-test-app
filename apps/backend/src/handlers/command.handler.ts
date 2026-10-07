import type {
  ApiErrorCode,
  Command,
} from '@app/contracts';
import { CommandStore } from '../store/command.store';
import { MemoryStore } from '../store/memory.store';
import {
  InvalidReorderError,
  ItemAlreadyExistsError,
  ItemAlreadySelectedError,
  ItemNotFoundError,
  ItemNotSelectedError,
} from '../store/memory.store.errors';

export class CommandHandler {
  constructor(
    private readonly store: MemoryStore,
    private readonly commandStore: CommandStore,
  ) {}

  public handleBatch(
    commands: Command[],
  ): void {
    if (commands.length === 0) {
      return;
    }

    let hasChanges = false;

    for (const command of commands) {
      const shouldProcess =
        this.commandStore.startProcessing(
          command.id,
        );

      // duplicate Kafka delivery
      if (!shouldProcess) {
        continue;
      }

      try {
        this.handle(command);

        this.commandStore.complete(
          command.id,
        );

        hasChanges = true;
      } catch (error) {
        const normalized =
          this.normalizeError(error);

        this.commandStore.fail(
          command.id,
          normalized.code,
          normalized.message,
        );
      }
    }

    if (hasChanges) {
      this.store.commit();
    }
  }

  private handle(command: Command): void {
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

  private normalizeError(
    error: unknown,
  ): {
    code: ApiErrorCode;
    message: string;
  } {
    if (
      error instanceof
      ItemAlreadyExistsError
    ) {
      return {
        code: 'ITEM_ALREADY_EXISTS',
        message: error.message,
      };
    }

    if (
      error instanceof
      ItemAlreadySelectedError
    ) {
      return {
        code: 'ITEM_ALREADY_SELECTED',
        message: error.message,
      };
    }

    if (
      error instanceof
      ItemNotSelectedError
    ) {
      return {
        code: 'ITEM_NOT_SELECTED',
        message: error.message,
      };
    }

    if (error instanceof ItemNotFoundError) {
      return {
        code: 'ITEM_NOT_FOUND',
        message: error.message,
      };
    }

    if (
      error instanceof InvalidReorderError
    ) {
      return {
        code: 'INVALID_REORDER',
        message: error.message,
      };
    }

    return {
      code: 'INTERNAL_ERROR',
      message: 'Internal command processing error',
    };
  }

  private assertNever(
    value: never,
  ): never {
    throw new Error(
      `Unsupported command: ${JSON.stringify(value)}`,
    );
  }
}