import {
  Play,
  Pause,
  Music2,
  SlidersHorizontal,
  Globe,
  CheckCircle2,
  Download,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/common/Badge";
import { useGetTrending } from "../hooks/queries/useGetTrending";
import { gradColor, formatDuration } from "../utils/format";
import type { Track } from "../types/track";

const BtnPrimary =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/40 transition-all duration-200";
const BtnSecondary =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-md bg-[#0d1340] hover:bg-[#151e58] text-indigo-300 border border-primary-soft transition-all duration-200";
const BtnPrimarySm =
  "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/40 transition-all duration-200";
const BtnGhostSm =
  "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-sm text-slate-400 hover:text-white hover:bg-[#111847] transition-all duration-200";

const FEATURES: { icon: React.ReactNode; title: string; desc: string }[] = [
  {
    icon: <Music2 size={22} />,
    title: "텍스트 → 음악",
    desc: '"잔잔한 피아노 Lo-Fi" 한 줄이면 됩니다. 멜로디부터 마스터링까지 자동.',
  },
  {
    icon: <SlidersHorizontal size={22} />,
    title: "스텝 분리 편집",
    desc: "드럼, 베이스, 보컬, 코드를 독립 트랙으로 받아 자유롭게 리믹스하세요.",
  },
  {
    icon: <Globe size={22} />,
    title: "12개 장르 & 무드 태그",
    desc: "K-Pop, Lo-Fi, City Pop, Synthwave, EDM, Jazz 등 다양한 장르·분위기 태그 조합.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "상업적 이용 가능",
    desc: "Pro 플랜은 유튜브, 광고, 게임, 스트리밍 모두에 자유롭게 사용 가능.",
  },
  {
    icon: <Download size={22} />,
    title: "오디오 다운로드",
    desc: "생성된 트랙을 바로 다운로드하고, 스텝별 분리 파일도 개별로 받을 수 있습니다.",
  },
  {
    icon: <Zap size={22} />,
    title: "2~3분 안에 결과",
    desc: "프롬프트 입력 후 평균 2~3분 내 2개 버전 동시 완성. 마음에 드는 버전을 골라보세요.",
  },
];

const HOW_STEPS = [
  {
    num: 1,
    title: "프롬프트 입력",
    desc: "원하는 음악을 한 문장으로 묘사하거나 장르·무드 칩으로 빠르게 선택.",
  },
  {
    num: 2,
    title: "옵션 설정",
    desc: "장르, 분위기, 악기 태그를 조합하세요. 태그가 사운드 스타일을 결정합니다.",
  },
  {
    num: 3,
    title: "AI 생성",
    desc: "2~3분 안에 2개 버전 완성. 마음에 안 들면 다시 생성하세요.",
  },
  {
    num: 4,
    title: "편집 & 다운로드",
    desc: "에디터에서 스텝 분리 후 믹싱하거나, 바로 오디오 파일을 다운로드하세요.",
  },
];

const PREVIEW_BARS = Array.from({ length: 20 }, () => 30 + Math.random() * 70);

const Landing: React.FC = () => {
  const { data: trendingData } = useGetTrending({ limit: 4 }, true);
  const showcaseTracks = (trendingData?.items ?? []) as (Track & {
    cover_url?: string;
    owner_name?: string;
  })[];

  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])

  const togglePlay = (
    track: Track & { audio_url?: string },
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const url = track.audio_url;
    if (!url) return;

    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audio.onended = () => setPlayingId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingId(track.id);
  };

  return (
    <div className="min-h-screen bg-[#080c2a] text-slate-100">
      {/* Nav */}
      <nav className="sticky top-0 z-20 glass border-b border-primary-soft">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-black text-lg shrink-0"
          >
            <span className="w-8 h-8 rounded-sm bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm shadow-lg shadow-indigo-900/50">
              A
            </span>
            AIVA FACTORY
          </Link>
          <div className="hidden md:flex items-center gap-7 ml-4">
            <a
              href="#features"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              기능
            </a>
            <a
              href="#how"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              사용법
            </a>
            <Link
              to="/explore"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              탐색
            </Link>
            <Link
              to="/pricing"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              요금제
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className={BtnGhostSm}>
              로그인
            </Link>
            <Link to="/signup" className={BtnPrimarySm}>
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 text-center overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-[-0.04em] mb-6">
          한 줄 문장으로
          <br />
          <span className="grad-text">완성된 음악</span>을 만들다
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          텍스트만 입력하면 AIVA FACTORY가 멜로디, 비트, 보컬, 마스터링까지
          한번에 완성합니다. 가입 즉시 100 크레딧 무료.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/signup" className={BtnPrimary}>
            무료로 시작하기
          </Link>
          <Link to="/explore" className={BtnSecondary}>
            샘플 들어보기
          </Link>
        </div>

        {/* 앱 미리보기 */}
        <div className="mt-20 max-w-4xl mx-auto rounded-2xl bg-[#0d1340] border border-primary-soft shadow-2xl overflow-hidden">
          <div className="h-9 bg-[#080c2a] flex items-center gap-2 px-4 border-b border-primary-soft">
            {(["#4338ca", "#312e81", "#1e1b4b"] as const).map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: c }}
              />
            ))}
            <span className="ml-3 text-xs text-slate-500">
              aiva-factory.p-e.kr/create
            </span>
          </div>
          <div className="p-8 grid md:grid-cols-[300px_1fr] gap-6 text-left">
            <div className="bg-[#080c2a] rounded-xl border border-primary-soft p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-300">
                  프롬프트
                </span>
                <Badge variant="info">3 / 5</Badge>
              </div>
              <div className="text-sm text-slate-300 bg-navy-800/60 rounded-lg p-3 leading-relaxed min-h-20">
                "비 오는 도쿄 밤, 시티팝 분위기의 잔잔한 LoFi 트랙. 색소폰
                솔로와 부드러운 신스 패드"
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["Lo-Fi", "City Pop", "색소폰", "신스"].map((c, i) => (
                  <span
                    key={c}
                    className={
                      "px-2 py-0.5 rounded-full text-xs font-semibold border " +
                      (i < 2
                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                        : "border-primary-soft text-slate-400")
                    }
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-[#080c2a] rounded-xl border border-primary-soft p-5 flex flex-col justify-between">
              {[
                {
                  title: "Rainy Tokyo Night · v1",
                  color: "from-indigo-600 to-violet-600",
                  dur: "2:34",
                },
                {
                  title: "Rainy Tokyo Night · v2",
                  color: "from-navy-600 to-indigo-700",
                  dur: "2:41",
                },
              ].map((t) => (
                <div
                  key={t.title}
                  className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/40 border border-primary-soft"
                >
                  <div
                    className={
                      "w-11 h-11 rounded-xl bg-linear-to-br " +
                      t.color +
                      " flex items-center justify-center text-white shrink-0"
                    }
                  >
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">
                      {t.title}
                    </div>
                    <div className="mt-1 flex items-center gap-0.5 h-5">
                      {PREVIEW_BARS.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full bg-indigo-500/40"
                          style={{ height: h + "%" }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">
                    {t.dur}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24" id="features">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black tracking-tight mb-3">
            음악을 <span className="grad-text">단순하게</span>, 결과는 프로답게
          </h2>
          <p className="text-slate-400">
            장르, 무드, 악기 태그를 조합하면 원하는 사운드가 완성됩니다.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title as string}
              className="bg-[#0d1340] border border-primary-soft rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="w-12 h-12 rounded-md bg-indigo-900/50 border border-indigo-700/30 flex items-center justify-center text-indigo-300 mb-5">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#0d1340] py-24" id="how">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black tracking-tight mb-3">
              이렇게 만들어요
            </h2>
            <p className="text-slate-400">
              4단계로 누구나 음악 프로듀서가 됩니다.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_STEPS.map((s) => (
              <div
                key={s.num}
                className="bg-[#080c2a] rounded-2xl p-7 border border-primary-soft"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-black mb-4">
                  {s.num}
                </div>
                <h4 className="font-bold text-white mb-2">{s.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black tracking-tight mb-3">
            이런 음악들이 만들어졌어요
          </h2>
          <p className="text-slate-400">
            실제 유저들이 AIVA FACTORY로 만든 트랙. 클릭해서 들어보세요.
          </p>
        </div>

        {showcaseTracks.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {showcaseTracks.map((t) => (
              <Link
                key={t.id}
                to={`/player/${t.id}`}
                className="group bg-[#0d1340] border border-primary-soft rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-200"
              >
                <div
                  className={`h-36 bg-linear-to-br ${gradColor(t.id)} flex items-center justify-center relative overflow-hidden`}
                >
                  {t.cover_url && (
                    <img
                      src={t.cover_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <Music2
                    size={44}
                    className="relative z-10 text-white opacity-50"
                  />
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <button
                      onClick={(e) => togglePlay(t, e)}
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                      {playingId === t.id ? (
                        <Pause size={20} fill="white" className="text-white" />
                      ) : (
                        <Play
                          size={20}
                          fill="white"
                          className="text-white ml-0.5"
                        />
                      )}
                    </button>
                  </div>
                  {playingId === t.id && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-0.5 z-20">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-white rounded-full animate-bounce"
                          style={{
                            height: `${8 + Math.random() * 12}px`,
                            animationDelay: `${i * 60}ms`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-bold text-sm text-white truncate">
                    {t.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 truncate">
                      {t.genre}
                      {t.owner_name ? ` · @${t.owner_name}` : ""}
                    </span>
                    <span className="ml-auto text-xs text-slate-500 shrink-0">
                      {formatDuration(t.duration)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Midnight Protocol",
                sub: "Synthwave",
                color: "from-indigo-700 to-violet-700",
              },
              {
                title: "Seoul Drift",
                sub: "City Pop",
                color: "from-navy-700 to-indigo-700",
              },
              {
                title: "Neon Bloom",
                sub: "Lo-Fi",
                color: "from-indigo-800 to-navy-600",
              },
              {
                title: "Iron Signal",
                sub: "EDM",
                color: "from-violet-800 to-indigo-900",
              },
            ].map((t) => (
              <div
                key={t.title}
                className="bg-[#0d1340] border border-primary-soft rounded-2xl overflow-hidden"
              >
                <div
                  className={`h-36 bg-linear-to-br ${t.color} flex items-center justify-center`}
                >
                  <Music2 size={44} className="text-white opacity-50" />
                </div>
                <div className="p-4">
                  <div className="font-bold text-sm text-white">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/explore" className={BtnSecondary}>
            더 많은 트랙 보기 →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div
          className="rounded-3xl p-16 text-center relative overflow-hidden"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_50%)]" />
          <div className="relative">
            <h2 className="text-4xl font-black mb-3">
              지금 가입하면 100 크레딧
            </h2>
            <p className="text-indigo-200 mb-8">
              약 25개의 트랙을 무료로 만들어볼 수 있어요. 신용카드 없이
              시작하세요.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-md hover:bg-indigo-50 transition-colors shadow-lg"
            >
              무료로 시작하기 →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-soft py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          <div>
            <div className="flex items-center gap-2.5 font-black text-lg mb-3">
              <span className="w-8 h-8 rounded-sm bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm">
                A
              </span>
              AIVA FACTORY
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              누구나 만드는 AI 음악 플랫폼.
              <br />
              가입 즉시 100 크레딧 무료.
            </p>
          </div>
          {[
            { h: "제품", links: ["기능", "요금제", "업데이트"] },
            { h: "회사", links: ["소개", "문의"] },
            { h: "고객지원", links: ["이용약관", "개인정보처리방침"] },
          ].map((col) => (
            <div key={col.h}>
              <h5 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-3">
                {col.h}
              </h5>
              {col.links.map((l) =>
                col.h === "회사" && l === "소개" ? (
                  <Link
                    key={l}
                    to="/pitch"
                    className="block text-sm text-slate-400 hover:text-white py-1 transition-colors"
                  >
                    {l}
                  </Link>
                ) : (
                  <div key={l} className="text-sm text-slate-400 py-1">
                    {l}
                  </div>
                ),
              )}
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-primary-soft text-xs text-slate-500">
          © 2026 AIVA FACTORY. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
