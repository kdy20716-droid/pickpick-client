import React, { useState } from "react";
import "./comments.css";

// 개별 댓글 컴포넌트
const CommentItem = ({ comment }) => {
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
          <span>👍 {comment.likes}</span>
          <span>💬 {comment.replies > 0 ? comment.replies : ""}</span>
        </div>
        {comment.replies > 0 && (
          <div className="reply">답글 {comment.replies}개</div>
        )}
      </div>
    </div>
  );
};

// 메인 댓글 모달 컴포넌트
const CommentApp = () => {
  // 초기 데이터 설정
  const [comments] = useState([
    { id: 1, name: "지존 지훈", text: "1빠", likes: 54, replies: 0 },
    {
      id: 2,
      name: "어그로꾼",
      text: "얘들아 내가 재밌는 얘기 해줄게...더보기",
      likes: 128,
      replies: 3,
    },
    { id: 3, name: "차미새", text: "o(*≧▽≦)ツ", likes: 234, replies: 19 },
    { id: 4, name: "익명", text: "＼(((￣▽￣)))／", likes: 2, replies: 43 },
  ]);

  return (
    <div className="modal">
      <div className="modal-header">
        <span>댓글 {comments.length}</span>
        <button className="close">×</button>
      </div>

      <div className="comment-list">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* 댓글 입력창 */}
      <div className="comment-input">
        <div className="avatar small"></div>
        <input type="text" placeholder="댓글 추가..." />
      </div>
    </div>
  );
};

export default CommentApp;
