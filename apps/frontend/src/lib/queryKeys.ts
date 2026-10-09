export const queryKeys = {
  items: {
    all: ['items'] as const,

    list: (filter: string) =>
      ['items', 'list', filter] as const,
  },

  selected: {
    all: ['selected'] as const,

    list: (filter: string) =>
      ['selected', 'list', filter] as const,
  },
};