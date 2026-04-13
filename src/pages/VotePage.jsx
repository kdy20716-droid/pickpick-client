import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import "./VotePage.css";
import vsLogo from "../assets/vs-logo.svg";
import favoriteIcon from "../assets/favorite.svg";
import dislikeIcon from "../assets/thumb_down.svg";
import commentIcon from "../assets/comment.svg";
import shareIcon from "../assets/share.svg";
import { voteTemplates } from "../data/votes.js";
import { useVotePageScrollSnap } from "../useVotePageScrollSnap.js";

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
    kind: "link",
    to: "/result",
  },
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

function shuffleCards(cards) {
  const shuffledCards = [...cards];

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledCards[index], shuffledCards[randomIndex]] = [
      shuffledCards[randomIndex],
      shuffledCards[index],
    ];
  }

  return shuffledCards;
}

function normalizeHash(hash) {
  return decodeURIComponent(hash.replace(/^#/, ""));
}

function createVoteCards(activeFeedId = "") {
  const cards = voteTemplates.map((template, index) => makeVoteCard(template, index));
  const activeCard = cards.find((card) => card.feedId === activeFeedId);
  const shuffledCards = shuffleCards(
    cards.filter((card) => card.feedId !== activeFeedId),
  );

  return activeCard ? [activeCard, ...shuffledCards] : shuffleCards(cards);
}

function VoteActionButton({
  action,
  active,
  count,
  onToggle,
  onShare,
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
    if (action.id === "share") {
      onShare(cardId);
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
            active={Boolean(actionState?.[action.id])}
            count={action.id === "like" ? likeCount : 0}
            onToggle={onToggleAction}
            onShare={onShare}
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
  const entersFromMain = location.state?.transition?.startsWith("main");
  const [cards] = useState(() => createVoteCards(normalizeHash(location.hash)));
  const [selectedVotes, setSelectedVotes] = useState({});
  const [actionStates, setActionStates] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [copiedCardId, setCopiedCardId] = useState("");
  const [activeCardId, setActiveCardId] = useState(() => cards[0]?.feedId ?? "");
  const pageRef = useRef(null);
  const feedRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const cardRefs = useRef(new Map());

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
    const feed = feedRef.current;
    if (!feed) {
      return;
    }

    const feedRect = feed.getBoundingClientRect();
    const viewportCenter = feedRect.top + feedRect.height / 2;
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
    const feed = feedRef.current;
    let frameId = 0;

    if (!feed) {
      return undefined;
    }

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
    feed.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      feed.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  useVotePageScrollSnap({
    pageRef,
    feedRef,
    activeCardId,
    cardRefs,
  });

  useEffect(() => {
    if (!activeCardId) {
      return;
    }

    const nextHash = `#${encodeURIComponent(activeCardId)}`;
    if (window.location.hash === nextHash) {
      return;
    }

    window.history.replaceState(
      window.history.state,
      "",
      `${location.pathname}${location.search}${nextHash}`,
    );
  }, [activeCardId, location.pathname, location.search]);

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
    setActionStates((currentStates) => {
      const previousState = currentStates[cardId] ?? {};

      if (actionId === "like") {
        const nextLike = !previousState.like;

        setLikeCounts((currentCounts) => {
          const previousCount = currentCounts[cardId] ?? 0;

          return {
            ...currentCounts,
            [cardId]: Math.max(0, previousCount + (nextLike ? 1 : -1)),
          };
        });

        return {
          ...currentStates,
          [cardId]: {
            ...previousState,
            like: nextLike,
            dislike: false,
          },
        };
      }

      if (actionId === "dislike") {
        if (previousState.like) {
          setLikeCounts((currentCounts) => ({
            ...currentCounts,
            [cardId]: 0,
          }));
        }

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

  return (
    <div
      ref={pageRef}
      className={`vote-page${entersFromMain ? " is-entering-from-main" : ""}`}
    >
      <div className="vote-layout">
        <div ref={feedRef} className="vote-feed">
          {cards.map((card) => (
            <VoteCard
              key={card.feedId}
              card={card}
              selectedCandidateId={selectedVotes[card.feedId]}
              onSelect={handleVote}
              actionState={actionStates[card.feedId]}
              likeCount={likeCounts[card.feedId] ?? 0}
              copied={copiedCardId === card.feedId}
              onToggleAction={handleToggleAction}
              onShare={handleShare}
              isActive={activeCardId === card.feedId}
              registerCardRef={registerCardRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
