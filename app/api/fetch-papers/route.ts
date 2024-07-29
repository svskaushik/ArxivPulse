import { NextResponse } from 'next/server';
import axios from 'axios';
import { parseString } from 'xml2js';
import { Paper } from '../../types';

const PAPERS_PER_PAGE = 10;

async function fetchRelatedPapers(paperId: string): Promise<Paper[]> {
  const response = await axios.get(`http://export.arxiv.org/api/query?id_list=${paperId}&max_results=5`);
  const xmlData = response.data;

  return new Promise((resolve, reject) => {
    parseString(xmlData, (err, result) => {
      if (err) {
        reject(new Error('Error parsing XML'));
      }

      const relatedPapers: Paper[] = result.feed.entry.map((entry: any) => ({
        id: entry.id[0],
        title: entry.title[0],
        link: entry.link.find((link: any) => link.$.rel === 'alternate')?.$.href,
        authors: entry.author.map((author: any) => ({
          name: author.name[0],
          profileUrl: `https://arxiv.org/search/cs?searchtype=author&query=${encodeURIComponent(author.name[0])}`,
        })),
      }));

      resolve(relatedPapers);
    });
  });
}

async function fetchMetrics(arxivId: string, doi: string | null) {
  try {
    const response = await fetch(`/api/fetch-metrics?arxivId=${arxivId}&doi=${doi}`);
    if (!response.ok) {
      console.error('Failed to fetch metrics');
      return { citationCount: 0, altmetric: 0 };
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return { citationCount: 0, altmetric: 0 };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '10', 10);
  const searchTerm = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const category = searchParams.get('category') || 'cs.AI';

  console.log(`Fetching papers: page=${page}, perPage=${perPage}`);

  try {
    let query = `search_query=${category}`;
    if (searchTerm) {
      query += `+AND+all:${searchTerm}`;
    }
    if (startDate) {
      query += `+AND+submittedDate:[${startDate}+TO+${endDate || '*'}]`;
    }

    const start = (page - 1) * PAPERS_PER_PAGE;
    const response = await axios.get(`http://export.arxiv.org/api/query?${query}&sortBy=lastUpdatedDate&sortOrder=descending&start=${start}&max_results=${PAPERS_PER_PAGE}`);
    const xmlData = response.data;

    return new Promise((resolve, reject) => {
      parseString(xmlData, async (err, result) => {
        if (err) {
          reject(new Error('Error parsing XML'));
        }

        const papers = await Promise.all(result.feed.entry.map(async (entry: any) => {
          const paperId = entry.id[0].split('/').pop();
          const doi = entry['arxiv:doi'] ? entry['arxiv:doi'][0] : null;
          const metrics = await fetchMetrics(paperId, doi);

          return {
            id: entry.id[0],
            title: entry.title[0],
            authors: entry.author.map((author: any) => ({
              name: author.name[0],
              profileUrl: `https://arxiv.org/search/cs?searchtype=author&query=${encodeURIComponent(author.name[0])}`,
            })),
            link: entry.link.find((link: any) => link.$.rel === 'alternate')?.$.href,
            pdfLink: `https://arxiv.org/pdf/${paperId}.pdf`,
            summary: '',
            abstract: entry.summary[0],
            categories: entry.category.map((cat: any) => cat.$.term),
            published: entry.published[0],
            updated: entry.updated[0],
            doi: doi,
            relatedPapers: [],
            citationCount: metrics.citationCount,
            altmetric: metrics.altmetric,
            inReadingList: false,
            userRating: 0,
            comments: [],
          };
        }));

        resolve(NextResponse.json(papers));
      });
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json({ error: 'Error fetching papers' }, { status: 500 });
  }
}
