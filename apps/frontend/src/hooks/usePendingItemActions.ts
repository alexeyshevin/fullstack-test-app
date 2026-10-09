import { useState } from 'react';

export const usePendingItemActions = () => {
  const [pendingIds, setPendingIds] = useState<
    Set<number>
  >(() => new Set());

  const setPending = (
    id: number,
    pending: boolean,
  ) => {
    setPendingIds((current) => {
      const next = new Set(current);

      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  };

  return {
    pendingIds,
    setPending,
  };
};