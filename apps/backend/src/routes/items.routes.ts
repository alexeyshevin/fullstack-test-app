import type {
  AddItemCommand,
  AddItemRequest,
  AddItemResponse,
  GetItemsQuery,
} from '@app/contracts';
import { Router } from 'express';
import type { CommandProducer } from '../kafka/command.producer';
import type { ItemsService } from '../services/item.service';
import type { CommandStore } from '../store/command.store';

export const createItemsRouter = (
  service: ItemsService,
  commandProducer: CommandProducer,
  commandStore: CommandStore,
): Router => {
  const router = Router();

  router.get('/', (req, res) => {
    const query: GetItemsQuery = {
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
      service.getItems(query);

    res.json(result);
  });

  router.post('/', async (req, res) => {
    const body =
      req.body as AddItemRequest;

    if (
      !Number.isSafeInteger(body.id) ||
      body.id <= 0
    ) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message:
            'id must be a positive safe integer',
        },
      });

      return;
    }

    const command: AddItemCommand = {
      id: crypto.randomUUID(),
      type: 'ADD_ITEM',
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

    const response: AddItemResponse = {
      commandId: command.id,
      status: 'accepted',
    };

    res.status(202).json(response);
  });

  return router;
};