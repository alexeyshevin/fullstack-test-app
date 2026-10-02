import type { CommandAcceptedResponse } from '../common/command';

export type ReorderPlacement =
  | 'before'
  | 'after';

export type ReorderItemRequest = {
  id: number;
  targetId: number;
  placement: ReorderPlacement;
};

export type ReorderItemResponse = CommandAcceptedResponse;