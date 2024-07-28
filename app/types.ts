export interface Paper {
  id: string;
  title: string;
  summary: string;
  abstract: string;
  authors: string[];
  link: string;
  categories: string[];
  published: string;
  updated: string;
  doi: string | null;
}
