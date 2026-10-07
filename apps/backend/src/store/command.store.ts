import type { ApiErrorCode, CommandStatus } from '@app/contracts';

export type CommandState = {
  commandId: string;
  status: CommandStatus;
  error?: {
    code: ApiErrorCode;
    message: string;
  };
};

export class CommandStore {
  private readonly commands =
    new Map<string, CommandState>();

  public accept(commandId: string): void {
    if (this.commands.has(commandId)) {
      return;
    }

    this.commands.set(commandId, {
      commandId,
      status: 'accepted',
    });
  }

  public startProcessing(
    commandId: string,
  ): boolean {
    const command =
      this.commands.get(commandId);

    if (!command) {
      this.commands.set(commandId, {
        commandId,
        status: 'processing',
      });

      return true;
    }

    if (
      command.status === 'processing' ||
      command.status === 'completed' ||
      command.status === 'failed'
    ) {
      return false;
    }

    this.commands.set(commandId, {
      commandId,
      status: 'processing',
    });

    return true;
  }

  public complete(commandId: string): void {
    this.commands.set(commandId, {
      commandId,
      status: 'completed',
    });
  }

  public fail(
    commandId: string,
    code: ApiErrorCode,
    message: string,
  ): void {
    this.commands.set(commandId, {
      commandId,
      status: 'failed',
      error: {
        code,
        message,
      },
    });
  }

  public get(
    commandId: string,
  ): CommandState | undefined {
    return this.commands.get(commandId);
  }
}