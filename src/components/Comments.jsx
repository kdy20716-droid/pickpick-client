import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import "../pages/comments.css";
import { getComments, addComment, deleteComment, toggleCommentLike } from "../api/posts.js";
import { useAuth } from "../contexts/AuthContext";

const COMMENT_OVERLAY_BREAKPOINT = 1320;

function formatRelativeTime(createdAt) {
  const diffMinutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));

  if (diffMinutes < 1) {
    return "방금 전";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return `${Math.floor(diffHours / 24)}일 전`;
}

function CommentItem({
  comment,
  currentUser,
  isOpen,
  replyDraft,
  onLike,
  onDislike,
  onToggleReplies,
  onReplyDraftChange,
  onAddReply,
  onDelete,
  replies = [],
  isReply = false
}) {
  return (
    <article className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
      <div className="comment-avatar" aria-hidden="true" />
      <div className="comment-body" style={{ width: '100%' }}>
        <div className="comment-top">
          <div>
            <strong className="comment-name">{comment.author}</strong>
            <span className="comment-time">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          {currentUser && currentUser.id === comment.user_id && (
            <button
              type="button"
              className="comment-delete"
              onClick={() => onDelete(comment.id)}
            >
              삭제
            </button>
          )}
        </div>

        <p className="comment-text">{comment.content}</p>

        <div className="comment-actions">
          <button
            type="button"
            className={`comment-action action-like${comment.reaction === "like" ? " is-active" : ""}`}
            onClick={() => onLike(comment.id)}
          >
            <ThumbsUp /> 좋아요 {comment.likes > 0 ? comment.likes : ""}
          </button>
          <button
            type="button"
            className={`comment-action action-dislike${comment.reaction === "dislike" ? " is-active" : ""}`}
            onClick={() => onDislike(comment.id)}
          >
            <ThumbsDown /> 싫어요
          </button>
          {!isReply && (
            <button type="button" className="comment-action action-reply" onClick={() => onToggleReplies && onToggleReplies(comment.id)} style={{ marginLeft: '10px' }}>
              답글 {replies.length > 0 ? replies.length : ""}
            </button>
          )}
        </div>

        {!isReply && isOpen && (
          <div className="comment-replies" style={{ width: '100%', marginTop: '12px' }}>
            <div className="youtube-reply-container">
              <div className="comment-avatar comment-avatar-small" aria-hidden="true" />
              <div className="youtube-reply-content">
                <input
                  type="text"
                  value={replyDraft}
                  placeholder="답글 추가..."
                  className="youtube-reply-input"
                  onChange={(e) => onReplyDraftChange && onReplyDraftChange(comment.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && replyDraft.trim()) onAddReply && onAddReply(comment.id);
                  }}
                />
                <div className="youtube-reply-actions">
                  <button type="button" className="btn-cancel" onClick={() => onToggleReplies && onToggleReplies(comment.id)}>취소</button>
                  <button type="button" className="btn-submit" onClick={() => onAddReply && onAddReply(comment.id)} disabled={!replyDraft.trim()}>답글</button>
                </div>
              </div>
            </div>
            {replies.map(reply => (
               <CommentItem
                 key={reply.id}
                 comment={reply}
                 currentUser={currentUser}
                 onLike={onLike}
                 onDislike={onDislike}
                 onDelete={onDelete}
                 isReply={true}
               />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Comments({ title, targetCardId, onClose, postDbId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [openReplies, setOpenReplies] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const modalRef = useRef(null);

  const { user: currentUser } = useAuth();
  const userId = currentUser?.id || 'guest';

  const [commentReactions, setCommentReactions] = useState(() => {
    const saved = localStorage.getItem(`commentReactions_${userId}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(`commentReactions_${userId}`, JSON.stringify(commentReactions));
  }, [commentReactions, userId]);

  useEffect(() => {
    if (postDbId) {
      getComments(postDbId)
        .then(res => {
          if (res.success) {
            const formatted = res.comments.map(c => ({
              ...c,
              reaction: commentReactions[c.id] || null
            }));
            setComments(formatted);
          }
        })
        .catch(console.error);
    }
  }, [postDbId, commentReactions]);

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
        const nextSheetWidth = `${Math.round(maxSheetWidth)}px`;
        page?.style.setProperty("--vote-comment-sheet-width", nextSheetWidth);
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
        setComments((prev) => [{ ...res.comment, reaction: null }, ...prev]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;
    try {
      const res = await deleteComment(postDbId, commentId, currentUser.id);
      if (res.success) {
        setComments((currentComments) =>
          currentComments.filter((comment) => comment.id !== commentId),
        );
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
      if (res.success) {
        setCommentReactions((prev) => ({ ...prev, [commentId]: res.liked ? "like" : null }));
        setComments((current) =>
          current.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                reaction: res.liked ? "like" : null,
                likes: res.liked ? (c.likes || 0) + 1 : Math.max(0, (c.likes || 0) - 1),
              };
            }
            return c;
          }),
        );
      }
    } catch (error) {
      console.error(error);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const handleDislike = async (commentId) => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    setComments((current) =>
      current.map((c) => {
        if (c.id === commentId) {
          const hadLike = c.reaction === "like";
          const hadDislike = c.reaction === "dislike";
          const willDislike = !hadDislike;

          if (hadLike && willDislike) {
            // 좋아요 취소 처리 (await 하지 않고 백그라운드 호출)
            toggleCommentLike(postDbId, commentId, currentUser.id).catch(console.error);
          }

          setCommentReactions((prev) => ({ ...prev, [commentId]: willDislike ? "dislike" : null }));

          return {
            ...c,
            reaction: willDislike ? "dislike" : null,
            likes: hadLike ? Math.max(0, (c.likes || 0) - 1) : c.likes,
          };
        }
        return c;
      }),
    );
  };

  const handleToggleReplies = (commentId) => {
    setOpenReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleReplyDraftChange = (commentId, value) => {
    setReplyDrafts(prev => ({ ...prev, [commentId]: value }));
  };

  const handleAddReply = async (parentId) => {
    const text = replyDrafts[parentId]?.trim();
    if (!text || !postDbId || !currentUser) return;

    try {
      const res = await addComment(postDbId, currentUser.id, text, parentId);
      if (res.success) {
        // 백엔드에서 반환된 새 답글 추가
        setComments((prev) => [...prev, { ...res.comment, reaction: null }]);
        setReplyDrafts(prev => ({ ...prev, [parentId]: "" }));
        setOpenReplies(prev => ({ ...prev, [parentId]: true }));
      }
    } catch (err) {
      console.error(err);
      alert("답글 작성에 실패했습니다.");
    }
  };

  const parentComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="comment-modal-layer" key={userId}>
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
          {parentComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              isOpen={Boolean(openReplies[comment.id])}
              replyDraft={replyDrafts[comment.id] ?? ""}
              onLike={handleLike}
              onDislike={handleDislike}
              onToggleReplies={handleToggleReplies}
              onReplyDraftChange={handleReplyDraftChange}
              onAddReply={handleAddReply}
              onDelete={handleDeleteComment}
              replies={getReplies(comment.id)}
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
          <button type="button" onClick={handleAddComment}>
            등록
          </button>
        </footer>
      </aside>
    </div>
  );
}
