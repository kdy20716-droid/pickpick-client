import { useState, useEffect } from "react";
import instance from "../../api/instance";

/**
 * 관리자 이메일 차단 탭 컴포넌트
 * 차단된 이메일 목록 조회, 이메일 차단 추가/해제를 담당합니다.
 */
export default function AdminBanTab({ token, loading, setLoading, pagination, setPagination, onAuthError }) {
  const [bannedEmails, setBannedEmails] = useState([]);
  const [newBanEmail, setNewBanEmail] = useState("");

  // 탭 진입 시 자동으로 1페이지 로드
  useEffect(() => {
    handleLoadPage(1);
  }, []);

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    const tab = "bans";
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
      const response = await instance.get("/admin/banned-emails", {
        params: { page, limit: 30 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setBannedEmails(response.data.bannedEmails);
      setPagination((prev) => ({ ...prev, bans: { ...prev.bans, current: page, total: response.data.total } }));
    } catch (error) {
      if (!onAuthError(error)) alert("데이터를 불러오는 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이메일 차단 추가
  const handleAddBanEmail = async (e) => {
    e.preventDefault();
    if (!newBanEmail.trim()) { alert("이메일을 입력해주세요."); return; }
    setLoading(true);
    try {
      await instance.post("/admin/banned-emails", { email: newBanEmail }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("이메일이 차단되었습니다.");
      setNewBanEmail("");
      handleLoadPage(1);
    } catch (error) {
      console.error("이메일 차단 에러:", error);
      alert("이메일 차단 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이메일 차단 해제
  const handleRemoveBanEmail = async (id) => {
    if (!window.confirm("차단을 해제하시겠습니까?")) return;
    setLoading(true);
    try {
      await instance.delete(`/admin/banned-emails/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("차단이 해제되었습니다.");
      setBannedEmails((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("차단 해제 에러:", error);
      alert("차단 해제 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-section animate-fade-in">
      {/* 이메일 차단 추가 폼 */}
      <div className="ban-management-card">
        <h3>새로운 이메일 차단</h3>
        <form onSubmit={handleAddBanEmail} className="ban-form-horizontal">
          <input
            type="email"
            placeholder="차단할 이메일 주소 입력"
            value={newBanEmail}
            onChange={(e) => setNewBanEmail(e.target.value)}
            className="ban-input"
            required
          />
          <button type="submit" className="admin-btn ban-submit-btn" disabled={loading}>
            이메일 차단하기
          </button>
        </form>
      </div>

      {/* 차단 목록 */}
      <div className="banned-list-container">
        <h3>차단된 이메일 목록</h3>
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이메일 주소</th>
                <th>차단 일시</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {bannedEmails.length === 0 ? (
                <tr><td colSpan="4" className="no-data">차단된 이메일이 없습니다.</td></tr>
              ) : (
                bannedEmails.map((ban) => (
                  <tr key={ban.id}>
                    <td>{ban.id}</td>
                    <td>{ban.email}</td>
                    <td>{new Date(ban.created_at).toLocaleString()}</td>
                    <td>
                      <button className="clear-btn" onClick={() => handleRemoveBanEmail(ban.id)} disabled={loading}>
                        차단 해제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>
    </div>
  );
}
