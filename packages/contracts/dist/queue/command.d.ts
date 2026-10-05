export type CommandType = 'ADD_ITEM' | 'SELECT_ITEM' | 'UNSELECT_ITEM' | 'REORDER_ITEM';
export type BaseCommand<TType extends CommandType, TPayload> = {
    id: string;
    type: TType;
    payload: TPayload;
    createdAt: number;
};
export type AddItemCommand = BaseCommand<'ADD_ITEM', {
    id: number;
}>;
export type SelectItemCommand = BaseCommand<'SELECT_ITEM', {
    id: number;
}>;
export type UnselectItemCommand = BaseCommand<'UNSELECT_ITEM', {
    id: number;
}>;
export type ReorderItemCommand = BaseCommand<'REORDER_ITEM', {
    id: number;
    targetId: number;
    placement: 'before' | 'after';
}>;
export type AppCommand = AddItemCommand | SelectItemCommand | UnselectItemCommand | ReorderItemCommand;
//# sourceMappingURL=command.d.ts.map