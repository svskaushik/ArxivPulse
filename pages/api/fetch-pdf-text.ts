import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import pdf from 'pdf-parse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'PDF URL is required' });
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = await pdf(response.data);
    return res.status(200).json({ text: data.text });
  } catch (error) {
    console.error('Error fetching or parsing PDF:', error);
    return res.status(500).json({ error: 'Error fetching or parsing PDF' });
  }
}
