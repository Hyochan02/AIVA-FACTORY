// 악기 스템(stem_type) → 한글 라벨
// Editor.tsx(분리 결과 표시)와 StemMixer.tsx(믹서 채널 라벨)에서 공통으로 사용한다.
export const STEM_LABELS: Record<string, string> = {
  vocals: "보컬",
  backing_vocals: "코러스",
  drums: "드럼",
  bass: "베이스",
  guitar: "기타",
  keyboard: "키보드",
  percussion: "퍼커션",
  strings: "현악",
  synth: "신스",
  fx: "이펙트",
  brass: "금관악기",
  woodwinds: "목관악기",
  instrumental: "반주 (전체)",
};

// 믹서 채널 스트립을 항상 일정한 순서로 보여주기 위한 정렬 우선순위
export const STEM_ORDER = Object.keys(STEM_LABELS);

export const stemSortKey = (stemType: string): number => {
  const idx = STEM_ORDER.indexOf(stemType);
  return idx === -1 ? STEM_ORDER.length : idx;
};
