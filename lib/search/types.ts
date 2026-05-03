export interface SearchDocument {
  slug: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  category?: string;
  date: string;
  summary?: string;
}

export interface SearchResult extends SearchDocument {
  score?: number;
}
