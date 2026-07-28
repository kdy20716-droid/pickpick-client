import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import "./VotePage.css";

import favoriteIcon from "../assets/favorite.svg";
import reportIcon from "../assets/report.svg";
import commentIcon from "../assets/comment.svg";
import shareIcon from "../assets/share.svg";
import filterIcon from "../assets/filter.svg";

import Comments from "../components/Comments.jsx";
import Report from "../components/Report.jsx";
import { VoteCard } from "./vote/VoteElements.jsx";
import { isMainRouteTransition } from "./animations/routeTransitions.js";
import { useActiveVoteCard } from "./vote/useActiveVoteCard.js";
import { useActiveVoteHash } from "./vote/useActiveVoteHash.js";
import { useVotePageScrollSnap } from "./vote/useVotePageScrollSnap.js";
import { getVoteFeedIdFromHash, getVoteHash } from "./vote/voteCards.js";
import { updateCardActionState } from "./vote/voteUtils.js";
import { useVoteState } from "../hooks/useVoteState.js";
import { useFetchVotes } from "../hooks/useFetchVotes.js";
import { useAuth } from "../contexts/AuthContext";
import { submitVote, toggleLike, incrementView } from "../api/posts.js";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const TAGS = [
  "전체", "연예", "음식", "애니메이션", "동물", "스포츠", "일상", "게임", "음악",
  "영화 / 드라마", "웹툰 / 웹소설", "유튜버 / 스트리머", "밸런스 게임", "밈", "기타",
];

const ACTION_BUTTONS = [
  { id: "like",    label: "좋아요", icon: favoriteIcon, kind: "toggle" },
  { id: "comment", label: "댓글",   icon: commentIcon,  kind: "modal"  },
  { id: "share",   label: "공유",   icon: shareIcon,    kind: "button" },
  { id: "report",  label: "신고",   icon: reportIcon,   kind: "button" },
];

// 공통 토스트 스타일 (중복 제거)
const TOAST_STYLE = {
  background: "rgba(24, 24, 28, 0.95)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "99px",
  padding: "12px 22px",
  fontSize: "0.92rem",
  fontWeight: 500,
  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
  fontFamily: "inherit",
};

const showToast = (message) =>
  toast(message, { duration: 3000, position: "bottom-center", style: TOAST_STYLE });

// ─── URL 유틸 ─────────────────────────────────────────────────────────────────

function getTargetVoteId(routePostId, search, hash) {
  const params = new URLSearchParams(search);
  const candidates = [
    routePostId,
    params.get("post"),
    params.get("postId"),
    params.get("vote"),
    params.get("voteId"),
    params.get("id"),
    getVoteFeedIdFromHash(hash),
  ];
  return candidates.find((c) => typeof c === "string" && c.trim().length > 0)?.trim() ?? "";
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function VotePage() {
  const location = useLocation();
  const { postId: routePostId } = useParams();
  const { user: currentUser, isLoggedIn } = useAuth();
  const userId = currentUser?.id || "guest";

  const targetVoteId = useMemo(
    () => getTargetVoteId(routePostId, location.search, location.hash),
    [routePostId, location.search, location.hash],
  );
  const entersFromMain = isMainRouteTransition(location.state?.transition);

  // ── 상태 ──
  const [selectedTag, setSelectedTag] = useState("전체");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [commentCardId, setCommentCardId] = useState("");
  const [reportCardId, setReportCardId] = useState("");
  const [copiedCardId, setCopiedCardId] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // ── Custom Hooks ──
  const { selectedVotes, setSelectedVotes, cardActions, setCardActions } =
    useVoteState(userId);

  const { cards, setCards, isVotesLoading, votesError, fetchVotes } =
    useFetchVotes({
      selectedTag,
      isLoggedIn,
      currentUserId: currentUser?.id,
      targetVoteId,
    });

  // ── Refs ──
  const pageRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  // ── 카드 활성화 / 스크롤 ──
  const { activeCardId, cardRefs, feedRef, registerCardRef } =
    useActiveVoteCard(cards, targetVoteId);

  useVotePageScrollSnap({ pageRef, feedRef, activeCardId, cardRefs, targetCardId: targetVoteId });
  useActiveVoteHash(activeCardId, location);

  // ── Effects ──

  // 1초마다 현재 시각 갱신 (마감 카운트다운용)
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // 활성 카드 조회수 증가
  useEffect(() => {
    if (activeCardId) {
      const card = cards.find((c) => c.feedId === activeCardId);
      if (card) incrementView(card.id).catch(console.error);
    }
  }, [activeCardId, cards]);

  // 투표 목록 불러오기 (태그/로그인 상태 변경 시 재실행)
  useEffect(() => {
    fetchVotes((serverVotes, serverActions) => {
      setSelectedVotes((prev) => ({ ...prev, ...serverVotes }));
      setCardActions((prev) => ({ ...prev, ...serverActions }));
    });
  }, [fetchVotes]);

  // 댓글 모달 열려 있을 때 스크롤 시 자동 닫기
  useEffect(() => {
    if (!commentCardId || !feedRef.current) return;
    const feed = feedRef.current;
    let canClose = false;
    const frameId = requestAnimationFrame(() => { canClose = true; });
    const handleScroll = () => { if (canClose) setCommentCardId(""); };
    feed.addEventListener("scroll", handleScroll, { passive: true });
    return () => { cancelAnimationFrame(frameId); feed.removeEventListener("scroll", handleScroll); };
  }, [commentCardId, feedRef]);

  // ── 이벤트 핸들러 ──

  const handleVote = useCallback(async (cardId, candidateId) => {
    const card = cards.find((c) => c.feedId === cardId);
    if (!card) return;

    // 마감 투표 차단
    const expiresAtTime = card.expiresAt ? new Date(card.expiresAt).getTime() : NaN;
    if (Number.isFinite(expiresAtTime) && expiresAtTime <= Date.now()) {
      showToast("마감된 투표입니다.");
      return;
    }

    // 이미 투표한 경우
    if (selectedVotes[cardId]) {
      showToast("이미 투표된 페이지입니다.");
      return;
    }

    // 비회원 처리
    if (userId === "guest") {
      setSelectedVotes((prev) => ({ ...prev, [cardId]: candidateId }));
      showToast("비회원 투표는 투표에 반영되지 않습니다.");
      return;
    }

    // 낙관적 업데이트
    setSelectedVotes((prev) => ({ ...prev, [cardId]: candidateId }));

    try {
      const res = await submitVote(card.id, userId, candidateId.toUpperCase());
      if (res.success) {
        const total = res.counts.candidate_a_count + res.counts.candidate_b_count;
        setCards((prev) =>
          prev.map((c) =>
            c.feedId === cardId
              ? {
                  ...c,
                  shares: {
                    left: total === 0 ? 50 : Math.round((res.counts.candidate_a_count / total) * 100),
                    right: total === 0 ? 50 : Math.round((res.counts.candidate_b_count / total) * 100),
                  },
                }
              : c,
          ),
        );
      } else {
        throw new Error("Vote failed");
      }
    } catch (err) {
      // 실패 시 낙관적 업데이트 롤백
      setSelectedVotes((prev) => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
      alert(err.response?.data?.message || "투표 처리에 실패했습니다.");
    }
  }, [userId, cards, selectedVotes, setCards, setSelectedVotes]);

  const handleToggleAction = useCallback(async (cardId, actionId) => {
    const card = cards.find((c) => c.feedId === cardId);
    if (!card) return;

    if (actionId === "like") {
      if (userId === "guest") return alert("로그인이 필요합니다.");

      const currentLiked = !!cardActions[cardId]?.like;
      const nextLiked = !currentLiked;

      // 낙관적 업데이트
      setCardActions((prev) =>
        updateCardActionState(prev, cardId, "like", {
          like: nextLiked,
          likeCount: (prev[cardId]?.likeCount || 0) + (nextLiked ? 1 : -1),
        }),
      );

      try {
        const res = await toggleLike(card.id, userId, nextLiked);
        if (res.success) {
          setCardActions((prev) =>
            updateCardActionState(prev, cardId, "like", {
              like: !!res.liked,
              likeCount: Number(res?.like_count ?? res?.likes ?? prev[cardId]?.likeCount),
            }),
          );
        }
      } catch {
        // 롤백
        setCardActions((prev) =>
          updateCardActionState(prev, cardId, "like", {
            like: currentLiked,
            likeCount: (prev[cardId]?.likeCount || 0) + (currentLiked ? 1 : -1),
          }),
        );
        alert("좋아요 처리에 실패했습니다.");
      }
    } else if (actionId === "report") {
      setReportCardId(cardId);
    }
  }, [userId, cards, cardActions, setCardActions]);

  const handleShare = useCallback(async (cardId) => {
    const url = `${window.location.origin}/vote${getVoteHash(cardId)}`;
    try {
      if (navigator.share)
        await navigator.share({ title: "PICKPICK 투표", text: "이 밸런스 게임 같이 투표해봐!", url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
      setCopiedCardId(cardId);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedCardId(""), 1600);
    } catch {
      setCopiedCardId("");
    }
  }, []);

  const handleOpenComments  = useCallback((cardId) => { setIsFilterOpen(false); setCommentCardId(cardId); }, []);
  const handleCloseComments = useCallback(() => setCommentCardId(""), []);
  const handleCloseReport   = useCallback(() => setReportCardId(""),  []);

  const commentCard = useMemo(() => cards.find((c) => c.feedId === commentCardId), [cards, commentCardId]);
  const reportCard  = useMemo(() => cards.find((c) => c.feedId === reportCardId),  [cards, reportCardId]);

  // ── 렌더 ──

  return (
    <div
      key={userId}
      ref={pageRef}
      className={`vote-page${entersFromMain ? " is-entering-from-main" : ""}${commentCardId ? " has-comment-modal" : ""}`}
    >
      {/* 필터 토글 버튼 */}
      {!isFilterOpen && !commentCardId && !reportCardId && (
        <button type="button" className="vote-action-button vote-filter-toggle" onClick={() => setIsFilterOpen(true)}>
          <img src={filterIcon} alt="" />
        </button>
      )}

      {/* 카테고리 필터 패널 */}
      {isFilterOpen && !commentCardId && !reportCardId && (
        <aside className="vote-filter-panel">
          <header className="vote-filter-header">
            <h2>카테고리</h2>
            <button type="button" className="vote-filter-close" onClick={() => setIsFilterOpen(false)}>
              <X size={22} />
            </button>
          </header>
          <div className="vote-filter-list">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`vote-filter-chip${selectedTag === tag ? " is-active" : ""}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* 투표 피드 */}
      <div className="vote-layout">
        <div ref={feedRef} className="vote-feed">
          {isVotesLoading ? (
            <div className="empty-state">투표 목록을 불러오는 중입니다.</div>
          ) : votesError ? (
            <div className="empty-state">{votesError}</div>
          ) : cards.length > 0 ? (
            cards.map((card) => (
              <VoteCard
                key={card.feedId}
                card={card}
                selectedCandidateId={selectedVotes[card.feedId]}
                onSelect={handleVote}
                actionState={cardActions[card.feedId]}
                likeCount={cardActions[card.feedId]?.likeCount ?? 0}
                copied={copiedCardId === card.feedId}
                onToggleAction={handleToggleAction}
                onShare={handleShare}
                onOpenComments={handleOpenComments}
                isCommentsOpen={commentCardId === card.feedId}
                isActive={activeCardId === card.feedId}
                currentTime={currentTime}
                registerCardRef={registerCardRef}
                actionButtons={ACTION_BUTTONS}
              />
            ))
          ) : (
            <div className="empty-state">검색 결과가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 댓글 모달 */}
      {commentCard && (
        <Comments
          title={commentCard.title}
          targetCardId={commentCard.feedId}
          postDbId={commentCard.id}
          onClose={handleCloseComments}
          layerClassName="is-vote-page"
        />
      )}

      {/* 신고 모달 */}
      {reportCard && (
        <Report
          title={reportCard.title}
          targetCardId={reportCard.feedId}
          onClose={handleCloseReport}
          userId={userId}
        />
      )}
    </div>
  );
}
