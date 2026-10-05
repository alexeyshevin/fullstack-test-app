import { DEFAULT_MAX_ID, DEFAULT_MIN_ID } from "./memory.store.constants";
import {
  InvalidReorderError,
  ItemAlreadyExistsError,
  ItemAlreadySelectedError,
  ItemNotFoundError,
  ItemNotSelectedError
} from "./memory.store.errors";

export type ReorderPlacement = 'before' | 'after';

export class MemoryStore {
  /**
   * Дополнительные элементы, созданные пользователем.
   *
   * Исходные элементы 1...1_000_000 здесь не хранятся.
   */
  private readonly customItems = new Set<number>();

  /**
   * Выбранные элементы в том порядке,
   * в котором они должны отображаться.
   */
  private readonly selectedIds: number[] = [];

  /**
   * Те же выбранные элементы для быстрого поиска.
   */
  private readonly selectedSet = new Set<number>();

  /**
   * Версия committed state.
   *
   * Увеличивается после применения batch.
   */
  private version = 0;

  public getVersion(): number {
    return this.version;
  }

  public hasItem(id: number): boolean {
    return (
      this.isDefaultItem(id) ||
      this.customItems.has(id)
    );
  }

  public isSelected(id: number): boolean {
    return this.selectedSet.has(id);
  }

  public getSelectedIds(): number[] {
    return [...this.selectedIds];
  }

  public getCustomItems(): Set<number> {
    return new Set(this.customItems);
  }

  public addItem(id: number): void {
    if (this.hasItem(id)) {
      throw new ItemAlreadyExistsError(id);
    }

    this.customItems.add(id);
  }

  public selectItem(id: number): void {
    if (!this.hasItem(id)) {
      throw new ItemNotFoundError(id);
    }

    if (this.selectedSet.has(id)) {
      throw new ItemAlreadySelectedError(id);
    }

    this.selectedIds.push(id);
    this.selectedSet.add(id);
  }

  public unselectItem(id: number): void {
    if (!this.selectedSet.has(id)) {
      throw new ItemNotSelectedError(id);
    }

    const index = this.selectedIds.indexOf(id);

    this.selectedIds.splice(index, 1);
    this.selectedSet.delete(id);
  }

  public reorderItem(
    id: number,
    targetId: number,
    placement: ReorderPlacement,
  ): void {
    if (!this.selectedSet.has(id)) {
      throw new ItemNotSelectedError(id);
    }

    if (!this.selectedSet.has(targetId)) {
      throw new ItemNotSelectedError(targetId);
    }

    if (id === targetId) {
      throw new InvalidReorderError(
        'Item and target item must be different',
      );
    }

    const currentIndex = this.selectedIds.indexOf(id);

    this.selectedIds.splice(currentIndex, 1);

    const targetIndex = this.selectedIds.indexOf(targetId);

    const insertionIndex =
      placement === 'before'
        ? targetIndex
        : targetIndex + 1;

    this.selectedIds.splice(
      insertionIndex,
      0,
      id,
    );
  }

  public commit(): void {
    this.version += 1;
  }

  private isDefaultItem(id: number): boolean {
    return (
      id >= DEFAULT_MIN_ID &&
      id <= DEFAULT_MAX_ID
    );
  }
}