import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, model_id, voice_settings } = await request.json();

    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    if (!apiKey) {
      console.error('API key is undefined');
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        text,
        model_id,
        voice_settings,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API Error: ${response.status} - ${errorBody}`);
      return NextResponse.json({ error: `Failed to convert text to speech: ${errorBody}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
