import { useRef, useState } from "react";
import "./Default.css";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import instance from "../../api/instance";
import { updateProfile, getLoginHistory } from "../../api/users";

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
    profileChange: "프로필 변경",
    profileChangeDesc: "프로필 사진 변경 옵션 선택",
    change: "변경",
    choosePhoto: "사진에서 찾기",
    defaultImage: "기본이미지로 바꾸기",
    profileUpdated: "프로필 사진이 변경되었습니다.",
    profileUpdateFail: "프로필 사진 변경에 실패했습니다.",
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
    profileChange: "Edit Profile",
    profileChangeDesc: "Choose a profile photo option",
    change: "Change",
    choosePhoto: "Choose Photo",
    defaultImage: "Use Default Image",
    profileUpdated: "Profile photo has been updated.",
    profileUpdateFail: "Failed to update profile photo.",
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
};

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser, logout } = useAuth();
  const profileFileInputRef = useRef(null);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
  const [loginHistory, setLoginHistory] = useState(null);
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

  const applyProfileUpdate = async (formData) => {
    if (!currentUser) return;

    try {
      const res = await updateProfile(currentUser.id, formData);
      if (res.success) {
        updateUser(res.user);
        alert(text.profileUpdated);
        setIsProfileOpen(false);
      }
    } catch (error) {
      console.error("프로필 이미지 변경 실패:", error);
      alert(error.response?.data?.message || text.profileUpdateFail);
    }
  };

  const handleProfileFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_image", file);
    await applyProfileUpdate(formData);
    event.target.value = "";
  };

  const handleResetProfileImage = async () => {
    const formData = new FormData();
    formData.append("remove_profile_image", "true");
    await applyProfileUpdate(formData);
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
                    <strong>{text.profileChange}</strong>
                    <span>{text.profileChangeDesc}</span>
                  </div>
                  <button type="button" onClick={() => setIsProfileOpen(true)}>
                    {text.change}
                  </button>
                </div>

                <div className="settings-menu-item">
                  <div>
                    <strong>{text.security}</strong>
                    <span>{text.securityDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (currentUser) {
                        try {
                          const res = await getLoginHistory(currentUser.id);
                          setLoginHistory(res.lastLogin);
                        } catch (error) {
                          console.error("로그인 기록 조회 실패:", error);
                          setLoginHistory(null);
                        }
                      }
                      setIsSecurityOpen(true);
                    }}
                  >
                    {text.check}
                  </button>
                </div>

                <div className="settings-menu-item">
                  <div>
                    <strong>{text.display}</strong>
                    <span>{text.displayDesc}</span>
                  </div>
                  <button type="button" onClick={() => setIsDisplayOpen(true)}>
                    {text.settings}
                  </button>
                </div>
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

      {isProfileOpen && (
        <div className="settings-modal-layer">
          <button
            type="button"
            className="settings-modal-backdrop"
            aria-label={text.close}
            onClick={() => setIsProfileOpen(false)}
          />
          <section
            className="settings-modal profile-settings-modal"
            aria-label={text.profileChange}
          >
            <header className="settings-modal-header">
              <div>
                <span>{text.profileChange}</span>
                <h2>{text.profileChangeDesc}</h2>
              </div>
              <button type="button" onClick={() => setIsProfileOpen(false)}>
                {text.close}
              </button>
            </header>

            <div className="profile-image-panel">
              <button
                type="button"
                className="profile-image-option"
                onClick={() => profileFileInputRef.current?.click()}
              >
                {text.choosePhoto}
              </button>
              <button
                type="button"
                className="profile-image-option"
                onClick={handleResetProfileImage}
              >
                {text.defaultImage}
              </button>
              <input
                ref={profileFileInputRef}
                type="file"
                accept="image/*"
                className="profile-image-file-input"
                onChange={handleProfileFileChange}
              />
            </div>
          </section>
        </div>
      )}

      {isSecurityOpen && (
        <div className="settings-modal-layer">
          <button
            type="button"
            className="settings-modal-backdrop"
            aria-label={text.close}
            onClick={() => setIsSecurityOpen(false)}
          />
          <section
            className="settings-modal security-settings-modal"
            aria-label={text.security}
          >
            <header className="settings-modal-header">
              <div>
                <span>{text.security}</span>
                <h2>{text.securityDesc}</h2>
              </div>
              <button type="button" onClick={() => setIsSecurityOpen(false)}>
                {text.close}
              </button>
            </header>

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
                  <em>
                    {loginHistory
                      ? new Date(loginHistory).toLocaleString()
                      : text.noHistory}
                  </em>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {isDisplayOpen && (
        <div className="settings-modal-layer">
          <button
            type="button"
            className="settings-modal-backdrop"
            aria-label={text.close}
            onClick={() => setIsDisplayOpen(false)}
          />
          <section
            className="settings-modal display-settings-modal"
            aria-label={text.display}
          >
            <header className="settings-modal-header">
              <div>
                <span>{text.display}</span>
                <h2>{text.displayDesc}</h2>
              </div>
              <button type="button" onClick={() => setIsDisplayOpen(false)}>
                {text.close}
              </button>
            </header>

            <div className="display-panel">
              <label className="display-option">
                <span>{text.language}</span>
                <select
                  value={displaySettings.language}
                  onChange={(event) =>
                    handleDisplaySettingChange("language", event.target.value)
                  }
                >
                  <option>한국어</option>
                  <option>English</option>
                </select>
              </label>

              <label className="display-option">
                <span>{text.fontSize}</span>
                <select
                  value={displaySettings.fontSize}
                  onChange={(event) =>
                    handleDisplaySettingChange("fontSize", event.target.value)
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
                onClick={() => {
                  alert(text.displaySaved);
                  setIsDisplayOpen(false);
                }}
              >
                {text.save}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
