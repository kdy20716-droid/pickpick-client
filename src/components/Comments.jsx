import { useLayoutEffect, useRef, useState } from "react";
import CommentItem from "./CommentItem.jsx";
import { commentSeedItems } from "./comments.js";
import "../pages/comments.css";

const COMMENT_OVERLAY_BREAKPOINT = 1320;

function getSeedCreatedAt(item) {
  const minutesAgo = item.minutesAgo ?? item.hoursAgo * 60;
  return Date.now() - minutesAgo * 60 * 1000;
}

function createInitialComments() {
  return commentSeedItems.map((comment) => ({
    ...comment,
    createdAt: getSeedCreatedAt(comment),
    reaction: null,
    replyItems: comment.replyItems.map((reply) => ({
      ...reply,
      createdAt: getSeedCreatedAt(reply),
    })),
  }));
}

function updateReaction(comment, nextReaction) {
  const hadLike = comment.reaction === "like";
  const hadDislike = comment.reaction === "dislike";
  const willLike = nextReaction === "like" && !hadLike;
  const willDislike = nextReaction === "dislike" && !hadDislike;

  return {
    ...comment,
    likes: Math.max(0, comment.likes + (willLike ? 1 : 0) - (hadLike ? 1 : 0)),
    dislikes: Math.max(
      0,
      comment.dislikes + (willDislike ? 1 : 0) - (hadDislike ? 1 : 0),
    ),
    reaction: willLike ? "like" : willDislike ? "dislike" : null,
  };
}

export default function Comments({ title, targetCardId, onClose }) {
  const [comments, setComments] = useState(createInitialComments);
  const [newComment, setNewComment] = useState("");
  const [openReplies, setOpenReplies] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const modalRef = useRef(null);
  const lastCommentSubmitRef = useRef({ text: "", time: 0 });
  const lastReplySubmitRef = useRef({});

  useLayoutEffect(() => {
    const modal = modalRef.current;
    if (!modal) {
      return undefined;
    }

    const page = modal.closest(".vote-page");
    const compactLayoutQuery = window.matchMedia(
      `(max-width: ${COMMENT_OVERLAY_BREAKPOINT}px)`,
    );
    let frameId = 0;
    let settleTimeoutId = 0;

    const getTargetVoteSheet = () => {
      const targetCard = targetCardId
        ? document.getElementById(targetCardId)
        : null;

      return (
        targetCard?.querySelector(".vote-sheet") ??
        document.querySelector(".vote-feed-item.is-active .vote-sheet") ??
        document.querySelector(".vote-sheet")
      );
    };

    const syncModalSize = () => {
      if (compactLayoutQuery.matches) {
        page?.style.removeProperty("--vote-comment-sheet-width");
        page?.style.removeProperty("--vote-comment-group-shift");
      } else {
        page?.style.setProperty("--vote-comment-group-shift", "0px");
      }

      const voteSheet = getTargetVoteSheet();
      if (!voteSheet) {
        return;
      }

      const targetCard = targetCardId
        ? document.getElementById(targetCardId)
        : null;
      const actionRail = targetCard?.querySelector(".vote-action-rail");
      let sheetRect = voteSheet.getBoundingClientRect();
      let railRect = actionRail?.getBoundingClientRect();
      const modalWidth = modal.getBoundingClientRect().width;

      if (railRect && !compactLayoutQuery.matches) {
        const sheetToRailGap = Math.max(0, railRect.left - sheetRect.right);
        const maxSheetWidth = Math.max(
          420,
          Math.min(
            850,
            window.innerWidth -
              modalWidth -
              railRect.width -
              sheetToRailGap * 2 -
              48,
          ),
        );
        page?.style.setProperty(
          "--vote-comment-sheet-width",
          `${Math.round(maxSheetWidth)}px`,
        );
        page?.style.setProperty("--vote-comment-group-shift", "0px");

        sheetRect = voteSheet.getBoundingClientRect();
        railRect = actionRail.getBoundingClientRect();

        const settledGap = Math.max(0, railRect.left - sheetRect.right);
        const groupWidth =
          sheetRect.width +
          settledGap +
          railRect.width +
          settledGap +
          modalWidth;
        const centeredGroupLeft = (window.innerWidth - groupWidth) / 2;
        const nextGroupLeft = Math.max(24, centeredGroupLeft);
        const nextShift = nextGroupLeft - sheetRect.left;
        const nextModalLeft =
          nextGroupLeft +
          sheetRect.width +
          settledGap +
          railRect.width +
          settledGap;

        page?.style.setProperty("--vote-comment-group-shift", `${nextShift}px`);
        modal.style.setProperty("--comment-modal-left", `${nextModalLeft}px`);
        modal.style.setProperty("--comment-modal-right", "auto");
      }

      modal.style.setProperty("--comment-modal-top", `${sheetRect.top}px`);
      modal.style.setProperty(
        "--comment-modal-height",
        `${sheetRect.height}px`,
      );
    };

    const scheduleSync = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(syncModalSize);
    };

    syncModalSize();
    settleTimeoutId = window.setTimeout(scheduleSync, 280);

    const targetVoteSheet = getTargetVoteSheet();
    const feed = document.querySelector(".vote-feed");
    const resizeObserver =
      window.ResizeObserver && targetVoteSheet
        ? new ResizeObserver(scheduleSync)
        : null;

    resizeObserver?.observe(targetVoteSheet);
    window.addEventListener("resize", scheduleSync);
    feed?.addEventListener("scroll", scheduleSync, { passive: true });

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      window.clearTimeout(settleTimeoutId);
      resizeObserver?.disconnect();
      page?.style.removeProperty("--vote-comment-sheet-width");
      page?.style.removeProperty("--vote-comment-group-shift");
      window.removeEventListener("resize", scheduleSync);
      feed?.removeEventListener("scroll", scheduleSync);
    };
  }, [targetCardId]);

  const handleReaction = (commentId, reaction) => {
    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId ? updateReaction(comment, reaction) : comment,
      ),
    );
  };

  const handleAddComment = () => {
    const text = newComment.trim();
    const now = Date.now();

    if (!text) {
      return;
    }

    if (
      lastCommentSubmitRef.current.text === text &&
      now - lastCommentSubmitRef.current.time < 800
    ) {
      return;
    }

    lastCommentSubmitRef.current = { text, time: now };
    setComments((currentComments) => [
      ...currentComments,
      {
        id: now,
        name: "익명",
        text,
        createdAt: now,
        likes: 0,
        dislikes: 0,
        reaction: null,
        replyItems: [],
      },
    ]);
    setNewComment("");
  };

  const handleToggleReplies = (commentId) => {
    setOpenReplies((currentOpenReplies) => ({
      ...currentOpenReplies,
      [commentId]: !currentOpenReplies[commentId],
    }));
  };

  const handleReplyDraftChange = (commentId, value) => {
    setReplyDrafts((currentReplyDrafts) => ({
      ...currentReplyDrafts,
      [commentId]: value,
    }));
  };

  const handleAddReply = (commentId) => {
    const text = (replyDrafts[commentId] ?? "").trim();
    const now = Date.now();
    const lastSubmit = lastReplySubmitRef.current[commentId];

    if (!text) {
      return;
    }

    if (lastSubmit?.text === text && now - lastSubmit.time < 800) {
      return;
    }

    lastReplySubmitRef.current = {
      ...lastReplySubmitRef.current,
      [commentId]: { text, time: now },
    };

    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replyItems: [
                ...comment.replyItems,
                {
                  id: now + commentId,
                  name: "익명",
                  text,
                  createdAt: now,
                  likes: 0,
                },
              ],
            }
          : comment,
      ),
    );

    setReplyDrafts((currentReplyDrafts) => ({
      ...currentReplyDrafts,
      [commentId]: "",
    }));

    setOpenReplies((currentOpenReplies) => ({
      ...currentOpenReplies,
      [commentId]: true,
    }));
  };

  const handleToggleMenu = (commentId) => {
    setOpenMenuId((currentOpenMenuId) =>
      currentOpenMenuId === commentId ? null : commentId,
    );
  };

  const handleDeleteComment = (commentId) => {
    setComments((currentComments) =>
      currentComments.filter((comment) => comment.id !== commentId),
    );

    setOpenReplies((currentOpenReplies) => {
      const nextOpenReplies = { ...currentOpenReplies };
      delete nextOpenReplies[commentId];
      return nextOpenReplies;
    });

    setReplyDrafts((currentReplyDrafts) => {
      const nextReplyDrafts = { ...currentReplyDrafts };
      delete nextReplyDrafts[commentId];
      return nextReplyDrafts;
    });

    setOpenMenuId(null);
  };

  return (
    <div className="comment-modal-layer">
      <button
        type="button"
        className="comment-modal-backdrop"
        aria-label="댓글창 닫기"
        onClick={onClose}
      />
      <aside
        ref={modalRef}
        className="comment-modal"
        aria-label={`${title} 댓글`}
      >
        <header className="comment-modal-header">
          <div>
            <span className="comment-modal-label">댓글</span>
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="comment-modal-close"
            onClick={onClose}
          >
            닫기
          </button>
        </header>

        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOpen={Boolean(openReplies[comment.id])}
              replyDraft={replyDrafts[comment.id] ?? ""}
              isMenuOpen={openMenuId === comment.id}
              onLike={(commentId) => handleReaction(commentId, "like")}
              onDislike={(commentId) => handleReaction(commentId, "dislike")}
              onToggleReplies={handleToggleReplies}
              onReplyDraftChange={handleReplyDraftChange}
              onAddReply={handleAddReply}
              onToggleMenu={handleToggleMenu}
              onDeleteComment={handleDeleteComment}
            />
          ))}
        </div>

        <footer className="comment-input">
          <div className="comment-avatar is-small" aria-hidden="true" />
          <input
            type="text"
            value={newComment}
            placeholder="댓글 추가..."
            onChange={(event) => setNewComment(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.repeat) {
                return;
              }

              if (event.key === "Enter") {
                handleAddComment();
              }
            }}
          />
          <button
            type="button"
            className="comment-submit"
            onClick={handleAddComment}
          >
            등록
          </button>
        </footer>
      </aside>
    </div>
  );
}
