import { useState } from "react";
import "./Default.css";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import instance from "../../api/instance";

const TEXT = {
  한국어: {
    breadcrumb: "마이페이지 > 내 프로필 > 계정 설정",
    nickname: "닉네임",
    currentEmail: "현재 이메일",
    currentPassword: "현재 비밀번호",
    passwordUnavailable: "보안상 표시할 수 없습니다",
    close: "닫기",
    manage: "관리",
    save: "저장",
    security: "보안",
    securityDesc: "로그인 기록과 계정 보호 설정",
    check: "확인",
    changePassword: "비밀번호 변경",
    newPassword: "새 비밀번호",
    confirmPassword: "새 비밀번호 확인",
    saveChange: "변경 저장",
    loginHistory: "로그인 기록",
    currentSession: "현재 접속",
    currentSessionDesc: "오늘 · 이 브라우저",
    recentLogin: "최근 로그인",
    noHistory: "기록 없음",
    display: "화면 & 사용 환경",
    displayDesc: "언어와 글자 크기 설정",
    settings: "설정",
    language: "언어 설정",
    fontSize: "글자 크기",
    small: "작게",
    normal: "보통",
    large: "크게",
    logout: "로그아웃",
    deleteAccount: "회원 탈퇴",
    logoutConfirm: "정말 로그아웃 하시겠습니까?",
    deleteConfirm: "정말로 탈퇴하시겠습니까?",
    deleteFail: "회원 탈퇴 처리에 실패했습니다.",
    passwordRequired: "현재 비밀번호와 새 비밀번호를 입력해주세요.",
    passwordMismatch: "새 비밀번호가 일치하지 않습니다.",
    passwordSaved: "비밀번호 변경 요청이 완료되었습니다.",
    displaySaved: "화면 설정이 저장되었습니다.",
  },
  English: {
    breadcrumb: "My Page > Profile > Account Settings",
    nickname: "Nickname",
    currentEmail: "Current Email",
    currentPassword: "Current Password",
    passwordUnavailable: "Cannot be shown for security",
    close: "Close",
    manage: "Manage",
    save: "Save",
    security: "Security",
    securityDesc: "Review login history and account protection",
    check: "Check",
    changePassword: "Change Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    saveChange: "Save Changes",
    loginHistory: "Login History",
    currentSession: "Current Session",
    currentSessionDesc: "Today · This browser",
    recentLogin: "Recent Login",
    noHistory: "No history",
    display: "Display & Preferences",
    displayDesc: "Language and font size settings",
    settings: "Settings",
    language: "Language",
    fontSize: "Font Size",
    small: "Small",
    normal: "Normal",
    large: "Large",
    logout: "Log Out",
    deleteAccount: "Delete Account",
    logoutConfirm: "Do you really want to log out?",
    deleteConfirm: "Do you really want to delete your account?",
    deleteFail: "Failed to delete account.",
    passwordRequired: "Please enter your current and new password.",
    passwordMismatch: "New passwords do not match.",
    passwordSaved: "Password change request completed.",
    displaySaved: "Display settings saved.",
  },
  일본어: {
    breadcrumb: "マイページ > プロフィール > アカウント設定",
    nickname: "ニックネーム",
    currentEmail: "現在のメール",
    currentPassword: "現在のパスワード",
    passwordUnavailable: "セキュリティ上表示できません",
    close: "閉じる",
    manage: "管理",
    save: "保存",
    security: "セキュリティ",
    securityDesc: "ログイン履歴とアカウント保護設定",
    check: "確認",
    changePassword: "パスワード変更",
    newPassword: "新しいパスワード",
    confirmPassword: "新しいパスワード確認",
    saveChange: "変更を保存",
    loginHistory: "ログイン履歴",
    currentSession: "現在の接続",
    currentSessionDesc: "今日 · このブラウザ",
    recentLogin: "最近のログイン",
    noHistory: "履歴なし",
    display: "画面 & 使用環境",
    displayDesc: "言語と文字サイズ設定",
    settings: "設定",
    language: "言語設定",
    fontSize: "文字サイズ",
    small: "小",
    normal: "普通",
    large: "大",
    logout: "ログアウト",
    deleteAccount: "退会",
    logoutConfirm: "本当にログアウトしますか？",
    deleteConfirm: "本当に退会しますか？",
    deleteFail: "退会処理に失敗しました。",
    passwordRequired: "現在のパスワードと新しいパスワードを入力してください。",
    passwordMismatch: "新しいパスワードが一致しません。",
    passwordSaved: "パスワード変更リクエストが完了しました。",
    displaySaved: "画面設定を保存しました。",
  },
};

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isDisplayOpen, setIsDisplayOpen] = useState(false);
  const [displaySettings, setDisplaySettings] = useState({
    language: "한국어",
    fontSize: "보통",
  });
  const text = TEXT[displaySettings.language] || TEXT.한국어;
  const displayNickname =
    currentUser?.name ||
    currentUser?.nickname ||
    currentUser?.email?.split("@")[0] ||
    "-";

  const handleLogout = async () => {
    const isConfirmed = window.confirm(text.logoutConfirm);
    if (!isConfirmed) return;

    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 중 오류:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    const isConfirmed = window.confirm(text.deleteConfirm);
    if (!isConfirmed) return;

    try {
      await instance.delete(`/users/account/${currentUser.id}`);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("회원 탈퇴 중 오류:", error);
      alert(error.response?.data?.message || text.deleteFail);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert(text.passwordRequired);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert(text.passwordMismatch);
      return;
    }

    alert(text.passwordSaved);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDisplaySettingChange = (key, value) => {
    setDisplaySettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="profile-container">
      <div className="breadcrumb">{text.breadcrumb}</div>

      <div className={`profile-card font-${displaySettings.fontSize}`}>
        <div className="card-content">
          <div className="profile-form">
            <div className="form-grid">
              <div className="account-info-list">
                <div className="account-info-item">
                  <div>
                    <strong>{text.nickname}</strong>
                    <span>{displayNickname}</span>
                  </div>
                </div>

                <div className="account-info-item">
                  <div>
                    <strong>{text.currentEmail}</strong>
                    <span>{currentUser?.email || "-"}</span>
                  </div>
                </div>

                <div className="account-info-item">
                  <div>
                    <strong>{text.currentPassword}</strong>
                    <span>
                      {isCurrentPasswordVisible
                        ? text.passwordUnavailable
                        : "••••••••"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setIsCurrentPasswordVisible((prev) => !prev)}
                    aria-label={text.currentPassword}
                  >
                    {isCurrentPasswordVisible ? (
                      <EyeOff size={18} strokeWidth={2} />
                    ) : (
                      <Eye size={18} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <div className="settings-menu">
                <div className="settings-menu-item">
                  <div>
                    <strong>{text.security}</strong>
                    <span>{text.securityDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSecurityOpen((prev) => !prev)}
                  >
                    {isSecurityOpen ? text.close : text.check}
                  </button>
                </div>

                {isSecurityOpen && (
                  <div className="security-panel">
                    <div className="security-section">
                      <strong>{text.changePassword}</strong>
                      <input
                        type="password"
                        name="currentPassword"
                        placeholder={text.currentPassword}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                      />
                      <input
                        type="password"
                        name="newPassword"
                        placeholder={text.newPassword}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                      />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder={text.confirmPassword}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                      <button type="button" onClick={handleSavePassword}>
                        {text.saveChange}
                      </button>
                    </div>

                    <div className="security-section">
                      <strong>{text.loginHistory}</strong>
                      <div className="login-history-item">
                        <span>{text.currentSession}</span>
                        <em>{text.currentSessionDesc}</em>
                      </div>
                      <div className="login-history-item">
                        <span>{text.recentLogin}</span>
                        <em>{text.noHistory}</em>
                      </div>
                    </div>
                  </div>
                )}

                <div className="settings-menu-item">
                  <div>
                    <strong>{text.display}</strong>
                    <span>{text.displayDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDisplayOpen((prev) => !prev)}
                  >
                    {isDisplayOpen ? text.close : text.settings}
                  </button>
                </div>

                {isDisplayOpen && (
                  <div className="display-panel">
                    <label className="display-option">
                      <span>{text.language}</span>
                      <select
                        value={displaySettings.language}
                        onChange={(event) =>
                          handleDisplaySettingChange(
                            "language",
                            event.target.value,
                          )
                        }
                      >
                        <option>한국어</option>
                        <option>English</option>
                        <option>일본어</option>
                      </select>
                    </label>

                    <label className="display-option">
                      <span>{text.fontSize}</span>
                      <select
                        value={displaySettings.fontSize}
                        onChange={(event) =>
                          handleDisplaySettingChange(
                            "fontSize",
                            event.target.value,
                          )
                        }
                      >
                        <option value="작게">{text.small}</option>
                        <option value="보통">{text.normal}</option>
                        <option value="크게">{text.large}</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      className="display-save-btn"
                      onClick={() => alert(text.displaySaved)}
                    >
                      {text.save}
                    </button>
                  </div>
                )}

              </div>

              <div className="account-actions">
                <button className="account-link-btn" onClick={handleLogout}>
                  {text.logout}
                </button>
                <button
                  className="account-danger-btn"
                  onClick={handleDeleteAccount}
                >
                  {text.deleteAccount}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
