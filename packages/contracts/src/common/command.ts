import type { ApiErrorCode } from './error';

export type CommandStatus =
  | 'accepted'
  | 'processing'
  | 'completed'
  | 'failed';

export type CommandResponse = {
  commandId: string;
  status: CommandStatus;
  error?: {
    code: ApiErrorCode;
    message: string;
  };
};

export type CommandAcceptedResponse = {
  commandId: string;
  status: 'accepted';
};