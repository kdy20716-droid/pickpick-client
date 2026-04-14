import { voteTemplates } from "../../data/votes.js";

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

export function getVoteFeedIdFromHash(hash) {
  try {
    return decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return hash.replace(/^#/, "");
  }
}

export function getVoteHash(feedId) {
  return `#${encodeURIComponent(feedId)}`;
}

export function createVoteCards(pinnedFeedId = "") {
  const cards = voteTemplates.map((template, index) =>
    makeVoteCard(template, index),
  );
  const pinnedCard = cards.find((card) => card.feedId === pinnedFeedId);

  if (!pinnedCard) {
    return shuffleCards(cards);
  }

  return [
    pinnedCard,
    ...shuffleCards(cards.filter((card) => card.feedId !== pinnedFeedId)),
  ];
}
