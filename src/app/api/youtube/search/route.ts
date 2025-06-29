
import { NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const video = await YouTube.searchOne(query, 'video');

    if (!video || !video.id) {
      return NextResponse.json({ error: 'No video found' }, { status: 404 });
    }

    return NextResponse.json({ videoId: video.id });
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
