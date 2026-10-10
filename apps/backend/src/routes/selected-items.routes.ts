import type {
  GetSelectedQuery,
  ReorderItemCommand,
  ReorderItemResponse,
  SelectItemCommand,
  SelectItemResponse,
  UnselectItemCommand,
  UnselectItemResponse
} from '@app/contracts';
import { Router } from 'express';
import type { ReadBatcher } from '../batching/read.batcher';
import type { CommandProducer } from '../kafka/command.producer';
import type { SelectedItemsService } from '../services/selected-items.service';
import type { CommandStore } from '../store/command.store';
import { isRecord, isValidId, isValidPageQuery } from './validation';

export const createSelectedItemsRouter = (
  service: SelectedItemsService,
  commandProducer: CommandProducer,
  commandStore: CommandStore,
  readBatcher: ReadBatcher,
): Router => {
  const router = Router();

  router.get('/', isValidPageQuery, async (req, res) => {
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

    try {
      const result = await readBatcher.enqueue('selected:' + JSON.stringify(query), () => service.getSelectedItems(query));
      res.json(result);
    } catch {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to read selected items' } });
    }
  });

  router.post(
    '/select',
    async (req, res) => {
      const body =
        req.body as unknown;

      if (!isRecord(body) || !isValidId(body.id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'id must be a safe integer',
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

      const operationKey = `${command.type}:${command.payload.id}`;
      const existingId = commandStore.reserveOperation(operationKey, command.id);
      if (existingId) {
        res.status(202).json({ commandId: existingId, status: 'accepted' });
        return;
      }
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
        req.body as unknown;

      if (!isRecord(body) || !isValidId(body.id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'id must be a safe integer',
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

      const operationKey = `${command.type}:${command.payload.id}`;
      const existingId = commandStore.reserveOperation(operationKey, command.id);
      if (existingId) {
        res.status(202).json({ commandId: existingId, status: 'accepted' });
        return;
      }
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
        req.body as unknown;

      if (
        !isRecord(body) ||
        !isValidId(body.id) ||
        !isValidId(body.targetId)
      ) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'id and targetId must be safe integers',
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

      const operationKey = `${command.type}:${command.payload.id}:${command.payload.targetId}:${command.payload.placement}`;
      const existingId = commandStore.reserveOperation(operationKey, command.id);
      if (existingId) {
        res.status(202).json({ commandId: existingId, status: 'accepted' });
        return;
      }
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

