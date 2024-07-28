import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    // Replace this with your actual LLM API call
    const response = await axios.post('https://api.langflow.com/summarize', { text });
    const summary = response.data.summary;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Error generating summary' }, { status: 500 });
  }
}
