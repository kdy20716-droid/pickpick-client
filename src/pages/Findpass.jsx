import { useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../api/instance";
import "./Findpass.css";

export default function FindPassword() {
  const [phase, setPhase] = useState(1);
  const [email, setEmail] = useState("");
  const [serverCode, setServerCode] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isValid, setIsValid] = useState(false);
  const [msg, setMsg] = useState("");
  const [isSuccessMsg, setIsSuccessMsg] = useState(false);
  const navigate = useNavigate();

  const validDomains = [
    "gmail.com",
    "naver.com",
    "daum.net",
    "kakao.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "yahoo.com",
    "hanmail.net",
    "nate.com",
  ];

  const checkEmail = (value) => {
    const parts = value.split("@");
    if (parts.length !== 2) return false;
    const domain = parts[1].toLowerCase();
    return validDomains.includes(domain);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (checkEmail(value)) {
      setIsValid(true);
      setIsSuccessMsg(true);
      setMsg("올바른 이메일 형식입니다.");
    } else {
      setIsValid(false);
      setIsSuccessMsg(false);
      setMsg("올바른 이메일 형식이 아닙니다.");
    }
  };

  const handleSendCode = async () => {
    if (!isValid) return;

    try {
      const response = await instance.post("/users/send-temp-password", { email });
      setServerCode(response.data.code);
      setPhase(2);
      setIsSuccessMsg(true);
      setMsg("인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
    } catch (error) {
      setIsSuccessMsg(false);
      setMsg(error.response?.data?.message || "발송 실패");
    }
  };

  const handleVerifyCode = () => {
    if (code === serverCode) {
      setPhase(3);
      setIsSuccessMsg(true);
      setMsg("인증이 완료되었습니다. 새 비밀번호를 입력해주세요.");
    } else {
      setIsSuccessMsg(false);
      setMsg("인증 코드가 일치하지 않습니다.");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 4) {
      setIsSuccessMsg(false);
      setMsg("비밀번호는 4자 이상 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsSuccessMsg(false);
      setMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await instance.post("/users/reset-password", { email, newPassword });
      setIsSuccessMsg(true);
      setMsg("비밀번호가 성공적으로 변경되었습니다! 잠시 후 로그인 페이지로 이동합니다.");
      
      // 사용자가 메시지를 볼 수 있도록 2초 후 이동
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setIsSuccessMsg(false);
      setMsg(error.response?.data?.message || "비밀번호 변경 실패");
    }
  };

  return (
    <div className="findpass-page">
      <div className="findpass-container">
        <div className="findpass-card">
          <h2>비밀번호 찾기</h2>
          
          {phase === 1 && (
            <>
              <p>가입하신 이메일 주소를 입력해 주세요.<br/>인증 코드를 발송해 드립니다.</p>
              <input
                type="text"
                placeholder="이메일 주소 입력"
                value={email}
                onChange={handleEmailChange}
              />
              <div className="findpass-buttons">
                <button className="back" onClick={() => navigate(-1)}>뒤로 가기</button>
                <button
                  className={`submit ${isValid ? "active" : ""}`}
                  disabled={!isValid}
                  onClick={handleSendCode}
                >
                  코드 발급
                </button>
              </div>
            </>
          )}

          {phase === 2 && (
            <>
              <p>이메일로 발송된 6자리 코드를 입력해주세요.</p>
              <input
                type="text"
                placeholder="인증 코드 6자리"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
              <div className="findpass-buttons">
                <button className="back" onClick={() => setPhase(1)}>이메일 재입력</button>
                <button
                  className={`submit ${code.length === 6 ? "active" : ""}`}
                  disabled={code.length !== 6}
                  onClick={handleVerifyCode}
                >
                  코드 확인
                </button>
              </div>
            </>
          )}

          {phase === 3 && (
            <>
              <p>새롭게 사용할 비밀번호를 입력해주세요.</p>
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="findpass-buttons">
                <button className="back" onClick={() => navigate(-1)}>취소</button>
                <button
                  className={`submit ${newPassword && confirmPassword ? "active" : ""}`}
                  disabled={!newPassword || !confirmPassword}
                  onClick={handleResetPassword}
                >
                  비밀번호 변경
                </button>
              </div>
            </>
          )}

          <small className={isSuccessMsg ? "findpass-success" : "findpass-error"}>
            {msg}
          </small>
        </div>
      </div>
    </div>
  );
}
