import { useState, useEffect } from "react";
import { initialActionState } from "../pages/vote/voteUtils";

/**
 * 투표/좋아요 상태 및 localStorage 동기화를 담당하는 커스텀 훅
 * @param {string|"guest"} userId
 */
export function useVoteState(userId) {
  const isGuest = userId === "guest";

  const [selectedVotes, setSelectedVotes] = useState(() => {
    if (isGuest) return {};
    return JSON.parse(localStorage.getItem(`selectedVotes_${userId}`) || "{}");
  });

  const [cardActions, setCardActions] = useState(() => {
    if (isGuest) return {};
    return JSON.parse(localStorage.getItem(`cardActions_${userId}`) || "{}");
  });

  // userId 변경 시 (로그인/로그아웃) 상태 동기화
  useEffect(() => {
    if (isGuest) {
      setSelectedVotes({});
      setCardActions({});
    } else {
      setSelectedVotes(JSON.parse(localStorage.getItem(`selectedVotes_${userId}`) || "{}"));
      setCardActions(JSON.parse(localStorage.getItem(`cardActions_${userId}`) || "{}"));
    }
  }, [userId, isGuest]);

  // selectedVotes → localStorage 저장 (회원만)
  useEffect(() => {
    if (!isGuest) {
      localStorage.setItem(`selectedVotes_${userId}`, JSON.stringify(selectedVotes));
    }
  }, [selectedVotes, userId, isGuest]);

  // cardActions → localStorage 저장 (회원만)
  useEffect(() => {
    if (!isGuest) {
      localStorage.setItem(`cardActions_${userId}`, JSON.stringify(cardActions));
    }
  }, [cardActions, userId, isGuest]);

  // 비회원 키 오염 방지: 마운트/언마운트 시 guest 키 제거
  useEffect(() => {
    localStorage.removeItem("selectedVotes_guest");
    localStorage.removeItem("cardActions_guest");
    return () => {
      localStorage.removeItem("selectedVotes_guest");
      localStorage.removeItem("cardActions_guest");
    };
  }, []);

  // 좋아요 전역 이벤트 수신 (다른 컴포넌트의 좋아요 변경 반영)
  useEffect(() => {
    const handleLikeUpdated = (e) => {
      const { userId: eventUserId, cardId, liked, likeCount } = e.detail ?? {};
      if (String(eventUserId) !== String(userId) || !cardId) return;

      setCardActions((prev) => {
        const state = prev[cardId] ?? initialActionState;
        return {
          ...prev,
          [cardId]: {
            ...state,
            like: !!liked,
            likeCount: Number.isFinite(likeCount)
              ? Math.max(0, likeCount)
              : state.likeCount,
          },
        };
      });
    };

    window.addEventListener("vote-like-updated", handleLikeUpdated);
    return () => window.removeEventListener("vote-like-updated", handleLikeUpdated);
  }, [userId]);

  return {
    selectedVotes,
    setSelectedVotes,
    cardActions,
    setCardActions,
  };
}
