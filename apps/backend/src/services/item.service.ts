import { DEFAULT_PAGE_SIZE, GetItemsQuery, GetItemsResponse, ItemDto, MAX_PAGE_SIZE } from "@app/contracts";
import { MemoryStore } from "../store/memory.store";
import { DEFAULT_MAX_ID } from "../store/memory.store.constants";

export class ItemsService {
  constructor(
    private readonly store: MemoryStore,
  ) {}

  public getItems(
    query: GetItemsQuery,
  ): GetItemsResponse {
    const limit = this.normalizeLimit(query.limit);

    const cursor = this.parseCursor(query.cursor);

    const collectedItems: ItemDto[] = [];

    this.collectDefaultItems(
      collectedItems,
      cursor,
      limit,
      query.filter,
    );

    if (collectedItems.length <= limit) {
      this.collectCustomItems(
        collectedItems,
        cursor,
        limit,
        query.filter,
      );
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
          ? String(lastItem.id)
          : null,
      version: this.store.getVersion(),
    };
  }

  private collectDefaultItems(
    result: ItemDto[],
    cursor: number,
    limit: number,
    filter?: string,
  ): void {
    let id = Math.max(cursor + 1, 1);

    while (
      id <= DEFAULT_MAX_ID &&
      result.length <= limit
    ) {
      if (
        !this.store.isSelected(id) &&
        this.matchesFilter(id, filter)
      ) {
        result.push({ id });
      }

      id++;
    }
  }

  private collectCustomItems(
    result: ItemDto[],
    cursor: number,
    limit: number,
    filter?: string,
  ): void {
    const customItems = [
      ...this.store.getCustomItems(),
    ]
      .filter(id => id > cursor)
      .sort((a, b) => a - b);

    for (const id of customItems) {
      if (result.length > limit) {
        break;
      }

      if (
        !this.store.isSelected(id) &&
        this.matchesFilter(id, filter)
      ) {
        result.push({ id });
      }
    }
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
      return 0;
    }

    const parsedCursor = Number(cursor);

    if (
      !Number.isSafeInteger(parsedCursor) ||
      parsedCursor < 0
    ) {
      return 0;
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