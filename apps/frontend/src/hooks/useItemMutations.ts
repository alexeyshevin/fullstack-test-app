import type {
    AddItemRequest,
    ReorderItemRequest,
    SelectItemRequest,
    UnselectItemRequest,
} from '@app/contracts';

import { itemsApi } from '../api/items.api';
import { selectedApi } from '../api/selected.api';
import { useCommandMutation } from './useCommandMutation';

export const useAddItem = () =>
  useCommandMutation<AddItemRequest>({
    mutationFn: itemsApi.addItem,
  });

export const useSelectItem = () =>
  useCommandMutation<SelectItemRequest>({
    mutationFn: selectedApi.select,
  });

export const useUnselectItem = () =>
  useCommandMutation<UnselectItemRequest>({
    mutationFn: selectedApi.unselect,
  });

export const useReorderItem = () =>
  useCommandMutation<ReorderItemRequest>({
    mutationFn: selectedApi.reorder,
  });