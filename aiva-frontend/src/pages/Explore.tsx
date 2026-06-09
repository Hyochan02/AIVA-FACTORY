import React, { useState, useMemo } from "react";
import { Music2, Play, Flame, Mic, Search, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/common/Badge";
import { useGetTrending } from "../hooks/queries/useGetTrending";
import { useGetRecent } from "../hooks/queries/useGetRecent";
import { useGetCreators } from "../hooks/queries/useGetCreators";
import { useSearchExplore } from "../hooks/queries/useSearchExplore";
import { usePostLike } from "../hooks/mutations/usePostLike";
import { useDeleteLike } from "../hooks/mutations/useDeleteLike";
import { usePostFollow } from "../hooks/mutations/usePostFollow";
import { useDeleteFollow } from "../hooks/mutations/useDeleteFollow";
import { formatDuration, gradColor } from "../utils/format";
import { useDebounce } from "../hooks/useDebounce";
import { TrackRow } from "../components/tracks/TrackRow";
import { CreatorCard } from "../components/explore/CreatorCard";
import type { Track } from "../types/track";

interface Creator {
  id: string;
  name: string;
  track_count: number;
  followers: number;
  avatar_url?: string;
  is_following: number;
}

const GENRES = [
  "전체",
  "Lo-Fi",
  "City Pop",
  "Ambient",
  "Synthwave",
  "K-Pop",
  "EDM",
  "Jazz",
  "Acoustic",
  "Hip-Hop",
  "Classical",
  "R&B",
  "Drum & Bass",
];

const TrackSkeleton = () => (
  <div className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
    <div className="w-5 h-3 bg-navy-700 rounded shrink-0" />
    <div className="w-11 h-11 rounded-xl bg-navy-700 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-navy-700 rounded w-32" />
      <div className="h-2 bg-navy-800 rounded w-20" />
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden animate-pulse">
    <div className="h-28 bg-navy-700" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-navy-700 rounded w-24" />
      <div className="h-2 bg-navy-800 rounded w-16" />
    </div>
  </div>
);

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [genre, setGenre] = useState("전체");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const activeGenre = genre === "전체" ? undefined : genre;
  const isSearching = debouncedSearch.trim().length > 0;

  const { data: trendingData, isLoading: trendingLoading } = useGetTrending(
    { genre: activeGenre, limit: 5 },
    !isSearching,
  );
  const { data: recentData, isLoading: recentLoading } = useGetRecent(
    { genre: activeGenre, limit: 2 },
    !isSearching,
  );
  const { data: searchData, isLoading: searchLoading } = useSearchExplore(
    debouncedSearch,
    { genre: activeGenre },
  );
  const { data: creatorsData } = useGetCreators(6);

  const { mutate: likeMutate } = usePostLike();
  const { mutate: unlikeMutate } = useDeleteLike();
  const { mutate: followMutate } = usePostFollow();
  const { mutate: unfollowMutate } = useDeleteFollow();

  const trending = trendingData?.items ?? [];
  const recent = recentData?.items ?? [];
  const searchedTracks = searchData?.tracks ?? [];
  const searchedUsers = searchData?.users ?? [];
  const creators = useMemo(
    () => (creatorsData as { items?: Creator[] } | null)?.items ?? [],
    [creatorsData],
  );

  const [likeOverrides, setLikeOverrides] = useState<Record<string, boolean>>(
    {},
  );

  const handleLike = (
    e: React.MouseEvent,
    track: Track & { is_liked?: number },
  ) => {
    e.stopPropagation();
    const currentLiked = likeOverrides[track.id] ?? !!track.is_liked;
    setLikeOverrides((prev) => ({ ...prev, [track.id]: !currentLiked }));
    if (currentLiked) {
      unlikeMutate(track.id, {
        onError: () =>
          setLikeOverrides((prev) => ({ ...prev, [track.id]: currentLiked })),
      });
    } else {
      likeMutate(track.id, {
        onError: () =>
          setLikeOverrides((prev) => ({ ...prev, [track.id]: currentLiked })),
      });
    }
  };

  type FollowOverride = Pick<Creator, "is_following" | "followers">;
  const [overrides, setOverrides] = useState<Record<string, FollowOverride>>(
    {},
  );
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  const localCreators = useMemo(
    () =>
      creators.map((c) =>
        overrides[c.id] ? { ...c, ...overrides[c.id] } : c,
      ),
    [creators, overrides],
  );

  const handleFollow = (creatorId: string) => {
    if (followLoading) return;
    const snapshot = creators.find((c) => c.id === creatorId);
    if (!snapshot) return;
    const current = overrides[creatorId] ?? snapshot;
    const wasFollowing = !!current.is_following;

    setFollowLoading(creatorId);
    setOverrides((prev) => ({
      ...prev,
      [creatorId]: {
        is_following: wasFollowing ? 0 : 1,
        followers: current.followers + (wasFollowing ? -1 : 1),
      },
    }));

    const onError = () => {
      setOverrides((prev) => ({
        ...prev,
        [creatorId]: {
          is_following: wasFollowing ? 1 : 0,
          followers: snapshot.followers,
        },
      }));
    };
    const onSettled = () => setFollowLoading(null);

    if (wasFollowing) {
      unfollowMutate(creatorId, { onError, onSettled });
    } else {
      followMutate(creatorId, { onError, onSettled });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="트랙, 아티스트, 장르 검색..."
          className="flex-1 bg-[#0d1340] border border-(--border-color) rounded-[12px] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${genre === g ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" : "border-(--border-color) text-slate-400 hover:border-indigo-700/40"}`}
          >
            {g}
          </button>
        ))}
      </div>

      {isSearching && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-bold text-white mb-5">
            <Search size={18} className="text-slate-400" /> &quot;
            {debouncedSearch}&quot; 검색 결과
            {!searchLoading && (
              <span className="text-slate-400 font-normal text-sm ml-2">
                ({searchedTracks.length + searchedUsers.length}개)
              </span>
            )}
          </h2>
          {searchLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => <TrackSkeleton key={i} />)
          ) : searchedTracks.length === 0 && searchedUsers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              검색 결과가 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {searchedUsers.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-2 px-1">아티스트</p>
                  <div className="flex flex-col gap-2">
                    {searchedUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl bg-[#080c2a]/60 border border-white/5">
                        <div className={`w-8 h-8 rounded-full bg-linear-to-br ${gradColor(u.id)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {[...u.name][0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-sm text-white">@{u.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {searchedTracks.length > 0 && (
                <div>
                  {searchedUsers.length > 0 && (
                    <p className="text-xs text-slate-500 font-semibold mb-2 px-1">트랙</p>
                  )}
                  <div className="flex flex-col gap-3">
                    {searchedTracks.map((t, i) => (
                      <TrackRow
                        key={t.id}
                        track={t}
                        rank={i + 1}
                        onPlay={() => navigate(`/player/${t.id}`)}
                        isLiked={likeOverrides[t.id] ?? !!(t as Track & { is_liked?: number }).is_liked}
                        onLike={handleLike}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!isSearching && (
        <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-bold text-white mb-5">
            <Flame size={18} className="text-orange-400" /> 트렌딩
          </h2>
          {trendingLoading ? (
            Array(5).fill(0).map((_, i) => <TrackSkeleton key={i} />)
          ) : trending.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              트렌딩 트랙이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {trending.map((t, i) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  rank={i + 1}
                  onPlay={() => navigate(`/player/${t.id}`)}
                  isLiked={likeOverrides[t.id] ?? !!(t as Track & { is_liked?: number }).is_liked}
                  onLike={handleLike}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!isSearching && (
        <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-stretch">
          <div className="flex flex-col">
            <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 flex-1 flex flex-col gap-5">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Radio size={18} className="text-indigo-300" /> 최신 공개 트랙
              </h2>
              {recentLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array(2).fill(0).map((_, i) => <CardSkeleton key={i} />)}
                </div>
              ) : recent.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  최신 트랙이 없습니다.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 content-start">
                  {recent.map((t) => (
                    <div
                      key={t.id}
                      className="bg-[#0d1340] border border-(--border-color) rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-200 group"
                      onClick={() => navigate(`/player/${t.id}`)}
                    >
                      <div className={`h-32 bg-linear-to-br ${gradColor(t.id)} flex items-center justify-center relative`}>
                        <Music2 size={40} className="opacity-60 text-white" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play size={16} fill="white" className="text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-white text-sm truncate mb-2">{t.title}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">{t.genre}</Badge>
                          <span className="ml-auto text-xs text-slate-400 shrink-0">{formatDuration(t.duration)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#0d1340] border border-(--border-color) rounded-2xl p-6 flex flex-col gap-4 flex-1">
              <h2 className="flex items-center gap-2 font-bold text-white">
                <Mic size={18} className="text-indigo-300" /> 인기 크리에이터
              </h2>
              {creators.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  크리에이터 정보를 불러오는 중...
                </p>
              )}
              {localCreators.map((c) => (
                <CreatorCard
                  key={c.id}
                  creator={c}
                  onFollow={handleFollow}
                  isLoading={followLoading === c.id}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
