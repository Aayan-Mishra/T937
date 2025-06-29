import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { youtubeVideoId, format } = await request.json();

    if (!youtubeVideoId || !format) {
      return NextResponse.json({ error: 'Missing youtubeVideoId or format' }, { status: 400 });
    }

    if (!['mp3', 'mp4'].includes(format)) {
        return NextResponse.json({ error: 'Invalid format specified' }, { status: 400 });
    }

    const cobaltApiUrl = 'https://cobalt.tools/api/json';
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

    const cobaltResponse = await fetch(cobaltApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: youtubeUrl,
        aFormat: 'mp3',
        vQuality: '720',
        isAudioOnly: format === 'mp3',
        isNoTTWatermark: true,
      }),
    });
    
    const data = await cobaltResponse.json();

    if (!cobaltResponse.ok) {
        console.error('Cobalt API Error:', data);
        throw new Error(data.text || 'Failed to get download link from Cobalt API.');
    }

    if (data.status === 'stream' || data.status === 'redirect') {
      return NextResponse.json({ downloadUrl: data.url });
    } else if (data.text) {
      return NextResponse.json({ error: `Cobalt API: ${data.text}` }, { status: 400 });
    } else {
      console.error('Unexpected response from Cobalt:', data);
      return NextResponse.json({ error: `Unexpected status from Cobalt API: ${data.status}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Download proxy error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process download request.' }, { status: 500 });
  }
}
