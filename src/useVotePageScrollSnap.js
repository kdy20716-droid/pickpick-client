import { useEffect, useEffectEvent } from "react";

function getHeaderHeight() {
  const header = document.querySelector(".site-header");
  return Math.round(header?.getBoundingClientRect().height ?? 0);
}

export function useVotePageScrollSnap({ pageRef, feedRef, activeCardId, cardRefs }) {
  const syncViewportOffset = useEffectEvent(() => {
    const page = pageRef.current;
    if (!page) {
      return;
    }

    page.style.setProperty("--vote-header-offset", `${getHeaderHeight()}px`);
  });

  const alignActiveCard = useEffectEvent((behavior = "auto") => {
    const feed = feedRef.current;
    const activeCard = cardRefs.current.get(activeCardId);

    if (!feed || !activeCard) {
      return;
    }

    const feedRect = feed.getBoundingClientRect();
    const cardRect = activeCard.getBoundingClientRect();
    const nextTop = feed.scrollTop + (cardRect.top - feedRect.top);

    feed.scrollTo({
      top: Math.max(0, Math.round(nextTop)),
      behavior,
    });
  });

  useEffect(() => {
    syncViewportOffset();

    const handleResize = () => {
      syncViewportOffset();
      alignActiveCard();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
}
