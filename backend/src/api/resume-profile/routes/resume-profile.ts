export default {
  routes: [
    {
      method: 'GET',
      path: '/resume-profiles',
      handler: 'resume-profile.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/resume-profiles',
      handler: 'resume-profile.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/resume-profiles',
      handler: 'resume-profile.delete',
      config: {
        policies: [],
      },
    },
  ],
};
