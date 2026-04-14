import React, { useState } from "react";
import "./Comments.css";

const initialComments = [
  { id: 1, name: "지존 지훈", text: "1빠", likes: 54, replyItems: [] },
  {
    id: 2,
    name: "어그로꾼",
    text: "얘들아 내가 재밌는 얘기 해줄게...더보기",
    likes: 128,
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
    replyItems: [
      { id: 401, name: "지나가던 사람", text: "텐션 좋네", likes: 1 },
      { id: 402, name: "익명2", text: "나도 따라 해봄", likes: 0 },
    ],
  },
];

const ReplyItem = ({ reply }) => {
  return (
    <div className="reply-item">
      <div className="avatar small"></div>
      <div className="reply-content">
        <span className="name">{reply.name}</span>
        <p className="comment-text">{reply.text}</p>
      </div>
    </div>
  );
};

const CommentItem = ({ comment, isOpen, onLike, onToggleReplies }) => {
  const replyCount = comment.replyItems.length;

  return (
    <div className="comment">
      <div className="avatar"></div>
      <div className="content">
        <div className="top-row">
          <span className="name">{comment.name}</span>
          <span className="menu">⋯</span>
        </div>
        <p className="comment-text">{comment.text}</p>
        <div className="actions">
          <button
            type="button"
            className="action-button"
            onClick={() => onLike(comment.id)}
          >
            👍 {comment.likes}
          </button>
          <button
            type="button"
            className="action-button"
            onClick={() => onToggleReplies(comment.id)}
          >
            💬 {replyCount > 0 ? replyCount : ""}
          </button>
        </div>
        {replyCount > 0 && (
          <button
            type="button"
            className="reply"
            onClick={() => onToggleReplies(comment.id)}
          >
            {isOpen ? "답글 숨기기" : `답글 ${replyCount}개`}
          </button>
        )}
        {isOpen && replyCount > 0 && (
          <div className="reply-list">
            {comment.replyItems.map((reply) => (
              <ReplyItem key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentApp = ({ isOpen, onClose, cardId }) => {
  const [comments, setComments] = useState(initialComments);
  const [openReplies, setOpenReplies] = useState({});
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
        replyItems: [],
      },
    ]);
    setNewComment("");
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      handleAddComment();
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="comments-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comments-title"
      >
        <div className="modal-header">
          <h3 id="comments-title">댓글 ({comments.length})</h3>
          <button className="close" onClick={onClose} aria-label="닫기">
            &times;
          </button>
        </div>

        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOpen={Boolean(openReplies[comment.id])}
              onLike={handleLike}
              onToggleReplies={handleToggleReplies}
            />
          ))}
        </div>

        <p
          style={{
            color: "#999",
            fontSize: "12px",
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          (투표 ID: {cardId})
        </p>

        <div className="comment-input">
          <div className="avatar small"></div>
          <input
            type="text"
            placeholder="댓글 추가..."
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <button className="comment-submit" onClick={handleAddComment}>
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentApp;
