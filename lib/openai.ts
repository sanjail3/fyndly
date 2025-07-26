import { OpenAIStream, StreamingTextResponse } from 'ai';
import { AzureOpenAI } from 'openai';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiVersion = process.env.AZURE_OPENAI_CHAT_API_VERSION;
const apiKey = process.env.AZURE_OPENAI_API_KEY;

const deployment = "video-gpt"; 

const client = new AzureOpenAI({ 
    endpoint, 
    apiVersion,
    deployment, 
    apiKey:apiKey
});

export async function createStreamingResponse(
  messages: any[],
  functions?: any[],
  functionCall?: 'auto' | 'none' | { name: string }
) {
  try {
    const response = await client.chat.completions.create({
      messages,
      model: deployment,
      temperature: 0.7,
      stream: true,
      functions,
      function_call: functionCall,
    });

    const stream = OpenAIStream(response as any);
    return new StreamingTextResponse(stream);
  } catch (error: unknown) {
    // Silently handle error (removed logs)
  }
}

