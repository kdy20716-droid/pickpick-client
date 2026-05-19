import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../api/instance";
import "./Admin.css";

const Admin = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [votes, setVotes] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedVoteId, setSelectedVoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("votes"); // 'votes', 'comments', or 'users'
  const [deleteModal, setDeleteModal] = useState(null); // null, 'vote', 'comment'
  const [itemToDelete, setItemToDelete] = useState(null);
  const [users, setUsers] = useState([]);

  // 2차 인증 상태
  const [isVerified, setIsVerified] = useState(false);
  const [serverCode, setServerCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem("token");

  // 관리자 권한 확인
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      alert("관리자 권한이 필요합니다.");
      navigate("/");
    }
  }, [currentUser, navigate]);

  // 인증 코드 발송
  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    try {
      const response = await instance.post(
        "/admin/send-verification",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setServerCode(response.data.code);
      alert("관리자 이메일로 인증 코드가 발송되었습니다.");
    } catch (error) {
      console.error("인증 코드 발송 에러:", error);
      if (!handleAuthError(error)) {
        alert("인증 코드 발송에 실패했습니다.");
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  // 인증 코드 확인
  const handleVerifyCode = () => {
    if (!serverCode) {
      alert("먼저 인증 코드를 발송해주세요.");
      return;
    }
    if (inputCode === serverCode) {
      setIsVerified(true);
      alert("관리자 인증이 완료되었습니다.");
    } else {
      alert("인증 코드가 일치하지 않습니다.");
    }
  };

  // 401 에러 공통 처리 함수
  const handleAuthError = (error) => {
    if (error.response && error.response.status === 401) {
      alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }
    return false;
  };

  // 투표 검색
  const handleSearchVotes = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await instance.get("/admin/votes/search", {
        params: { q: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setVotes(response.data.votes);
      setComments([]);
      setSelectedVoteId(null);
    } catch (error) {
      console.error("검색 에러:", error);
      if (!handleAuthError(error)) {
        alert(error.response?.data?.message || "검색 중 에러가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 모든 투표 조회
  const handleLoadAllVotes = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/admin/votes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVotes(response.data.votes);
      setComments([]);
      setSelectedVoteId(null);
    } catch (error) {
      console.error("투표 조회 에러:", error);
      if (!handleAuthError(error)) {
        alert("투표 조회 중 에러가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 투표의 댓글 조회
  const handleViewComments = async (voteId) => {
    setSelectedVoteId(voteId);
    setLoading(true);
    try {
      const response = await instance.get("/admin/comments", {
        params: { postId: voteId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data.comments);
      setActiveTab("comments");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("댓글 조회 에러:", error);
      if (!handleAuthError(error)) {
        alert("댓글 조회 중 에러가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 투표 삭제
  const handleDeleteVote = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      await instance.delete(`/admin/votes/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("투표가 삭제되었습니다.");
      setVotes(votes.filter((v) => v.id !== itemToDelete.id));
      setDeleteModal(null);
      setItemToDelete(null);
    } catch (error) {
      console.error("투표 삭제 에러:", error);
      alert(
        error.response?.data?.message || "투표 삭제 중 에러가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      await instance.delete(`/admin/comments/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("댓글이 삭제되었습니다.");
      setComments(comments.filter((c) => c.id !== itemToDelete.id));
      setDeleteModal(null);
      setItemToDelete(null);
    } catch (error) {
      console.error("댓글 삭제 에러:", error);
      alert(
        error.response?.data?.message || "댓글 삭제 중 에러가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 유저 목록 조회
  const handleLoadUsers = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
      setActiveTab("users");
    } catch (error) {
      console.error("유저 조회 에러:", error);
      if (!handleAuthError(error)) {
        alert("유저 목록을 불러오는 중 에러가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 유저 상태 업데이트 (티어, 역할, 테두리 등)
  const handleUpdateUserStatus = async (userId, updates) => {
    setLoading(true);
    try {
      await instance.put(`/admin/users/${userId}/status`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("유저 정보가 수정되었습니다.");
      // 목록 업데이트
      setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
    } catch (error) {
      console.error("유저 수정 에러:", error);
      alert("유저 수정 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return null; // 권한 없으면 렌더링 안 함
  }

  // 2차 인증 전 화면
  if (!isVerified) {
    return (
      <div className="admin-page">
        <div className="admin-verification-container">
          <div className="admin-verification-card">
            <h2>보안 인증</h2>
            <p>
              안전한 관리를 위해 등록된 이메일(kdy20716@gmail.com)로 인증이
              필요합니다.
            </p>

            <div className="verification-actions">
              <button
                className="admin-btn send-code-btn"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode}
              >
                {isSendingCode
                  ? "발송 중..."
                  : serverCode
                    ? "코드 재발송"
                    : "인증 코드 발송"}
              </button>
            </div>

            {serverCode && (
              <div className="verification-input-group animate-fade-in">
                <input
                  type="text"
                  placeholder="인증 코드 6자리 입력"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  maxLength={6}
                />
                <button
                  className="admin-btn verify-btn"
                  onClick={handleVerifyCode}
                >
                  인증하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1>
            관리자 <span>Dashboard</span>
          </h1>
          <p>안녕하세요, {currentUser?.name}님</p>
        </div>

        <div className="admin-container">
          {/* 검색 섹션 */}
          <div className="admin-search-section">
            <h2>투표 검색</h2>
            <form onSubmit={handleSearchVotes} className="search-form">
              <input
                type="text"
                placeholder="투표 제목, 선택지명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? "검색 중..." : "투표 검색"}
              </button>
              <button
                type="button"
                className="load-all-btn"
                onClick={handleLoadAllVotes}
                disabled={loading}
              >
                {loading ? "로딩 중..." : "전체 투표 보기"}
              </button>
            </form>
          </div>

          {/* 탭 선택 */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "votes" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("votes");
                setComments([]);
              }}
            >
              투표 ({votes.length})
            </button>
            <button
              className={`tab ${activeTab === "users" ? "active" : ""}`}
              onClick={handleLoadUsers}
            >
              유저 ({users.length || "..."})
            </button>
            <button
              className={`tab ${activeTab === "comments" ? "active" : ""}`}
              onClick={() => setActiveTab("comments")}
              disabled={!selectedVoteId}
            >
              댓글 ({comments.length})
            </button>
          </div>

          {/* 투표 목록 */}
          {activeTab === "votes" && (
            <div className="content-section">
              {votes.length === 0 ? (
                <p className="no-data">검색 결과가 없습니다.</p>
              ) : (
                <div className="votes-grid">
                  {votes.map((vote) => (
                    <div key={vote.id} className="vote-card">
                      <div className="vote-header">
                        <h3>{vote.title}</h3>
                        <span className="vote-id">#{vote.id}</span>
                      </div>
                      <div className="vote-body">
                        <div className="candidates">
                          <div className="candidate">
                            <span className="name">
                              A: {vote.candidate_a_name}
                            </span>
                            <span className="count">
                              {vote.candidate_a_count} votes
                            </span>
                          </div>
                          <span className="vs">VS</span>
                          <div className="candidate">
                            <span className="name">
                              B: {vote.candidate_b_name}
                            </span>
                            <span className="count">
                              {vote.candidate_b_count} votes
                            </span>
                          </div>
                        </div>
                        <div className="vote-info">
                          <p>
                            작성자: {vote.author_nickname} ({vote.author_name})
                          </p>
                          <p>
                            조회: {vote.view_count} | 댓글: {vote.comment_count}
                          </p>
                          <p>
                            작성일: {new Date(vote.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="vote-actions">
                        <button
                          className="view-comments-btn"
                          onClick={() => handleViewComments(vote.id)}
                          disabled={loading}
                        >
                          댓글 보기
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => {
                            setDeleteModal("vote");
                            setItemToDelete(vote);
                          }}
                          disabled={loading}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 유저 관리 섹션 */}
          {activeTab === "users" && (
            <div className="content-section">
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>닉네임(이름)</th>
                      <th>티어</th>
                      <th>권한</th>
                      <th>특별 테두리</th>
                      <th>가입일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.nickname} ({user.name})</td>
                        <td>
                          <select 
                            value={user.tier === "diamond" ? "master" : user.tier}
                            onChange={(e) => handleUpdateUserStatus(user.id, { tier: e.target.value })}
                          >
                            <option value="bronze">BRONZE</option>
                            <option value="silver">SILVER</option>
                            <option value="gold">GOLD</option>
                            <option value="platinum">PLATINUM</option>
                            <option value="master">MASTER</option>
                          </select>
                        </td>
                        <td>
                          {user.role === "admin" ? (
                            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>ADMIN</span>
                          ) : (
                            <span>USER</span>
                          )}
                        </td>
                        <td>
                          <div className="border-grant-cell">
                            <span className="current-unlocked">{user.unlocked_borders || "없음"}</span>
                            <button 
                              className="grant-btn"
                              onClick={() => {
                                const border = "pick";
                                const newList = user.unlocked_borders 
                                  ? [...new Set([...user.unlocked_borders.split(','), border])].join(',')
                                  : border;
                                handleUpdateUserStatus(user.id, { unlocked_borders: newList });
                              }}
                            >
                              Pick 지급
                            </button>
                            {user.unlocked_borders && (
                              <button 
                                className="clear-btn"
                                onClick={() => handleUpdateUserStatus(user.id, { unlocked_borders: null })}
                              >
                                초기화
                              </button>
                            )}
                          </div>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          {/* 추가 관리 기능 필요시 배치 */}
                          -
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 댓글 목록 */}
          {activeTab === "comments" && (
            <div className="content-section">
              {!selectedVoteId ? (
                <p className="no-data">
                  투표를 선택하면 댓글을 조회할 수 있습니다.
                </p>
              ) : comments.length === 0 ? (
                <p className="no-data">댓글이 없습니다.</p>
              ) : (
                <div className="comments-list">
                  <p className="selected-vote">
                    선택된 투표: <strong>{comments[0]?.vote_title}</strong>
                  </p>
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="author">
                          {comment.author_nickname} ({comment.author_name})
                        </span>
                        <span className="created-at">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                      <button
                        className="delete-comment-btn"
                        onClick={() => {
                          setDeleteModal("comment");
                          setItemToDelete(comment);
                        }}
                        disabled={loading}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 삭제 확인 모달 */}
        {deleteModal && (
          <div
            className="modal-overlay"
            onClick={() => {
              setDeleteModal(null);
              setItemToDelete(null);
            }}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">
                {deleteModal === "vote" ? "투표 삭제" : "댓글 삭제"}
              </h3>
              <p className="modal-text">
                {deleteModal === "vote"
                  ? `"${itemToDelete?.title}" 투표를 삭제하시겠습니까?`
                  : `댓글을 삭제하시겠습니까?`}
              </p>
              <div className="modal-actions">
                <button
                  className="modal-cancel-btn"
                  onClick={() => {
                    setDeleteModal(null);
                    setItemToDelete(null);
                  }}
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  className="modal-delete-btn"
                  onClick={
                    deleteModal === "vote"
                      ? handleDeleteVote
                      : handleDeleteComment
                  }
                  disabled={loading}
                >
                  {loading ? "처리 중..." : "삭제"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
