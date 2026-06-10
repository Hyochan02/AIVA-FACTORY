import {
  Sparkles, Zap, ShieldCheck, Link2, Music2, SlidersHorizontal,
  Library, Users, Coins, Building2, Rocket,
} from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/common/Badge'

/* ── 버튼 스타일 상수 ── */
const BtnPrimary   = 'inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-[14px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/40 transition-all duration-200'
const BtnSecondary = 'inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-[14px] bg-[#0d1340] hover:bg-[#151e58] text-indigo-300 border border-[rgba(129,140,248,0.15)] transition-all duration-200'
const BtnGhostSm   = 'inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-sm text-slate-400 hover:text-white hover:bg-[#111847] transition-all duration-200'

/* ── 데이터 ── */
const VALUE_PROPS = [
  { icon: <Zap size={22} />,        title: '즉시성',  desc: '텍스트 프롬프트 입력 → 약 30~60초 내 2개 버전 동시 생성' },
  { icon: <SlidersHorizontal size={22} />, title: '완결성',  desc: '생성 → 가사/보컬/길이 편집 → 스템 분리 → MP3/WAV 다운로드까지 한 화면에서' },
  { icon: <ShieldCheck size={22} />, title: '안전성',  desc: '악성·유해 프롬프트 필터링으로 안심하고 사용 가능한 콘텐츠 생성' },
  { icon: <Link2 size={22} />,      title: '연결성',  desc: '생성한 음악을 커뮤니티(Explore)에서 탐색·재생·공유' },
]

const CORE_FEATURES = [
  { icon: <Music2 size={20} />,            title: '음악 생성',   desc: '장르·분위기·가사 유무 등 프롬프트 기반 생성 (Suno API 연동)' },
  { icon: <SlidersHorizontal size={20} />, title: '에디터',      desc: '곡 길이 연장(Extend), 가사 재작성, 보컬 분리, 오디오 포맷 변환' },
  { icon: <Library size={20} />,           title: '라이브러리',  desc: '생성한 음악 관리, 즐겨찾기, 재생목록' },
  { icon: <Users size={20} />,             title: '커뮤니티',    desc: '다른 사용자의 작품 탐색(Explore), 좋아요·재생' },
  { icon: <Coins size={20} />,             title: '크레딧/요금제', desc: '무료 100크레딧 + Pro/Enterprise 구독' },
]

const PAIN_POINTS = [
  { title: '비용',    detail: '외주 BGM 1곡 5~50만원, 스톡 음원 월 1~3만원 구독에도 원하는 느낌은 못 찾는 경우 다수' },
  { title: '저작권',  detail: '유튜브 Content ID 매칭 → 수익 미배분·영상 삭제 위험' },
  { title: '속도',    detail: '작곡 의뢰~수령까지 며칠~몇 주, 매일 콘텐츠를 올려야 하는 일정과 불일치' },
  { title: '진입장벽', detail: '음악 이론·악기·DAW 지식 필요, "원하는 음악을 설명"하는 것조차 어려움' },
]

const ENGINE_COMPARISON = [
  ['개발/검증 기간', '모델 학습·튜닝에만 수개월~수년', 'API 연동만으로 즉시 활용, 빠른 MVP 검증'],
  ['비용 구조',     '대규모 GPU 클러스터·데이터셋 필요', '별도 인프라 불필요, API 호출 비용만 발생'],
  ['음질/완성도',   '학습·튜닝 수준에 따라 품질 편차 큼', '이미 검증된 상용 수준 품질 확보'],
  ['자원 배분',     '"음악 모델링"에 자원 집중',         '사용자 경험·편집·커뮤니티·요금제에 집중'],
]

const PERSONAS = [
  {
    name: '민지', age: '24세', role: '숏폼 크리에이터 (유튜브 쇼츠·릴스)',
    need: '저작권 걱정 없는 BGM을 매일 여러 개 빠르게',
    scenario: '영상 컨셉 입력 → 2개 버전 생성 → 톤 맞는 곡 선택 → 영상 길이에 맞춰 Extend → MP3 다운로드 → 업로드',
    value: '외주 비용 0원, 제작 시간 수일 → 수분',
    color: 'from-indigo-600 to-violet-600',
  },
  {
    name: '현우', age: '29세', role: '음악 취미러 (직장인)',
    need: '나만의 음악을 만들어보고 싶지만 악기·이론 지식 없음',
    scenario: '좋아하는 분위기를 텍스트로 묘사 → 가사 자동 생성 → 보컬 포함 곡 생성 → 커뮤니티 공유 → 반응 확인',
    value: '"창작자가 되는 경험"을 가볍게 → 커뮤니티 락인',
    color: 'from-navy-600 to-indigo-700',
  },
  {
    name: '사장님', age: '37세', role: '1인 브랜드·온라인 셀러',
    need: '광고 영상·매장 BGM·브랜드 사운드로고 제작',
    scenario: '브랜드 톤(예: "발랄하고 신뢰감 있는") 입력 → 음악 생성 → 상업적 이용 가능한 요금제로 다운로드',
    value: '외주 사운드 디자인 비용(수십만원) 대비 압도적 절감',
    color: 'from-violet-700 to-indigo-900',
  },
]

const ROI_ROWS = [
  ['월 음원 확보 비용', '5~30만원 (외주 1~수곡 또는 스톡 구독)', '0원(Free) ~ 구독료 수준'],
  ['곡당 제작 시간',   '수일 (외주 의뢰~수령)',                 '약 1분 (생성 + 즉시 편집)'],
  ['저작권 리스크',    '있음 (스톡 음원 라이선스 분쟁 가능성)', '낮음 (상업 이용 라이선스 제공)'],
  ['반복/수정 비용',   '추가 비용 발생',                        '크레딧 내 재생성 가능'],
]

const DIFFERENTIATION = [
  ['Suno/Udio 등 생성 엔진 자체', '한국어 친화 UI + 편집 워크플로우 통합(연장/가사/보컬분리/포맷변환) + 커뮤니티'],
  ['외주 작곡가 / 스톡 음원',     '비용·속도·반복 생성의 자유도, 저작권 부담 최소화'],
  ['단순 AI 음악 생성기',         '생성 → 보관 → 활용 → 공유까지 End-to-End 워크플로우'],
  ['보안/안전성',                 '악성·유해 프롬프트 필터링으로 건전한 커뮤니티 환경 유지'],
]

const B2B_SCENARIOS = [
  ['지자체/관광 마케팅',     '지역 특색 반영 홍보 영상용 음원 대량 생성', '캠페인별 맞춤 음원, 외주 대비 비용·시간 절감'],
  ['IT 스타트업',            '앱 알림음, UX 사운드, 사운드로고 생성',     '브랜드 일관성 있는 사운드 아이덴티티 구축'],
  ['디지털 커머스/광고 대행사', '광고 소재별 배경음악 대량 생산(A/B 테스트)', '소재 다양화 → 광고 효율 개선'],
  ['대기업 ESG/사내 커뮤니케이션', '캠페인송, 사내 행사용 음원',          '제작 비용 절감 + 신속한 대응'],
]

/* ── 공용 컴포넌트 ── */
const SectionHeader: React.FC<{ num: string; title: React.ReactNode; subtitle?: string }> = ({ num, title, subtitle }) => (
  <div className="text-center mb-14">
    <div className="text-xs font-black tracking-[0.3em] text-indigo-400 mb-3">{num}</div>
    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{title}</h2>
    {subtitle && <p className="text-slate-400 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
)

const SimpleTable: React.FC<{ head: string[]; rows: string[][] }> = ({ head, rows }) => (
  <div className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(129,140,248,0.15)]">
            {head.map((h, i) => (
              <th key={i} className={`p-4 font-bold text-white ${i === 0 ? 'text-left' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[rgba(129,140,248,0.1)] last:border-0 hover:bg-navy-800/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`p-4 align-top ${j === 0 ? 'font-bold text-indigo-300 whitespace-nowrap' : 'text-slate-400 leading-relaxed'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const Pitch: React.FC = () => (
  <div className="min-h-screen bg-[#080c2a] text-slate-100">

    {/* Nav */}
    <nav className="sticky top-0 z-20 glass border-b border-[rgba(129,140,248,0.15)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5 font-black text-lg shrink-0">
          <span className="w-8 h-8 rounded-sm bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm shadow-lg shadow-indigo-900/50">A</span>
          AIVA FACTORY
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/" className={BtnGhostSm}>홈으로</Link>
          <Link to="/signup" className={BtnPrimary.replace('px-6 py-3 text-base', 'px-3 py-1.5 text-xs')}>무료로 시작하기</Link>
        </div>
      </div>
    </nav>

    {/* Hero */}
    <section className="relative max-w-5xl mx-auto px-6 py-24 text-center overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
      <Badge variant="new">
        <Sparkles size={11} className="inline mr-1.5 opacity-80" />
        AI비즈니스마케팅 · 발표 자료
      </Badge>
      <h1 className="mt-6 text-4xl md:text-6xl font-black leading-[1.15] tracking-[-0.03em]">
        텍스트 한 줄로 음악을 만드는<br />
        <span className="grad-text">B2C AI 음악 생성 플랫폼</span>
      </h1>
      <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
        AIVA FACTORY는 Suno API를 핵심 엔진으로 삼아, 생성부터 편집·다운로드·커뮤니티 공유까지
        하나의 워크플로우로 통합한 AI 음악 플랫폼입니다.
      </p>
      <p className="mt-2 text-sm text-slate-500">기획배경 · 시장분석 · 솔루션 · 비즈니스모델 · 차별화 · B2B 확장 가능성</p>
    </section>

    {/* 1. 기획배경 + AIVA → Suno 전환 */}
    <section className="bg-[#0d1340] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          num="01 · 기획 배경"
          title={<>왜 <span className="grad-text">"FACTORY(공장)"</span>인가</>}
          subtitle='사용자가 "원재료(텍스트 프롬프트)"를 투입하면 AI가 "완제품(음악·가사·뮤직비디오)"을 만들어내는 자동화된 생산 라인의 이미지를 차용했습니다.'
        />
        <div className="bg-[#080c2a] border border-[rgba(129,140,248,0.15)] rounded-2xl p-8 mb-10">
          <h3 className="font-bold text-white mb-2">⭐ 음악 생성 엔진: 자체 구현 → Suno API 전환</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            기획 초기에는 자체 AI 음악 생성 모델 구축도 검토했지만, 다음과 같은 비즈니스적 이유로
            <strong className="text-indigo-300"> Suno AI API를 핵심 생산 설비</strong>로 도입했습니다.
            많은 AI 서비스 기업이 OpenAI·Suno·ElevenLabs 같은 검증된 API를 조합(API-First / Composable AI)하여
            빠르게 MVP를 출시하고, <strong className="text-indigo-300">사용자 경험·워크플로우·커뮤니티·비즈니스 모델</strong>에서
            경쟁력을 확보하는 전략과 동일합니다.
          </p>
          <SimpleTable head={['구분', '자체 모델 구현', 'Suno API 활용 (현재 방식)']} rows={ENGINE_COMPARISON} />
        </div>
      </div>
    </section>

    {/* 2. 시장 배경 & Pain Points */}
    <section className="max-w-6xl mx-auto px-6 py-24">
      <SectionHeader
        num="02 · 시장 분석"
        title={<>"콘텐츠 퍼스트" 시대,<br />음악만 <span className="grad-text">뒤처진 영역</span></>}
        subtitle="숏폼·라이브커머스·1인 미디어의 폭증으로 콘텐츠 생산 속도가 음악 제작 속도를 추월했습니다. 생성형 AI는 이미 표준 도구가 되었지만, 음악만 진입장벽이 높고 도구가 파편화되어 있습니다."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PAIN_POINTS.map(p => (
          <div key={p.title} className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-200">
            <div className="text-xs font-black tracking-widest text-red-400 mb-2">PAIN POINT</div>
            <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{p.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-[#0d1340] border border-indigo-700/30 rounded-2xl p-6 text-center">
        <p className="text-sm md:text-base text-slate-300">
          핵심 인사이트: 문제는 <span className="text-white font-bold">"음악을 잘 만드는 것"</span>이 아니라,{' '}
          <span className="grad-text font-bold">"원하는 느낌의 음악을 저작권 걱정 없이, 지금 당장, 저비용으로"</span> 얻는 것입니다.
        </p>
      </div>
    </section>

    {/* 3. 솔루션 */}
    <section className="bg-[#0d1340] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          num="03 · 솔루션"
          title={<>AIVA FACTORY의 <span className="grad-text">핵심 가치 제안</span></>}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {VALUE_PROPS.map(v => (
            <div key={v.title} className="bg-[#080c2a] border border-[rgba(129,140,248,0.15)] rounded-2xl p-7">
              <div className="w-12 h-12 rounded-[14px] bg-indigo-900/50 border border-indigo-700/30 flex items-center justify-center text-indigo-300 mb-5">{v.icon}</div>
              <h3 className="text-base font-bold text-white mb-2">{v.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="text-center text-xl font-bold text-white mb-8">핵심 기능 구성</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CORE_FEATURES.map(f => (
            <div key={f.title} className="bg-[#080c2a] border border-[rgba(129,140,248,0.15)] rounded-xl p-5 text-center">
              <div className="w-10 h-10 mx-auto rounded-[12px] bg-indigo-900/50 border border-indigo-700/30 flex items-center justify-center text-indigo-300 mb-3">{f.icon}</div>
              <h4 className="text-sm font-bold text-white mb-1">{f.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* 4. 페르소나 */}
    <section className="max-w-6xl mx-auto px-6 py-24">
      <SectionHeader
        num="04 · 타겟 페르소나"
        title={<>누가 <span className="grad-text">AIVA FACTORY</span>를 쓰는가</>}
        subtitle="B2C 사용자 시나리오 — 콘텐츠 크리에이터, 음악 취미러, 1인 브랜드/소상공인"
      />
      <div className="grid lg:grid-cols-3 gap-6">
        {PERSONAS.map(p => (
          <div key={p.name} className="bg-[#0d1340] border border-[rgba(129,140,248,0.15)] rounded-2xl overflow-hidden">
            <div className={`h-24 bg-linear-to-br ${p.color} flex items-end p-5`}>
              <div>
                <div className="text-white font-black text-lg">{p.name} <span className="font-normal text-sm opacity-80">· {p.age}</span></div>
                <div className="text-white/80 text-xs mt-0.5">{p.role}</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-black tracking-widest text-indigo-400 mb-1">니즈</div>
                <p className="text-sm text-slate-300 leading-relaxed">{p.need}</p>
              </div>
              <div>
                <div className="text-xs font-black tracking-widest text-indigo-400 mb-1">시나리오</div>
                <p className="text-sm text-slate-400 leading-relaxed">{p.scenario}</p>
              </div>
              <div className="pt-3 border-t border-[rgba(129,140,248,0.1)]">
                <div className="text-xs font-black tracking-widest text-emerald-400 mb-1">핵심 가치</div>
                <p className="text-sm text-slate-300 leading-relaxed font-semibold">{p.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* 5. 비즈니스 모델 & ROI */}
    <section className="bg-[#0d1340] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          num="05 · 비즈니스 모델"
          title={<>Freemium + <span className="grad-text">크레딧 시스템</span></>}
          subtitle="가입 즉시 100크레딧 무료 → 사용량 기반 크레딧 소모 → 구독/크레딧 충전 전환"
        />
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {[
            { name: 'Free',       desc: '가입 즉시 100크레딧, MP3 다운로드, 커뮤니티 이용', tag: '체험 → 습관화' },
            { name: 'Pro (구독)', desc: '월 크레딧 대폭 확대, WAV/스템 다운로드, 상업적 이용 라이선스, 우선 처리', tag: '핵심 수익원' },
            { name: 'Enterprise', desc: '무제한 크레딧 + API 접근', tag: 'B2B 확장 연결고리' },
          ].map(p => (
            <div key={p.name} className="bg-[#080c2a] border border-[rgba(129,140,248,0.15)] rounded-2xl p-7">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <Badge variant={p.name === 'Pro (구독)' ? 'new' : 'info'}>{p.tag}</Badge>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="text-center text-xl font-bold text-white mb-2">ROI 비교 (개인 크리에이터 기준, 월간)</h3>
        <p className="text-center text-sm text-slate-500 mb-8">절감 효과: 비용 약 90% 이상, 제작 시간 약 95% 이상 단축 (체감 기준)</p>
        <SimpleTable head={['항목', '기존 방식 (외주/스톡음원)', 'AIVA FACTORY']} rows={ROI_ROWS} />
      </div>
    </section>

    {/* 6. 차별화 */}
    <section className="max-w-6xl mx-auto px-6 py-24">
      <SectionHeader
        num="06 · 차별화"
        title={<>경쟁 구도 속 <span className="grad-text">AIVA FACTORY의 위치</span></>}
      />
      <SimpleTable head={['비교 대상', 'AIVA FACTORY의 차별점']} rows={DIFFERENTIATION} />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Strength',    desc: '생성-편집-배포-커뮤니티 통합 워크플로우, 검증된 Suno AI 엔진', color: 'border-emerald-700/30 text-emerald-400' },
          { label: 'Weakness',    desc: '핵심 AI 엔진을 외부 API(Suno)에 의존, API 비용 구조에 따른 수익성 영향', color: 'border-yellow-700/30 text-yellow-400' },
          { label: 'Opportunity', desc: 'AI 음악 생성 시장 성장, 숏폼 콘텐츠 증가에 따른 배경음악 수요 확대', color: 'border-indigo-700/30 text-indigo-400' },
          { label: 'Threat',      desc: 'Suno·Udio의 자체 커뮤니티/편집 기능 강화, AI 음악 저작권 법적 불확실성', color: 'border-red-700/30 text-red-400' },
        ].map(s => (
          <div key={s.label} className={`bg-[#0d1340] border ${s.color.split(' ')[0]} rounded-2xl p-5`}>
            <div className={`text-xs font-black tracking-widest mb-2 ${s.color.split(' ')[1]}`}>{s.label}</div>
            <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* 7. B2B 확장 */}
    <section className="bg-[#0d1340] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          num="07 · B2B 확장 가능성"
          title={<>B2C에서 <span className="grad-text">B2B SaaS API</span>로</>}
          subtitle="검증된 생성·편집 엔진은 동일한 구조로 기업 대상 API/솔루션으로 확장 가능합니다."
        />
        <SimpleTable head={['대상', '활용 시나리오', '기대 효과']} rows={B2B_SCENARIOS} />
        <div className="mt-8 bg-[#080c2a] border border-indigo-700/30 rounded-2xl p-6 flex items-start gap-4">
          <Building2 size={24} className="text-indigo-400 shrink-0 mt-1" />
          <p className="text-sm text-slate-300 leading-relaxed">
            Enterprise 요금제의 "API 접근" 권한을 기반으로, 기업이 자사 서비스에 AIVA FACTORY의 생성 엔진을
            임베드하는 <strong className="text-indigo-300">B2B SaaS API 모델</strong>로 자연스럽게 연결됩니다.
            B2C에서 쌓은 사용자 데이터와 운영 노하우(필터링, 품질 관리)가 B2B 신뢰도의 근거가 됩니다.
          </p>
        </div>
      </div>
    </section>

    {/* 8. 결론 + 라이브 데모 CTA */}
    <section className="max-w-5xl mx-auto px-6 py-24">
      <div className="rounded-3xl p-16 text-center relative overflow-hidden" style={{ background: 'var(--gradient-brand)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="relative">
          <Rocket size={32} className="mx-auto mb-4 text-white/90" />
          <h2 className="text-3xl md:text-4xl font-black mb-3 text-white">이제, 라이브 데모로 확인하세요</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            지금까지 살펴본 기획배경·시장분석·솔루션·비즈니스모델이 실제 서비스에서
            어떻게 작동하는지 직접 시연합니다 — 음악 생성부터 편집·다운로드·커뮤니티 공유까지.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-[14px] hover:bg-indigo-50 transition-colors shadow-lg">
              서비스 홈으로 이동 →
            </Link>
            <Link to="/explore" className={BtnSecondary + ' bg-white/10 hover:bg-white/20 text-white border-white/20'}>
              커뮤니티 둘러보기
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-[rgba(129,140,248,0.15)] py-10 px-6 text-center">
      <div className="flex items-center justify-center gap-2.5 font-black text-base mb-2">
        <span className="w-7 h-7 rounded-sm bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs">A</span>
        AIVA FACTORY
      </div>
      <p className="text-xs text-slate-500">2026-1 AI비즈니스마케팅 · 진효찬 · © 2026 AIVA FACTORY</p>
    </footer>
  </div>
)

export default Pitch
