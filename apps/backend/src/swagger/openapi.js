export const openApiDocument = {
    openapi: '3.0.3',
    info: {
        title: 'Fullstack Test App API',
        version: '1.0.0',
        description: 'API for items and selected items.',
    },
    servers: [
        {
            url: 'http://localhost:3000',
        },
    ],
    paths: {
        '/api/items': {
            get: {
                summary: 'Get available items',
                parameters: [
                    {
                        name: 'cursor',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 20,
                            default: 20,
                        },
                    },
                    {
                        name: 'filter',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Paginated available items',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ItemsResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/selected': {
            get: {
                summary: 'Get selected items',
                parameters: [
                    {
                        name: 'cursor',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 20,
                            default: 20,
                        },
                    },
                    {
                        name: 'filter',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Paginated selected items',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/SelectedItemsResponse',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            Item: {
                type: 'object',
                required: [
                    'id',
                ],
                properties: {
                    id: {
                        type: 'integer',
                        example: 42,
                    },
                },
            },
            SelectedItem: {
                type: 'object',
                required: [
                    'id',
                    'position',
                ],
                properties: {
                    id: {
                        type: 'integer',
                        example: 42,
                    },
                    position: {
                        type: 'integer',
                        example: 0,
                    },
                },
            },
            ItemsResponse: {
                type: 'object',
                required: [
                    'items',
                    'nextCursor',
                    'hasMore',
                    'version',
                ],
                properties: {
                    items: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Item',
                        },
                    },
                    nextCursor: {
                        type: 'string',
                        nullable: true,
                        example: '20',
                    },
                    hasMore: {
                        type: 'boolean',
                        example: true,
                    },
                    version: {
                        type: 'integer',
                        example: 0,
                    },
                },
            },
            SelectedItemsResponse: {
                type: 'object',
                required: [
                    'items',
                    'nextCursor',
                    'hasMore',
                    'version',
                ],
                properties: {
                    items: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/SelectedItem',
                        },
                    },
                    nextCursor: {
                        type: 'string',
                        nullable: true,
                        example: '19',
                    },
                    hasMore: {
                        type: 'boolean',
                        example: true,
                    },
                    version: {
                        type: 'integer',
                        example: 1,
                    },
                },
            },
        },
    },
};
