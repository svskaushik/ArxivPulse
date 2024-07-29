import { NextRequest, NextResponse } from 'next/server';
import { LangflowClient } from '../../utils/langflowClient';

const langflowClient = new LangflowClient(process.env.LANGFLOW_API_URL!, process.env.LANGFLOW_API_KEY);

export async function POST(request: NextRequest) {
  const { paperId, pdfUrl, message } = await request.json();

  if (!paperId || !pdfUrl || !message) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const flowIdOrName = process.env.LANGFLOW_CHAT_FLOW_ID!;
    const tweaks = {
      "TextInput-LERC7": { "value": message },
      "TextInput-PDF": { "value": pdfUrl }
    };

    const response = await langflowClient.runFlow(
      flowIdOrName,
      message,
      tweaks,
      false,
      (data) => console.log("Received:", data.chunk),
      (message) => console.log("Stream Closed:", message),
      (error) => console.log("Stream Error:", error)
    );

    let output: string | undefined;

    if (response.outputs && response.outputs.length > 0) {
      const firstOutput = response.outputs[0];
      if (firstOutput.outputs && firstOutput.outputs.length > 0) {
        const messageOutput = firstOutput.outputs[0];
        if (messageOutput.artifacts.message) {
          output = messageOutput.artifacts.message;
        }
      }
    }

    if (!output || typeof output !== 'string') {
      console.error('Unable to find valid output in response');
      return NextResponse.json({ error: 'Invalid response structure' }, { status: 500 });
    }

    return NextResponse.json({ response: output });
  } catch (error) {
    console.error('Error in chat with PDF:', error);
    return NextResponse.json({ error: 'Error in chat with PDF', details: error.message }, { status: 500 });
  }
}
