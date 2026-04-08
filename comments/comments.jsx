import React, { useState } from "react";
import "./comments.css";

const CommentModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  const comments = [
    {
      id: 1,
      name: "지존 지훈",
      text: "1빠",
      likes: 54,
      replies: 0,
    },
    {
      id: 2,
      name: "어그로꾼",
      text: "얘들아 내가 재밌는 얘기 해줄게...",
      likes: 128,
      replies: 3,
    },
    {
      id: 3,
      name: "차미새",
      text: "ㅇ(*≧▽≦)ツ",
      likes: 234,
      replies: 19,
    },
    {
      id: 4,
      name: "익명",
      text: "(( ( ￣▽￣)))",
      likes: 2,
      replies: 43,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal">
      {/* 헤더 */}
      <div className="modal-header">
        <span>댓글 {comments.length}</span>
        <button className="close" onClick={() => setIsOpen(false)}>
          ×
        </button>
      </div>

      {/* 댓글 리스트 */}
      <div className="comment-list">
        {comments.map((c) => (
          <div key={c.id} className="comment">
            <div className="avatar"></div>

            <div className="content">
              <div className="top">
                <span className="name">{c.name}</span>
                <span className="menu">...</span>
              </div>

              <p>{c.text}</p>

              <div className="actions">
                <span>👍 {c.likes}</span>
                <span>💬 {c.replies}</span>
              </div>

              {c.replies > 0 && <div className="reply">답글 {c.replies}개</div>}
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력 */}
      <div className="comment-input">
        <div className="avatar small"></div>
        <input type="text" placeholder="댓글 추가..." />
      </div>
    </div>
  );
};

export default CommentModal;
