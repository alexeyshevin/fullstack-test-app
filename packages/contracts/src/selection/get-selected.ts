import type { ListQuery, PaginatedResponse } from '../common/pagination';
import { SelectedItemDto } from './selected-item';

export type GetSelectedQuery = ListQuery;

export type GetSelectedResponse = PaginatedResponse<SelectedItemDto>;