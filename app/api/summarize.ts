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

    const flowOutputs = response.outputs[0];
    const firstComponentOutputs = flowOutputs.outputs[0];
    const output = firstComponentOutputs.outputs.message;

    return NextResponse.json({ summary: output.message.text });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json({ error: 'Error generating summary' }, { status: 500 });
  }
}
