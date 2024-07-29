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

    if (!response.outputs || response.outputs.length === 0) {
      throw new Error('No outputs in response');
    }

    const flowOutputs = response.outputs[0];
    if (!flowOutputs.outputs || flowOutputs.outputs.length === 0) {
      throw new Error('No outputs in flowOutputs');
    }

    const firstComponentOutputs = flowOutputs.outputs[0];
    if (!firstComponentOutputs.outputs || !firstComponentOutputs.outputs.message) {
      throw new Error('Invalid structure in firstComponentOutputs');
    }

    const output = firstComponentOutputs.outputs.message;
    if (typeof output !== 'string') {
      throw new Error('Output is not a string');
    }

    return NextResponse.json({ summary: output });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Error generating summary', details: error.message }, { status: 500 });
  }
}
