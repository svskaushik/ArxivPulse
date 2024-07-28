import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { parseString } from 'xml2js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get('http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=lastUpdatedDate&sortOrder=descending&max_results=25');
    const xmlData = response.data;

    parseString(xmlData, (err, result) => {
      if (err) {
        throw new Error('Error parsing XML');
      }

      const papers = result.feed.entry.map((entry: any) => ({
        id: entry.id[0],
        title: entry.title[0],
        authors: entry.author.map((author: any) => author.name[0]),
        link: entry.link.find((link: any) => link.$.rel === 'alternate')?.$.href,
        summary: '',
      }));

      res.status(200).json(papers);
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ error: 'Error fetching papers' });
  }
}
