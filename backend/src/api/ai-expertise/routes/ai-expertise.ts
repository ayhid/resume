export default {
  routes: [
    {
      method: 'GET',
      path: '/ai-expertises',
      handler: 'ai-expertise.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/ai-expertises/:id',
      handler: 'ai-expertise.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/ai-expertises',
      handler: 'ai-expertise.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/ai-expertises/:id',
      handler: 'ai-expertise.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/ai-expertises/:id',
      handler: 'ai-expertise.delete',
      config: {
        policies: [],
      },
    },
  ],
};
