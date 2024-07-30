import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="paper.pdf"',
      },
    });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return NextResponse.json({ error: 'Error fetching PDF' }, { status: 500 });
  }
}
