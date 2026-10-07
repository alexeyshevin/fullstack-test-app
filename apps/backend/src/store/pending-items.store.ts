export class PendingItemsStore {
  private readonly ids = new Set<number>();

  public has(id: number): boolean {
    return this.ids.has(id);
  }

  public add(id: number): boolean {
    if (this.ids.has(id)) {
      return false;
    }

    this.ids.add(id);

    return true;
  }

  public delete(id: number): void {
    this.ids.delete(id);
  }
}