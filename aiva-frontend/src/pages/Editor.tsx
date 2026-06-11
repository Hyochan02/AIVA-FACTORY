import React, { useState, useEffect, useRef } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  HardDrive,
  Film,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/common/Button";
import { getTracks } from "../api/tracks/getTracks";
import { pollSeparate } from "../api/editor/pollSeparate";
import { pollWav } from "../api/editor/pollWav";
import { pollVideo } from "../api/editor/pollVideo";
import { useSeparateVocals } from "../hooks/mutations/useSeparateVocals";
import { useConvertWav } from "../hooks/mutations/useConvertWav";
import { useCreateVideo } from "../hooks/mutations/useCreateVideo";
import { useGetJobHistory } from "../hooks/queries/useGetJobHistory";
import { useGetStems } from "../hooks/queries/useGetStems";
import { useQueryClient } from "@tanstack/react-query";
import type { SeparateResult, JobHistory } from "../types/editor";
import { JobHistoryPanel } from "../components/editor/JobHistoryPanel";
import { StemMixer } from "../components/editor/StemMixer";
import { STEM_LABELS } from "../constants/stemLabels";

type Tab = "mixer" | "separate" | "wav" | "video";

interface TrackItem {
  id: string;
  title: string;
  genre?: string;
  status: string;
}

// ── 폴링 훅 ─────────────────────────────────────────────────
function usePoller<T>(
  pollFn: (jobId: string) => Promise<unknown>,
  onDone: (data: T) => void,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const start = (id: string) => {
    setJobId(id);
    setPolling(true);
  };

  useEffect(() => {
    if (!jobId || !polling) return;
    const check = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = (await pollFn(jobId)) as any;
        const data = res.data as { status: string } & T;
        if (data.status === "done") {
          setPolling(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          onDone(data as T);
        }
      } catch {
        /* ignore polling errors */
      }
    };
    check();
    intervalRef.current = setInterval(check, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, polling]);

  return { start, polling };
}

// ──────────────────────────────────────────────────────────
const TAB_INFO: {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  desc: string;
  credit: number;
}[] = [
  {
    id: "mixer",
    label: "믹서 / 편집",
    icon: React.createElement(SlidersHorizontal, { size: 15 }),
    desc: "트랙별 볼륨·뮤트·솔로를 조절해 즉시 편집·분리하고, 마음에 드는 믹스를 저장합니다",
    credit: 0,
  },
  {
    id: "wav",
    label: "WAV 변환",
    icon: React.createElement(HardDrive, { size: 15 }),
    desc: "고음질 WAV 파일로 변환합니다",
    credit: 2,
  },
  {
    id: "video",
    label: "뮤직비디오",
    icon: React.createElement(Film, { size: 15 }),
    desc: "MP4 비디오를 자동 생성합니다",
    credit: 5,
  },
  {
    id: "separate",
    label: "고급 분리 (다시 생성)",
    icon: React.createElement(RefreshCw, { size: 15 }),
    desc: "위 믹서로 부족할 때, 더 많은 악기 조합으로 스템 파일을 새로 생성합니다",
    credit: 10,
  },
];

const Editor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initTrackId = searchParams.get("trackId") ?? "";
  const queryClient = useQueryClient();

  // 기본 탭: 악곡을 선택하면 가장 먼저 "믹서/편집" 탭을 보여준다.
  // 보컬 음소거 = 분리 등, 믹서 조절 자체가 1차 편집 수단이기 때문이다.
  // 나머지(WAV 변환 / 뮤직비디오 / 고급 분리)는 부가 기능 탭으로 배치한다.
  const [activeTab, setActiveTab] = useState<Tab>("mixer");

  // "믹서" 탭은 작업 히스토리가 없는 탭이므로 전체 타입(undefined)을 조회한다.
  const { data: historyData, isLoading: historyLoading } = useGetJobHistory(
    activeTab === "mixer" ? undefined : (activeTab as JobHistory["type"]),
  );
  const jobHistory = historyData?.jobs ?? [];

  const refreshHistory = () => {
    setTimeout(
      () => queryClient.invalidateQueries({ queryKey: ["jobHistory", activeTab] }),
      1000,
    );
  };

  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState(initTrackId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 선택한 트랙의 악기별 스템(자동 분리 결과) — 믹서 UI에 전달
  const { data: stems } = useGetStems(selectedTrackId);

  // ── 뮤테이션 훅 ──
  const { mutate: separateMutate } = useSeparateVocals();
  const { mutate: wavMutate } = useConvertWav();
  const { mutate: videoMutate } = useCreateVideo();

  // ── separate ──
  const [separateType, setSeparateType] = useState<"separate_vocal" | "split_stem">("separate_vocal");
  const [separateResult, setSeparateResult] = useState<SeparateResult | null>(null);
  const separatePoller = usePoller<SeparateResult>((id) => pollSeparate(id), (d) => {
    setSeparateResult(d);
    setLoading(false);
    setSuccessMsg("보컬/악기가 분리되었습니다!");
    refreshHistory();
  });

  // ── wav ───────
  const [wavUrl, setWavUrl] = useState("");
  const wavPoller = usePoller<{ wavUrl: string }>((id) => pollWav(id), (d) => {
    setWavUrl(d.wavUrl ?? "");
    setLoading(false);
    setSuccessMsg("WAV 변환이 완료되었습니다!");
    refreshHistory();
  });

  // ── video ─────
  const [videoUrl, setVideoUrl] = useState("");
  const videoPoller = usePoller<{ videoUrl: string }>((id) => pollVideo(id), (d) => {
    setVideoUrl(d.videoUrl ?? "");
    setLoading(false);
    setSuccessMsg("뮤직비디오가 생성되었습니다!");
    refreshHistory();
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getTracks({ limit: 50 }).then((res: any) => {
      const items: TrackItem[] = (res.data?.items ?? []).filter(
        (t: TrackItem) => t.status === "done",
      );
      setTracks(items);
      if (!selectedTrackId && items.length > 0) setSelectedTrackId(items[0].id);
    }).catch(() => {});
  }, [selectedTrackId]);

  const clearMessages = () => { setError(""); setSuccessMsg(""); };

  const handleAction = () => {
    if (!selectedTrackId) {
      setError("트랙을 선택해주세요.");
      return;
    }
    clearMessages();
    setLoading(true);

    const onError = (err: Error) => {
      setError(err.message || "요청에 실패했습니다.");
      setLoading(false);
    };

    if (activeTab === "separate") {
      setSeparateResult(null);
      separateMutate(
        { trackId: selectedTrackId, type: separateType },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: (data: any) => separatePoller.start(data.jobId),
          onError,
        },
      );
    } else if (activeTab === "wav") {
      wavMutate(
        { trackId: selectedTrackId },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: (data: any) => wavPoller.start(data.jobId),
          onError,
        },
      );
    } else if (activeTab === "video") {
      videoMutate(
        { trackId: selectedTrackId },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: (data: any) => videoPoller.start(data.jobId),
          onError,
        },
      );
    }
  };

  const tabInfo = TAB_INFO.find((t) => t.id === activeTab)!;
  const currentCredit =
    activeTab === "separate" ? (separateType === "split_stem" ? 50 : 10) : tabInfo.credit;
  const isPolling =
    (activeTab === "separate" && separatePoller.polling) ||
    (activeTab === "wav" && wavPoller.polling) ||
    (activeTab === "video" && videoPoller.polling);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TAB_INFO.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); clearMessages(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border transition-all shrink-0 ${
              activeTab === t.id
                ? "bg-indigo-600/20 border-indigo-500/60 text-indigo-300"
                : "border-primary-soft text-slate-400 hover:border-indigo-700/50"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.id !== "mixer" && (
              <span className="text-xs opacity-60">
                ({t.id === "separate" ? "10~50" : t.credit}크)
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-indigo-300">{tabInfo.icon}</span>
              <div>
                <h2 className="text-base font-black text-white">{tabInfo.label}</h2>
                <p className="text-xs text-slate-400">
                  {tabInfo.desc}
                  {activeTab !== "mixer" && ` · 크레딧 ${currentCredit}개 소모`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
            <label className="block text-sm font-bold text-white mb-3">대상 트랙 선택</label>
            {tracks.length === 0 ? (
              <p className="text-slate-500 text-sm">완료된 트랙이 없습니다. 먼저 음악을 생성해주세요.</p>
            ) : (
              <div className="relative">
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className="w-full appearance-none bg-[#080c2a] border border-primary-soft rounded-md px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.genre ? `(${t.genre})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* 악곡을 선택하면 가장 먼저 보여주는 화면.
              생성 완료 시 백엔드가 자동으로 split_stem을 요청해두므로,
              대부분의 경우 트랙 선택 즉시 믹서가 바로 표시된다.
              → 보컬을 음소거하면 반주만 남는 등, "악기 분리"는 별도 기능이 아니라
                이 믹서의 볼륨/뮤트/솔로 조절 자체로 충족된다. 조절한 값은
                "믹스 저장"으로 서버에 보관해 다음에 다시 불러올 수 있다. */}
          {activeTab === "mixer" && (
            stems && stems.length > 0 ? (
              <StemMixer stems={stems} trackId={selectedTrackId} />
            ) : selectedTrackId ? (
              <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5 flex items-center gap-2 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                악기별 스템을 분리하는 중입니다. 완료되면 이 화면에 믹서가 표시됩니다. (최대 1~2분 소요)
              </div>
            ) : (
              <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5 text-sm text-slate-400">
                먼저 위에서 편집할 악곡을 선택해주세요.
              </div>
            )
          )}

          {activeTab === "separate" && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5 space-y-3">
              <label className="block text-sm font-bold text-white mb-2">분리 모드</label>
              {(
                [
                  { value: "separate_vocal", label: "보컬 + 반주 분리", credit: "10크레딧", desc: "2개 파일 반환: 보컬, 반주" },
                  { value: "split_stem", label: "전체 악기 분리", credit: "50크레딧", desc: "최대 12개 파일: 보컬, 드럼, 베이스, 기타, 키보드 등" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value} type="button" onClick={() => setSeparateType(opt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-md border text-left transition-all ${separateType === opt.value ? "border-indigo-500/60 bg-indigo-600/10" : "border-primary-soft hover:border-indigo-700/40"}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${separateType === opt.value ? "border-indigo-400" : "border-slate-600"}`}>
                    {separateType === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {opt.label} <span className="font-normal text-slate-400">({opt.credit})</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "wav" && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
              <p className="text-sm text-slate-400">선택한 트랙을 고음질 WAV 파일로 변환합니다.</p>
              <p className="text-xs text-slate-500 mt-2">WAV 파일은 15일간 보관됩니다</p>
            </div>
          )}

          {activeTab === "video" && (
            <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5">
              <p className="text-sm text-slate-400">선택한 트랙으로 비주얼 이펙트가 포함된 MP4 뮤직비디오를 생성합니다.</p>
              <p className="text-xs text-slate-500 mt-2">생성된 비디오는 15일간 보관됩니다.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">{error}</div>
          )}
          {successMsg && (
            <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-4 text-sm text-green-300">{successMsg}</div>
          )}

          {/* 믹서 탭은 자체 "믹스 저장/다운로드" 버튼을 쓰므로 별도 액션 버튼이 필요 없다 */}
          {activeTab !== "mixer" && (
            <Button
              variant="primary" size="lg" fullWidth onClick={handleAction}
              disabled={loading || isPolling || !selectedTrackId}
            >
              {isPolling ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  처리 중... (완료까지 30~120초)
                </span>
              ) : loading ? "요청 중..." : (
                <span className="flex items-center gap-1.5">
                  {tabInfo.icon} {tabInfo.label} 시작
                </span>
              )}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <JobHistoryPanel
            title={activeTab === "mixer" ? "최근 작업" : tabInfo.label}
            jobs={jobHistory}
            isLoading={historyLoading}
          />
        </div>
      </div>

      {((activeTab === "separate" && separateResult?.status === "done") ||
        (activeTab === "wav" && wavUrl) ||
        (activeTab === "video" && videoUrl)) && (
        <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            결과
          </h3>

          {activeTab === "separate" && separateResult?.status === "done" && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(separateResult.stems ?? {}).map(([stemType, url]) => (
                  <div key={stemType} className="bg-navy-800/30 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-300">{STEM_LABELS[stemType] ?? stemType}</p>
                    <audio controls src={url} className="w-full" />
                  </div>
                ))}
              </div>
              {separateType === "split_stem" && (
                <p className="text-xs text-slate-500">
                  분리된 악기들은 라이브러리의 트랙 상세 → 믹서에서 함께 재생하고 볼륨을 조절할 수 있습니다.
                </p>
              )}
            </div>
          )}

          {activeTab === "wav" && wavUrl && (
            <div className="space-y-3">
              <p className="text-xs text-emerald-400 font-semibold">✓ WAV 변환 완료</p>
              <a href={wavUrl} download className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-indigo-500/60 text-sm font-bold text-indigo-300 hover:bg-indigo-600/20 transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                WAV 파일 다운로드
              </a>
            </div>
          )}

          {activeTab === "video" && videoUrl && (
            <div className="space-y-3">
              <p className="text-xs text-emerald-400 font-semibold">✓ 뮤직비디오 생성 완료</p>
              <video controls src={videoUrl} className="w-full rounded-xl" />
              <a href={videoUrl} download className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                다운로드
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Editor;
