export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface CoverResolution {
  src: string;
  alt: string;
  source: 'frontmatter' | 'first-image' | 'default';
}

export interface PostFrontmatter {
  title: string;
  description: string;
  date: Date;
  updated?: Date;
  tags: string[];
  category?: string;
  draft: boolean;
  featured: boolean;
  author?: string;
  canonical?: string;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
  cover?: string;
  coverAlt?: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  imageCredit?: string;
  ogImage?: string;
}

export interface PageFrontmatter {
  title: string;
  description: string;
  draft: boolean;
  updated?: Date;
}

export interface ProcessedContent {
  html: string;
  excerpt: string;
  text: string;
  headings: Heading[];
}

export interface PostSummary extends PostFrontmatter {
  slug: string;
  url: string;
  excerpt: string;
  coverImage: CoverResolution;
}

export interface Post extends PostSummary, ProcessedContent {
  sourcePath: string;
  content: string;
}

export interface Page extends PageFrontmatter, ProcessedContent {
  slug: string;
  url: string;
  sourcePath: string;
  content: string;
}

export interface SearchIndexEntry {
  slug: string;
  url: string;
  title: string;
  description: string;
  summary: string;
  category?: string;
  tags: string[];
  text: string;
}
