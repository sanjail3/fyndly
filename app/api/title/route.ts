import { NextResponse } from 'next/server';
import { extractTitleAndSubtitle } from '@/lib/title';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages payload' }, { status: 400 });
    }
    const result = await extractTitleAndSubtitle(messages);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error extracting title and subtitle:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 