import { useState } from "react";
import "../pages/comments.css";

const initialComments = [
  {
    id: 1,
    name: "지존 지훈",
    text: "1빠",
    likes: 54,
    dislikes: 0,
    replyItems: [],
  },
  {
    id: 2,
    name: "어그로꾼",
    text: "얘들아 내가 재밌는 얘기 해줄게...더보기",
    likes: 128,
    dislikes: 3,
    replyItems: [
      { id: 201, name: "반박러", text: "안 궁금한데 계속 해봐", likes: 12 },
      { id: 202, name: "구경꾼", text: "그래서 다음이 뭔데?", likes: 7 },
      { id: 203, name: "웃참실패", text: "이미 재밌다", likes: 3 },
    ],
  },
  {
    id: 3,
    name: "차미새",
    text: "o(*≧▽≦)ツ",
    likes: 234,
    dislikes: 1,
    replyItems: [
      { id: 301, name: "팬1", text: "이 이모티콘 너무 귀엽다", likes: 21 },
      { id: 302, name: "팬2", text: "오늘도 등장했다", likes: 8 },
    ],
  },
  {
    id: 4,
    name: "익명",
    text: "＼(((￣▽￣)))／",
    likes: 2,
    dislikes: 0,
    replyItems: [
      { id: 401, name: "지나가던 사람", text: "텐션 좋네", likes: 1 },
      { id: 402, name: "익명2", text: "나도 따라 해봄", likes: 0 },
    ],
  },
];

function LikeIcon() {
  return (
    <svg
      className="like-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9 21H6.2a1.2 1.2 0 0 1-1.2-1.2V11a1.2 1.2 0 0 1 1.2-1.2H9m0 11V9.2l3.2-5.1A1.3 1.3 0 0 1 14.6 5l-.5 4.8h4.7a1.8 1.8 0 0 1 1.8 2.1l-1.1 6.8A2.8 2.8 0 0 1 16.8 21H9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      className="comment-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.8 18.5 4 20V6.8A1.8 1.8 0 0 1 5.8 5h12.4A1.8 1.8 0 0 1 20 6.8v8.4a1.8 1.8 0 0 1-1.8 1.8H6.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DislikeIcon() {
  return (
    <svg
      className="dislike-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M15 3h2.8A1.2 1.2 0 0 1 19 4.2V13a1.2 1.2 0 0 1-1.2 1.2H15M15 3v11.8l-3.2 5.1a1.3 1.3 0 0 1-2.4-.9l.5-4.8H5.2A1.8 1.8 0 0 1 3.4 12l1.1-6.8A2.8 2.8 0 0 1 7.2 3H15Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReplyItem({ reply }) {
  return (
    <div className="reply-item">
      <div className="avatar small"></div>
      <div className="reply-content">
        <span className="name">{reply.name}</span>
        <p className="comment-text">{reply.text}</p>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  isOpen,
  replyDraft,
  isMenuOpen,
  onLike,
  onDislike,
  onToggleReplies,
  onReplyDraftChange,
  onAddReply,
  onToggleMenu,
  onDeleteComment,
}) {
  const replyCount = comment.replyItems.length;

  return (
    <div className="comment">
      <div className="avatar"></div>
      <div className="content">
        <div className="top-row">
          <span className="name">{comment.name}</span>
          <div className="comment-menu-wrap">
            <button
              type="button"
              className="menu-button"
              onClick={() => onToggleMenu(comment.id)}
              aria-label="댓글 메뉴 열기"
            >
              •••
            </button>
            {isMenuOpen && (
              <button
                type="button"
                className="comment-delete"
                onClick={() => onDeleteComment(comment.id)}
              >
                댓글 삭제
              </button>
            )}
          </div>
        </div>
        <p className="comment-text">{comment.text}</p>
        <div className="comment-meta">
          <div className="actions">
            <button
              type="button"
              className="action-button like-button"
              onClick={() => onLike(comment.id)}
            >
              <LikeIcon />
              <span>{comment.likes}</span>
            </button>
            <button
              type="button"
              className="action-button dislike-button"
              onClick={() => onDislike(comment.id)}
            >
              <DislikeIcon />
              <span>{comment.dislikes || 0}</span>
            </button>
            <button
              type="button"
              className="action-button comment-button"
              onClick={() => onToggleReplies(comment.id)}
            >
              <CommentIcon />
              <span>{replyCount > 0 ? replyCount : ""}</span>
            </button>
          </div>
          <button
            type="button"
            className="reply"
            onClick={() => onToggleReplies(comment.id)}
          >
            {isOpen
              ? "답글 숨기기"
              : replyCount > 0
                ? `답글 ${replyCount}개`
                : "답글 달기"}
          </button>
        </div>
        {isOpen && (
          <>
            {replyCount > 0 && (
              <div className="reply-list">
                {comment.replyItems.map((reply) => (
                  <ReplyItem key={reply.id} reply={reply} />
                ))}
              </div>
            )}
            <div className="reply-input">
              <input
                type="text"
                placeholder="답글 추가..."
                value={replyDraft}
                onChange={(event) =>
                  onReplyDraftChange(comment.id, event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onAddReply(comment.id);
                  }
                }}
              />
              <button
                type="button"
                className="reply-submit"
                onClick={() => onAddReply(comment.id)}
              >
                등록
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Comments({ setOpen }) {
  const [comments, setComments] = useState(initialComments);
  const [openReplies, setOpenReplies] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [newComment, setNewComment] = useState("");

  const handleLike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment,
      ),
    );
  };

  const handleDislike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, dislikes: (comment.dislikes || 0) + 1 }
          : comment,
      ),
    );
  };

  const handleToggleReplies = (commentId) => {
    setOpenReplies((prevOpenReplies) => ({
      ...prevOpenReplies,
      [commentId]: !prevOpenReplies[commentId],
    }));
  };

  const handleAddComment = () => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment) {
      return;
    }

    setComments((prevComments) => [
      ...prevComments,
      {
        id: Date.now(),
        name: "익명",
        text: trimmedComment,
        likes: 0,
        dislikes: 0,
        replyItems: [],
      },
    ]);
    setNewComment("");
  };

  const handleToggleMenu = (commentId) => {
    setOpenMenuId((prevOpenMenuId) =>
      prevOpenMenuId === commentId ? null : commentId,
    );
  };

  const handleDeleteComment = (commentId) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== commentId),
    );

    setOpenReplies((prevOpenReplies) => {
      const nextOpenReplies = { ...prevOpenReplies };
      delete nextOpenReplies[commentId];
      return nextOpenReplies;
    });

    setReplyDrafts((prevReplyDrafts) => {
      const nextReplyDrafts = { ...prevReplyDrafts };
      delete nextReplyDrafts[commentId];
      return nextReplyDrafts;
    });

    setOpenMenuId(null);
  };

  const handleReplyDraftChange = (commentId, value) => {
    setReplyDrafts((prevReplyDrafts) => ({
      ...prevReplyDrafts,
      [commentId]: value,
    }));
  };

  const handleAddReply = (commentId) => {
    const trimmedReply = (replyDrafts[commentId] || "").trim();

    if (!trimmedReply) {
      return;
    }

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replyItems: [
                ...comment.replyItems,
                {
                  id: Date.now() + commentId,
                  name: "익명",
                  text: trimmedReply,
                  likes: 0,
                },
              ],
            }
          : comment,
      ),
    );

    setReplyDrafts((prevReplyDrafts) => ({
      ...prevReplyDrafts,
      [commentId]: "",
    }));

    setOpenReplies((prevOpenReplies) => ({
      ...prevOpenReplies,
      [commentId]: true,
    }));
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      handleAddComment();
    }
  };

  return (
    <div className="modal-background" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <span>댓글 {comments.length}</span>
          <button
            className="close"
            type="button"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOpen={Boolean(openReplies[comment.id])}
              replyDraft={replyDrafts[comment.id] || ""}
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

        <div className="comment-input">
          <div className="avatar small"></div>
          <input
            type="text"
            placeholder="댓글 추가..."
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            className="comment-submit"
            onClick={handleAddComment}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
