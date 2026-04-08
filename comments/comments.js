document.addEventListener("DOMContentLoaded", () => {
  const commentListEl = document.querySelector(".comment-list");
  const commentInputEl = document.querySelector(".comment-input input");

  function getReplyCount(commentEl) {
    const actionReply = Array.from(
      commentEl.querySelectorAll(".actions span"),
    ).find((el) => el.textContent.includes("💬"));
    const replyText = actionReply ? actionReply.textContent : "";
    const marker = commentEl.querySelector(".reply");
    const markerText = marker ? marker.textContent : "";

    const first = replyText || markerText;
    const match = first.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  function toggleReplies(commentEl) {
    if (!commentEl) return;

    const nextSibling = commentEl.nextElementSibling;
    let replyList =
      nextSibling && nextSibling.classList.contains("reply-list")
        ? nextSibling
        : null;

    if (replyList) {
      replyList.classList.toggle("hidden");
      return;
    }

    const count = getReplyCount(commentEl);
    replyList = document.createElement("div");
    replyList.className = "reply-list";

    if (count <= 0) {
      replyList.innerHTML = "<div class='reply-item'>답글이 없습니다.</div>";
    } else {
      for (let i = 1; i <= count && i <= 10; i++) {
        replyList.innerHTML += `
          <div class="reply-item">
            <div class="avatar small"></div>
            <div class="content">
              <div class="top">
                <span class="name">답글 작성자 ${i}</span>
              </div>
              <p>이것은 답글 ${i} 입니다.</p>
            </div>
          </div>
        `;
      }
      if (count > 10) {
        replyList.innerHTML += `<div class='reply-item'>+${count - 10}개의 추가 답글</div>`;
      }
    }

    commentEl.insertAdjacentElement("afterend", replyList);
  }

  function initializeCommentEvents(commentEl) {
    const actionSpans = commentEl.querySelectorAll(".actions span");
    actionSpans.forEach((span) => {
      const trimmed = span.textContent.trim();

      if (trimmed.startsWith("👍")) {
        span.style.cursor = "pointer";
        span.addEventListener("click", () => {
          const text = span.textContent.trim();
          const match = text.match(/👍\s*(\d+)/);
          let current = 0;
          if (match && match[1]) {
            current = parseInt(match[1], 10);
          }

          if (Number.isNaN(current)) {
            current = 0;
          }

          span.textContent = `👍 ${current + 1}`;
        });
      }

      if (trimmed.startsWith("💬")) {
        span.style.cursor = "pointer";
        span.addEventListener("click", () => {
          const commentEl = span.closest(".comment");
          toggleReplies(commentEl);
        });
      }
    });

    const replyMarker = commentEl.querySelector(".reply");
    if (replyMarker) {
      replyMarker.style.cursor = "pointer";
      replyMarker.addEventListener("click", () => {
        const commentEl = replyMarker.closest(".comment");
        toggleReplies(commentEl);
      });
    }

    const menuBtn = commentEl.querySelector(".menu");
    if (menuBtn) {
      menuBtn.style.cursor = "pointer";
      menuBtn.addEventListener("click", () => {
        const confirmed = window.confirm("댓글을 삭제하시겠습니까?");
        if (!confirmed) return;

        const existingReplyList = commentEl.nextElementSibling;
        if (
          existingReplyList &&
          existingReplyList.classList.contains("reply-list")
        ) {
          existingReplyList.remove();
        }

        commentEl.remove();
      });
    }
  }

  // 초기 댓글 이벤트 바인딩
  document
    .querySelectorAll(".comment-list .comment")
    .forEach((comment) => initializeCommentEvents(comment));

  // 댓글 입력 후 Enter 키로 추가
  if (commentInputEl) {
    commentInputEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;

      const content = commentInputEl.value.trim();
      if (!content) return;

      const newComment = document.createElement("div");
      newComment.className = "comment";
      newComment.innerHTML = `
        <div class="avatar"></div>
        <div class="content">
          <div class="top">
            <span class="name">익명</span>
            <span class="menu">⋯</span>
          </div>
          <p>${content}</p>
          <div class="actions">
            <span>👍 0</span>
            <span>💬</span>
          </div>
        </div>
      `;

      commentListEl.appendChild(newComment);
      initializeCommentEvents(newComment);
      commentInputEl.value = "";
    });
  }
});
