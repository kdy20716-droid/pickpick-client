import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./VotePage.css";
import vsLogo from "../assets/vs-logo.svg";
import favoriteIcon from "../assets/favorite.svg";
import dislikeIcon from "../assets/thumb_down.svg";
import commentIcon from "../assets/comment.svg";
import shareIcon from "../assets/share.svg";
import Comments from "../components/Comments.jsx";
import { isMainRouteTransition } from "./animations/routeTransitions.js";
import { useActiveVoteCard } from "./vote/useActiveVoteCard.js";
import { useActiveVoteHash } from "./vote/useActiveVoteHash.js";
import { useVotePageScrollSnap } from "./vote/useVotePageScrollSnap.js";
import {
  getVoteFeedIdFromHash,
  getVoteHash,
} from "./vote/voteCards.js";
import { getVote, vote } from "../api/posts";

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

function updateCardActionState(currentActions, cardId, actionId) {
  const previousState = currentActions[cardId] ?? initialActionState;

  if (actionId === "like") {
    const nextLike = !previousState.like;

    return {
      ...currentActions,
      [cardId]: {
        ...previousState,
        like: nextLike,
        dislike: false,
        likeCount: Math.max(
          0,
          previousState.likeCount + (nextLike ? 1 : -1),
        ),
      },
    };
  }

  if (actionId === "dislike") {
    return {
      ...currentActions,
      [cardId]: {
        ...previousState,
        like: false,
        dislike: !previousState.dislike,
        likeCount: previousState.like ? 0 : previousState.likeCount,
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
  registerCardRef,
}) {
  const hasVoted = Boolean(selectedCandidateId);

  return (
    <article
      ref={registerCardRef(card.feedId)}
      className={`vote-feed-item vote-${card.id}${isActive ? " is-active" : ""}`}
      id={card.feedId}
    >
      <div className={`vote-sheet${hasVoted ? " has-results" : ""}`}>
        <h2 className="vote-sheet-title">{card.title}</h2>

        <div className="vote-sheet-match">
          {[card.leftCandidate, card.rightCandidate].map((candidate) => {
            const isSelected = selectedCandidateId === candidate.id;

            return (
              <button
                key={candidate.id}
                type="button"
                className={`vote-choice tone-${candidate.tone}${
                  isSelected ? " is-selected" : ""
                }`}
                aria-pressed={isSelected}
                disabled={hasVoted}
                onClick={() => onSelect(card.feedId, candidate.id)}
              >
                <img
                  src={
                    candidate.image
                      ? candidate.image.startsWith("http")
                        ? candidate.image
                        : `http://localhost:4000/${candidate.image.startsWith("uploads/") ? "" : "uploads/"}${candidate.image}`
                      : ""
                  }
                  alt={candidate.name}
                  onError={(e) => {
                    console.error(`이미지 로드 실패: ${e.target.src}`);
                    e.target.style.display = "none";
                  }}
                />

                <span className="vote-choice-overlay" aria-hidden="true" />
                <p className="vote-choice-name">{candidate.name}</p>
              </button>
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
  const entersFromMain = isMainRouteTransition(location.state?.transition);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [cardActions, setCardActions] = useState({});
  const [copiedCardId, setCopiedCardId] = useState("");
  const [commentCardId, setCommentCardId] = useState("");
  const pageRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const { activeCardId, cardRefs, feedRef, registerCardRef } =
    useActiveVoteCard(cards);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        const data = await getVote();

        const mappedCards = data.map((item) => {
          const total = item.candidate_a_count + item.candidate_b_count;
          const leftShare = total === 0 ? 50 : Math.round((item.candidate_a_count / total) * 100);
          const rightShare = total === 0 ? 50 : 100 - leftShare;

          return {
            id: item.id,
            feedId: String(item.id),
            title: item.title,
            category: item.category,
            leftCandidate: {
              id: "left",
              name: item.candidate_a_name,
              image: item.candidate_a_image,
              tone: "blue",
              count: item.candidate_a_count,
            },
            rightCandidate: {
              id: "right",
              name: item.candidate_b_name,
              image: item.candidate_b_image,
              tone: "pink",
              count: item.candidate_b_count,
            },
            shares: {
              left: leftShare,
              right: rightShare,
            },
          };
        });

        const pinnedFeedId = getVoteFeedIdFromHash(location.hash);
        if (pinnedFeedId) {
          const pinnedIndex = mappedCards.findIndex(
            (c) => c.feedId === pinnedFeedId,
          );
          if (pinnedIndex !== -1) {
            const pinnedCard = mappedCards.splice(pinnedIndex, 1)[0];
            mappedCards.unshift(pinnedCard);
          }
        }

        setCards(mappedCards);
      } catch (error) {
        console.error("Failed to fetch votes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [location.hash]);

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
  });

  useActiveVoteHash(activeCardId, location);

  const handleVote = async (cardId, candidateId) => {
    if (selectedVotes[cardId]) return;

    const side = candidateId === "left" ? "A" : "B";

    try {
      // 서버에 투표 반영
      await vote(cardId, side);

      // 로컬 상태 업데이트 (화면에 즉시 반영)
      setCards((prevCards) =>
        prevCards.map((card) => {
          if (card.feedId === cardId) {
            const newLeftCount =
              card.leftCandidate.count + (side === "A" ? 1 : 0);
            const newRightCount =
              card.rightCandidate.count + (side === "B" ? 1 : 0);
            const total = newLeftCount + newRightCount;
            const leftShare = total === 0 ? 50 : Math.round((newLeftCount / total) * 100);

            return {
              ...card,
              leftCandidate: { ...card.leftCandidate, count: newLeftCount },
              rightCandidate: { ...card.rightCandidate, count: newRightCount },
              shares: {
                left: leftShare,
                right: 100 - leftShare,
              },
            };
          }
          return card;
        }),
      );

      setSelectedVotes((currentVotes) => ({
        ...currentVotes,
        [cardId]: candidateId,
      }));
    } catch (error) {
      console.error("투표 실패:", error);
      alert("투표 처리에 실패했습니다.");
    }
  };

  const handleToggleAction = (cardId, actionId) => {
    setCardActions((currentActions) =>
      updateCardActionState(currentActions, cardId, actionId),
    );
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
    setCommentCardId(cardId);
  };

  const handleCloseComments = () => {
    setCommentCardId("");
  };

  const commentCard = cards.find((card) => card.feedId === commentCardId);

  if (loading) {
    return (
      <div className="vote-page-loading">
        <p>투표 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className={`vote-page${entersFromMain ? " is-entering-from-main" : ""}${
        commentCardId ? " has-comment-modal" : ""
      }`}
    >
      <div className="vote-layout">
        <div ref={feedRef} className="vote-feed">
          {cards.length > 0 ? (
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
                  registerCardRef={registerCardRef}
                />
              );
            })
          ) : (
            <div className="vote-feed-empty">
              <p>등록된 투표가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      {commentCard ? (
        <Comments
          title={commentCard.title}
          targetCardId={commentCard.feedId}
          onClose={handleCloseComments}
        />
      ) : null}
    </div>
  );
}
