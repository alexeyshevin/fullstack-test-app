export class ReadBatcher {
  private readonly pending = new Map<string, {
    execute: () => unknown;
    listeners: Array<{ resolve: (value: any) => void;
    reject: (error: unknown) => void }>
}>();

  private timer: NodeJS.Timeout | null = null;

  public enqueue<T>(key: string, execute: () => T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let entry = this.pending.get(key);
      if (!entry) {
        entry = { execute, listeners: [] };
        this.pending.set(key, entry);
      }

      entry.listeners.push({ resolve, reject });

      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 1000);
      }
    });
  }

  public flush(): void {
    if (this.timer) {
        clearTimeout(this.timer);
    }

    this.timer = null;

    const batch = [...this.pending.values()];

    this.pending.clear();

    for (const { execute, listeners } of batch) {
      try {
        const value = execute();
        for (const listener of listeners) listener.resolve(value);
      } catch (error) {
        for (const listener of listeners) listener.reject(error);
      }
    }
  }
}
