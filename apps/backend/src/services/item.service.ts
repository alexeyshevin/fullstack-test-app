import { DEFAULT_PAGE_SIZE, GetItemsQuery, GetItemsResponse, ItemDto, MAX_PAGE_SIZE } from "@app/contracts";
import { MemoryStore } from "../store/memory.store";
import { DEFAULT_MAX_ID } from "../store/memory.store.constants";

export class ItemsService {
  constructor(
    private readonly store: MemoryStore,
  ) {}

  public hasItem(id: number): boolean {
    return this.store.hasItem(id);
  }

  public getItems(
    query: GetItemsQuery,
  ): GetItemsResponse {
    const limit = this.normalizeLimit(query.limit);

    const cursor = this.parseCursor(query.cursor);

    const collectedItems: ItemDto[] = [];

    // Custom negative IDs and zero precede the default positive range.
    const custom = [...this.store.getCustomItems()].sort((a, b) => a - b);

    const filter = query.filter;
    const matches = (id: number) => !this.store.isSelected(id) && this.matchesFilter(id, filter);
    for (const id of custom) {
      if (id >= 1) {
        break;
      }

      if ((cursor === null || id > cursor) && matches(id)) {
        collectedItems.push({ id });
      }

      if (collectedItems.length > limit) {
        break;
      }
    }
    if (collectedItems.length <= limit) {
      let id = Math.max((cursor ?? 0) + 1, 1);
      while (id <= DEFAULT_MAX_ID && collectedItems.length <= limit) {
        if (matches(id)) collectedItems.push({ id });
        id++;
      }
    }

    if (collectedItems.length <= limit) {
      for (const id of custom) {
        if (id <= DEFAULT_MAX_ID || (cursor !== null && id <= cursor)) {
          continue;
        }

        if (matches(id)) {
          collectedItems.push({ id });
        }

        if (collectedItems.length > limit) {
          break;
        }
      }
    }

    const hasMore = collectedItems.length > limit;

    const items = hasMore ? collectedItems.slice(0, limit) : collectedItems;

    const lastItem = items[items.length - 1];

    return {
      items,
      hasMore,
      nextCursor:
        hasMore && lastItem
          ? String(lastItem.id)
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
  ): number | null {
    if (cursor === undefined) {
      return null;
    }

    const parsedCursor = Number(cursor);

    if (
      !Number.isSafeInteger(parsedCursor) ||
      !Number.isFinite(parsedCursor)
    ) {
      return null;
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