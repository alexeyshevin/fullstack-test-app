import type {
  GetSelectedQuery,
  ReorderItemCommand,
  ReorderItemRequest,
  ReorderItemResponse,
  SelectItemCommand,
  SelectItemRequest,
  SelectItemResponse,
  UnselectItemCommand,
  UnselectItemRequest,
  UnselectItemResponse,
} from '@app/contracts';
import { Router } from 'express';
import type { CommandProducer } from '../kafka/command.producer';
import type { SelectedItemsService } from '../services/selected-items.service';
import type { CommandStore } from '../store/command.store';

export const createSelectedItemsRouter = (
  service: SelectedItemsService,
  commandProducer: CommandProducer,
  commandStore: CommandStore,
): Router => {
  const router = Router();

  router.get('/', (req, res) => {
    const query: GetSelectedQuery = {
      cursor:
        typeof req.query.cursor === 'string'
          ? req.query.cursor
          : undefined,

      filter:
        typeof req.query.filter === 'string'
          ? req.query.filter
          : undefined,

      limit:
        typeof req.query.limit === 'string'
          ? Number(req.query.limit)
          : undefined,
    };

    const result =
      service.getSelectedItems(query);

    res.json(result);
  });

  router.post(
    '/select',
    async (req, res) => {
      const body =
        req.body as SelectItemRequest;

      if (!isValidId(body.id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'id must be a positive safe integer',
          },
        });

        return;
      }

      const command: SelectItemCommand = {
        id: crypto.randomUUID(),
        type: 'SELECT_ITEM',
        createdAt: Date.now(),
        payload: {
          id: body.id,
        },
      };

      commandStore.accept(command.id);

      try {
        await commandProducer.send(
          command,
        );
      } catch {
        commandStore.fail(
          command.id,
          'COMMAND_QUEUE_UNAVAILABLE',
          'Failed to enqueue command',
        );

        res.status(503).json({
          error: {
            code:
              'COMMAND_QUEUE_UNAVAILABLE',
            message:
              'Command queue is unavailable',
          },
        });

        return;
      }

      const response: SelectItemResponse = {
        commandId: command.id,
        status: 'accepted',
      };

      res.status(202).json(response);
    },
  );

  router.post(
    '/unselect',
    async (req, res) => {
      const body =
        req.body as UnselectItemRequest;

      if (!isValidId(body.id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'id must be a positive safe integer',
          },
        });

        return;
      }

      const command: UnselectItemCommand = {
        id: crypto.randomUUID(),
        type: 'UNSELECT_ITEM',
        createdAt: Date.now(),
        payload: {
          id: body.id,
        },
      };

      commandStore.accept(command.id);

      try {
        await commandProducer.send(
          command,
        );
      } catch {
        commandStore.fail(
          command.id,
          'COMMAND_QUEUE_UNAVAILABLE',
          'Failed to enqueue command',
        );

        res.status(503).json({
          error: {
            code:
              'COMMAND_QUEUE_UNAVAILABLE',
            message:
              'Command queue is unavailable',
          },
        });

        return;
      }

      const response: UnselectItemResponse = {
        commandId: command.id,
        status: 'accepted',
      };

      res.status(202).json(response);
    },
  );

  router.post(
    '/reorder',
    async (req, res) => {
      const body =
        req.body as ReorderItemRequest;

      if (
        !isValidId(body.id) ||
        !isValidId(body.targetId)
      ) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'id and targetId must be positive safe integers',
          },
        });

        return;
      }

      if (
        body.placement !== 'before' &&
        body.placement !== 'after'
      ) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'placement must be "before" or "after"',
          },
        });

        return;
      }

      if (body.id === body.targetId) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'id and targetId must be different',
          },
        });

        return;
      }

      const command: ReorderItemCommand = {
        id: crypto.randomUUID(),
        type: 'REORDER_ITEM',
        createdAt: Date.now(),
        payload: {
          id: body.id,
          targetId: body.targetId,
          placement: body.placement,
        },
      };

      commandStore.accept(command.id);

      try {
        await commandProducer.send(
          command,
        );
      } catch {
        commandStore.fail(
          command.id,
          'COMMAND_QUEUE_UNAVAILABLE',
          'Failed to enqueue command',
        );

        res.status(503).json({
          error: {
            code:
              'COMMAND_QUEUE_UNAVAILABLE',
            message:
              'Command queue is unavailable',
          },
        });

        return;
      }

      const response: ReorderItemResponse = {
        commandId: command.id,
        status: 'accepted',
      };

      res.status(202).json(response);
    },
  );

  return router;
};

const isValidId = (
  value: unknown,
): value is number =>
  Number.isSafeInteger(value) &&
  (value as number) > 0;