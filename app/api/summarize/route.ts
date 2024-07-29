import { NextRequest, NextResponse } from 'next/server';
import { LangflowClient } from '../../utils/langflowClient';

const langflowClient = new LangflowClient(process.env.LANGFLOW_API_URL!, process.env.LANGFLOW_API_KEY);

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const flowIdOrName = process.env.LANGFLOW_FLOW_ID!;
    const tweaks = {
      "GoogleGenerativeAIModel-pBSTc": {},
      "TextInput-LERC7": {},
      "TextOutput-U5ntd": {},
      "Prompt-sXSZz": {}
    };

    const response = await langflowClient.runFlow(
      flowIdOrName,
      text,
      tweaks,
      false,
      (data) => console.log("Received:", data.chunk),
      (message) => console.log("Stream Closed:", message),
      (error) => console.log("Stream Error:", error)
    );

    console.log('Full response:', JSON.stringify(response, null, 2));

    let output: string | undefined;

    // Extract the output from the new response structure
    if (response.outputs && response.outputs.length > 0) {
      const firstOutput = response.outputs[0];
      if (firstOutput.outputs && firstOutput.outputs.length > 0) {
        const textOutput = firstOutput.outputs[0];
        if (textOutput.outputs && textOutput.outputs.text && textOutput.outputs.text.message) {
          output = textOutput.outputs.text.message;
        }
      }
    }

    if (!output || typeof output !== 'string') {
      console.error('Unable to find valid output in response');
      return NextResponse.json({ error: 'Invalid response structure' }, { status: 500 });
    }

    return NextResponse.json({ summary: output });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Error generating summary', details: error.message }, { status: 500 });
  }
}
