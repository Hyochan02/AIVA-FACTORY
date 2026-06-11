import React from "react";
import { Play, Pause, Download, Volume2, VolumeX, Headphones, Loader2, Save, Check } from "lucide-react";
import { useStemMixer } from "../../hooks/useStemMixer";
import type { Stem } from "../../types/track";

interface StemMixerProps {
  stems: Stem[];
  trackId?: string;
}

const formatTime = (sec: number): string => {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const StemMixer: React.FC<StemMixerProps> = ({ stems, trackId }) => {
  const mixer = useStemMixer(stems, trackId);
  const channelList = Object.values(mixer.channels);
  const anySolo = channelList.some((c) => c.solo);
  const progress = mixer.duration > 0 ? mixer.position / mixer.duration : 0;

  if (channelList.length === 0) return null;

  return (
    <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-black text-white">악기별 믹서</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            트랙별 볼륨·뮤트·솔로를 조절해 나만의 믹스를 만들 수 있습니다. 예를 들어 보컬을
            음소거하면 반주(MR)만 남는 등, 믹서 조절 자체가 곧 분리·편집 기능입니다. 마음에
            드는 믹스는 저장해두거나 파일로 다운로드하세요.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {trackId && (
            <button
              type="button"
              onClick={mixer.saveMix}
              disabled={!mixer.isReady || mixer.isSaving}
              title="현재 볼륨/뮤트/솔로 설정을 저장합니다"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/60 text-xs font-bold text-emerald-300 hover:bg-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mixer.isSaving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : mixer.saveSuccess ? (
                <Check size={13} />
              ) : (
                <Save size={13} />
              )}
              믹스 저장
            </button>
          )}
          <button
            type="button"
            onClick={mixer.downloadMix}
            disabled={!mixer.isReady || mixer.isRendering}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-500/60 text-xs font-bold text-indigo-300 hover:bg-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mixer.isRendering ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            믹스 다운로드
          </button>
        </div>
      </div>

      {/* 재생 컨트롤 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={mixer.togglePlay}
          disabled={!mixer.isReady}
          className="w-9 h-9 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mixer.isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>
        <input
          type="range"
          min={0}
          max={mixer.duration || 0}
          step={0.01}
          value={mixer.position}
          onChange={(e) => mixer.seek(Number(e.target.value))}
          disabled={!mixer.isReady}
          className="flex-1 accent-indigo-500 disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, rgba(129,140,248,0.9) ${progress * 100}%, rgba(129,140,248,0.2) ${progress * 100}%)`,
          }}
        />
        <span className="text-xs text-slate-400 tabular-nums shrink-0 w-20 text-right">
          {formatTime(mixer.position)} / {formatTime(mixer.duration)}
        </span>
      </div>

      {!mixer.isReady && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" /> 스템 오디오를 불러오는 중입니다...
        </p>
      )}

      {/* 채널 스트립 */}
      <div className="space-y-1.5">
        {channelList.map((ch) => {
          const dimmed = ch.muted || (anySolo && !ch.solo);
          return (
            <div
              key={ch.stemType}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-opacity ${
                dimmed ? "bg-navy-800/15 opacity-50" : "bg-navy-800/30"
              }`}
            >
              <div className="w-16 sm:w-20 shrink-0 text-xs font-bold text-slate-200 truncate">
                {ch.label}
              </div>

              {ch.loading ? (
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" /> 로딩중...
                </span>
              ) : ch.error ? (
                <span className="text-xs text-red-400">불러오기 실패</span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => mixer.toggleMute(ch.stemType)}
                    title="음소거"
                    className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center border transition-colors ${
                      ch.muted
                        ? "border-red-500/60 bg-red-900/30 text-red-300"
                        : "border-primary-soft text-slate-400 hover:text-white"
                    }`}
                  >
                    {ch.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => mixer.toggleSolo(ch.stemType)}
                    title="솔로 (이 트랙만 재생)"
                    className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center border transition-colors ${
                      ch.solo
                        ? "border-amber-500/60 bg-amber-900/30 text-amber-300"
                        : "border-primary-soft text-slate-400 hover:text-white"
                    }`}
                  >
                    <Headphones size={13} />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={ch.volume}
                    onChange={(e) => mixer.setVolume(ch.stemType, Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 tabular-nums w-8 text-right shrink-0">
                    {Math.round(ch.volume * 100)}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StemMixer;
