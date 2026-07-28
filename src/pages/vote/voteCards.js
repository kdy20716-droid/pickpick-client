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

/**
 * Note: createVoteCards and createVoteBatch were removed as they depended on undefined voteTemplates
 * and are no longer used in the current API-driven architecture of VotePage.
 */

/**
 * 정렬된 카드 목록의 순서를 보존하며, 특정 targetCardId가 지정된 경우 해당 카드를 맨 위에 핀 고정합니다.
 * @param {Array} cards - 정렬 완료된 카드 목록
 * @param {string} targetCardId - 핀 고정할 카드 ID (선택)
 * @returns {Array} 핀 고정 및 정렬이 보존된 카드 목록
 */
export function pinTargetCard(cards, targetCardId) {
  if (!targetCardId) {
    return cards;
  }

  const pinnedCard = cards.find((card) => card.feedId === targetCardId);

  if (!pinnedCard) {
    return cards;
  }

  return [
    pinnedCard,
    ...cards.filter((card) => card.feedId !== targetCardId),
  ];
}
