"use server";
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { AzureOpenAI } from 'openai';



const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiVersion = process.env.AZURE_OPENAI_CHAT_API_VERSION;
const apiKey = process.env.AZURE_OPENAI_API_KEY;

const deployment = "video-gpt"; 


const client_1 = new AzureOpenAI({ 
  endpoint, 
  apiVersion,
  deployment, 
  apiKey:apiKey
});

export async function extractTitleAndSubtitle(messages: any[]): Promise<{ title: string, subtitle: string }> {
  const conversationContent = messages.map(msg => {
    if (typeof msg.content === 'string') return msg.content;
    else if (msg.content.prompt) return msg.content.prompt;
    else return JSON.stringify(msg.content);
  }).join("\n");

  const prompt = `Based on the following conversation, extract a concise title and a descriptive subtitle.
Format your response as follows:
Title: <your title>
Subtitle: <your subtitle>

Conversation:
${conversationContent}`;

  // Log the constructed prompt for debugging purposes.

  const response = await client_1.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful conversation summarizer." },
      { role: "user", content: prompt }
    ],
    model: deployment,
    temperature: 0.7,
    stream: false,
  });

  const content = response.choices?.[0]?.message?.content || "";
  const titleMatch = content.match(/Title:\s*(.*)/i);
  const subtitleMatch = content.match(/Subtitle:\s*(.*)/i);
  const title = titleMatch ? titleMatch[1].trim() : "Chat Conversation";
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : "";
 
  return { title, subtitle };
}