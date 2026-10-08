import type {
    CommandResponse,
} from '@app/contracts';

import { apiClient } from './client';

export const commandsApi = {
  getStatus: (
    commandId: string,
    signal?: AbortSignal,
  ): Promise<CommandResponse> =>
    apiClient<CommandResponse>(
      `/commands/${encodeURIComponent(commandId)}`,
      { signal },
    ),
};