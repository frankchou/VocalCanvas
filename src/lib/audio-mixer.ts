/**
 * Mix TTS speech audio with a BGM track using Web Audio API.
 * Returns a Blob URL of the mixed audio (WAV format).
 *
 * If bgmTrackId is 'none' or bgmVolume is 0, returns a plain Blob URL
 * of the original speech without any decoding/re-encoding overhead.
 */
export async function mixAudioWithBgm(
  speechBlob: Blob,
  bgmTrackId: string,
  bgmVolume: number, // 0-100
): Promise<string> {
  // No mixing needed — return speech as-is
  if (bgmTrackId === 'none' || bgmVolume === 0) {
    return URL.createObjectURL(speechBlob);
  }

  const audioContext = new AudioContext();

  try {
    // Decode speech audio
    const speechArrayBuffer = await speechBlob.arrayBuffer();
    const speechBuffer = await audioContext.decodeAudioData(speechArrayBuffer);

    // Fetch and decode BGM from public folder
    const bgmResponse = await fetch(`/audio/bgm/${bgmTrackId}.mp3`);
    if (!bgmResponse.ok) {
      // BGM fetch failed — fall back to speech-only
      console.warn(`[audio-mixer] BGM fetch failed for "${bgmTrackId}", returning speech only`);
      return URL.createObjectURL(speechBlob);
    }
    const bgmArrayBuffer = await bgmResponse.arrayBuffer();
    const bgmBuffer = await audioContext.decodeAudioData(bgmArrayBuffer);

    // Offline render context — match speech duration & sample rate, stereo output
    const duration = speechBuffer.duration;
    const sampleRate = speechBuffer.sampleRate;
    const offlineContext = new OfflineAudioContext(
      2, // stereo
      Math.ceil(duration * sampleRate),
      sampleRate,
    );

    // Speech source at full volume
    const speechSource = offlineContext.createBufferSource();
    speechSource.buffer = speechBuffer;
    const speechGain = offlineContext.createGain();
    speechGain.gain.value = 1.0;
    speechSource.connect(speechGain);
    speechGain.connect(offlineContext.destination);

    // BGM source at user-controlled volume, looped to cover speech duration
    const bgmSource = offlineContext.createBufferSource();
    bgmSource.buffer = bgmBuffer;
    bgmSource.loop = true;
    const bgmGain = offlineContext.createGain();
    bgmGain.gain.value = bgmVolume / 100;
    bgmSource.connect(bgmGain);
    bgmGain.connect(offlineContext.destination);

    // Start both at time 0
    speechSource.start(0);
    bgmSource.start(0);

    // Render the mix
    const renderedBuffer = await offlineContext.startRendering();

    // Encode to WAV (browsers cannot encode mp3)
    const wavBlob = audioBufferToWav(renderedBuffer);

    return URL.createObjectURL(wavBlob);
  } finally {
    await audioContext.close();
  }
}

// ---------------------------------------------------------------------------
// WAV encoding helpers
// ---------------------------------------------------------------------------

/** Convert an AudioBuffer to a 16-bit PCM WAV Blob. */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length;
  const dataLength = length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // sub-chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Interleaved PCM samples
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
