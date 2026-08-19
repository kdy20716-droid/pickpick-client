import { useState, useEffect } from "react";
import instance from "../../api/instance";

/**
 * 관리자 유저 탭 컴포넌트
 * 유저 목록 조회, 티어/역할/테두리 수정, 강제 탈퇴(2단계 인증 포함)를 담당합니다.
 */
export default function AdminUserTab({ token, loading, setLoading, pagination, setPagination, onAuthError }) {
  const [users, setUsers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // 유저 삭제 2단계 인증 상태
  const [userDeleteStep, setUserDeleteStep] = useState(0); // 0: 초기, 1: 확인, 2: 코드 입력
  const [deleteVerifyCode, setDeleteVerifyCode] = useState("");
  const [deleteInputCode, setDeleteInputCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);

  // 탭 진입 시 자동으로 1페이지 로드
  useEffect(() => {
    handleLoadPage(1);
  }, []);

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    const tab = "users";
    const { current, total, limit } = pagination[tab] || { current: 1, total: 0, limit: 50 };
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
      const response = await instance.get("/admin/users", {
        params: { page, limit: 50 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
      setPagination((prev) => ({ ...prev, users: { ...prev.users, current: page, total: response.data.total } }));
    } catch (error) {
      if (!onAuthError(error)) alert("데이터를 불러오는 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 유저 상태 업데이트 (티어/테두리 등)
  const handleUpdateUserStatus = async (userId, updates) => {
    setLoading(true);
    try {
      await instance.put(`/admin/users/${userId}/status`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("유저 정보가 수정되었습니다.");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    } catch (error) {
      console.error("유저 수정 에러:", error);
      alert("유저 수정 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 강제탈퇴 인증코드 발송
  const handleSendDeleteCode = async () => {
    setIsSendingCode(true);
    try {
      const response = await instance.post("/admin/send-verification", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteVerifyCode(response.data.code);
      setUserDeleteStep(2);
      alert("관리자 이메일로 인증 코드가 발송되었습니다.");
    } catch (error) {
      console.error("인증 코드 발송 에러:", error);
      if (!onAuthError(error)) alert("인증 코드 발송에 실패했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // 강제탈퇴 최종 실행
  const handleDeleteUser = async () => {
    if (!itemToDelete || deleteInputCode !== deleteVerifyCode) {
      alert("인증 코드가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      await instance.delete(`/admin/users/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("유저가 강제 탈퇴되었습니다.");
      setUsers((prev) => prev.filter((u) => u.id !== itemToDelete.id));
      handleCloseModal();
    } catch (error) {
      console.error("유저 삭제 에러:", error);
      if (!onAuthError(error)) alert(error.response?.data?.message || "유저 강제탈퇴 중 에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setDeleteModal(false);
    setItemToDelete(null);
    setUserDeleteStep(0);
    setDeleteVerifyCode("");
    setDeleteInputCode("");
  };

  return (
    <>
      <div className="admin-search-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>유저 목록 관리</h2>
          <button
            type="button"
            className="load-all-btn"
            onClick={() => handleLoadPage(1)}
            disabled={loading}
          >
            {loading ? "로딩 중..." : "전체 유저 새로고침 / 조회"}
          </button>
        </div>
      </div>
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nickname} ({user.name})</td>
                  <td>
                    <select
                      value={user.tier || "bronze"}
                      onChange={(e) => handleUpdateUserStatus(user.id, { tier: e.target.value })}
                    >
                      {["bronze", "silver", "gold", "platinum", "diamond", "master", "challenger"].map((t) => (
                        <option key={t} value={t}>{t.toUpperCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {user.role === "admin"
                      ? <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>ADMIN</span>
                      : <span>USER</span>}
                  </td>
                  <td>
                    <div className="border-grant-cell">
                      <span className="current-unlocked">{user.unlocked_borders || "없음"}</span>
                      <button
                        className="grant-btn"
                        onClick={() => {
                          const newList = user.unlocked_borders
                            ? [...new Set([...user.unlocked_borders.split(","), "pick"])].join(",")
                            : "pick";
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
                    {user.role !== "admin" && (
                      <button
                        className="delete-btn"
                        onClick={() => { setDeleteModal(true); setItemToDelete(user); setUserDeleteStep(1); }}
                        disabled={loading}
                      >
                        강제탈퇴
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination />
      </div>

      {/* 강제탈퇴 확인 모달 */}
      {deleteModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">유저 강제 탈퇴</h3>
            <div className="user-delete-steps">
              {/* Step 1: 확인 */}
              {userDeleteStep === 1 && (
                <div className="step-content animate-fade-in">
                  <p className="modal-text warning-text">
                    <strong>주의:</strong> [{itemToDelete?.nickname}] 유저를 정말로{" "}
                    <strong>강제 탈퇴</strong> 시키겠습니까?
                    <br />이 작업은 되돌릴 수 없으며 유저의 모든 활동 데이터가 삭제됩니다.
                  </p>
                  <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={handleCloseModal}>취소</button>
                    <button className="modal-delete-btn" onClick={handleSendDeleteCode} disabled={isSendingCode}>
                      {isSendingCode ? "발송 중..." : "확인 및 인증번호 받기"}
                    </button>
                  </div>
                </div>
              )}
              {/* Step 2: 인증코드 입력 */}
              {userDeleteStep === 2 && (
                <div className="step-content animate-fade-in">
                  <p className="modal-text">
                    관리자 보안 인증이 필요합니다.<br />
                    등록된 이메일로 전송된 <strong>인증 번호</strong>를 입력해주세요.
                  </p>
                  <div className="verification-input-group">
                    <input
                      type="text"
                      placeholder="6자리 코드 입력"
                      value={deleteInputCode}
                      onChange={(e) => setDeleteInputCode(e.target.value)}
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={handleCloseModal}>취소</button>
                    <button
                      className="modal-delete-btn final-delete-btn"
                      onClick={handleDeleteUser}
                      disabled={loading || deleteInputCode.length < 6}
                    >
                      {loading ? "처리 중..." : "최종 강제 탈퇴 승인"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
