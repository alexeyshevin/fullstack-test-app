import { Router } from 'express';
import type { CommandStore } from '../store/command.store';

export const createCommandsRouter = (
  commandStore: CommandStore,
): Router => {
  const router = Router();

  router.get(
    '/:commandId',
    (req, res) => {
      const commandId =
        req.params.commandId;

      const command =
        commandStore.get(commandId);

      if (!command) {
        res.status(404).json({
          error: {
            code: 'COMMAND_NOT_FOUND',
            message:
              `Command ${commandId} not found`,
          },
        });

        return;
      }

      res.json(command);
    },
  );

  return router;
};