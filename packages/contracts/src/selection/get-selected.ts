import type { ListQuery, PaginatedResponse } from '../common/pagination.js';
import { SelectedItemDto } from './selected-item.js';

export type GetSelectedQuery = ListQuery;

export type GetSelectedResponse = PaginatedResponse<SelectedItemDto>;