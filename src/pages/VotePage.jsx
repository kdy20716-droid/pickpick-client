import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import "./VotePage.css";
import vsLogo from "../assets/vs-logo.svg";
import favoriteIcon from "../assets/favorite.svg";
import dislikeIcon from "../assets/thumb_down.svg";
import commentIcon from "../assets/comment.svg";
import shareIcon from "../assets/share.svg";
import { voteTemplates } from "../data/votes.js";
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

function makeVoteCard(template, index) {
  return {
    ...template,
    feedId: `${template.id}-${index + 1}`,
  };
}

function createVoteBatch(startIndex, count) {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset;
    const template = voteTemplates[index % voteTemplates.length];
    return makeVoteCard(template, index);
  });
}

function VoteActionButton({
  action,
  active,
  onToggle,
  onShare,
  onComment,
  copied,
  activeCardId,
}) {
  if (action.kind === "link") {
    return (
      <Link
        to={action.to}
        className="vote-action-button"
        aria-label={action.label}
      >
        <img src={action.icon} alt="" aria-hidden="true" />
      </Link>
    );
  }

  const handleClick = () => {
    if (!activeCardId) {
      return;
    }

    if (action.id === "share") {
      onShare(activeCardId);
      return;
    }

    if (action.id === "comment") {
      onComment(activeCardId);
      return;
    }

    onToggle(activeCardId, action.id);
  };

  const isActive = action.id === "share" ? copied : active;

  return (
    <button
      type="button"
      className={`vote-action-button${isActive ? " is-active" : ""}`}
      aria-label={action.label}
      aria-pressed={action.kind === "toggle" ? active : undefined}
      onClick={handleClick}
    >
      <img src={action.icon} alt="" aria-hidden="true" />
    </button>
  );
}

function VoteCard({
  card,
  selectedCandidateId,
  onSelect,
  isActive,
  registerCardRef,
}) {
  const hasVoted = Boolean(selectedCandidateId);

  return (
    <article
      ref={registerCardRef(card.feedId)}
      className={`vote-feed-item${isActive ? " is-active" : ""}`}
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
                onClick={() => onSelect(card.feedId, candidate.id)}
              >
                <img src={candidate.image} alt={candidate.name} />
                <span className="vote-choice-overlay" aria-hidden="true" />
                <span className="vote-choice-name">{candidate.name}</span>
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
    </article>
  );
}

export default function VotePage() {
  const [cards, setCards] = useState(() =>
    createVoteBatch(0, INITIAL_CARD_COUNT),
  );
  const [selectedVotes, setSelectedVotes] = useState({});
  const [actionStates, setActionStates] = useState({});
  const [copiedCardId, setCopiedCardId] = useState("");
  const [activeCardId, setActiveCardId] = useState(() => {
    const initialCards = createVoteBatch(0, INITIAL_CARD_COUNT);
    return initialCards[0]?.feedId ?? "";
  });
  const [commentsCardId, setCommentsCardId] = useState(null);

  const loaderRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const cardRefs = useRef(new Map());

  const appendMoreCards = useEffectEvent(() => {
    startTransition(() => {
      setCards((currentCards) => [
        ...currentCards,
        ...createVoteBatch(currentCards.length, LOAD_MORE_COUNT),
      ]);
    });
  });

  useEffect(() => {
    const loader = loaderRef.current;

    if (!loader) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          appendMoreCards();
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(loader);

    return () => {
      observer.disconnect();
    };
  }, [appendMoreCards]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const registerCardRef = (cardId) => (node) => {
    if (node) {
      cardRefs.current.set(cardId, node);
      return;
    }

    cardRefs.current.delete(cardId);
  };

  const syncActiveCard = useEffectEvent(() => {
    const viewportCenter = window.innerHeight / 2;
    let nearestCardId = "";
    let nearestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((node, cardId) => {
      const rect = node.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestCardId = cardId;
      }
    });

    if (nearestCardId && nearestCardId !== activeCardId) {
      setActiveCardId(nearestCardId);
    }
  });

  useEffect(() => {
    let frameId = 0;

    const handleViewportChange = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        syncActiveCard();
      });
    };

    handleViewportChange();
    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [cards.length, syncActiveCard]);

  useEffect(() => {
    if (!activeCardId && cards[0]) {
      setActiveCardId(cards[0].feedId);
    }
  }, [activeCardId, cards]);

  const handleVote = (cardId, candidateId) => {
    setSelectedVotes((currentVotes) => ({
      ...currentVotes,
      [cardId]: candidateId,
    }));
  };

  const handleToggleAction = (cardId, actionId) => {
    setActionStates((currentStates) => {
      const previousState = currentStates[cardId] ?? {};

      if (actionId === "like") {
        return {
          ...currentStates,
          [cardId]: {
            ...previousState,
            like: !previousState.like,
            dislike: false,
          },
        };
      }

      if (actionId === "dislike") {
        return {
          ...currentStates,
          [cardId]: {
            ...previousState,
            like: false,
            dislike: !previousState.dislike,
          },
        };
      }

      return currentStates;
    });
  };

  const handleShare = async (cardId) => {
    const shareUrl = `${window.location.origin}/vote#${cardId}`;

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
    <div className="vote-page">
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
            />
          ))}
        </div>

        <div className="vote-action-column">
          <div className="vote-action-rail" aria-label="투표 액션">
            {actionButtons.map((action) => (
              <VoteActionButton
                key={action.id}
                action={action}
                active={Boolean(actionStates[activeCardId]?.[action.id])}
                onToggle={handleToggleAction}
                onShare={handleShare}
                onComment={handleOpenComments}
                copied={copiedCardId === activeCardId}
                activeCardId={activeCardId}
              />
            ))}
          </div>
        </div>
      </div>

      <div ref={loaderRef} className="vote-feed-loader" aria-hidden="true" />

      <CommentApp // Use the CommentApp component
        isOpen={Boolean(commentsCardId)}
        onClose={handleCloseComments}
        cardId={commentsCardId}
      />
    </div>
  );
}
