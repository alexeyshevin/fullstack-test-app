import type { CommandAcceptedResponse } from '../common/command.js';

export type ReorderPlacement =
  | 'before'
  | 'after';

export type ReorderItemRequest = {
  id: number;
  targetId: number;
  placement: ReorderPlacement;
};

export type ReorderItemResponse = CommandAcceptedResponse;