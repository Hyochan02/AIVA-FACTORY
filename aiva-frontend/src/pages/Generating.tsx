import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Music2, CheckCircle2, XCircle, Piano } from "lucide-react";
import { usePollStatus } from "../hooks/queries/usePollStatus";
import type { TrackVersion } from "../types/generate";
import { Button } from "../components/common/Button";
import { VersionPicker } from "../components/generate/VersionPicker";

const STEP_LABELS: Record<string, string> = {
  pending: "요청 접수 중",
  generating: "오디오 합성 중",
  done: "완료!",
  error: "오류 발생",
};

const Generating: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get("trackId") ?? "";

  const [picked, setPicked] = useState<TrackVersion | null>(null);

  if (!trackId) {
    navigate("/create");
  }

  const { data: status, isError: fetchError } = usePollStatus(trackId, !!trackId);

  const goToPlayer = (version?: TrackVersion) => {
    const vNum = version?.version_num ?? 1;
    navigate(`/player/${trackId}?v=${vNum}`);
  };

  const progress = status?.progress ?? 0;
  const isDone = status?.status === "done";
  const isError = status?.status === "error" || fetchError;
  const versions = status?.versions ?? [];

  return (
    <div className="max-w-lg mx-auto text-center space-y-10 py-8">
      <div className="relative w-32 h-32 mx-auto">
        {!isDone && !isError && (
          <div className="absolute inset-0 rounded-full bg-indigo-600/20 animate-ping" />
        )}
        <div className="absolute inset-3 rounded-full bg-indigo-700/30 animate-pulse" />
        <div
          className={`relative w-full h-full rounded-full flex items-center justify-center shadow-2xl shadow-indigo-900/60 ${
            isDone
              ? "bg-linear-to-br from-green-500 to-emerald-600"
              : isError
                ? "bg-linear-to-br from-red-700 to-rose-800"
                : "bg-linear-to-br from-indigo-600 to-violet-600"
          }`}
        >
          <span className="flex items-center justify-center">
            {isDone ? (
              <CheckCircle2 size={40} className="text-white" />
            ) : isError ? (
              <XCircle size={40} className="text-white" />
            ) : (
              <Music2 size={40} className="text-white" />
            )}
          </span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-black text-white mb-2">
          {isDone
            ? "AI 음악이 완성됐어요!"
            : isError
              ? "생성에 실패했습니다"
              : "AI가 음악을 만들고 있어요"}
        </h1>
        <p className="text-slate-400 text-sm">
          {isDone
            ? "버전을 선택해 플레이어에서 감상하세요"
            : isError
              ? "잠시 후 다시 시도해주세요"
              : (status?.step ?? "잠시만 기다려주세요. 약 30초 소요됩니다.")}
        </p>
      </div>

      {!isDone && !isError && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              {status?.step ?? STEP_LABELS[status?.status ?? "pending"]}
            </span>
            <span className="font-bold text-indigo-400">{progress}%</span>
          </div>
          <div className="h-2 bg-[#0d1340] rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {isDone && versions.length > 0 && (
        <VersionPicker
          versions={versions}
          picked={picked}
          onPick={setPicked}
          onConfirm={goToPlayer}
        />
      )}

      {isDone && versions.length === 0 && (
        <Button variant="primary" size="lg" fullWidth onClick={() => goToPlayer()}>
          플레이어로 이동 →
        </Button>
      )}

      {isError && (
        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => navigate("/create")}
          >
            다시 시도하기
          </Button>
        </div>
      )}

      {!isDone && !isError && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Piano size={12} /> Suno AI 엔진
            </span>
            <span>·</span>
            <span>2개 버전 생성</span>
            <span>·</span>
            <span>크레딧 4개 소모</span>
          </div>
          <button
            onClick={() => navigate("/create")}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            취소하고 돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default Generating;
