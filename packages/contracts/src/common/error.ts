export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'ITEM_NOT_FOUND'
  | 'ITEM_ALREADY_EXISTS'
  | 'ITEM_ALREADY_PENDING'
  | 'ITEM_ALREADY_SELECTED'
  | 'ITEM_NOT_SELECTED'
  | 'INVALID_REORDER'
  | 'INTERNAL_ERROR';

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};