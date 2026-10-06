import type { GetSelectedQuery } from '@app/contracts';
import { Router } from 'express';
import type { SelectedItemsService } from '../services/selected-items.service';

export const createSelectedItemsRouter = (
  service: SelectedItemsService,
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

  return router;
};