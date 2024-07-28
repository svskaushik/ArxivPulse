import { NextResponse } from 'next/server';
import axios from 'axios';
import { parseString } from 'xml2js';

export async function GET() {
  try {
    const response = await axios.get('http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=lastUpdatedDate&sortOrder=descending&max_results=25');
    const xmlData = response.data;

    return new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) {
          reject(new Error('Error parsing XML'));
        }

        const papers = result.feed.entry.map((entry: any) => ({
          id: entry.id[0],
          title: entry.title[0],
          authors: entry.author.map((author: any) => author.name[0]),
          link: entry.link.find((link: any) => link.$.rel === 'alternate')?.$.href,
          summary: entry.summary[0],
          abstract: entry.summary[0],
          categories: entry.category.map((cat: any) => cat.$.term),
          published: entry.published[0],
          updated: entry.updated[0],
          doi: entry['arxiv:doi'] ? entry['arxiv:doi'][0] : null,
        }));

        resolve(NextResponse.json(papers));
      });
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    return NextResponse.json({ error: 'Error fetching papers' }, { status: 500 });
  }
}
