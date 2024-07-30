import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import pdf from 'pdf-parse';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  const { paperId, pdfUrl, message } = await request.json();

  if (!paperId || !pdfUrl || !message) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const writeChunk = async (chunk: string) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
  };

  try {
    // Fetch PDF content
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = Buffer.from(response.data);

    // Parse PDF content
    const pdfData = await pdf(pdfBuffer);
    const pdfText = pdfData.text;

    // Use Google's Generative AI to process the message and PDF text
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an AI assistant specialized in scientific papers. Use the following paper content to answer the user's question. If the answer cannot be found in the paper, say so.

Paper content:
${pdfText}

User question: ${message}

Your response:`;

    const result = await model.generateContentStream(prompt);

    (async () => {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        await writeChunk(chunkText);
      }
      await writer.close();
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat with PDF:', error);
    await writeChunk(JSON.stringify({ error: 'Error in chat with PDF', details: error.message }));
    await writer.close();
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
