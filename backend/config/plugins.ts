export default ({ env }) => ({
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'en',
      locales: ['en', 'fr'],
    },
  },
  email: {
    config: {
      provider: env('EMAIL_PROVIDER', 'nodemailer'),
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USER'),
          pass: env('SMTP_PASS'),
        },
      },
      settings: {
        defaultFrom: env('EMAIL_FROM', 'noreply@ayoub-hidri.dev'),
        defaultReplyTo: env('EMAIL_REPLY_TO', 'ayoub.hidri@gmail.com'),
      },
    },
  },
});
