export type CommandStatus = 'accepted' | 'processing' | 'completed' | 'failed';
export type CommandResponse = {
    commandId: string;
    status: CommandStatus;
};
export type CommandAcceptedResponse = {
    commandId: string;
    status: 'accepted';
};
//# sourceMappingURL=command.d.ts.map