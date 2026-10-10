import type { CommandAcceptedResponse } from '../common/command.js';

export type AddItemRequest = {
  id: number;
};

export type AddItemResponse = CommandAcceptedResponse;