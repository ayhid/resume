export interface StrapiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

export interface ResumeProfile {
  id: number;
  documentId: string;
  fullName: string;
  jobTitle: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
}

export interface SocialLink {
  id: number;
  documentId: string;
  platform: string;
  url: string;
  icon: string;
  iconType: 'devicon' | 'svg' | 'none';
  label: string;
  order: number;
}

export interface Skill {
  id: number;
  documentId: string;
  name: string;
  icon: string;
  proficiency: number;
  yearsLabel: string;
  category: string;
  order: number;
}

export interface TechBadge {
  id: number;
  name: string;
  icon: string;
}

export interface Experience {
  id: number;
  documentId: string;
  jobTitle: string;
  company: string;
  location: string;
  dateRange: string;
  description: string;
  achievements: string;
  techStack: TechBadge[];
  order: number;
}

export interface Education {
  id: number;
  documentId: string;
  degree: string;
  school: string;
  year: string;
  distinction: string;
  order: number;
}

export interface LanguageEntry {
  id: number;
  documentId: string;
  name: string;
  proficiency: string;
  order: number;
}

export interface Interest {
  id: number;
  documentId: string;
  name: string;
  order: number;
}

export interface AiExpertise {
  id: number;
  documentId: string;
  title: string;
  description: string;
  order: number;
}

export interface CtaButton {
  id: number;
  label: string;
  url: string;
  style: 'primary' | 'outline';
  iconType: 'email' | 'calendar' | 'none';
}

export interface CtaSection {
  id: number;
  documentId: string;
  heading: string;
  description: string;
  buttons: CtaButton[];
}

export interface SiteSetting {
  id: number;
  documentId: string;
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  mixpanelToken: string;
  keywords: string;
}

export type Locale = 'en' | 'fr';
