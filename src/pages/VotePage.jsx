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
  createVoteCards,
  getVoteFeedIdFromHash,
  getVoteHash,
} from "./vote/voteCards.js";
import { getVote, submitVote } from "../api/posts.js";

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
                <img src={candidate.image} alt={candidate.name} />
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
  
  // 상태를 초기화할 때 localStorage에서 값을 가져옵니다.
  const [selectedVotes, setSelectedVotes] = useState(() => {
    const saved = localStorage.getItem("selectedVotes");
    return saved ? JSON.parse(saved) : {};
  });
  
  const [cardActions, setCardActions] = useState(() => {
    const saved = localStorage.getItem("cardActions");
    return saved ? JSON.parse(saved) : {};
  });

  // 상태가 변경될 때마다 localStorage에 저장합니다.
  useEffect(() => {
    localStorage.setItem("selectedVotes", JSON.stringify(selectedVotes));
  }, [selectedVotes]);

  useEffect(() => {
    localStorage.setItem("cardActions", JSON.stringify(cardActions));
  }, [cardActions]);

  const [copiedCardId, setCopiedCardId] = useState("");
  const [commentCardId, setCommentCardId] = useState("");
  const pageRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const { activeCardId, cardRefs, feedRef, registerCardRef } =
    useActiveVoteCard(cards);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const data = await getVote();
        const formattedCards = data.map((item, index) => {
          const totalVotes = (item.candidate_a_count || 0) + (item.candidate_b_count || 0);
          const leftShare = totalVotes === 0 ? 50 : Math.round(((item.candidate_a_count || 0) / totalVotes) * 100);
          const rightShare = totalVotes === 0 ? 50 : Math.round(((item.candidate_b_count || 0) / totalVotes) * 100);

          return {
            id: item.id.toString(),
            feedId: `${item.id}-${index + 1}`,
            title: item.title,
            leftCandidate: {
              id: "a",
              name: item.candidate_a_name,
              image: item.candidate_a_image ? `http://localhost:4000/uploads/${item.candidate_a_image}` : null,
              tone: "light",
            },
            rightCandidate: {
              id: "b",
              name: item.candidate_b_name,
              image: item.candidate_b_image ? `http://localhost:4000/uploads/${item.candidate_b_image}` : null,
              tone: "dark",
            },
            shares: { left: leftShare, right: rightShare },
          };
        });
        setCards(formattedCards);
      } catch (error) {
        console.error("투표 목록을 불러오는데 실패했습니다.", error);
      }
    };
    fetchVotes();
  }, []);

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
    if (selectedVotes[cardId]) {
      return;
    }

    const card = cards.find(c => c.feedId === cardId);
    if (!card) return;

    // 현재 접속 중인 유저 가져오기
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : { id: 1 }; // 비로그인 시 임시로 1번 유저 사용

    try {
      const side = candidateId.toUpperCase(); // 'a' -> 'A', 'b' -> 'B'
      const response = await submitVote(card.id, user.id, side);

      if (response.success) {
        // 서버에서 받아온 최신 투표수로 퍼센트 재계산
        const counts = response.counts;
        const totalVotes = counts.candidate_a_count + counts.candidate_b_count;
        const leftShare = totalVotes === 0 ? 50 : Math.round((counts.candidate_a_count / totalVotes) * 100);
        const rightShare = totalVotes === 0 ? 50 : Math.round((counts.candidate_b_count / totalVotes) * 100);

        setCards(currentCards =>
          currentCards.map(c =>
            c.feedId === cardId ? { ...c, shares: { left: leftShare, right: rightShare } } : c
          )
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

  return (
    <div
      ref={pageRef}
      className={`vote-page${entersFromMain ? " is-entering-from-main" : ""}${
        commentCardId ? " has-comment-modal" : ""
      }`}
    >
      <div className="vote-layout">
        <div ref={feedRef} className="vote-feed">
          {cards.map((card) => {
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
          })}
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
