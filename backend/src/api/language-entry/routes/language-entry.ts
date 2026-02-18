export default {
  routes: [
    {
      method: 'GET',
      path: '/language-entries',
      handler: 'language-entry.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/language-entries/:id',
      handler: 'language-entry.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/language-entries',
      handler: 'language-entry.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/language-entries/:id',
      handler: 'language-entry.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/language-entries/:id',
      handler: 'language-entry.delete',
      config: {
        policies: [],
      },
    },
  ],
};
