import type { ListQuery, PaginatedResponse } from '../common/pagination';
import type { ItemDto } from './item';

export type GetItemsQuery = ListQuery;

export type GetItemsResponse = PaginatedResponse<ItemDto>;