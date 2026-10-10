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
  private readonly commands = new Map<string, CommandState>();

  private readonly pendingKeys = new Map<string, string>();

  private readonly commandKeys = new Map<string, string>();

  public reserveOperation(key: string, commandId: string): string | null {
    const existing = this.pendingKeys.get(key);
    if (existing) {
      return existing;
    }

    this.pendingKeys.set(key, commandId);
    this.commandKeys.set(commandId, key);
    return null;
  }

  public releaseOperation(key: string, commandId: string): void {
    if (this.pendingKeys.get(key) === commandId) {
      this.pendingKeys.delete(key);
    }
  }

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
    const command = this.commands.get(commandId);

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
    this.releaseByCommand(commandId);
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
    this.releaseByCommand(commandId);
    this.commands.set(commandId, {
      commandId,
      status: 'failed',
      error: {
        code,
        message,
      },
    });
  }

  private releaseByCommand(commandId: string): void {
    const key = this.commandKeys.get(commandId);
    if (key !== undefined) {
      this.releaseOperation(key, commandId);
      this.commandKeys.delete(commandId);
    }
  }

  public get(
    commandId: string,
  ): CommandState | undefined {
    return this.commands.get(commandId);
  }
}