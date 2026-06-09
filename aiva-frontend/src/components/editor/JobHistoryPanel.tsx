import React from 'react'
import { Music2, FileText, Mic, HardDrive, Film } from 'lucide-react'
import { formatDate } from '../../utils/format'
import type { JobHistory } from '../../types/editor'

const TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  extend:   { label: '음악 연장',  color: 'text-violet-300',  icon: <Music2 size={13} /> },
  lyrics:   { label: '가사 생성',  color: 'text-blue-300',    icon: <FileText size={13} /> },
  separate: { label: '보컬 분리',  color: 'text-pink-300',    icon: <Mic size={13} /> },
  wav:      { label: 'WAV 변환',   color: 'text-emerald-300', icon: <HardDrive size={13} /> },
  video:    { label: '뮤직비디오', color: 'text-orange-300',  icon: <Film size={13} /> },
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-400 animate-pulse',
  done:    'bg-emerald-400',
  error:   'bg-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  pending: '처리 중',
  done:    '완료',
  error:   '오류',
}

interface JobHistoryPanelProps {
  title: string
  jobs: JobHistory[]
  isLoading: boolean
}

export const JobHistoryPanel: React.FC<JobHistoryPanelProps> = ({
  title,
  jobs,
  isLoading,
}) => (
  <div className="bg-[#0d1340] border border-primary-soft rounded-2xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-white flex items-center gap-2 text-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-300">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {title} 히스토리
      </h3>
      {jobs.length > 0 && (
        <span className="text-xs text-slate-500">{jobs.length}건</span>
      )}
    </div>

    {isLoading && (
      <div className="space-y-2">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-14 bg-navy-800/40 rounded-xl animate-pulse" />
        ))}
      </div>
    )}

    {!isLoading && jobs.length === 0 && (
      <div className="flex flex-col items-center gap-1.5 py-8 text-slate-600">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-center">{title} 기록이 없습니다</p>
      </div>
    )}

    {!isLoading && jobs.length > 0 && (
      <div className="flex flex-col gap-1.5 max-h-105 overflow-y-auto pr-1">
        {jobs.map((job) => {
          const meta = TYPE_META[job.type] ?? { label: job.type, color: 'text-slate-300', icon: null }
          return (
            <div key={job.id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-navy-800/50 transition-colors group">
              <span className={`shrink-0 ${meta.color}`}>{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[job.status] ?? 'bg-slate-400'}`} />
                  <span className="text-[10px] text-slate-500">{STATUS_LABEL[job.status] ?? job.status}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{job.track_title ?? '—'}</p>
                <p className="text-[10px] text-slate-600">{formatDate(job.created_at)}</p>
              </div>
              {job.result_url && (
                <a
                  href={job.result_url}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-indigo-300 transition-opacity shrink-0"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </a>
              )}
            </div>
          )
        })}
      </div>
    )}
  </div>
)
