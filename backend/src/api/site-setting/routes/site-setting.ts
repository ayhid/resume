export default {
  routes: [
    {
      method: 'GET',
      path: '/site-settings',
      handler: 'site-setting.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/site-settings',
      handler: 'site-setting.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/site-settings',
      handler: 'site-setting.delete',
      config: {
        policies: [],
      },
    },
  ],
};
