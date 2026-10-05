import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { MemoryStore } from '../store/memory.store.js';
import { SelectedItemsService } from './selected-items.service.js';

describe('SelectedItemsService', () => {
  let store: MemoryStore;
  let service: SelectedItemsService;

  beforeEach(() => {
    store = new MemoryStore();
    service = new SelectedItemsService(store);

    store.selectItem(12);
    store.selectItem(500);
    store.selectItem(120);
    store.selectItem(42);
    store.selectItem(912);
    store.selectItem(123);
  });

  it('returns selected items preserving order', () => {
    const result = service.getSelectedItems({
      limit: 3,
    });

    expect(result.items).toEqual([
      {
        id: 12,
        position: 0,
      },
      {
        id: 500,
        position: 1,
      },
      {
        id: 120,
        position: 2,
      },
    ]);

    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('2');
  });

  it('continues from cursor', () => {
    const result = service.getSelectedItems({
      cursor: '2',
      limit: 2,
    });

    expect(result.items).toEqual([
      {
        id: 42,
        position: 3,
      },
      {
        id: 912,
        position: 4,
      },
    ]);

    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('4');
  });

  it('preserves original positions when filtering', () => {
    const result = service.getSelectedItems({
      filter: '12',
      limit: 2,
    });

    expect(result.items).toEqual([
      {
        id: 12,
        position: 0,
      },
      {
        id: 120,
        position: 2,
      },
    ]);

    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBe('2');
  });

  it('returns the last filtered page', () => {
    const result = service.getSelectedItems({
      filter: '12',
      cursor: '2',
      limit: 2,
    });

    expect(result.items).toEqual([
      {
        id: 912,
        position: 4,
      },
      {
        id: 123,
        position: 5,
      },
    ]);

    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('returns an empty result when nothing matches', () => {
    const result = service.getSelectedItems({
      filter: '999999999',
    });

    expect(result.items).toEqual([]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
});