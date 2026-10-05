export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 20;
export type PaginationQuery = {
    cursor?: string;
    limit?: number;
};
export type PaginatedResponse<T> = {
    items: T[];
    nextCursor: string | null;
    hasMore: boolean;
    version: number;
};
export type FilterQuery = {
    filter?: string;
};
export type ListQuery = PaginationQuery & FilterQuery;
//# sourceMappingURL=pagination.d.ts.map