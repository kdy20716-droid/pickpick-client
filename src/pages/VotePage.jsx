import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./VotePage.css";
import vsLogo from "../assets/vs-logo.svg";
import favoriteIcon from "../assets/favorite.svg";
import dislikeIcon from "../assets/thumb_down.svg";
import commentIcon from "../assets/comment.svg";
import shareIcon from "../assets/share.svg";
import filterIcon from "../assets/filter.svg";
import Comments from "../components/Comments.jsx";
import { isMainRouteTransition } from "./animations/routeTransitions.js";
import { useActiveVoteCard } from "./vote/useActiveVoteCard.js";
import { useActiveVoteHash } from "./vote/useActiveVoteHash.js";
import { useVotePageScrollSnap } from "./vote/useVotePageScrollSnap.js";
import { getVoteFeedIdFromHash, getVoteHash } from "./vote/voteCards.js";

import {
  getVote,
  submitVote,
  toggleLike,
  incrementView,
} from "../api/posts.js";
import { useAuth } from "../contexts/AuthContext";
import { useFitSingleLineText } from "../hooks/useFitSingleLineText.js";

const tags = [
  "전체",
  "연예",
  "음식",
  "애니메이션",
  "동물",
  "스포츠",
  "일상",
  "게임",
  "음악",
  "영화 / 드라마",
  "웹툰 / 웹소설",
  "유튜버 / 스트리머",
  "밸런스 게임",
  "밈",
  "기타",
];

const actionButtons = [
  {
    id: "like",
    label: "좋아요",
    icon: favoriteIcon,
    kind: "toggle",
  },
  {
    id: "dislike",
    label: "싫어요",
    icon: dislikeIcon,
    kind: "toggle",
  },
  {
    id: "comment",
    label: "댓글",
    icon: commentIcon,
    kind: "modal",
  },
  {
    id: "share",
    label: "공유",
    icon: shareIcon,
    kind: "button",
  },
];

const initialActionState = {
  like: false,
  dislike: false,
  likeCount: 0,
};

const CANDIDATE_NAME_MAX_SIZE_REM = 2.65;
const CANDIDATE_NAME_MIN_SIZE_REM = 1.05;
const CANDIDATE_NAME_COMFORT_LENGTH = 6.5;
const CANDIDATE_NAME_SHRINK_RATE = 0.17;

function getCandidateNameWeight(name = "") {
  return Array.from(String(name).trim()).reduce((total, character) => {
    if (/\s/.test(character)) {
      return total + 0.35;
    }

    if (/[A-Za-z0-9]/.test(character)) {
      return total + 0.6;
    }

    if (/[\x20-\x7E]/.test(character)) {
      return total + 0.45;
    }

    return total + 1;
  }, 0);
}

function getCandidateNameStyle(name) {
  const overflowLength = Math.max(
    0,
    getCandidateNameWeight(name) - CANDIDATE_NAME_COMFORT_LENGTH,
  );
  const sizeRem = Math.max(
    CANDIDATE_NAME_MIN_SIZE_REM,
    CANDIDATE_NAME_MAX_SIZE_REM - overflowLength * CANDIDATE_NAME_SHRINK_RATE,
  );

  return {
    "--vote-choice-name-fit-size": `${sizeRem.toFixed(2)}rem`,
  };
}

function formatVoteDeadline(expiresAt, currentTime) {
  if (!expiresAt) {
    return "무기한";
  }

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const remainingMs = date.getTime() - currentTime;
  if (remainingMs <= 0) {
    return "마감됨";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (number) => String(number).padStart(2, "0");
  const time = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return days > 0 ? `마감 ${days}일 ${time}` : `마감 ${time}`;
}

function getTargetVoteId(routePostId, search, hash) {
  const searchParams = new URLSearchParams(search);
  const candidates = [
    routePostId,
    searchParams.get("post"),
    searchParams.get("postId"),
    searchParams.get("vote"),
    searchParams.get("voteId"),
    searchParams.get("id"),
    getVoteFeedIdFromHash(hash),
  ];

  return (
    candidates
      .find((candidate) => {
        return typeof candidate === "string" && candidate.trim().length > 0;
      })
      ?.trim() ?? ""
  );
}

function pinTargetCard(cards, targetCardId) {
  if (!targetCardId) {
    return cards;
  }

  const targetIndex = cards.findIndex((card) => card.feedId === targetCardId);
  if (targetIndex < 0) {
    return cards;
  }

  return [
    cards[targetIndex],
    ...cards.slice(0, targetIndex),
    ...cards.slice(targetIndex + 1),
  ];
}

function getLikeCountFromResponse(response, fallbackCount) {
  const nextCount = Number(response?.like_count ?? response?.likes);
  return Number.isFinite(nextCount) ? Math.max(0, nextCount) : fallbackCount;
}

function updateCardActionState(currentActions, cardId, actionId, options = {}) {
  const previousState = currentActions[cardId] ?? initialActionState;

  if (actionId === "like") {
    const nextLike =
      typeof options.like === "boolean" ? options.like : !previousState.like;
    const fallbackLikeCount = Math.max(
      0,
      previousState.likeCount + (nextLike ? 1 : -1),
    );

    return {
      ...currentActions,
      [cardId]: {
        ...previousState,
        like: nextLike,
        dislike: false,
        likeCount:
          typeof options.likeCount === "number"
            ? Math.max(0, options.likeCount)
            : fallbackLikeCount,
      },
    };
  }

  if (actionId === "dislike") {
    const fallbackLikeCount = previousState.like
      ? Math.max(0, previousState.likeCount - 1)
      : previousState.likeCount;

    return {
      ...currentActions,
      [cardId]: {
        ...previousState,
        like: false,
        dislike:
          typeof options.dislike === "boolean"
            ? options.dislike
            : !previousState.dislike,
        likeCount:
          typeof options.likeCount === "number"
            ? Math.max(0, options.likeCount)
            : fallbackLikeCount,
      },
    };
  }

  return currentActions;
}

function VoteActionButton({
  action,
  active,
  count,
  disabled,
  onToggle,
  onShare,
  onComment,
  copied,
  cardId,
}) {
  if (action.kind === "link") {
    return (
      <Link
        to={action.to}
        className={`vote-action-button action-${action.id}`}
        aria-label={action.label}
      >
        <img src={action.icon} alt="" aria-hidden="true" />
      </Link>
    );
  }

  const handleClick = () => {
    if (disabled) {
      return;
    }

    if (action.id === "share") {
      onShare(cardId);
      return;
    }

    if (action.id === "comment") {
      onComment(cardId);
      return;
    }

    onToggle(cardId, action.id);
  };

  const isActive = action.id === "share" ? copied : active;

  return (
    <button
      type="button"
      className={`vote-action-button action-${action.id}${
        isActive ? " is-active" : ""
      }`}
      aria-label={action.label}
      aria-pressed={action.kind === "toggle" ? active : undefined}
      disabled={disabled}
      onClick={handleClick}
    >
      <img src={action.icon} alt="" aria-hidden="true" />
      {action.id === "like" ? (
        <span className="vote-action-count" aria-hidden="true">
          {count}
        </span>
      ) : null}
    </button>
  );
}

function VoteSheetTitle({ children }) {
  const ref = useFitSingleLineText(children);
  return (
    <h2 ref={ref} className="vote-sheet-title">
      {children}
    </h2>
  );
}

function YouTubePlayer({ videoId, title, isActive }) {
  const [isPaused, setIsPaused] = useState(true);
  const iframeRef = useRef(null);

  // 화면에서 벗어나면(비활성화되면) 상태 초기화
  useEffect(() => {
    if (!isActive) {
      setIsPaused(true);
    }
  }, [isActive]);

  const togglePlayback = (e) => {
    e.stopPropagation();
    if (!isActive) return;

    const nextPaused = !isPaused;
    setIsPaused(nextPaused);

    if (iframeRef.current?.contentWindow) {
      const command = nextPaused ? "pauseVideo" : "playVideo";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: [] }),
        "*",
      );
    }
  };

  if (!isActive) {
    return (
      <div className="custom-youtube-container">
        <img
          src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="player-controls is-paused">
          <div className="play-icon" />
        </div>
      </div>
    );
  }

  return (
    <div className="custom-youtube-container">
      <div className="youtube-iframe-target">
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&mute=0&controls=1&loop=1&playlist=${videoId}&rel=0&playsinline=1&enablejsapi=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function VoteCard({
  card,
  selectedCandidateId,
  onSelect,
  actionState,
  likeCount,
  copied,
  onToggleAction,
  onShare,
  onOpenComments,
  isCommentsOpen,
  isActive,
  currentTime,
  registerCardRef,
}) {
  const expiresAtTime = card.expiresAt ? new Date(card.expiresAt).getTime() : NaN;
  const isExpired =
    Number.isFinite(expiresAtTime) && expiresAtTime <= currentTime;
  const hasVoted = Boolean(selectedCandidateId) || isExpired;
  const deadlineLabel = formatVoteDeadline(card.expiresAt, currentTime);

  return (
    <article
      ref={registerCardRef(card.feedId)}
      className={`vote-feed-item vote-${card.id}${isActive ? " is-active" : ""}`}
      id={card.feedId}
    >
      <div className={`vote-sheet${hasVoted ? " has-results" : ""}`}>
        {deadlineLabel ? (
          <div className="vote-deadline-badge">{deadlineLabel}</div>
        ) : null}
        <VoteSheetTitle>{card.title}</VoteSheetTitle>

        <div className="vote-sheet-match">
          {[card.leftCandidate, card.rightCandidate].map((candidate) => {
            const isSelected = selectedCandidateId === candidate.id;
            const isVideo =
              candidate.type === "youtube" || candidate.type === "video";
            
            // 승패 판정 로직 추가 (50:50인 경우 제외)
            const isLeft = candidate.id === "a";
            const leftShare = card.shares.left;
            const rightShare = card.shares.right;
            const isLoser = hasVoted && (
              (isLeft && leftShare < rightShare) ||
              (!isLeft && rightShare < leftShare)
            );

            return (
              <div
                key={candidate.id}
                className={`vote-choice tone-${candidate.tone}${
                  isSelected ? " is-selected" : ""
                }${isLoser ? " is-loser" : ""}`}
                aria-pressed={isSelected}
              >
                {!hasVoted && isVideo && (
                  <button
                    type="button"
                    className="vote-pick-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(card.feedId, candidate.id);
                    }}
                  >PICK</button>
                )}

                <div
                  className="vote-choice-inner"
                  style={{ width: "100%", height: "100%" }}
                  onClick={
                    !isVideo && !hasVoted
                      ? () => onSelect(card.feedId, candidate.id)
                      : undefined
                  }
                >
                  {candidate.image ? (
                    candidate.type === "youtube" ? (
                      <div className="vote-choice-media">
                        <YouTubePlayer
                          videoId={candidate.image}
                          title={candidate.name}
                          isActive={isActive}
                        />
                      </div>
                    ) : candidate.type === "video" ? (
                      <div className="vote-choice-media">
                        <video
                          src={candidate.image}
                          autoPlay
                          loop
                          muted
                          playsInline
                          onClick={(e) => {
                            e.stopPropagation();
                            if (e.currentTarget.paused) e.currentTarget.play();
                            else e.currentTarget.pause();
                          }}
                        />
                      </div>
                    ) : candidate.type === "audio" ? (
                      <div className="vote-choice-audio-container">
                        <div className="audio-icon-large">🎵</div>
                        <audio
                          src={candidate.image}
                          controls={hasVoted}
                          className="vote-choice-audio-player"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      <img src={candidate.image} alt={candidate.name} />
                    )
                  ) : (
                    <span
                      className="vote-choice-image-fallback"
                      aria-hidden="true"
                    >
                      {candidate.name?.slice(0, 1) || "?"}
                    </span>
                  )}
                  <span className="vote-choice-overlay" aria-hidden="true" />
                  <p
                    className="vote-choice-name"
                    style={getCandidateNameStyle(candidate.name)}
                  >
                    {candidate.name}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="vote-sheet-vs" aria-hidden="true">
            <img src={vsLogo} alt="" />
          </div>
        </div>

        {hasVoted ? (
          <div className="vote-sheet-results" aria-label="연재 투표율">
            <div className="vote-share-bar" aria-hidden="true">
              <div
                className="vote-share-segment vote-share-left"
                style={{ width: `${card.shares.left}%` }}
              />
              <div
                className="vote-share-segment vote-share-right"
                style={{ width: `${card.shares.right}%` }}
              />
            </div>

            <div className="vote-share-footer">
              <span>{card.shares.left}%</span>
              <span>{card.shares.right}%</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="vote-action-rail" aria-label="투표 액션">
        {actionButtons.map((action) => (
          <VoteActionButton
            key={action.id}
            action={action}
            active={
              action.id === "comment"
                ? isCommentsOpen
                : Boolean(actionState?.[action.id])
            }
            disabled={action.id === "comment" && !hasVoted}
            count={action.id === "like" ? likeCount : 0}
            onToggle={onToggleAction}
            onShare={onShare}
            onComment={onOpenComments}
            copied={copied}
            cardId={card.feedId}
          />
        ))}
      </div>
    </article>
  );
}

export default function VotePage() {
  const location = useLocation();
  const { postId: routePostId } = useParams();
  const entersFromMain = isMainRouteTransition(location.state?.transition);
  const targetVoteId = useMemo(
    () => getTargetVoteId(routePostId, location.search, location.hash),
    [routePostId, location.search, location.hash],
  );
  const [cards, setCards] = useState([]);
  const [isVotesLoading, setIsVotesLoading] = useState(true);
  const [votesError, setVotesError] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const { user: currentUser, isLoggedIn } = useAuth();
  const userId = currentUser?.id || "guest";

  // 상태를 초기화할 때 유저별 키를 사용하여 localStorage에서 값을 가져옵니다.
  const [selectedVotes, setSelectedVotes] = useState(() => {
    const saved = localStorage.getItem(`selectedVotes_${userId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [cardActions, setCardActions] = useState(() => {
    const saved = localStorage.getItem(`cardActions_${userId}`);
    return saved ? JSON.parse(saved) : {};
  });

  // 유저가 바뀌면(로그인/로그아웃) 기록을 다시 로드합니다.
  useEffect(() => {
    const savedVotes = localStorage.getItem(`selectedVotes_${userId}`);
    setSelectedVotes(savedVotes ? JSON.parse(savedVotes) : {});

    const savedActions = localStorage.getItem(`cardActions_${userId}`);
    setCardActions(savedActions ? JSON.parse(savedActions) : {});
  }, [userId]);

  // 상태가 변경될 때마다 유저별 키로 localStorage에 저장합니다.
  useEffect(() => {
    localStorage.setItem(
      `selectedVotes_${userId}`,
      JSON.stringify(selectedVotes),
    );
  }, [selectedVotes, userId]);

  useEffect(() => {
    localStorage.setItem(`cardActions_${userId}`, JSON.stringify(cardActions));
  }, [cardActions, userId]);

  useEffect(() => {
    const handleVoteLikeUpdated = (event) => {
      const detail = event.detail ?? {};
      if (String(detail.userId) !== String(userId)) {
        return;
      }

      const cardId = String(detail.cardId ?? "");
      if (!cardId) {
        return;
      }

      setCardActions((currentActions) => {
        const previousState = currentActions[cardId] ?? initialActionState;
        const nextCount = Number(detail.likeCount);

        return {
          ...currentActions,
          [cardId]: {
            ...previousState,
            like: Boolean(detail.liked),
            dislike: detail.liked ? false : previousState.dislike,
            likeCount: Number.isFinite(nextCount)
              ? Math.max(0, nextCount)
              : previousState.likeCount,
          },
        };
      });
    };

    window.addEventListener("vote-like-updated", handleVoteLikeUpdated);
    return () => {
      window.removeEventListener("vote-like-updated", handleVoteLikeUpdated);
    };
  }, [userId]);

  const [copiedCardId, setCopiedCardId] = useState("");
  const [commentCardId, setCommentCardId] = useState("");
  const [selectedTag, setSelectedTag] = useState("전체");
  const [sortBy] = useState("random");
  const [searchKeyword] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const pageRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const fetchSequenceRef = useRef(0);
  const { activeCardId, cardRefs, feedRef, registerCardRef } =
    useActiveVoteCard(cards, targetVoteId);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  // 조회수 증가 로직
  useEffect(() => {
    if (activeCardId) {
      const card = cards.find((c) => c.feedId === activeCardId);
      if (card) {
        incrementView(card.id).catch(console.error);
      }
    }
  }, [activeCardId, cards]);

  const fetchVotes = useCallback(async () => {
    const fetchId = fetchSequenceRef.current + 1;
    fetchSequenceRef.current = fetchId;

    setIsVotesLoading(true);
    setVotesError("");

    try {
      const passedUserId = !isLoggedIn ? null : currentUser?.id;
      const data = await getVote(
        searchKeyword,
        selectedTag,
        sortBy,
        passedUserId,
        null,
        null,
        null,
        targetVoteId || null,
      );

      const serverVotes = {};
      const serverActions = {};
      const formattedCards = data.map((item) => {
        const totalVotes =
          (item.candidate_a_count || 0) + (item.candidate_b_count || 0);
        const leftShare =
          totalVotes === 0
            ? 50
            : Math.round(((item.candidate_a_count || 0) / totalVotes) * 100);
        const rightShare =
          totalVotes === 0
            ? 50
            : Math.round(((item.candidate_b_count || 0) / totalVotes) * 100);

        const cardId = item.id.toString();

        if (item.user_voted_side) {
          serverVotes[cardId] = item.user_voted_side.toLowerCase();
        }

        // 서버에서 받아온 좋아요 상태와 카운트 동기화
        serverActions[cardId] = {
          like: Boolean(item.user_liked),
          dislike: false, // 싫어요는 현재 서버 스키마에 없으므로 로컬 유지 또는 초기화
          likeCount: item.like_count || 0,
        };

        return {
          id: cardId,
          feedId: cardId,
          title: item.title,
          expiresAt: item.expires_at,
          isExpired: item.expires_at ? new Date(item.expires_at) <= new Date() : false,
          leftCandidate: {
            id: "a",
            name: item.candidate_a_name,
            image: item.candidate_a_image,
            type: item.candidate_a_type || "image",
            tone: "light",
          },
          rightCandidate: {
            id: "b",
            name: item.candidate_b_name,
            image: item.candidate_b_image,
            type: item.candidate_b_type || "image",
            tone: "dark",
          },
          shares: { left: leftShare, right: rightShare },
        };
      });

      if (fetchSequenceRef.current !== fetchId) {
        return;
      }

      // Merge server votes into local state (server has priority)
      setSelectedVotes((prev) => ({ ...prev, ...serverVotes }));
      setCardActions((prev) => ({ ...prev, ...serverActions }));
      setCards(pinTargetCard(formattedCards, targetVoteId));
    } catch (error) {
      if (fetchSequenceRef.current !== fetchId) {
        return;
      }

      console.error("투표 목록을 불러오는데 실패했습니다.", error);
      setCards([]);
      setVotesError("투표 목록을 불러오지 못했습니다.");
    } finally {
      if (fetchSequenceRef.current === fetchId) {
        setIsVotesLoading(false);
      }
    }
  }, [
    selectedTag,
    searchKeyword,
    sortBy,
    isLoggedIn,
    currentUser?.id,
    targetVoteId,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchVotes();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchVotes]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!commentCardId) {
      return undefined;
    }

    const feed = feedRef.current;
    if (!feed) {
      return undefined;
    }

    let canCloseOnScroll = false;
    let resizeUnlockTimeoutId = 0;
    const frameId = requestAnimationFrame(() => {
      canCloseOnScroll = true;
    });

    const handleResize = () => {
      canCloseOnScroll = false;
      window.clearTimeout(resizeUnlockTimeoutId);
      resizeUnlockTimeoutId = window.setTimeout(() => {
        canCloseOnScroll = true;
      }, 240);
    };

    const handleScroll = () => {
      if (canCloseOnScroll) {
        setCommentCardId("");
      }
    };

    feed.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(resizeUnlockTimeoutId);
      feed.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [commentCardId, feedRef]);

  useVotePageScrollSnap({
    pageRef,
    feedRef,
    activeCardId,
    cardRefs,
    targetCardId: targetVoteId,
  });

  useActiveVoteHash(activeCardId, location);

  const handleVote = async (cardId, candidateId) => {
    if (userId === "guest") {
      alert("로그인 후 이용할 수 있습니다.");
      return;
    }

    if (selectedVotes[cardId]) {
      return;
    }

    const card = cards.find((c) => c.feedId === cardId);
    if (!card) return;

    try {
      const side = candidateId.toUpperCase(); // 'a' -> 'A', 'b' -> 'B'
      const response = await submitVote(card.id, userId, side);

      if (response.success) {
        // 서버에서 받아온 최신 투표수로 퍼센트 재계산
        const counts = response.counts;
        const totalVotes = counts.candidate_a_count + counts.candidate_b_count;
        const leftShare =
          totalVotes === 0
            ? 50
            : Math.round((counts.candidate_a_count / totalVotes) * 100);
        const rightShare =
          totalVotes === 0
            ? 50
            : Math.round((counts.candidate_b_count / totalVotes) * 100);

        setCards((currentCards) =>
          currentCards.map((c) =>
            c.feedId === cardId
              ? { ...c, shares: { left: leftShare, right: rightShare } }
              : c,
          ),
        );

        setSelectedVotes((currentVotes) => ({
          ...currentVotes,
          [cardId]: candidateId,
        }));
      }
    } catch (error) {
      console.error("투표 전송 에러:", error);
      alert(error.response?.data?.message || "투표 처리에 실패했습니다.");
    }
  };

  const handleToggleAction = async (cardId, actionId) => {
    const card = cards.find((c) => c.feedId === cardId);
    if (!card) return;

    if (actionId === "like") {
      if (userId === "guest") {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const currentActionState = cardActions[cardId] ?? initialActionState;
        const nextLike = !currentActionState.like;
        const res = await toggleLike(card.id, userId, nextLike);
        if (res.success) {
          setCardActions((currentActions) => {
            const previousState = currentActions[cardId] ?? initialActionState;
            const fallbackCount = Math.max(
              0,
              previousState.likeCount + (res.liked ? 1 : -1),
            );
            const likeCount = getLikeCountFromResponse(res, fallbackCount);

            return updateCardActionState(currentActions, cardId, actionId, {
              like: Boolean(res.liked),
              likeCount,
            });
          });
        }
      } catch (error) {
        console.error(error);
        alert("좋아요 처리에 실패했습니다.");
      }
    } else {
      const currentActionState = cardActions[cardId] ?? initialActionState;
      const nextDislike = !currentActionState.dislike;
      let serverLikeCount = null;

      if (currentActionState.like) {
        try {
          const res = await toggleLike(card.id, userId, false);
          if (!res.success) {
            return;
          }

          serverLikeCount = getLikeCountFromResponse(
            res,
            Math.max(0, currentActionState.likeCount - 1),
          );
        } catch (error) {
          console.error(error);
          alert("좋아요 처리에 실패했습니다.");
          return;
        }
      }

      setCardActions((currentActions) =>
        updateCardActionState(currentActions, cardId, actionId, {
          dislike: nextDislike,
          likeCount: serverLikeCount,
        }),
      );
    }
  };

  const handleShare = async (cardId) => {
    const shareUrl = `${window.location.origin}/vote${getVoteHash(cardId)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "PICKPICK 투표",
          text: "이 밸런스 게임 같이 투표해봐!",
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }

      setCopiedCardId(cardId);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopiedCardId("");
      }, 1600);
    } catch {
      setCopiedCardId("");
    }
  };

  const handleOpenComments = (cardId) => {
    setIsFilterOpen(false);
    setCommentCardId(cardId);
  };

  const handleCloseComments = () => {
    setCommentCardId("");
  };

  const commentCard = cards.find((card) => card.feedId === commentCardId);

  return (
    <div
      key={userId}
      ref={pageRef}
      className={`vote-page${entersFromMain ? " is-entering-from-main" : ""}${
        commentCardId ? " has-comment-modal" : ""
      }`}
    >
      {!isFilterOpen && !commentCardId ? (
        <button
          type="button"
          className="vote-action-button vote-filter-toggle action-filter"
          onClick={() => setIsFilterOpen(true)}
          aria-label="카테고리 필터 열기"
        >
          <img src={filterIcon} alt="" aria-hidden="true" />
        </button>
      ) : null}

      {isFilterOpen && !commentCardId ? (
        <aside className="vote-filter-panel" aria-label="카테고리 필터">
          <header className="vote-filter-header">
            <h2>카테고리</h2>
            <button
              type="button"
              className="vote-filter-close"
              onClick={() => setIsFilterOpen(false)}
              aria-label="카테고리 필터 닫기"
            >
              X
            </button>
          </header>

          <div className="vote-filter-list">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`vote-filter-chip${
                  selectedTag === tag ? " is-active" : ""
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="vote-layout">
        <div ref={feedRef} className="vote-feed">
          {isVotesLoading ? (
            <div className="empty-state" role="status">
              투표 목록을 불러오는 중입니다.
            </div>
          ) : votesError ? (
            <div className="empty-state" role="alert">
              {votesError}
            </div>
          ) : cards.length > 0 ? (
            cards.map((card) => {
              const actionState = cardActions[card.feedId];

              return (
                <VoteCard
                  key={card.feedId}
                  card={card}
                  selectedCandidateId={selectedVotes[card.feedId]}
                  onSelect={handleVote}
                  actionState={actionState}
                  likeCount={actionState?.likeCount ?? 0}
                  copied={copiedCardId === card.feedId}
                  onToggleAction={handleToggleAction}
                  onShare={handleShare}
                  onOpenComments={handleOpenComments}
                  isCommentsOpen={commentCardId === card.feedId}
                  isActive={activeCardId === card.feedId}
                  currentTime={currentTime}
                  registerCardRef={registerCardRef}
                />
              );
            })
          ) : (
            <div className="empty-state">검색 결과가 없습니다.</div>
          )}
        </div>
      </div>
      {commentCard ? (
        <Comments
          title={commentCard.title}
          targetCardId={commentCard.feedId}
          postDbId={commentCard.id}
          onClose={handleCloseComments}
          layerClassName="is-vote-page"
        />
      ) : null}
    </div>
  );
}
