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
  userRating?: number;
  comments?: Comment[];
  inReadingList: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Author {
  name: string;
  profileUrl: string;
}

export enum CitationFormat {
  APA = 'APA',
  MLA = 'MLA',
  Chicago = 'Chicago',
  Harvard = 'Harvard',
  IEEE = 'IEEE'
}
