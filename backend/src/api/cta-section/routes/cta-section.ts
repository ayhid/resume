export default {
  routes: [
    {
      method: 'GET',
      path: '/cta-sections',
      handler: 'cta-section.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/cta-sections',
      handler: 'cta-section.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/cta-sections',
      handler: 'cta-section.delete',
      config: {
        policies: [],
      },
    },
  ],
};
