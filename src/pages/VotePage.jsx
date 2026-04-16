import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./VotePage.css";
import vsLogo from "../assets/vs-logo.svg";
import favoriteIcon from "../assets/favorite.svg";
import dislikeIcon from "../assets/thumb_down.svg";
import commentIcon from "../assets/comment.svg";
import shareIcon from "../assets/share.svg";
import { createVoteBatch, getVoteHash } from "./vote/voteCards.js";
import { useActiveVoteCard } from "./vote/useActiveVoteCard.js";
import { useVotePageScrollSnap } from "./vote/useVotePageScrollSnap.js";
import { useActiveVoteHash } from "./vote/useActiveVoteHash.js";
import CommentApp from "../components/Comments.jsx"; // Import the existing Comments.jsx

const INITIAL_CARD_COUNT = 4;
const LOAD_MORE_COUNT = 3;

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
    kind: "button",
  }, // Removed kind: "link", to: "/result"
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
        likeCount: Math.max(0, previousState.likeCount + (nextLike ? 1 : -1)),
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
  const [cards, _setCards] = useState(() =>
    createVoteBatch(0, INITIAL_CARD_COUNT),
  );
  const [selectedVotes, setSelectedVotes] = useState({});
  const [cardActions, setCardActions] = useState({});
  const [copiedCardId, setCopiedCardId] = useState("");
  const [commentsCardId, setCommentsCardId] = useState(null);

  const pageRef = useRef(null);
  const location = useLocation();
  const loaderRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const { activeCardId, cardRefs, feedRef, registerCardRef } =
    useActiveVoteCard(cards);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!commentsCardId) {
      return undefined;
    }

    const feed = feedRef.current;
    if (!feed) {
      return undefined;
    }

    let canCloseOnScroll = false;
    const frameId = requestAnimationFrame(() => {
      canCloseOnScroll = true;
    });

    const handleScroll = () => {
      if (canCloseOnScroll) {
        setCommentsCardId(null);
      }
    };

    feed.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      feed.removeEventListener("scroll", handleScroll);
    };
  }, [commentsCardId, feedRef]);

  useVotePageScrollSnap({
    pageRef,
    feedRef,
    activeCardId,
    cardRefs,
  });

  useActiveVoteHash(activeCardId, location);

  const handleVote = (cardId, candidateId) => {
    setSelectedVotes((currentVotes) => {
      if (currentVotes[cardId]) {
        return currentVotes;
      }

      return {
        ...currentVotes,
        [cardId]: candidateId,
      };
    });
  };

  const handleToggleAction = (cardId, actionId) => {
    setCardActions((currentActions) =>
      updateCardActionState(currentActions, cardId, actionId),
    );
  };

  const handleShare = async (cardId) => {
    const hash =
      typeof getVoteHash === "function" ? getVoteHash(cardId) : `?id=${cardId}`;
    const shareUrl = `${window.location.origin}/vote${hash}`;

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
    setCommentsCardId(cardId);
  };

  const handleCloseComments = () => {
    setCommentsCardId(null);
  };

  return (
    <>
      <div
        ref={pageRef}
        className={`vote-page${commentsCardId ? " comments-open" : ""}`}
      >
        <div className="vote-layout">
          <div className="vote-feed">
            {cards.map((card) => (
              <VoteCard
                key={card.feedId}
                card={card}
                selectedCandidateId={selectedVotes[card.feedId]}
                onSelect={handleVote}
                isActive={activeCardId === card.feedId}
                registerCardRef={registerCardRef}
                actionState={cardActions[card.feedId]}
                likeCount={cardActions[card.feedId]?.likeCount ?? 0}
                copied={copiedCardId === card.feedId}
                onToggleAction={handleToggleAction}
                onShare={handleShare}
                onOpenComments={handleOpenComments}
                isCommentsOpen={commentsCardId === card.feedId}
              />
            ))}
          </div>

          <div className="vote-action-column">
            <div className="vote-action-rail" aria-label="투표 액션">
              {actionButtons.map((action) => (
                <VoteActionButton
                  key={action.id}
                  action={action}
                  active={
                    action.id === "comment"
                      ? commentsCardId === activeCardId
                      : Boolean(cardActions[activeCardId]?.[action.id])
                  }
                  onToggle={handleToggleAction}
                  onShare={handleShare}
                  onComment={handleOpenComments}
                  copied={copiedCardId === activeCardId}
                  cardId={activeCardId}
                  count={cardActions[activeCardId]?.likeCount ?? 0}
                  disabled={
                    action.id === "comment" && !selectedVotes[activeCardId]
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div ref={loaderRef} className="vote-feed-loader" aria-hidden="true" />
      </div>

      <CommentApp // Use the CommentApp component
        isOpen={Boolean(commentsCardId)}
        onClose={handleCloseComments}
        cardId={commentsCardId}
      />
    </>
  );
}
