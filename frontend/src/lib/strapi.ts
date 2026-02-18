import type {
  StrapiResponse,
  StrapiCollectionResponse,
  ResumeProfile,
  SocialLink,
  Skill,
  Experience,
  Education,
  LanguageEntry,
  Interest,
  AiExpertise,
  CtaSection,
  SiteSetting,
  Locale,
} from './types';

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN || '';

async function fetchAPI<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`/api${path}`, STRAPI_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: STRAPI_API_TOKEN
      ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      : {},
  });

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} for ${path}`);
  }

  return res.json();
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export async function getProfile(locale: Locale): Promise<ResumeProfile> {
  const res = await fetchAPI<StrapiResponse<ResumeProfile>>('/resume-profiles', { locale });
  return res.data;
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  const res = await fetchAPI<StrapiCollectionResponse<SocialLink>>('/social-links', {
    'sort[0]': 'order:asc',
    'pagination[pageSize]': '100',
  });
  return sortByOrder(res.data);
}

export async function getSkills(locale: Locale): Promise<Skill[]> {
  const res = await fetchAPI<StrapiCollectionResponse<Skill>>('/skills', {
    locale,
    'sort[0]': 'order:asc',
    'pagination[pageSize]': '100',
  });
  return sortByOrder(res.data);
}

export async function getExperiences(locale: Locale): Promise<Experience[]> {
  const res = await fetchAPI<StrapiCollectionResponse<Experience>>('/experiences', {
    locale,
    'sort[0]': 'order:asc',
    'pagination[pageSize]': '100',
    'populate[techStack]': '*',
  });
  return sortByOrder(res.data);
}

export async function getEducation(locale: Locale): Promise<Education[]> {
  const res = await fetchAPI<StrapiCollectionResponse<Education>>('/educations', {
    locale,
    'sort[0]': 'order:asc',
    'pagination[pageSize]': '100',
  });
  return sortByOrder(res.data);
}

export async function getLanguages(locale: Locale): Promise<LanguageEntry[]> {
  const res = await fetchAPI<StrapiCollectionResponse<LanguageEntry>>('/language-entries', {
    locale,
    'sort[0]': 'order:asc',
    'pagination[pageSize]': '100',
  });
  return sortByOrder(res.data);
}

export async function getInterests(locale: Locale): Promise<Interest[]> {
  const res = await fetchAPI<StrapiCollectionResponse<Interest>>('/interests', {
    locale,
    'sort[0]': 'order:asc',
    'pagination[pageSize]': '100',
  });
  return sortByOrder(res.data);
}

export async function getAiExpertise(locale: Locale): Promise<AiExpertise[]> {
  const res = await fetchAPI<StrapiCollectionResponse<AiExpertise>>('/ai-expertises', {
    locale,
    'sort[0]': 'order:asc',
    'pagination[pageSize]': '100',
  });
  return sortByOrder(res.data);
}

export async function getCtaSection(locale: Locale): Promise<CtaSection> {
  const res = await fetchAPI<StrapiResponse<CtaSection>>('/cta-sections', {
    locale,
    'populate[buttons]': '*',
  });
  return res.data;
}

export async function getSiteSettings(locale: Locale): Promise<SiteSetting> {
  const res = await fetchAPI<StrapiResponse<SiteSetting>>('/site-settings', { locale });
  return res.data;
}
