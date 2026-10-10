import type { ListQuery, PaginatedResponse } from '../common/pagination.js';
import type { ItemDto } from './item.js';

export type GetItemsQuery = ListQuery;

export type GetItemsResponse = PaginatedResponse<ItemDto>;