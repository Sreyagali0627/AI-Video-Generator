
export function decode(base64: string): Uint8Array {
  // Accept either raw base64 or data URLs like: data:audio/wav;base64,AAAA
  const raw = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryString = atob(raw);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Handle WAV (RIFF) containers: locate 'data' chunk and extract PCM samples
  try {
    const dv = new DataView(data.buffer);
    const isRiff = data.length >= 12 && String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) === 'RIFF';
    let pcmOffset = 0;
    let pcmBytes = data.length;
    let channels = numChannels;
    let rate = sampleRate;

    if (isRiff) {
      channels = dv.getUint16(22, true);
      rate = dv.getUint32(24, true);
      const bitsPerSample = dv.getUint16(34, true);

      // Find 'data' subchunk
      let offset = 12;
      while (offset + 8 <= data.length) {
        const chunkId = String.fromCharCode(dv.getUint8(offset), dv.getUint8(offset + 1), dv.getUint8(offset + 2), dv.getUint8(offset + 3));
        const chunkSize = dv.getUint32(offset + 4, true);
        if (chunkId === 'data') {
          pcmOffset = offset + 8;
          pcmBytes = chunkSize;
          break;
        }
        offset += 8 + chunkSize;
      }
    }

    const pcmSlice = data.subarray(pcmOffset, pcmOffset + pcmBytes);
    const dataInt16 = new Int16Array(pcmSlice.buffer, pcmSlice.byteOffset, Math.floor(pcmSlice.byteLength / 2));
    const frameCount = dataInt16.length / channels;
    const buffer = ctx.createBuffer(channels, frameCount, rate);

    for (let channel = 0; channel < channels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * channels + channel] / 32768.0;
      }
    }
    return buffer;
  } catch (e) {
    // Fallback: naive 16-bit PCM decode
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
