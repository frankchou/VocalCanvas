import { NextRequest, NextResponse } from 'next/server';
import textToSpeech from '@google-cloud/text-to-speech';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize TTS client with service account
const keyPath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || './gcp-sa-key.json');
const credentials = JSON.parse(readFileSync(keyPath, 'utf-8'));
const client = new textToSpeech.TextToSpeechClient({ credentials });

interface ScriptNode {
  type: 'text' | 'delay';
  value?: string;
  seconds?: number;
}

interface TtsRequest {
  script: ScriptNode[];
  voice: {
    gender: 'male' | 'female';
    age: number;
    pitch: number;
    timbre: number;
    preset: string | null;
  };
  lang: 'zh' | 'en';
}

function scriptToSsml(script: ScriptNode[]): string {
  let ssml = '<speak>';
  for (const node of script) {
    if (node.type === 'text' && node.value) {
      ssml += node.value;
    } else if (node.type === 'delay' && node.seconds) {
      ssml += `<break time="${node.seconds}s"/>`;
    }
  }
  ssml += '</speak>';
  return ssml;
}

function mapVoiceParams(voice: TtsRequest['voice'], lang: string) {
  // pitch: map 0-100 to -10.0 to 10.0 semitones
  const pitch = ((voice.pitch - 50) / 50) * 10;
  // speakingRate: map age 0-100 to 1.3 (young/fast) - 0.7 (old/slow)
  const speakingRate = 1.3 - (voice.age / 100) * 0.6;

  // Voice selection based on gender and language
  const voiceMap: Record<string, Record<string, string>> = {
    zh: { female: 'cmn-TW-Standard-A', male: 'cmn-TW-Standard-B' },
    en: { female: 'en-US-Neural2-F', male: 'en-US-Neural2-D' },
  };

  const languageCode = lang === 'zh' ? 'cmn-TW' : 'en-US';
  const voiceName = voiceMap[lang]?.[voice.gender] || voiceMap.zh.female;

  return { languageCode, voiceName, pitch, speakingRate };
}

export async function POST(request: NextRequest) {
  try {
    const body: TtsRequest = await request.json();
    const { script, voice, lang } = body;

    if (!script || !voice) {
      return NextResponse.json({ error: 'Missing script or voice' }, { status: 400 });
    }

    const ssml = scriptToSsml(script);
    const { languageCode, voiceName, pitch, speakingRate } = mapVoiceParams(voice, lang);

    const [response] = await client.synthesizeSpeech({
      input: { ssml },
      voice: {
        languageCode,
        name: voiceName,
        ssmlGender: voice.gender === 'male' ? 'MALE' : 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch,
        speakingRate,
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    });

    const audioContent = response.audioContent;
    if (!audioContent) {
      return NextResponse.json({ error: 'No audio generated' }, { status: 500 });
    }

    const base64Audio = Buffer.from(audioContent as Uint8Array).toString('base64');
    return NextResponse.json({ audio: base64Audio, format: 'mp3' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[tts] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
