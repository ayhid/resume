export default {
  routes: [
    {
      method: 'GET',
      path: '/contact-submissions',
      handler: 'contact-submission.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/contact-submissions/:id',
      handler: 'contact-submission.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/contact-submissions',
      handler: 'contact-submission.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/contact-submissions/:id',
      handler: 'contact-submission.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/contact-submissions/:id',
      handler: 'contact-submission.delete',
      config: {
        policies: [],
      },
    },
  ],
};
