import {
    DEFAULT_PAGE_SIZE,
    GetSelectedQuery,
    GetSelectedResponse,
    MAX_PAGE_SIZE,
    SelectedItemDto
} from "@app/contracts";
import { MemoryStore } from "../store/memory.store";

export class SelectedItemsService {
  constructor(
    private readonly store: MemoryStore,
  ) {}

  public getSelectedItems(
    query: GetSelectedQuery,
  ): GetSelectedResponse {
    const limit =
      this.normalizeLimit(query.limit);

    const cursor =
      this.parseCursor(query.cursor);

    const selectedIds =
      this.store.getSelectedIds();

    const collectedItems: SelectedItemDto[] = [];

    for (
      let position = cursor + 1;
      position < selectedIds.length;
      position++
    ) {
      const id = selectedIds[position];

      if (id === undefined) {
        continue;
      }

      if (!this.matchesFilter(id, query.filter)) {
        continue;
      }

      collectedItems.push({
        id,
        position,
      });

      if (collectedItems.length > limit) {
        break;
      }
    }

    const hasMore =
      collectedItems.length > limit;

    const items = hasMore
      ? collectedItems.slice(0, limit)
      : collectedItems;

    const lastItem =
      items[items.length - 1];

    return {
      items,
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? String(lastItem.position)
          : null,
      version: this.store.getVersion(),
    };
  }

  private matchesFilter(
    id: number,
    filter?: string,
  ): boolean {
    if (!filter) {
      return true;
    }

    return String(id).includes(filter);
  }

  private parseCursor(
    cursor?: string,
  ): number {
    if (!cursor) {
      return -1;
    }

    const parsedCursor = Number(cursor);

    if (
      !Number.isSafeInteger(parsedCursor) ||
      parsedCursor < 0
    ) {
      return -1;
    }

    return parsedCursor;
  }

  private normalizeLimit(
    limit?: number,
  ): number {
    if (!limit) {
      return DEFAULT_PAGE_SIZE;
    }

    return Math.min(
      Math.max(limit, 1),
      MAX_PAGE_SIZE,
    );
  }
}