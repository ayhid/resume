/**
 * Seed script to populate Strapi with resume content from the static HTML.
 * Run with: npx tsx scripts/seed-strapi.ts
 *
 * Requires STRAPI_URL and STRAPI_ADMIN_TOKEN env vars.
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_ADMIN_TOKEN || '';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
};

async function api(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify({ data: body }) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function createLocalized(path: string, enData: Record<string, unknown>, frData: Record<string, unknown>) {
  const enRes = await api(path, 'POST', { ...enData, locale: 'en' });
  const documentId = enRes.data?.documentId;
  if (documentId && frData) {
    await api(`${path}/${documentId}`, 'PUT', { ...frData, locale: 'fr' });
  }
  return enRes;
}

async function createSingleLocalized(path: string, enData: Record<string, unknown>, frData: Record<string, unknown>) {
  await api(path, 'PUT', { ...enData, locale: 'en' });
  await api(path, 'PUT', { ...frData, locale: 'fr' });
}

// ─── Data ────────────────────────────────────────────────────────────

const profile = {
  en: {
    fullName: 'Ayoub Hidri',
    jobTitle: 'Full Stack Engineer',
    bio: '15+ years building innovative solutions with React & TypeScript. I modernize legacy systems, lead technical teams, and deliver complex projects for enterprise clients.',
    email: 'ayoub.hidri@gmail.com',
    phone: '+33605604105',
    location: 'Strasbourg, France',
  },
  fr: {
    fullName: 'Ayoub Hidri',
    jobTitle: 'Ingénieur Full Stack',
    bio: "15+ ans d'expérience en React & TypeScript. Je modernise les systèmes legacy, dirige des équipes techniques et livre des projets complexes pour des clients entreprise.",
    email: 'ayoub.hidri@gmail.com',
    phone: '+33605604105',
    location: 'Strasbourg, France',
  },
};

const socialLinks = [
  { platform: 'email', url: 'mailto:ayoub.hidri@gmail.com', icon: 'email', iconType: 'svg', label: 'ayoub.hidri@gmail.com', order: 0 },
  { platform: 'location', url: '', icon: 'location', iconType: 'svg', label: 'Strasbourg, France', order: 1 },
  { platform: 'linkedin', url: 'https://linkedin.com/in/ayoub-hidri', icon: 'devicon-linkedin-plain', iconType: 'devicon', label: 'LinkedIn', order: 2 },
  { platform: 'github', url: 'https://github.com/ayhid', icon: 'devicon-github-original', iconType: 'devicon', label: 'GitHub', order: 3 },
  { platform: 'github-opkod', url: 'https://github.com/opkod-france', icon: 'devicon-github-original', iconType: 'devicon', label: 'Opkod', order: 4 },
  { platform: 'medium', url: 'https://medium.com/@ayhidr', icon: 'medium', iconType: 'svg', label: 'Medium', order: 5 },
];

const skills = [
  { name: 'React', icon: 'devicon-react-original colored', proficiency: 95, yearsLabel: { en: '10+ years', fr: '10+ ans' }, order: 0 },
  { name: 'TypeScript', icon: 'devicon-typescript-plain colored', proficiency: 90, yearsLabel: { en: '8+ years', fr: '8+ ans' }, order: 1 },
  { name: 'Next.js', icon: 'devicon-nextjs-original', proficiency: 92, yearsLabel: { en: '10+ years', fr: '10+ ans' }, order: 2 },
  { name: 'Node.js', icon: 'devicon-nodejs-plain colored', proficiency: 92, yearsLabel: { en: '12+ years', fr: '12+ ans' }, order: 3 },
  { name: 'NestJS', icon: 'devicon-nestjs-plain colored', proficiency: 85, yearsLabel: { en: '6+ years', fr: '6+ ans' }, order: 4 },
  { name: 'GraphQL', icon: 'devicon-graphql-plain colored', proficiency: 75, yearsLabel: { en: '5+ years', fr: '5+ ans' }, order: 5 },
  { name: 'Docker', icon: 'devicon-docker-plain colored', proficiency: 80, yearsLabel: { en: '7+ years', fr: '7+ ans' }, order: 6 },
  { name: 'AWS', icon: 'devicon-amazonwebservices-original colored', proficiency: 82, yearsLabel: { en: '8+ years', fr: '8+ ans' }, order: 7 },
  { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored', proficiency: 88, yearsLabel: { en: '10+ years', fr: '10+ ans' }, order: 8 },
  { name: 'Strapi', icon: 'devicon-strapi-plain colored', proficiency: 80, yearsLabel: { en: '4+ years', fr: '4+ ans' }, order: 9 },
];

const experiences = [
  {
    en: {
      jobTitle: 'Frontend Developer & E-commerce Specialist',
      company: 'Salomon',
      location: 'Remote',
      dateRange: 'Nov 2024 — Present',
      description: 'Contributing to the global e-commerce platform transformation at Salomon, driving performance optimizations and user experience improvements for millions of customers worldwide.',
      achievements: '<ul><li>Led migration to React Server Components, significantly improving Core Web Vitals and page load times</li><li>Architected wishlist functionality with event-driven state management for seamless cross-session sync</li><li>Spearheaded WCAG accessibility compliance implementation across the platform</li><li>Developed feature flag architecture using Vercel Edge Config for controlled rollouts and A/B testing</li><li>Mentoring 4 junior developers on React/Next.js best practices through code reviews and knowledge sessions</li></ul>',
    },
    fr: {
      jobTitle: 'Développeur Frontend & Spécialiste E-commerce',
      company: 'Salomon',
      location: 'Télétravail',
      dateRange: 'Nov 2024 — Présent',
      description: 'Contribution à la transformation de la plateforme e-commerce mondiale de Salomon, optimisations de performance et améliorations UX pour des millions de clients.',
      achievements: '<ul><li>Migration vers React Server Components, amélioration significative des Core Web Vitals</li><li>Architecture wishlist avec gestion d\'état event-driven pour synchronisation cross-session</li><li>Implémentation conformité WCAG pour l\'accessibilité de la plateforme</li><li>Architecture feature flags avec Vercel Edge Config pour déploiements contrôlés et tests A/B</li><li>Mentorat de 4 développeurs juniors sur les bonnes pratiques React/Next.js</li></ul>',
    },
    techStack: [
      { name: 'React', icon: 'devicon-react-original colored' },
      { name: 'Next.js', icon: 'devicon-nextjs-original' },
      { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
      { name: 'Tailwind', icon: 'devicon-tailwindcss-plain colored' },
      { name: 'Storybook', icon: 'devicon-storybook-plain colored' },
    ],
    order: 0,
  },
  {
    en: {
      jobTitle: 'Senior Frontend Consultant',
      company: 'Leboncoin',
      location: 'Paris',
      dateRange: 'Jun 2022 — Oct 2024',
      description: "Technical lead for post-moderation tooling at France's largest classifieds platform, handling millions of daily listings with a focus on modernization and developer experience.",
      achievements: '<ul><li>Orchestrated legacy codebase modernization with React-Query, implementing optimistic updates for improved UX</li><li>Achieved 100% test coverage combining Jest, React Testing Library, and Cypress E2E tests</li><li>Established automated dependency management with Dependabot, reducing security vulnerabilities</li><li>Built internal developer tooling that reduced onboarding time and standardized practices across squads</li></ul>',
    },
    fr: {
      jobTitle: 'Consultant Frontend Senior',
      company: 'Leboncoin',
      location: 'Paris',
      dateRange: 'Jun 2022 — Oct 2024',
      description: 'Lead technique pour les outils de post-modération de la plus grande plateforme de petites annonces française, traitant des millions d\'annonces quotidiennes.',
      achievements: '<ul><li>Modernisation du code legacy avec React-Query, mises à jour optimistes pour UX améliorée</li><li>100% de couverture de tests avec Jest, React Testing Library et Cypress E2E</li><li>Gestion automatisée des dépendances avec Dependabot, réduction des vulnérabilités</li><li>Outils internes réduisant le temps d\'onboarding et standardisant les pratiques</li></ul>',
    },
    techStack: [
      { name: 'React', icon: 'devicon-react-original colored' },
      { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
      { name: 'Jest', icon: 'devicon-jest-plain colored' },
      { name: 'Cypress', icon: 'devicon-cypressio-plain' },
      { name: 'Storybook', icon: 'devicon-storybook-plain colored' },
      { name: 'Docker', icon: 'devicon-docker-plain colored' },
    ],
    order: 1,
  },
  {
    en: {
      jobTitle: 'FullStack Expert',
      company: 'Deloitte Digital Factory',
      location: 'La Défense',
      dateRange: 'Jan — May 2022',
      description: 'Joined the Digital Factory team to enhance risk management processes within the Deloitte consulting ecosystem, focusing on technical debt reduction and code quality.',
      achievements: '<ul><li>Led critical technical debt initiative, updating and securing dependencies accumulated over years</li><li>Established code quality standards with automated ESLint, Prettier, and Husky pre-commit workflows</li><li>Contributed to microservices decomposition and legacy-to-cloud integration patterns</li></ul>',
    },
    fr: {
      jobTitle: 'Expert FullStack',
      company: 'Deloitte Digital Factory',
      location: 'La Défense',
      dateRange: 'Jan — Mai 2022',
      description: "Intégration de l'équipe Digital Factory pour améliorer les processus de gestion des risques, focus sur la réduction de dette technique et la qualité du code.",
      achievements: '<ul><li>Initiative critique de réduction de dette technique, mise à jour des dépendances critiques</li><li>Standards de qualité avec workflows automatisés ESLint, Prettier et hooks Husky</li><li>Contribution à la décomposition microservices et patterns d\'intégration legacy-cloud</li></ul>',
    },
    techStack: [
      { name: 'React', icon: 'devicon-react-original colored' },
      { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
      { name: 'Docker', icon: 'devicon-docker-plain colored' },
      { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' },
      { name: 'NestJS', icon: 'devicon-nestjs-plain colored' },
      { name: 'Next.js', icon: 'devicon-nextjs-original' },
      { name: 'Cypress', icon: 'devicon-cypressio-plain' },
    ],
    order: 2,
  },
  {
    en: {
      jobTitle: 'FullStack/JAMstack Expert',
      company: 'Engie Digital',
      location: 'Paris',
      dateRange: 'Mar — Dec 2021',
      description: 'Developed a comprehensive mobile operator platform enabling field technicians to perform complex operations on energy infrastructure with offline-first capabilities.',
      achievements: '<ul><li>Built NFC-enabled PWAs for field technicians with offline mode and automatic sync on reconnection</li><li>Pioneered company-wide Renovate adoption, creating custom presets deployed across dozens of repos</li><li>Architected serverless microservices on AWS Lambda with SNS/SQS event-driven patterns</li><li>Designed PostgreSQL schema with PostGIS for efficient geospatial operations</li></ul>',
    },
    fr: {
      jobTitle: 'Expert FullStack/JAMstack',
      company: 'Engie Digital',
      location: 'Paris',
      dateRange: 'Mar — Déc 2021',
      description: "Développement d'une plateforme opérateur mobile permettant aux techniciens terrain d'effectuer des opérations complexes sur l'infrastructure énergétique avec capacités offline-first.",
      achievements: '<ul><li>PWAs NFC pour techniciens terrain avec mode hors ligne et synchronisation automatique</li><li>Adoption entreprise de Renovate, presets personnalisés déployés sur des dizaines de repos</li><li>Microservices serverless AWS Lambda avec patterns event-driven SNS/SQS</li><li>Schéma PostgreSQL avec PostGIS pour opérations géospatiales</li></ul>',
    },
    techStack: [
      { name: 'React', icon: 'devicon-react-original colored' },
      { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
      { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored' },
      { name: 'AWS', icon: 'devicon-amazonwebservices-original colored' },
      { name: 'NestJS', icon: 'devicon-nestjs-plain colored' },
      { name: 'Okta', icon: '' },
      { name: 'Lambda', icon: '' },
      { name: 'Terraform', icon: 'devicon-terraform-plain colored' },
    ],
    order: 3,
  },
  {
    en: {
      jobTitle: 'Technical Director & Architect',
      company: 'Isobar (Dentsu Group)',
      location: 'Courbevoie',
      dateRange: 'Jul 2017 — Feb 2021',
      description: 'Cross-functional technical leadership role working directly with the CTO and COO on strategic initiatives, pioneering modern architectures and mentoring senior developers across the agency.',
      achievements: '<ul><li>Pioneered Headless CMS adoption across 3 major accounts, improving content delivery and editorial flexibility</li><li>Collaborated with creative teams to architect MVPs/POCs translating concepts into production solutions</li><li><strong>MMA/COVEA:</strong> Built OCR insurance document processing system automating claims handling</li><li><strong>Technip Energies:</strong> Delivered headless platform unifying content across digital touchpoints</li></ul>',
    },
    fr: {
      jobTitle: 'Directeur Technique & Architecte',
      company: 'Isobar (Groupe Dentsu)',
      location: 'Courbevoie',
      dateRange: 'Jul 2017 — Fév 2021',
      description: 'Leadership technique transversal travaillant directement avec CTO et COO sur initiatives stratégiques, pionnier des architectures modernes et mentorat des développeurs seniors.',
      achievements: '<ul><li>Adoption Headless CMS sur 3 grands comptes, amélioration livraison contenu et flexibilité éditoriale</li><li>Collaboration équipes créatives pour MVPs/POCs traduisant concepts en solutions production</li><li><strong>MMA/COVEA :</strong> Système OCR traitement documents assurance automatisant les sinistres</li><li><strong>Technip Energies :</strong> Plateforme headless unifiant le contenu multi-touchpoints</li></ul>',
    },
    techStack: [
      { name: 'React', icon: 'devicon-react-original colored' },
      { name: 'Next.js', icon: 'devicon-nextjs-original' },
      { name: 'GraphQL', icon: 'devicon-graphql-plain colored' },
      { name: 'NestJS', icon: 'devicon-nestjs-plain colored' },
      { name: 'Strapi', icon: 'devicon-strapi-plain colored' },
      { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' },
      { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored' },
      { name: 'MySQL', icon: 'devicon-mysql-plain colored' },
      { name: 'AWS', icon: 'devicon-amazonwebservices-original colored' },
      { name: 'Azure', icon: 'devicon-azure-plain colored' },
      { name: 'Lambda', icon: '' },
      { name: 'TensorFlow', icon: 'devicon-tensorflow-original colored' },
      { name: 'Ansible', icon: 'devicon-ansible-plain' },
      { name: 'Docker', icon: 'devicon-docker-plain colored' },
    ],
    order: 4,
  },
  {
    en: {
      jobTitle: 'Technical Leader & Architect',
      company: 'Cleanio',
      location: 'Paris',
      dateRange: 'Apr 2015 — May 2017',
      description: 'Architected the complete technical ecosystem for an innovative dry cleaning startup, from customer-facing apps to backend infrastructure and delivery operations.',
      achievements: '<ul><li>Designed microservices architecture replacing the monolith, enabling independent scaling of services</li><li>Established CI/CD pipelines with CircleCI and AWS, implementing blue-green zero-downtime deployments</li><li>Built real-time tracking systems and driver mobile app optimizing route planning and workflows</li></ul>',
    },
    fr: {
      jobTitle: 'Leader Technique & Architecte',
      company: 'Cleanio',
      location: 'Paris',
      dateRange: 'Avr 2015 — Mai 2017',
      description: "Architecture de l'écosystème technique complet pour une startup innovante de pressing, des applications client à l'infrastructure backend et opérations de livraison.",
      achievements: '<ul><li>Architecture microservices remplaçant le monolithe, scaling indépendant des services</li><li>Pipelines CI/CD avec CircleCI et AWS, déploiements blue-green sans interruption</li><li>Systèmes de tracking temps réel et app mobile chauffeur optimisant les workflows</li></ul>',
    },
    techStack: [
      { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
      { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' },
      { name: 'CircleCI', icon: 'devicon-circleci-plain' },
      { name: 'AWS', icon: 'devicon-amazonwebservices-original colored' },
      { name: 'DigitalOcean', icon: 'devicon-digitalocean-plain colored' },
      { name: 'Microservices', icon: '' },
      { name: 'Routific', icon: '' },
    ],
    order: 5,
  },
  {
    en: {
      jobTitle: 'Lead Developer & Web Architect',
      company: 'Business & Decision',
      location: 'Tunis/Paris',
      dateRange: 'Nov 2011 — Mar 2015',
      description: 'Enterprise consulting and systems integration for major automotive and e-commerce clients, leading distributed teams and delivering complex technical solutions.',
      achievements: '<ul><li><strong>Peugeot (16 months):</strong> Led 10-person agile team building dealer management systems with SAP integration. Created custom personalization engine using MongoDB for dynamic website experiences</li><li><strong>Citroën (13 months):</strong> Developed content personalization engine adapting UX based on user behavior and location</li><li><strong>Kayoo.com:</strong> Managed distributed teams across 3 countries, ensuring quality standards across deliverables</li></ul>',
    },
    fr: {
      jobTitle: 'Développeur Principal & Architecte Web',
      company: 'Business & Decision',
      location: 'Tunis/Paris',
      dateRange: 'Nov 2011 — Mar 2015',
      description: "Conseil entreprise et intégration de systèmes pour clients majeurs automobile et e-commerce, direction d'équipes distribuées et livraison de solutions techniques complexes.",
      achievements: '<ul><li><strong>Peugeot (16 mois) :</strong> Direction équipe agile de 10 personnes, systèmes gestion concessionnaires avec SAP</li><li><strong>Citroën (13 mois) :</strong> Moteur de personnalisation contenu adaptant UX selon comportement et localisation</li><li><strong>Kayoo.com :</strong> Gestion équipes distribuées sur 3 pays, standards qualité sur tous les livrables</li></ul>',
    },
    techStack: [
      { name: 'Symfony', icon: 'devicon-symfony-original' },
      { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' },
      { name: 'Redis', icon: 'devicon-redis-plain colored' },
      { name: 'Zend Framework', icon: '' },
      { name: 'MySQL', icon: 'devicon-mysql-plain colored' },
      { name: 'Doctrine', icon: 'devicon-doctrine-plain colored' },
      { name: 'Clean Architecture', icon: '' },
      { name: 'Grunt', icon: 'devicon-grunt-plain colored' },
    ],
    order: 6,
  },
  {
    en: {
      jobTitle: 'Software Engineer',
      company: 'DigitalMania Studios',
      location: 'Tunis',
      dateRange: 'Nov 2009 — Aug 2011',
      description: "Joined Tunisia's first independent game development studio, working on diverse projects spanning web development and game engineering in a creative startup environment.",
      achievements: '<ul><li>Developed complete Peugeot intranet and document management system with complex approval workflows</li><li>Created custom Drupal modules extending CMS capabilities for client-specific requirements</li><li>Built Unity 3D plugins enabling unique gameplay mechanics for the studio\'s game projects</li></ul>',
    },
    fr: {
      jobTitle: 'Ingénieur Logiciel',
      company: 'DigitalMania Studios',
      location: 'Tunis',
      dateRange: 'Nov 2009 — Août 2011',
      description: "Premier studio de jeux indépendant de Tunisie, projets diversifiés couvrant développement web et ingénierie de jeux dans un environnement startup créatif.",
      achievements: "<ul><li>Intranet Peugeot complet et système de gestion documentaire avec workflows d'approbation</li><li>Modules Drupal personnalisés étendant les capacités CMS pour besoins clients</li><li>Plugins Unity 3D permettant des mécaniques de gameplay uniques</li></ul>",
    },
    techStack: [
      { name: 'Drupal', icon: 'devicon-drupal-plain colored' },
      { name: 'Unity 3D', icon: 'devicon-unity-original' },
      { name: 'PHP', icon: 'devicon-php-plain colored' },
      { name: 'Facebook API', icon: 'devicon-facebook-plain colored' },
      { name: 'Symfony 1', icon: 'devicon-symfony-original' },
      { name: 'CakePHP', icon: 'devicon-cakephp-plain colored' },
      { name: 'C#', icon: 'devicon-csharp-plain colored' },
    ],
    order: 7,
  },
];

const education = {
  en: { degree: 'Software Engineering', school: 'ESPRIT', year: '2010', distinction: 'Graduated with Excellent Distinction' },
  fr: { degree: 'Génie Logiciel', school: 'ESPRIT', year: '2010', distinction: 'Mention Très Bien' },
};

const languages = [
  { en: { name: 'French', proficiency: 'Native' }, fr: { name: 'Français', proficiency: 'Natif' }, order: 0 },
  { en: { name: 'English', proficiency: 'Fluent' }, fr: { name: 'Anglais', proficiency: 'Courant' }, order: 1 },
  { en: { name: 'Arabic', proficiency: 'Native' }, fr: { name: 'Arabe', proficiency: 'Natif' }, order: 2 },
];

const interests = [
  { en: { name: '3D Printing' }, fr: { name: 'Impression 3D' }, order: 0 },
  { en: { name: 'Drums' }, fr: { name: 'Batterie' }, order: 1 },
  { en: { name: 'Bike Touring' }, fr: { name: 'Cyclotourisme' }, order: 2 },
  { en: { name: 'Miniatures' }, fr: { name: 'Figurines' }, order: 3 },
];

const aiExpertise = [
  {
    en: { title: 'AI Agent Development', description: 'Claude SDK, custom skills & plugins' },
    fr: { title: "Développement d'Agents IA", description: 'Claude SDK, skills & plugins custom' },
    order: 0,
  },
  {
    en: { title: 'AI-Assisted Development', description: 'Orchestrating AI workflows & tooling' },
    fr: { title: 'Développement Assisté par IA', description: 'Orchestration workflows & outils IA' },
    order: 1,
  },
  {
    en: { title: 'LLM Integration', description: 'Building AI-powered applications' },
    fr: { title: 'Intégration LLM', description: "Applications alimentées par l'IA" },
    order: 2,
  },
];

const ctaSection = {
  en: {
    heading: "Let's Build Something Great",
    description: "Looking for an experienced Full Stack Engineer? I'm available for consulting, freelance projects, and technical leadership roles.",
  },
  fr: {
    heading: 'Construisons Quelque Chose de Grand',
    description: 'Vous cherchez un Ingénieur Full Stack expérimenté ? Je suis disponible pour du conseil, des projets freelance et des rôles de leadership technique.',
  },
  buttons: [
    { label: { en: 'Get in Touch', fr: 'Me Contacter' }, url: 'mailto:ayoub.hidri@gmail.com', style: 'primary', iconType: 'email' },
    { label: { en: 'Schedule a Call', fr: 'Planifier un Appel' }, url: 'https://calendly.com/schedule-ayoub-hidri', style: 'outline', iconType: 'calendar' },
  ],
};

const siteSettings = {
  en: {
    siteTitle: 'Ayoub Hidri - Full Stack Engineer | React/TypeScript Expert',
    siteDescription: 'Experienced Full Stack Engineer specializing in React JS/TypeScript with 15+ years in software development.',
    siteUrl: 'https://ayoub-hidri.dev',
    mixpanelToken: '6ab50e9f9dc05acc32db6699ba9349be',
    keywords: 'Full Stack Engineer, React Developer, TypeScript, JavaScript, Node.js, Frontend Developer, Backend Developer, Software Engineer, Freelance Developer',
  },
  fr: {
    siteTitle: 'Ayoub Hidri - Ingénieur Full Stack | Expert React/TypeScript',
    siteDescription: "Ingénieur Full Stack expérimenté spécialisé en React JS/TypeScript avec plus de 15 ans d'expérience.",
    siteUrl: 'https://ayoub-hidri.dev',
    mixpanelToken: '6ab50e9f9dc05acc32db6699ba9349be',
    keywords: 'Ingénieur Full Stack, Développeur React, TypeScript, JavaScript, Node.js, Développeur Frontend, Développeur Backend, Ingénieur Logiciel, Freelance',
  },
};

// ─── Seed Runner ─────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding Strapi...\n');

  // 1. Profile (single type)
  console.log('→ Resume Profile');
  await createSingleLocalized('/resume-profiles', profile.en, profile.fr);

  // 2. Social Links (not localized)
  console.log('→ Social Links');
  for (const link of socialLinks) {
    await api('/social-links', 'POST', link);
  }

  // 3. Skills (localized)
  console.log('→ Skills');
  for (const skill of skills) {
    const { yearsLabel, ...rest } = skill;
    await createLocalized('/skills', { ...rest, yearsLabel: yearsLabel.en }, { ...rest, yearsLabel: yearsLabel.fr });
  }

  // 4. Experiences (localized with components)
  console.log('→ Experiences');
  for (const exp of experiences) {
    await createLocalized(
      '/experiences',
      { ...exp.en, techStack: exp.techStack, order: exp.order },
      { ...exp.fr, techStack: exp.techStack, order: exp.order }
    );
  }

  // 5. Education (localized)
  console.log('→ Education');
  await createLocalized('/educations', { ...education.en, order: 0 }, { ...education.fr, order: 0 });

  // 6. Languages (localized)
  console.log('→ Languages');
  for (const lang of languages) {
    await createLocalized('/language-entries', { ...lang.en, order: lang.order }, { ...lang.fr, order: lang.order });
  }

  // 7. Interests (localized)
  console.log('→ Interests');
  for (const interest of interests) {
    await createLocalized('/interests', { ...interest.en, order: interest.order }, { ...interest.fr, order: interest.order });
  }

  // 8. AI Expertise (localized)
  console.log('→ AI Expertise');
  for (const ai of aiExpertise) {
    await createLocalized('/ai-expertises', { ...ai.en, order: ai.order }, { ...ai.fr, order: ai.order });
  }

  // 9. CTA Section (single type, localized)
  console.log('→ CTA Section');
  await createSingleLocalized(
    '/cta-sections',
    { heading: ctaSection.en.heading, description: ctaSection.en.description, buttons: ctaSection.buttons.map(b => ({ label: b.label.en, url: b.url, style: b.style, iconType: b.iconType })) },
    { heading: ctaSection.fr.heading, description: ctaSection.fr.description, buttons: ctaSection.buttons.map(b => ({ label: b.label.fr, url: b.url, style: b.style, iconType: b.iconType })) }
  );

  // 10. Site Settings (single type, localized)
  console.log('→ Site Settings');
  await createSingleLocalized('/site-settings', siteSettings.en, siteSettings.fr);

  console.log('\n✅ Seeding complete!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
