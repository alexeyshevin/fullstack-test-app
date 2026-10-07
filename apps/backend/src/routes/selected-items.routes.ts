import type { GetSelectedQuery, ReorderItemCommand, ReorderItemRequest, SelectItemCommand, SelectItemRequest, UnselectItemCommand, UnselectItemParams } from '@app/contracts';
import { Router } from 'express';
import { CommandProducer } from '../kafka/command.producer';
import type { SelectedItemsService } from '../services/selected-items.service';

export const createSelectedItemsRouter = (
  service: SelectedItemsService,
  commandProducer: CommandProducer,
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
          error:
            'id must be a positive safe integer',
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

      await commandProducer.send(command);

      res.status(202).json({
        accepted: true,
        commandId: command.id,
      });
    },
  );

  router.post(
    '/unselect',
    async (req, res) => {
      const body =
        req.body as UnselectItemParams;

      if (!isValidId(body.id)) {
        res.status(400).json({
          error:
            'id must be a positive safe integer',
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

      await commandProducer.send(command);

      res.status(202).json({
        accepted: true,
        commandId: command.id,
      });
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
          error:
            'id and targetId must be positive safe integers',
        });

        return;
      }

      if (
        body.placement !== 'before' &&
        body.placement !== 'after'
      ) {
        res.status(400).json({
          error:
            'placement must be "before" or "after"',
        });

        return;
      }

      if (body.id === body.targetId) {
        res.status(400).json({
          error:
            'id and targetId must be different',
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

      await commandProducer.send(command);

      res.status(202).json({
        accepted: true,
        commandId: command.id,
      });
    },
  );

  return router;
};

const isValidId = (
  value: unknown,
): value is number =>
  Number.isSafeInteger(value) &&
  (value as number) > 0;