import type { CommandAcceptedResponse } from '../common/command.js';

export type UnselectItemRequest = {
  id: number;
};

export type UnselectItemResponse = CommandAcceptedResponse;