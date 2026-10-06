import type { GetItemsQuery } from '@app/contracts';
import { Router } from 'express';
import type { ItemsService } from '../services/item.service';

export const createItemsRouter = (
  service: ItemsService,
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

  return router;
};