import type {
  AddItemCommand,
  AddItemResponse,
  GetItemsQuery
} from '@app/contracts';
import { Router } from 'express';
import type { ReadBatcher } from '../batching/read.batcher';
import type { CommandProducer } from '../kafka/command.producer';
import type { ItemsService } from '../services/item.service';
import type { CommandStore } from '../store/command.store';
import type { PendingItemsStore } from '../store/pending-items.store';
import { isRecord, isValidId, isValidPageQuery } from './validation';
export const createItemsRouter = (
  service: ItemsService,
  commandProducer: CommandProducer,
  commandStore: CommandStore,
  pendingItemsStore: PendingItemsStore,
  readBatcher: ReadBatcher,
): Router => {
  const router = Router();

  router.get('/', isValidPageQuery, async (req, res) => {
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

    try {
      const result = await readBatcher.enqueue('items:' + JSON.stringify(query), () => service.getItems(query));
      res.json(result);
    } catch {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to read items' } });
    }
  });

  router.post('/', async (req, res) => {
    const body =
      req.body as unknown;

    if (
      !isRecord(body) ||
      !isValidId(body.id)
    ) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message:
            'id must be a safe integer',
        },
      });

      return;
    }

    /*
     * Проверяем уже существующее,
     * committed-состояние.
     */
    if (service.hasItem(body.id)) {
      res.status(409).json({
        error: {
          code: 'ITEM_ALREADY_EXISTS',
          message:
            `Item ${body.id} already exists`,
        },
      });

      return;
    }

    /*
     * Атомарно резервируем ID.
     *
     * Если add() вернул false,
     * такой ADD уже ожидает обработки.
     */
    const reserved =
      pendingItemsStore.add(body.id);

    if (!reserved) {
      res.status(409).json({
        error: {
          code: 'ITEM_ALREADY_PENDING',
          message:
            `Item ${body.id} is already pending`,
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
      /*
       * Kafka не приняла команду.
       *
       * Следовательно, ADD никогда
       * не будет обработан и reservation
       * необходимо снять.
       */
      pendingItemsStore.delete(body.id);

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