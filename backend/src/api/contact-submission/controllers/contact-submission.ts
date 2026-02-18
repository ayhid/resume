import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::contact-submission.contact-submission', ({ strapi }) => ({
  async create(ctx) {
    // Call the default create
    const response = await super.create(ctx);

    // Send email notification
    const { name, email, subject, message, locale } = ctx.request.body?.data || {};

    try {
      await strapi.plugins['email']?.services.email.send({
        to: process.env.EMAIL_REPLY_TO || 'ayoub.hidri@gmail.com',
        subject: `[Resume Contact] ${subject || 'New message'}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Locale:</strong> ${locale || 'unknown'}</p>
          <hr>
          <p>${(message || '').replace(/\n/g, '<br>')}</p>
        `,
      });
    } catch (err) {
      strapi.log.error('Failed to send contact notification email:', err);
    }

    return response;
  },
}));
