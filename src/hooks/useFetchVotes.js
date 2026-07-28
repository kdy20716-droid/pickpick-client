import { useState, useCallback, useRef } from "react";
import { getVote } from "../api/posts";
import { pinTargetCard } from "../pages/vote/voteCards";

/**
 * 투표 목록 fetch, 포맷, 정렬을 담당하는 커스텀 훅
 * @param {object} params
 * @param {string} params.selectedTag - 선택된 카테고리 태그
 * @param {boolean} params.isLoggedIn
 * @param {string|number|null} params.currentUserId
 * @param {string} params.targetVoteId - 고정 핀 투표 ID
 */
export function useFetchVotes({ selectedTag, isLoggedIn, currentUserId, targetVoteId }) {
  const [cards, setCards] = useState([]);
  const [isVotesLoading, setIsVotesLoading] = useState(true);
  const [votesError, setVotesError] = useState("");
  const fetchSequenceRef = useRef(0);

  const fetchVotes = useCallback(
    async (onVotesReady) => {
      const fetchId = ++fetchSequenceRef.current;
      setIsVotesLoading(true);
      setVotesError("");

      try {
        const data = await getVote(
          null,
          selectedTag,
          "random",
          isLoggedIn ? currentUserId : null,
          null,
          null,
          null,
          targetVoteId || null,
        );
        if (fetchSequenceRef.current !== fetchId) return;

        const serverVotes = {};
        const serverActions = {};

        const formattedCards = data.map((item) => {
          const cardId = item.id.toString();
          const total =
            (item.candidate_a_count || 0) + (item.candidate_b_count || 0);

          if (item.user_voted_side)
            serverVotes[cardId] = item.user_voted_side.toLowerCase();
          serverActions[cardId] = {
            like: !!item.user_liked,
            likeCount: item.like_count || 0,
          };

          return {
            id: cardId,
            feedId: cardId,
            title: item.title,
            expiresAt: item.expires_at,
            isExpired: item.expires_at
              ? new Date(item.expires_at) <= new Date()
              : false,
            isVoted: !!item.user_voted_side,
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
            shares: {
              left:
                total === 0
                  ? 50
                  : Math.round((item.candidate_a_count / total) * 100),
              right:
                total === 0
                  ? 50
                  : Math.round((item.candidate_b_count / total) * 100),
            },
          };
        });

        // 정렬: 미투표 → 마감안됨 → 무기한 → 마감됨
        const sorted = formattedCards.sort((a, b) => {
          if (a.isVoted !== b.isVoted)
            return (a.isVoted ? 1 : 0) - (b.isVoted ? 1 : 0);

          const getPriority = (c) => {
            if (c.expiresAt && !c.isExpired) return 0;
            if (!c.expiresAt) return 1;
            return 2;
          };
          return getPriority(a) - getPriority(b);
        });

        setCards(pinTargetCard(sorted, targetVoteId));

        // 서버에서 받은 투표/액션 상태를 부모로 전달
        if (onVotesReady) onVotesReady(serverVotes, serverActions);
      } catch {
        if (fetchSequenceRef.current === fetchId) {
          setCards([]);
          setVotesError("투표 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (fetchSequenceRef.current === fetchId) setIsVotesLoading(false);
      }
    },
    [selectedTag, isLoggedIn, currentUserId, targetVoteId],
  );

  return { cards, setCards, isVotesLoading, votesError, fetchVotes };
}
