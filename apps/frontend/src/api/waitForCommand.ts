import { ApiError } from './client';
import { commandsApi } from './commands.api';

type WaitOptions = {
  signal?: AbortSignal;
  intervalMs?: number;
  timeoutMs?: number;
};

const sleep = (
  ms: number,
  signal?: AbortSignal,
): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      reject(signal?.reason);
    };

    signal?.addEventListener(
      'abort',
      onAbort,
      { once: true },
    );
  });

export const waitForCommand = async (
  commandId: string,
  {
    signal,
    intervalMs = 500,
    timeoutMs = 30_000,
  }: WaitOptions = {},
): Promise<void> => {
  const startedAt = Date.now();

  while (true) {
    signal?.throwIfAborted();

    const command = await commandsApi.getStatus(
      commandId,
      signal,
    );

    if (command.status === 'completed') {
      return;
    }

    if (command.status === 'failed') {
      throw new ApiError(
        409,
        command.error?.code ?? 'INTERNAL_ERROR',
        command.error?.message ?? 'Command failed',
      );
    }

    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(
        `Command ${commandId} timed out`,
      );
    }

    await sleep(intervalMs, signal);
  }
};