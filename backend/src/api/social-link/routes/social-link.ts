export default {
  routes: [
    {
      method: 'GET',
      path: '/social-links',
      handler: 'social-link.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/social-links/:id',
      handler: 'social-link.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/social-links',
      handler: 'social-link.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/social-links/:id',
      handler: 'social-link.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/social-links/:id',
      handler: 'social-link.delete',
      config: {
        policies: [],
      },
    },
  ],
};
