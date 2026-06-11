import { useCallback, useEffect, useRef, useState } from 'react'
import type { Stem } from '../types/track'
import type { StemConfig } from '../types/editor'
import { STEM_LABELS, stemSortKey } from '../constants/stemLabels'
import { audioBufferToWav } from '../utils/audioBufferToWav'
import { useGetMixSettings } from './queries/useGetMixSettings'
import { useSaveMixSettings } from './mutations/useSaveMixSettings'

export interface MixerChannel {
  stemType: string
  label: string
  buffer: AudioBuffer | null
  volume: number   // 0~1
  muted: boolean
  solo: boolean
  loading: boolean
  error: boolean
}

/**
 * 악기별 스템(track_stems)을 Web Audio API로 동시 재생/믹싱하는 훅.
 *
 * Best Practice 메모 — 왜 <audio> 태그 12개를 그냥 재생하지 않는가?
 * 1) 동기화: <audio> 엘리먼트는 각자 독립적인 재생 시계를 가져서, play()를 동시에 호출해도
 *    네트워크/디코딩 지연 때문에 트랙끼리 미세하게 어긋난다. Web Audio API는 모든 소스를
 *    하나의 AudioContext 시계(currentTime) 기준으로 "같은 시각에 시작"하도록 예약할 수 있다.
 * 2) 실시간 볼륨/뮤트/솔로: GainNode의 gain 값은 재생을 멈추지 않고도 즉시 바꿀 수 있다.
 * 3) 믹스 다운로드: OfflineAudioContext를 쓰면 사용자가 설정한 볼륨/뮤트/솔로 그대로
 *    "오프라인 렌더링"해서 하나의 WAV 파일로 합칠 수 있다. <audio> 태그만으로는 불가능하다.
 *
 * 믹스 저장(trackId 전달 시):
 * - 마운트 시 editor_settings.stem_config에 저장된 이전 볼륨/뮤트/솔로 값을 불러와 채널에 적용한다.
 * - "믹스 저장" 호출 시 현재 채널 상태(volume/muted/solo)를 그대로 서버에 upsert한다.
 *   (오디오 자체가 아니라 "설정값"만 저장하므로 용량이 작고, 원본 스템은 그대로 두면서
 *    재진입 시 동일한 믹스를 즉시 재현할 수 있다.)
 */
export function useStemMixer(stems: Stem[] | undefined, trackId?: string) {
  const ctxRef = useRef<AudioContext | null>(null)
  const sourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map())
  const gainsRef = useRef<Map<string, GainNode>>(new Map())
  const startTimeRef = useRef(0)   // 재생(재개) 시점의 ctx.currentTime
  const offsetRef = useRef(0)      // 재생(재개) 시점의 트랙 내 위치(초)
  const rafRef = useRef<number | null>(null)

  const [channels, setChannels] = useState<Record<string, MixerChannel>>({})
  const channelsRef = useRef(channels)
  channelsRef.current = channels

  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)

  // 저장된 믹스 설정(stem별 volume/muted/solo) 조회 — trackId가 없으면 비활성화
  const { data: savedConfig } = useGetMixSettings(trackId ?? '')
  // 같은 트랙에 대해 저장된 설정을 한 번만 적용하기 위한 가드
  const appliedSavedConfigRef = useRef(false)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctxRef.current = new Ctor()
    }
    return ctxRef.current
  }, [])

  const stopSources = useCallback(() => {
    for (const src of sourcesRef.current.values()) {
      try { src.stop() } catch { /* 이미 정지된 source */ }
      src.disconnect()
    }
    sourcesRef.current.clear()
  }, [])

  // ── 1. stems가 바뀌면 오디오 fetch + decode ──────────────────
  useEffect(() => {
    stopSources()
    setIsPlaying(false)
    setPosition(0)
    offsetRef.current = 0
    appliedSavedConfigRef.current = false // 트랙이 바뀌면 저장된 설정을 다시 적용해야 한다

    if (!stems || stems.length === 0) {
      setChannels({})
      setDuration(0)
      setIsReady(false)
      return
    }

    let cancelled = false
    const ctx = getCtx()

    const sorted = [...stems].sort((a, b) => stemSortKey(a.stem_type) - stemSortKey(b.stem_type))

    setIsReady(false)
    setChannels(() => {
      const next: Record<string, MixerChannel> = {}
      for (const s of sorted) {
        next[s.stem_type] = {
          stemType: s.stem_type,
          label: STEM_LABELS[s.stem_type] ?? s.stem_type,
          buffer: null,
          volume: 1,
          muted: false,
          solo: false,
          loading: true,
          error: false,
        }
      }
      return next
    })
    setDuration(0)

    Promise.all(sorted.map(async (s) => {
      try {
        const res = await fetch(s.audio_url)
        const arr = await res.arrayBuffer()
        const buf = await ctx.decodeAudioData(arr)
        if (cancelled) return
        setChannels(prev => ({ ...prev, [s.stem_type]: { ...prev[s.stem_type], buffer: buf, loading: false } }))
        setDuration(d => Math.max(d, buf.duration))
      } catch {
        if (cancelled) return
        setChannels(prev => ({ ...prev, [s.stem_type]: { ...prev[s.stem_type], loading: false, error: true } }))
      }
    })).then(() => { if (!cancelled) setIsReady(true) })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stems, getCtx, stopSources])

  // ── 1-1. 저장된 믹스 설정 적용 ─────────────────────────────────
  // channels가 채워지고(useEffect 1) savedConfig 조회가 끝나면, 저장된 값이 있는
  // 스템에 한해 volume/muted/solo를 덮어쓴다. 트랙당 한 번만 적용되도록
  // appliedSavedConfigRef로 가드한다(이후 사용자가 직접 조절한 값을 덮어쓰지 않기 위함).
  useEffect(() => {
    if (appliedSavedConfigRef.current) return
    if (!savedConfig || Object.keys(channels).length === 0) return

    appliedSavedConfigRef.current = true
    setChannels(prev => {
      const next = { ...prev }
      for (const [stemType, settings] of Object.entries(savedConfig)) {
        if (!next[stemType]) continue
        next[stemType] = {
          ...next[stemType],
          volume: settings.volume,
          muted: settings.muted,
          solo: settings.solo,
        }
      }
      return next
    })
  }, [channels, savedConfig])

  // 언마운트 시 AudioContext 정리
  useEffect(() => () => {
    stopSources()
    ctxRef.current?.close().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 2. 볼륨/뮤트/솔로 → GainNode에 실시간 반영 ────────────────
  const effectiveGain = useCallback((ch: MixerChannel, anySolo: boolean) => {
    if (ch.muted) return 0
    if (anySolo && !ch.solo) return 0
    return ch.volume
  }, [])

  useEffect(() => {
    const anySolo = Object.values(channels).some(c => c.solo)
    for (const [type, gain] of gainsRef.current) {
      const ch = channels[type]
      if (!ch) continue
      gain.gain.value = effectiveGain(ch, anySolo)
    }
  }, [channels, effectiveGain])

  // ── 3. 재생 / 일시정지 / 탐색 ─────────────────────────────────
  const play = useCallback(() => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    stopSources()

    const current = channelsRef.current
    const anySolo = Object.values(current).some(c => c.solo)
    const now = ctx.currentTime
    const startAt = now + 0.05 // 약간의 여유를 두고 모든 트랙을 같은 시각에 시작

    for (const [type, ch] of Object.entries(current)) {
      if (!ch.buffer) continue
      const src = ctx.createBufferSource()
      src.buffer = ch.buffer

      let gain = gainsRef.current.get(type)
      if (!gain) {
        gain = ctx.createGain()
        gain.connect(ctx.destination)
        gainsRef.current.set(type, gain)
      }
      gain.gain.value = effectiveGain(ch, anySolo)

      src.connect(gain)
      const offset = Math.min(offsetRef.current, ch.buffer.duration)
      src.start(startAt, offset)
      sourcesRef.current.set(type, src)
    }

    startTimeRef.current = startAt
    setIsPlaying(true)
  }, [getCtx, stopSources, effectiveGain])

  const pause = useCallback(() => {
    const ctx = ctxRef.current
    if (ctx) {
      const elapsed = Math.max(0, ctx.currentTime - startTimeRef.current)
      offsetRef.current = Math.min(offsetRef.current + elapsed, duration)
      setPosition(offsetRef.current)
    }
    stopSources()
    setIsPlaying(false)
  }, [stopSources, duration])

  const seek = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(time, duration))
    offsetRef.current = clamped
    setPosition(clamped)
    if (isPlaying) {
      stopSources()
      play()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, isPlaying, stopSources, play])

  const togglePlay = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, pause, play])

  // 재생 위치 업데이트 + 끝까지 재생되면 정지
  useEffect(() => {
    if (!isPlaying) return
    const ctx = ctxRef.current
    if (!ctx) return

    const tick = () => {
      const elapsed = Math.max(0, ctx.currentTime - startTimeRef.current)
      const pos = offsetRef.current + elapsed
      if (pos >= duration) {
        stopSources()
        offsetRef.current = 0
        setPosition(0)
        setIsPlaying(false)
        return
      }
      setPosition(pos)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [isPlaying, duration, stopSources])

  // ── 4. 채널 컨트롤 ────────────────────────────────────────────
  const setVolume = useCallback((stemType: string, volume: number) => {
    setChannels(prev => prev[stemType] ? { ...prev, [stemType]: { ...prev[stemType], volume } } : prev)
  }, [])

  const toggleMute = useCallback((stemType: string) => {
    setChannels(prev => prev[stemType] ? { ...prev, [stemType]: { ...prev[stemType], muted: !prev[stemType].muted } } : prev)
  }, [])

  const toggleSolo = useCallback((stemType: string) => {
    setChannels(prev => prev[stemType] ? { ...prev, [stemType]: { ...prev[stemType], solo: !prev[stemType].solo } } : prev)
  }, [])

  // ── 5. 믹스 다운로드 (OfflineAudioContext) ───────────────────
  const [isRendering, setIsRendering] = useState(false)
  const downloadMix = useCallback(async () => {
    const current = channelsRef.current
    const buffered = Object.values(current).filter(c => c.buffer)
    if (buffered.length === 0 || duration === 0) return

    setIsRendering(true)
    try {
      const sampleRate = buffered[0].buffer!.sampleRate
      const length = Math.ceil(duration * sampleRate)
      const offline = new OfflineAudioContext(2, length, sampleRate)
      const anySolo = buffered.some(c => c.solo)

      for (const ch of buffered) {
        const gainValue = effectiveGain(ch, anySolo)
        if (gainValue <= 0) continue
        const src = offline.createBufferSource()
        src.buffer = ch.buffer!
        const gain = offline.createGain()
        gain.gain.value = gainValue
        src.connect(gain)
        gain.connect(offline.destination)
        src.start(0)
      }

      const rendered = await offline.startRendering()
      const blob = audioBufferToWav(rendered)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'aiva-mix.wav'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setIsRendering(false)
    }
  }, [duration, effectiveGain])

  // ── 6. 믹스 저장 (volume/muted/solo 설정값만 서버에 저장) ────
  const saveMutation = useSaveMixSettings()

  const getMixConfig = useCallback((): StemConfig => {
    const config: StemConfig = {}
    for (const [type, ch] of Object.entries(channelsRef.current)) {
      config[type] = { volume: ch.volume, muted: ch.muted, solo: ch.solo }
    }
    return config
  }, [])

  const saveMix = useCallback(() => {
    if (!trackId) return
    saveMutation.mutate({ trackId, stemConfig: getMixConfig() })
  }, [trackId, getMixConfig, saveMutation])

  return {
    channels,
    isPlaying,
    position,
    duration,
    isReady,
    isRendering,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleSolo,
    downloadMix,
    saveMix,
    isSaving: saveMutation.isPending,
    saveSuccess: saveMutation.isSuccess,
  }
}
