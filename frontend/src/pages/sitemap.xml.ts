import type { APIRoute } from 'astro';

const site = 'https://ayoub-hidri.dev';

export const GET: APIRoute = async () => {
  const pages = [
    { url: `${site}/en/`, lastmod: new Date().toISOString().split('T')[0] },
    { url: `${site}/fr/`, lastmod: new Date().toISOString().split('T')[0] },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${site}/en/" />
    <xhtml:link rel="alternate" hreflang="fr" href="${site}/fr/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${site}/en/" />
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
