import { useState } from "react";
import instance from "../../api/instance";

/**
 * 관리자 신고 탭 컴포넌트
 * 신고 목록 조회 및 신고 상태(무시/게시물 삭제)를 처리합니다.
 */
export default function AdminReportTab({ token, loading, setLoading, pagination, setPagination, onAuthError }) {
  const [reports, setReports] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    const tab = "reports";
    const { current, total, limit } = pagination[tab] || { current: 1, total: 0, limit: 30 };
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;
    return (
      <div className="admin-pagination">
        <button onClick={() => handleLoadPage(current - 1)} disabled={current === 1} className="page-nav-btn">&lt;</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => handleLoadPage(p)} className={`page-btn ${current === p ? "active" : ""}`}>{p}</button>
        ))}
        <button onClick={() => handleLoadPage(current + 1)} disabled={current === totalPages} className="page-nav-btn">&gt;</button>
      </div>
    );
  };

  const handleLoadPage = async (page) => {
    setLoading(true);
    try {
      const response = await instance.get("/admin/reports", {
        params: { page, limit: 30 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data.reports);
      setPagination((prev) => ({ ...prev, reports: { ...prev.reports, current: page, total: response.data.total } }));
    } catch (error) {
      if (!onAuthError(error)) alert("데이터를 불러오는 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 신고 상태 변경 (무시 / 처리완료)
  const handleUpdateReportStatus = async (reportId, status) => {
    setLoading(true);
    try {
      await instance.put(`/admin/reports/${reportId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("신고 상태가 변경되었습니다.");
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
    } catch (error) {
      console.error("신고 수정 에러:", error);
      alert("신고 수정 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 신고된 게시물 삭제
  const handleDeleteReportedVote = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await instance.delete(`/admin/votes/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("투표가 삭제되었습니다.");
      // 해당 신고를 처리 완료로 변경
      if (itemToDelete.reportId) {
        await instance.put(`/admin/reports/${itemToDelete.reportId}/status`, { status: "resolved" }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports((prev) => prev.map((r) => (r.id === itemToDelete.reportId ? { ...r, status: "resolved" } : r)));
      }
      setDeleteModal(null);
      setItemToDelete(null);
    } catch (error) {
      alert(error.response?.data?.message || "투표 삭제 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setDeleteModal(null);
    setItemToDelete(null);
  };

  return (
    <>
      <div className="content-section">
        <div className="reports-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>신고ID</th>
                <th>대상 게시물</th>
                <th>신고 사유</th>
                <th>신고자</th>
                <th>상태</th>
                <th>일시</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>
                    <div className="post-info">
                      <strong>{report.vote_title}</strong>
                      <span>#{report.post_id}</span>
                    </div>
                  </td>
                  <td><div className="report-reason-text">{report.reason}</div></td>
                  <td>{report.reporter_nickname || "익명"}</td>
                  <td>
                    <span className={`status-badge status-${report.status}`}>
                      {report.status === "pending" ? "대기" : "처리완료"}
                    </span>
                  </td>
                  <td>{new Date(report.created_at).toLocaleString()}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="ignore-btn"
                        onClick={() => handleUpdateReportStatus(report.id, "ignored")}
                        disabled={report.status !== "pending"}
                      >
                        무시
                      </button>
                      <button
                        className="delete-post-btn"
                        onClick={() => {
                          setDeleteModal("vote");
                          setItemToDelete({ id: report.post_id, title: report.vote_title, reportId: report.id });
                        }}
                        disabled={!report.post_id || report.status !== "pending"}
                      >
                        게시물 삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>

      {/* 삭제 확인 모달 */}
      {deleteModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">투표 삭제</h3>
            <p className="modal-text">"{itemToDelete?.title}" 투표를 삭제하시겠습니까?</p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={handleCloseModal} disabled={loading}>취소</button>
              <button className="modal-delete-btn" onClick={handleDeleteReportedVote} disabled={loading}>
                {loading ? "처리 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
