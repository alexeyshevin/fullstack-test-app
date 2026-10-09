import {
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';

import type {
    CommandAcceptedResponse,
} from '@app/contracts';

import { waitForCommand } from '../api/waitForCommand';
import { queryKeys } from '../lib/queryKeys';

type CommandMutationOptions<
  TVariables,
> = {
  mutationFn: (
    variables: TVariables,
  ) => Promise<CommandAcceptedResponse>;
};

export const useCommandMutation = <
  TVariables,
>({
  mutationFn,
}: CommandMutationOptions<TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables);

      await waitForCommand(response.commandId);

      return response;
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.items.all,
        }),

        queryClient.invalidateQueries({
          queryKey: queryKeys.selected.all,
        }),
      ]);
    },
  });
};