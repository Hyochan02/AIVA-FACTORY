import React, { useState, useEffect, useRef } from "react";
import {
  SlidersHorizontal,
  HardDrive,
  Film,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useSearchParams, useBlocker } from "react-router-dom";
import { Button } from "../components/common/Button";
import { useAuthStore } from "../stores/authStore";
import { getTracks } from "../api/tracks/getTracks";
import { pollWav } from "../api/editor/pollWav";
import { pollVideo } from "../api/editor/pollVideo";
import { useConvertWav } from "../hooks/mutations/useConvertWav";
import { useCreateVideo } from "../hooks/mutations/useCreateVideo";
import { useGetJobHistory } from "../hooks/queries/useGetJobHistory";
import { useGetStems } from "../hooks/queries/useGetStems";
import { useQueryClient } from "@tanstack/react-query";
import { trackTitle } from "../utils/format";
import type { JobHistory } from "../types/editor";
import { JobHistoryPanel } from "../components/editor/JobHistoryPanel";
import { StemMixer } from "../components/editor/StemMixer";

type Tab = "mixer" | "wav" | "video";

interface TrackItem {
  id: string;
  title: string;
  genre?: string;
  status: string;
  version_num?: number;
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
    desc: "트랙별 볼륨·뮤트·솔로를 조절해 즉시 편집하고, 마음에 드는 믹스를 저장합니다",
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
];

const Editor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initTrackId = searchParams.get("trackId") ?? "";
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("mixer");

  const { data: historyData, isLoading: historyLoading } = useGetJobHistory(
    activeTab !== "mixer" ? (activeTab as JobHistory["type"]) : undefined,
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

  const blocker = useBlocker(loading);

  useEffect(() => {
    if (!loading) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [loading]);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { data: stems } = useGetStems(selectedTrackId);

  const { mutate: wavMutate } = useConvertWav();
  const { mutate: videoMutate } = useCreateVideo();

  const [wavUrl, setWavUrl] = useState("");
  const wavPoller = usePoller<{ wavUrl: string }>((id) => pollWav(id), (d) => {
    setWavUrl(d.wavUrl ?? "");
    setLoading(false);
    setSuccessMsg("WAV 변환이 완료되었습니다!");
    refreshHistory();
  });

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

    if (activeTab === "wav") {
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
  const currentCredit = tabInfo.credit;
  const userCredits = user?.credits ?? 0;
  const hasEnoughCredits = activeTab === "mixer" || userCredits >= currentCredit;
  const isPolling =
    (activeTab === "wav" && wavPoller.polling) ||
    (activeTab === "video" && videoPoller.polling);

  return (
    <>
    {blocker.state === "blocked" && (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-8 max-w-sm w-full space-y-5">
          <div>
            <h3 className="font-bold text-white text-lg mb-2">작업 중에 나가시겠어요?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              작업이 진행 중입니다. 지금 페이지를 떠나면 작업이 중단될 수 있습니다.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => blocker.reset()}>
              계속 대기하기
            </Button>
            <button
              onClick={() => blocker.proceed()}
              className="flex-1 py-2 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400 text-sm font-semibold hover:bg-rose-600/30 transition-all"
            >
              지금 나가기
            </button>
          </div>
        </div>
      </div>
    )}
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
              <span className="text-xs opacity-60">({t.credit}크)</span>
            )}
          </button>
        ))}
      </div>

      <div className={`grid gap-6 ${activeTab !== "mixer" ? "lg:grid-cols-3" : ""}`}>
        <div className={`space-y-5 ${activeTab !== "mixer" ? "lg:col-span-2" : ""}`}>
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
                      {trackTitle(t.title, t.version_num)}{t.genre ? ` (${t.genre})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

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

          {activeTab !== "mixer" && (
            <>
              {!hasEnoughCredits && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-900/30 border border-amber-700/40 text-sm text-amber-300">
                  <span>⚠️</span>
                  <span>
                    크레딧이 부족합니다. 현재 <strong>{userCredits}크레딧</strong> 보유 중 /
                    필요 <strong>{currentCredit}크레딧</strong>
                  </span>
                </div>
              )}
              <Button
                variant="primary" size="lg" fullWidth onClick={handleAction}
                disabled={loading || isPolling || !selectedTrackId || !hasEnoughCredits}
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
            </>
          )}
        </div>

        {activeTab !== "mixer" && (
          <div className="space-y-3">
            <JobHistoryPanel
              title={tabInfo.label}
              jobs={jobHistory}
              isLoading={historyLoading}
            />
          </div>
        )}
      </div>

      {((activeTab === "wav" && wavUrl) || (activeTab === "video" && videoUrl)) && (
        <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            결과
          </h3>

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
    </>
  );
};

export default Editor;
