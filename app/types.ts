export interface Paper {
  id: string;
  title: string;
  summary: string;
  abstract: string;
  authors: Author[];
  link: string;
  pdfLink: string;
  categories: string[];
  published: string;
  updated: string;
  doi: string | null;
  relatedPapers: Paper[];
  citationCount: number;
  altmetric: number;
}

export interface Author {
  name: string;
  profileUrl: string;
}
