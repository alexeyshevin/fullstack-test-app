import type { AddItemCommand, AddItemRequest, GetItemsQuery } from '@app/contracts';
import { Router } from 'express';
import type { CommandProducer } from '../kafka/command.producer';
import type { ItemsService } from '../services/item.service';

export const createItemsRouter = (
  service: ItemsService,
  commandProducer: CommandProducer,
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
        error: 'id must be a positive safe integer',
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

    await commandProducer.send(command);

    res.status(202).json({
      accepted: true,
      commandId: command.id,
    });
  });

  return router;
};