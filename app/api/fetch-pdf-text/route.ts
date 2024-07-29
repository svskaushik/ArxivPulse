import { NextResponse } from 'next/server';
import axios from 'axios';
import pdf from 'pdf-parse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return NextResponse.json({ error: 'PDF URL is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const data = await pdf(response.data);
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Error fetching or parsing PDF:', error);
    return NextResponse.json({ error: 'Error fetching or parsing PDF' }, { status: 500 });
  }
}