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
    notifications: "알림 설정",
    notificationsDesc: "댓글, 답글, 좋아요 알림 관리",
    close: "닫기",
    manage: "관리",
    commentNotifications: "댓글 알림",
    commentNotificationsDesc: "내 투표에 새 댓글이 달렸을 때",
    replyNotifications: "답글 알림",
    replyNotificationsDesc: "내 댓글에 답글이 달렸을 때",
    likeNotifications: "좋아요 알림",
    likeNotificationsDesc: "내 게시글이나 댓글에 반응이 있을 때",
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
    customerSupport: "고객 지원",
    customerSupportDesc: "문의, 도움말, 서비스 이용 지원",
    support: "문의",
    contactUs: "문의하기",
    contactUsDesc: "불편사항이나 계정 문제를 문의하세요",
    inquiryTitle: "문의 제목",
    inquiryTitlePlaceholder: "문의 제목을 입력하세요",
    inquiryContent: "문의 내용",
    inquiryContentPlaceholder: "문의 내용을 자세히 입력하세요",
    submitInquiry: "문의 보내기",
    inquiryRequired: "문의 제목과 내용을 입력해주세요.",
    inquirySent: "문의가 접수되었습니다.",
    faq: "FAQ",
    faqDesc: "자주 묻는 질문 확인",
    faqItems: [
      [
        "비밀번호를 잊어버렸어요.",
        "로그인 화면의 비밀번호 찾기에서 임시 비밀번호를 받을 수 있습니다.",
      ],
      [
        "알림 설정은 어디서 바꾸나요?",
        "알림 설정의 관리 버튼을 눌러 댓글, 답글, 좋아요 알림을 조정할 수 있습니다.",
      ],
    ],
    versionInfo: "버전 정보",
    versionInfoDesc: "PickPick v1.0.0",
    termsPrivacy: "이용약관/개인정보처리방침",
    termsPrivacyDesc: "서비스 약관과 개인정보 처리 기준",
    termsPrivacyItems: [
      [
        "이용약관",
        "PickPick은 원활한 서비스 이용을 위해 기본적인 계정 정보와 이용 기록을 관리합니다.",
      ],
      [
        "개인정보처리방침",
        "이메일, 닉네임 등 필요한 정보만 서비스 제공 목적으로 사용합니다.",
      ],
      [
        "보관 및 삭제",
        "회원 탈퇴 시 관련 법령에 따라 필요한 정보를 제외하고 계정 정보가 삭제됩니다.",
      ],
    ],
    open: "보기",
    logout: "로그아웃",
    deleteAccount: "회원 탈퇴",
    logoutConfirm: "정말 로그아웃 하시겠습니까?",
    deleteConfirm: "정말로 탈퇴하시겠습니까?",
    deleteFail: "회원 탈퇴 처리에 실패했습니다.",
    passwordRequired: "현재 비밀번호와 새 비밀번호를 입력해주세요.",
    passwordMismatch: "새 비밀번호가 일치하지 않습니다.",
    passwordSaved: "비밀번호 변경 요청이 완료되었습니다.",
    notificationSaved: "알림 설정이 저장되었습니다.",
    displaySaved: "화면 설정이 저장되었습니다.",
  },
  English: {
    breadcrumb: "My Page > Profile > Account Settings",
    nickname: "Nickname",
    currentEmail: "Current Email",
    currentPassword: "Current Password",
    passwordUnavailable: "Cannot be shown for security",
    notifications: "Notifications",
    notificationsDesc: "Manage comment, reply, and like alerts",
    close: "Close",
    manage: "Manage",
    commentNotifications: "Comment Alerts",
    commentNotificationsDesc: "When someone comments on my poll",
    replyNotifications: "Reply Alerts",
    replyNotificationsDesc: "When someone replies to my comment",
    likeNotifications: "Like Alerts",
    likeNotificationsDesc: "When someone reacts to my post or comment",
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
    customerSupport: "Customer Support",
    customerSupportDesc: "Help, inquiries, and service support",
    support: "Contact",
    contactUs: "Contact Us",
    contactUsDesc: "Ask about account issues or service problems",
    inquiryTitle: "Subject",
    inquiryTitlePlaceholder: "Enter a subject",
    inquiryContent: "Message",
    inquiryContentPlaceholder: "Describe your issue in detail",
    submitInquiry: "Send Inquiry",
    inquiryRequired: "Please enter a subject and message.",
    inquirySent: "Your inquiry has been submitted.",
    faq: "FAQ",
    faqDesc: "View frequently asked questions",
    faqItems: [
      [
        "I forgot my password.",
        "Use Find Password on the login page to receive a temporary password.",
      ],
      [
        "Where can I change notifications?",
        "Open Manage under Notifications to adjust comment, reply, and like alerts.",
      ],
    ],
    versionInfo: "Version Info",
    versionInfoDesc: "PickPick v1.0.0",
    termsPrivacy: "Terms / Privacy Policy",
    termsPrivacyDesc: "Service terms and privacy standards",
    termsPrivacyItems: [
      [
        "Terms of Use",
        "PickPick manages basic account information and usage records for stable service use.",
      ],
      [
        "Privacy Policy",
        "Only required information such as email and nickname is used to provide the service.",
      ],
      [
        "Retention and Deletion",
        "When you delete your account, account data is removed except where legally required.",
      ],
    ],
    open: "Open",
    logout: "Log Out",
    deleteAccount: "Delete Account",
    logoutConfirm: "Do you really want to log out?",
    deleteConfirm: "Do you really want to delete your account?",
    deleteFail: "Failed to delete account.",
    passwordRequired: "Please enter your current and new password.",
    passwordMismatch: "New passwords do not match.",
    passwordSaved: "Password change request completed.",
    notificationSaved: "Notification settings saved.",
    displaySaved: "Display settings saved.",
  },
  일본어: {
    breadcrumb: "マイページ > プロフィール > アカウント設定",
    nickname: "ニックネーム",
    currentEmail: "現在のメール",
    currentPassword: "現在のパスワード",
    passwordUnavailable: "セキュリティ上表示できません",
    notifications: "通知設定",
    notificationsDesc: "コメント、返信、いいね通知を管理",
    close: "閉じる",
    manage: "管理",
    commentNotifications: "コメント通知",
    commentNotificationsDesc: "自分の投票にコメントが付いたとき",
    replyNotifications: "返信通知",
    replyNotificationsDesc: "自分のコメントに返信が付いたとき",
    likeNotifications: "いいね通知",
    likeNotificationsDesc: "投稿やコメントに反応があったとき",
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
    customerSupport: "カスタマーサポート",
    customerSupportDesc: "お問い合わせ、ヘルプ、サービス利用支援",
    support: "お問い合わせ",
    contactUs: "お問い合わせ",
    contactUsDesc: "不具合やアカウント問題を問い合わせる",
    inquiryTitle: "件名",
    inquiryTitlePlaceholder: "件名を入力してください",
    inquiryContent: "お問い合わせ内容",
    inquiryContentPlaceholder: "内容を詳しく入力してください",
    submitInquiry: "送信",
    inquiryRequired: "件名と内容を入力してください。",
    inquirySent: "お問い合わせを受け付けました。",
    faq: "FAQ",
    faqDesc: "よくある質問を確認",
    faqItems: [
      [
        "パスワードを忘れました。",
        "ログイン画面のパスワード検索から一時パスワードを受け取れます。",
      ],
      [
        "通知設定はどこで変更できますか？",
        "通知設定の管理ボタンからコメント、返信、いいね通知を調整できます。",
      ],
    ],
    versionInfo: "バージョン情報",
    versionInfoDesc: "PickPick v1.0.0",
    termsPrivacy: "利用規約/個人情報処理方針",
    termsPrivacyDesc: "サービス規約と個人情報の基準",
    termsPrivacyItems: [
      [
        "利用規約",
        "PickPickは円滑なサービス利用のため、基本的なアカウント情報と利用記録を管理します。",
      ],
      [
        "個人情報処理方針",
        "メール、ニックネームなど必要な情報のみサービス提供目的で使用します。",
      ],
      [
        "保管および削除",
        "退会時、法令上必要な情報を除きアカウント情報は削除されます。",
      ],
    ],
    open: "見る",
    logout: "ログアウト",
    deleteAccount: "退会",
    logoutConfirm: "本当にログアウトしますか？",
    deleteConfirm: "本当に退会しますか？",
    deleteFail: "退会処理に失敗しました。",
    passwordRequired: "現在のパスワードと新しいパスワードを入力してください。",
    passwordMismatch: "新しいパスワードが一致しません。",
    passwordSaved: "パスワード変更リクエストが完了しました。",
    notificationSaved: "通知設定を保存しました。",
    displaySaved: "画面設定を保存しました。",
  },
};

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    comments: true,
    replies: true,
    likes: true,
  });
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
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    title: "",
    content: "",
  });
  const text = TEXT[displaySettings.language] || TEXT.한국어;

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

  const handleToggleNotification = (key) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

  const handleInquiryChange = (event) => {
    const { name, value } = event.target;
    setInquiryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitInquiry = () => {
    if (!inquiryForm.title.trim() || !inquiryForm.content.trim()) {
      alert(text.inquiryRequired);
      return;
    }

    alert(text.inquirySent);
    setInquiryForm({
      title: "",
      content: "",
    });
    setIsInquiryOpen(false);
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
                    <span>{currentUser?.name || "-"}</span>
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
                    <strong>{text.notifications}</strong>
                    <span>{text.notificationsDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNotificationOpen((prev) => !prev)}
                  >
                    {isNotificationOpen ? text.close : text.manage}
                  </button>
                </div>

                {isNotificationOpen && (
                  <div className="notification-panel">
                    <label className="notification-option">
                      <span>
                        <strong>{text.commentNotifications}</strong>
                        <em>{text.commentNotificationsDesc}</em>
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.comments}
                        onChange={() => handleToggleNotification("comments")}
                      />
                    </label>

                    <label className="notification-option">
                      <span>
                        <strong>{text.replyNotifications}</strong>
                        <em>{text.replyNotificationsDesc}</em>
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.replies}
                        onChange={() => handleToggleNotification("replies")}
                      />
                    </label>

                    <label className="notification-option">
                      <span>
                        <strong>{text.likeNotifications}</strong>
                        <em>{text.likeNotificationsDesc}</em>
                      </span>
                      <input
                        type="checkbox"
                        checked={notificationSettings.likes}
                        onChange={() => handleToggleNotification("likes")}
                      />
                    </label>

                    <button
                      type="button"
                      className="notification-save-btn"
                      onClick={() => alert(text.notificationSaved)}
                    >
                      {text.save}
                    </button>
                  </div>
                )}

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

                <div className="settings-menu-item">
                  <div>
                    <strong>{text.customerSupport}</strong>
                    <span>{text.customerSupportDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSupportOpen((prev) => !prev)}
                  >
                    {isSupportOpen ? text.close : text.support}
                  </button>
                </div>

                {isSupportOpen && (
                  <div className="support-panel">
                    <div className="support-item">
                      <div>
                        <strong>{text.contactUs}</strong>
                        <span>{text.contactUsDesc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsInquiryOpen((prev) => !prev)}
                      >
                        {isInquiryOpen ? text.close : text.support}
                      </button>
                    </div>

                    {isInquiryOpen && (
                      <div className="inquiry-form">
                        <label>
                          <span>{text.inquiryTitle}</span>
                          <input
                            type="text"
                            name="title"
                            value={inquiryForm.title}
                            placeholder={text.inquiryTitlePlaceholder}
                            onChange={handleInquiryChange}
                          />
                        </label>

                        <label>
                          <span>{text.inquiryContent}</span>
                          <textarea
                            name="content"
                            value={inquiryForm.content}
                            placeholder={text.inquiryContentPlaceholder}
                            onChange={handleInquiryChange}
                          />
                        </label>

                        <button type="button" onClick={handleSubmitInquiry}>
                          {text.submitInquiry}
                        </button>
                      </div>
                    )}

                    <div className="support-item">
                      <div>
                        <strong>{text.faq}</strong>
                        <span>{text.faqDesc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFaqOpen((prev) => !prev)}
                      >
                        {isFaqOpen ? text.close : text.open}
                      </button>
                    </div>

                    {isFaqOpen && (
                      <div className="faq-panel">
                        {text.faqItems.map(([question, answer]) => (
                          <div className="faq-item" key={question}>
                            <strong>{question}</strong>
                            <span>{answer}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="support-item">
                      <div>
                        <strong>{text.termsPrivacy}</strong>
                        <span>{text.termsPrivacyDesc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsTermsOpen((prev) => !prev)}
                      >
                        {isTermsOpen ? text.close : text.open}
                      </button>
                    </div>

                    {isTermsOpen && (
                      <div className="terms-panel">
                        {text.termsPrivacyItems.map(([title, content]) => (
                          <div className="terms-item" key={title}>
                            <strong>{title}</strong>
                            <span>{content}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="support-item">
                      <div>
                        <strong>{text.versionInfo}</strong>
                        <span>{text.versionInfoDesc}</span>
                      </div>
                    </div>
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
