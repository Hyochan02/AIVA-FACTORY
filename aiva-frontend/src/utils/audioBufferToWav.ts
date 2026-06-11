/**
 * AudioBuffer → WAV(PCM 16bit) Blob 변환
 *
 * 왜 필요한가?
 * - OfflineAudioContext.startRendering()의 결과는 "AudioBuffer"라는 메모리상의 PCM 데이터일 뿐,
 *   브라우저가 이를 바로 파일로 저장해주는 API는 없다.
 * - 가장 간단하고 호환성이 좋은 방법은 표준 WAV(RIFF) 헤더를 직접 작성해
 *   16비트 정수 PCM 데이터를 붙이는 것 — 별도 라이브러리 없이 40줄 내외로 구현 가능하다.
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const numFrames = buffer.length
  const bytesPerSample = 2 // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample
  const dataSize = numFrames * blockAlign
  const headerSize = 44
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  // RIFF 청크
  writeString(0, 'RIFF')
  view.setUint32(4, headerSize + dataSize - 8, true)
  writeString(8, 'WAVE')

  // fmt 청크 (PCM 포맷 정보)
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)               // 서브청크 크기 (PCM = 16)
  view.setUint16(20, 1, true)                // 오디오 포맷: 1 = PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true) // byte rate
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)      // bits per sample

  // data 청크
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  // 채널별 Float32 샘플(-1~1)을 인터리빙하며 16비트 정수로 변환
  const channelData: Float32Array[] = []
  for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch))

  let offset = headerSize
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}
