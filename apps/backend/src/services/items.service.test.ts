import {
    beforeEach,
    describe,
    expect,
    it
} from 'vitest';
import { MemoryStore } from '../store/memory.store';
import { ItemsService } from './item.service';

describe('ItemsService', () => {
  let store: MemoryStore;
  let service: ItemsService;

  beforeEach(() => {
    store = new MemoryStore();
    service = new ItemsService(store);
  });

  it('returns the first page', () => {
    const result = service.getItems({
      limit: 5,
    });

    expect(result.items).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
    ]);

    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('5');
  });

  it('continues from cursor', () => {
    const result = service.getItems({
      cursor: '5',
      limit: 5,
    });

    expect(result.items).toEqual([
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
    ]);

    expect(result.nextCursor).toBe('10');
  });

  it('excludes selected items', () => {
    store.selectItem(2);
    store.selectItem(4);

    const result = service.getItems({
      limit: 5,
    });

    expect(result.items).toEqual([
      { id: 1 },
      { id: 3 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
    ]);
  });

  it('filters items by id', () => {
    const result = service.getItems({
      filter: '12',
      limit: 5,
    });

    expect(result.items).toEqual([
      { id: 12 },
      { id: 112 },
      { id: 120 },
      { id: 121 },
      { id: 122 },
    ]);
  });

  it('does not return more than MAX_PAGE_SIZE', () => {
    const result = service.getItems({
      limit: 1000,
    });

    expect(result.items).toHaveLength(20);
  });

  it('returns store version', () => {
    const result = service.getItems({
      limit: 5,
    });

    expect(result.version).toBe(
      store.getVersion(),
    );
  });
});