import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import instance from "../api/instance";

import AdminVoteTab   from "./admin/AdminVoteTab.jsx";
import AdminUserTab   from "./admin/AdminUserTab.jsx";
import AdminReportTab from "./admin/AdminReportTab.jsx";
import AdminBanTab    from "./admin/AdminBanTab.jsx";
import "./Admin.css";

// 탭 목록 정의
const TABS = [
  { id: "votes",   label: "투표" },
  { id: "users",   label: "유저" },
  { id: "reports", label: "신고" },
  { id: "bans",    label: "이메일 차단" },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();

  // 탭 & 공유 상태
  const [activeTab, setActiveTab]   = useState("votes");
  const [loading, setLoading]       = useState(false);
  const [pagination, setPagination] = useState({
    votes:   { current: 1, total: 0, limit: 50 },
    users:   { current: 1, total: 0, limit: 50 },
    reports: { current: 1, total: 0, limit: 30 },
    bans:    { current: 1, total: 0, limit: 30 },
  });

  // 2차 인증 상태 (세션 유지)
  const [isVerified,    setIsVerified]    = useState(() => sessionStorage.getItem("isAdminVerified") === "true");
  const [serverCode,    setServerCode]    = useState("");
  const [inputCode,     setInputCode]     = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);

  // tab 컴포넌트 ref (탭 전환 시 페이지 1로 데이터 로드 트리거)
  const voteTabRef   = useRef(null);
  const userTabRef   = useRef(null);
  const reportTabRef = useRef(null);
  const banTabRef    = useRef(null);

  // 관리자 권한 확인
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      alert("관리자 권한이 필요합니다.");
      navigate("/");
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== "admin") return null;

  // ── 공통 401 처리 ──────────────────────────────────────────────────────────

  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
      navigate("/login");
      return true;
    }
    return false;
  };

  // ── 2차 인증 ────────────────────────────────────────────────────────────────

  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    try {
      const response = await instance.post("/admin/send-verification", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServerCode(response.data.code);
      alert("관리자 이메일로 인증 코드가 발송되었습니다.");
    } catch (error) {
      console.error("인증 코드 발송 에러:", error);
      if (!handleAuthError(error)) alert("인증 코드 발송에 실패했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = () => {
    if (!serverCode) { alert("먼저 인증 코드를 발송해주세요."); return; }
    if (inputCode === serverCode) {
      setIsVerified(true);
      sessionStorage.setItem("isAdminVerified", "true");
      alert("관리자 인증이 완료되었습니다.");
    } else {
      alert("인증 코드가 일치하지 않습니다.");
    }
  };

  // ── 탭 전환 ─────────────────────────────────────────────────────────────────

  const handleTabChange = (tabId) => setActiveTab(tabId);

  // ── 2차 인증 전 화면 ─────────────────────────────────────────────────────────

  if (!isVerified) {
    return (
      <div className="admin-page">
        <div className="admin-verification-container">
          <div className="admin-verification-card">
            <h2>보안 인증</h2>
            <p>안전한 관리를 위해 등록된 이메일로 인증이 필요합니다.</p>
            <div className="verification-actions">
              <button
                className="admin-btn send-code-btn"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode}
              >
                {isSendingCode ? "발송 중..." : serverCode ? "코드 재발송" : "인증 코드 발송"}
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
                <button className="admin-btn verify-btn" onClick={handleVerifyCode}>
                  인증하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 공통 Props ───────────────────────────────────────────────────────────────

  const sharedProps = { token, loading, setLoading, pagination, setPagination, onAuthError: handleAuthError };

  // ── 메인 대시보드 렌더 ────────────────────────────────────────────────────────

  return (
    <div className="admin-page">
      <div className="admin-wrapper">
        <div className="admin-header">
          <h1>관리자 <span>Dashboard</span></h1>
          <p>안녕하세요, {currentUser?.name}님</p>
        </div>

        <div className="admin-container">
          {/* 탭 선택 */}
          <div className="tabs">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                className={`tab ${activeTab === id ? "active" : ""}`}
                onClick={() => handleTabChange(id)}
              >
                {label} ({pagination[id]?.total ?? 0})
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === "votes"   && <AdminVoteTab   ref={voteTabRef}   {...sharedProps} onTabChange={handleTabChange} />}
          {activeTab === "users"   && <AdminUserTab   ref={userTabRef}   {...sharedProps} />}
          {activeTab === "reports" && <AdminReportTab ref={reportTabRef} {...sharedProps} />}
          {activeTab === "bans"    && <AdminBanTab    ref={banTabRef}    {...sharedProps} />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
