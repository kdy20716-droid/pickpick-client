import { useState } from "react";
import instance from "../../api/instance";

/**
 * 관리자 투표 탭 컴포넌트
 * 투표 목록 조회/검색/삭제, 투표 참여 상세 모달, 댓글 조회를 담당합니다.
 */
export default function AdminVoteTab({ token, loading, setLoading, pagination, setPagination, onAuthError, onTabChange }) {
  const [votes, setVotes] = useState([]);
  const [comments, setComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVoteId, setSelectedVoteId] = useState(null);
  const [voteRecords, setVoteRecords] = useState([]);
  const [selectedVoteTitle, setSelectedVoteTitle] = useState("");
  const [showVoteDetails, setShowVoteDetails] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 페이지네이션 컴포넌트
  const Pagination = ({ tab }) => {
    const { current, total, limit } = pagination[tab] || { current: 1, total: 0, limit: 50 };
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;
    return (
      <div className="admin-pagination">
        <button onClick={() => handleLoadPage(tab, current - 1)} disabled={current === 1} className="page-nav-btn">&lt;</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => handleLoadPage(tab, p)} className={`page-btn ${current === p ? "active" : ""}`}>{p}</button>
        ))}
        <button onClick={() => handleLoadPage(tab, current + 1)} disabled={current === totalPages} className="page-nav-btn">&gt;</button>
      </div>
    );
  };

  const handleLoadPage = async (tab, page) => {
    setLoading(true);
    try {
      const response = await instance.get("/admin/votes", {
        params: { page, limit: 50 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setVotes(response.data.votes);
      setPagination((prev) => ({ ...prev, [tab]: { ...prev[tab], current: page, total: response.data.total } }));
    } catch (error) {
      if (!onAuthError(error)) alert("데이터를 불러오는 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 전체 투표 조회
  const handleLoadAllVotes = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/admin/votes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVotes(response.data.votes);
      setComments([]);
      setSelectedVoteId(null);
      setPagination((prev) => ({ ...prev, votes: { ...prev.votes, total: response.data.total, current: 1 } }));
    } catch (error) {
      if (!onAuthError(error)) alert("투표 조회 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 투표 검색
  const handleSearchVotes = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) { alert("검색어를 입력해주세요."); return; }
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
      if (!onAuthError(error)) alert(error.response?.data?.message || "검색 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 투표 상세 참여 기록 조회
  const handleViewVoteDetails = async (voteId, voteTitle) => {
    setLoading(true);
    setSelectedVoteTitle(voteTitle);
    try {
      const response = await instance.get(`/admin/votes/${voteId}/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVoteRecords(response.data.records);
      setShowVoteDetails(true);
    } catch (error) {
      if (!onAuthError(error)) alert("상세 기록을 불러오는 중 에러가 발생했습니다.");
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
      setVotes((prev) => prev.filter((v) => v.id !== itemToDelete.id));
      setDeleteModal(null);
      setItemToDelete(null);
    } catch (error) {
      alert(error.response?.data?.message || "투표 삭제 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 댓글 조회
  const handleViewComments = async (voteId) => {
    setSelectedVoteId(voteId);
    setLoading(true);
    try {
      const response = await instance.get("/admin/comments", {
        params: { postId: voteId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data.comments);
      onTabChange("comments");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (!onAuthError(error)) alert("댓글 조회 중 에러가 발생했습니다.");
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
      setComments((prev) => prev.filter((c) => c.id !== itemToDelete.id));
      setDeleteModal(null);
      setItemToDelete(null);
    } catch (error) {
      alert(error.response?.data?.message || "댓글 삭제 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setDeleteModal(null);
    setItemToDelete(null);
    setShowVoteDetails(false);
    setVoteRecords([]);
  };

  return (
    <>
      {/* 검색 영역 */}
      <div className="admin-search-section">
        <h2>투표 검색</h2>
        <form onSubmit={handleSearchVotes} className="search-form-horizontal">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="투표 제목, 선택지명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="search-buttons-group">
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? "검색 중..." : "투표 검색"}
            </button>
            <button type="button" className="load-all-btn" onClick={handleLoadAllVotes} disabled={loading}>
              {loading ? "로딩 중..." : "전체 투표 보기"}
            </button>
          </div>
        </form>
      </div>

      {/* 투표 목록 */}
      <div className="content-section">
        {votes.length === 0 ? (
          <p className="no-data">검색 결과가 없습니다.</p>
        ) : (
          <>
            <div className="votes-grid">
              {votes.map((vote) => (
                <div
                  key={vote.id}
                  className="vote-card"
                  onClick={() => handleViewVoteDetails(vote.id, vote.title)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="vote-header">
                    <h3>{vote.title}</h3>
                    <span className="vote-id">#{vote.id}</span>
                  </div>
                  <div className="vote-body">
                    <div className="candidates">
                      <div className="candidate">
                        <span className="name">A: {vote.candidate_a_name}</span>
                        <span className="count">{vote.candidate_a_count} votes</span>
                      </div>
                      <span className="vs">VS</span>
                      <div className="candidate">
                        <span className="name">B: {vote.candidate_b_name}</span>
                        <span className="count">{vote.candidate_b_count} votes</span>
                      </div>
                    </div>
                    <div className="vote-info">
                      <p>작성자: {vote.author_nickname} ({vote.author_name})</p>
                      <p>조회: {vote.view_count} | 댓글: {vote.comment_count}</p>
                      <p>작성일: {new Date(vote.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="vote-actions">
                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); setDeleteModal("vote"); setItemToDelete(vote); }}
                      disabled={loading}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination tab="votes" />
          </>
        )}
      </div>

      {/* 투표 참여 상세 모달 */}
      {showVoteDetails && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "90%" }}>
            <h3 className="modal-title">투표 참여 상세 내역</h3>
            <p className="modal-subtitle" style={{ marginBottom: "20px", color: "#666" }}>
              게시글: <strong>{selectedVoteTitle}</strong>
            </p>
            <div className="detail-table-container" style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #eee", borderRadius: "8px" }}>
              <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>유저 (닉네임/이름)</th>
                    <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>선택</th>
                    <th style={{ padding: "12px", textAlign: "right", borderBottom: "2px solid #dee2e6" }}>투표 일시</th>
                  </tr>
                </thead>
                <tbody>
                  {voteRecords.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: "40px", textAlign: "center", color: "#999" }}>아직 참여 기록이 없습니다.</td></tr>
                  ) : (
                    voteRecords.map((record, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px" }}>
                          <strong>{record.nickname}</strong>{" "}
                          <span style={{ color: "#888", fontSize: "0.9em" }}>({record.name})</span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <span style={{
                            padding: "4px 10px", borderRadius: "20px", fontWeight: "bold",
                            backgroundColor: record.selected_side === "A" ? "#e3f2fd" : "#fff3e0",
                            color: record.selected_side === "A" ? "#1976d2" : "#f57c00",
                          }}>
                            {record.selected_side}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", color: "#666", fontSize: "0.9em" }}>
                          {new Date(record.created_at).toLocaleString("ko-KR", {
                            year: "numeric", month: "2-digit", day: "2-digit",
                            hour: "2-digit", minute: "2-digit", second: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-actions" style={{ marginTop: "20px" }}>
              <button className="modal-cancel-btn" onClick={handleCloseModal}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{deleteModal === "vote" ? "투표 삭제" : "댓글 삭제"}</h3>
            <p className="modal-text">
              {deleteModal === "vote"
                ? `"${itemToDelete?.title}" 투표를 삭제하시겠습니까?`
                : "댓글을 삭제하시겠습니까?"}
            </p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={handleCloseModal} disabled={loading}>취소</button>
              <button
                className="modal-delete-btn"
                onClick={deleteModal === "vote" ? handleDeleteVote : handleDeleteComment}
                disabled={loading}
              >
                {loading ? "처리 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
