import { useEffect, useLayoutEffect, useRef, useState } from "react";
import CommentItem from "./CommentItem.jsx";
import "../pages/comments.css";
import {
  addComment,
  deleteComment,
  getComments,
  toggleCommentLike,
} from "../api/posts.js";

const COMMENT_OVERLAY_BREAKPOINT = 1320;

function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

function getSavedCommentReactions() {
  try {
    const saved = localStorage.getItem("commentReactions");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function toTimestamp(value) {
  if (!value) {
    return Date.now();
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Date.now() : timestamp;
}

function normalizeReply(reply) {
  return {
    ...reply,
    id: reply.id,
    name: reply.name ?? reply.author ?? reply.user_name ?? "익명",
    text: reply.text ?? reply.content ?? "",
    createdAt: reply.createdAt ?? toTimestamp(reply.created_at),
    likes: reply.likes ?? 0,
  };
}

function normalizeComment(comment, reaction = null) {
  return {
    ...comment,
    id: comment.id,
    user_id: comment.user_id,
    name: comment.name ?? comment.author ?? comment.user_name ?? "익명",
    text: comment.text ?? comment.content ?? "",
    createdAt: comment.createdAt ?? toTimestamp(comment.created_at),
    likes: comment.likes ?? 0,
    dislikes: comment.dislikes ?? 0,
    reaction,
    replyItems: (comment.replyItems ?? comment.replies ?? []).map(
      normalizeReply,
    ),
  };
}

export default function Comments({ title, targetCardId, onClose, postDbId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openReplies, setOpenReplies] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const modalRef = useRef(null);
  const lastReplySubmitRef = useRef({});

  const currentUser = getCurrentUser();

  const [commentReactions, setCommentReactions] = useState(
    getSavedCommentReactions,
  );

  useEffect(() => {
    localStorage.setItem("commentReactions", JSON.stringify(commentReactions));
  }, [commentReactions]);

  useEffect(() => {
    let ignore = false;

    if (!postDbId) {
      return () => {
        ignore = true;
      };
    }

    getComments(postDbId)
      .then((res) => {
        if (ignore || !res.success) {
          return;
        }

        setComments(
          res.comments.map((comment) =>
            normalizeComment(comment, commentReactions[comment.id] ?? null),
          ),
        );
      })
      .catch(console.error);

    return () => {
      ignore = true;
    };
  }, [commentReactions, postDbId]);

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

  const handleAddComment = async () => {
    const text = newComment.trim();

    if (!text || !postDbId) {
      return;
    }

    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await addComment(postDbId, currentUser.id, text);
      if (res.success) {
        setComments((prev) => [normalizeComment(res.comment, null), ...prev]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
      alert("댓글 작성에 실패했습니다.");
    }
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

    if (!text || now - (lastSubmit ?? 0) < 400) {
      return;
    }

    lastReplySubmitRef.current[commentId] = now;

    setComments((currentComments) =>
      currentComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replyItems: [
                ...comment.replyItems,
                {
                  id: `reply-${commentId}-${now}`,
                  name: currentUser?.name ?? currentUser?.nickname ?? "익명",
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

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await deleteComment(postDbId, commentId, currentUser.id);
      if (res.success) {
        setComments((currentComments) =>
          currentComments.filter((comment) => comment.id !== commentId),
        );
        setOpenMenuId(null);
      }
    } catch (err) {
      console.error(err);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const handleLike = async (commentId) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await toggleCommentLike(postDbId, commentId, currentUser.id);
      if (!res.success) {
        return;
      }

      setCommentReactions((prev) => ({
        ...prev,
        [commentId]: res.liked ? "like" : null,
      }));
      setComments((current) =>
        current.map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }

          const hadDislike = comment.reaction === "dislike";

          return {
            ...comment,
            reaction: res.liked ? "like" : null,
            likes:
              res.likes ??
              (res.liked
                ? (comment.likes || 0) + 1
                : Math.max(0, (comment.likes || 0) - 1)),
            dislikes: hadDislike
              ? Math.max(0, (comment.dislikes || 0) - 1)
              : comment.dislikes,
          };
        }),
      );
    } catch (error) {
      console.error(error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleDislike = (commentId) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    const targetComment = comments.find((comment) => comment.id === commentId);
    const hadLike = targetComment?.reaction === "like";
    const hadDislike = targetComment?.reaction === "dislike";
    const willDislike = !hadDislike;

    if (hadLike && willDislike) {
      toggleCommentLike(postDbId, commentId, currentUser.id).catch(
        console.error,
      );
    }

    setCommentReactions((prev) => ({
      ...prev,
      [commentId]: willDislike ? "dislike" : null,
    }));
    setComments((current) =>
      current.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        return {
          ...comment,
          reaction: willDislike ? "dislike" : null,
          likes: hadLike
            ? Math.max(0, (comment.likes || 0) - 1)
            : comment.likes,
          dislikes: Math.max(
            0,
            (comment.dislikes || 0) + (willDislike ? 1 : -1),
          ),
        };
      }),
    );
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
              onLike={handleLike}
              onDislike={handleDislike}
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
