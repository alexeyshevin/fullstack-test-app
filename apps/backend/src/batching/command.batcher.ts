import type {
  Command,
} from '@app/contracts';

type BatchHandler = (
  commands: Command[],
) => Promise<void> | void;

export class CommandBatcher {
  private readonly commands: Command[] = [];

  private timer: NodeJS.Timeout | null =
    null;

  private flushing = false;

  constructor(
    private readonly intervalMs: number,
    private readonly handler: BatchHandler,
  ) {}

  public add(command: Command): void {
    this.commands.push(command);

    this.ensureTimer();
  }

  public async flush(): Promise<void> {
    if (
      this.flushing ||
      this.commands.length === 0
    ) {
      return;
    }

    this.flushing = true;
    this.clearTimer();

    const batch =
      this.commands.splice(
        0,
        this.commands.length,
      );

    try {
      await this.handler(batch);
    } catch (error) {
      console.error(
        'Failed to flush command batch:',
        error,
      );
    } finally {
      this.flushing = false;

      if (this.commands.length > 0) {
        this.ensureTimer();
      }
    }
  }

  private ensureTimer(): void {
    if (this.timer) {
      return;
    }

    this.timer = setTimeout(
      () => {
        this.timer = null;

        void this.flush();
      },
      this.intervalMs,
    );
  }

  private clearTimer(): void {
    if (!this.timer) {
      return;
    }

    clearTimeout(this.timer);

    this.timer = null;
  }
}