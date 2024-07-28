import { NextResponse } from 'next/server';
import axios from 'axios';
import { parseString } from 'xml2js';
import { Paper, Author } from '../../types';

export async function GET() {
  try {
    const response = await axios.get('http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=lastUpdatedDate&sortOrder=descending&max_results=25');
    const xmlData = response.data;

    return new Promise((resolve, reject) => {
      parseString(xmlData, async (err, result) => {
        if (err) {
          reject(new Error('Error parsing XML'));
        }

        const papers: Paper[] = await Promise.all(result.feed.entry.map(async (entry: any) => {
          const id = entry.id[0].split('/').pop();
          const paper: Paper = {
            id: entry.id[0],
            title: entry.title[0],
            authors: entry.author.map((author: any) => ({
              name: author.name[0],
              profileUrl: `https://arxiv.org/search/cs?searchtype=author&query=${encodeURIComponent(author.name[0])}`,
            })),
            link: entry.link.find((link: any) => link.$.rel === 'alternate')?.$.href,
            pdfLink: `https://arxiv.org/pdf/${id}.pdf`,
            summary: '',
            abstract: entry.summary[0],
            categories: entry.category.map((cat: any) => cat.$.term),
            published: entry.published[0],
            updated: entry.updated[0],
            doi: entry['arxiv:doi'] ? entry['arxiv:doi'][0] : null,
            relatedPapers: [],
            citationCount: 0,
            altmetric: 0,
          };

          // Fetch citation count and altmetric score (placeholder API calls)
          const citationResponse = await axios.get(`https://api.example.com/citations/${id}`);
          paper.citationCount = citationResponse.data.count;

          const altmetricResponse = await axios.get(`https://api.example.com/altmetric/${id}`);
          paper.altmetric = altmetricResponse.data.score;

          // Fetch related papers (placeholder API call)
          const relatedResponse = await axios.get(`https://api.example.com/related/${id}`);
          paper.relatedPapers = relatedResponse.data.papers;

          return paper;
        }));

        resolve(NextResponse.json(papers));
      });
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json({ error: 'Error fetching papers' }, { status: 500 });
  }
}
