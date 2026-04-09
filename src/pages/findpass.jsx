import { useState } from "react";
import "./findpass.css";

export default function FindPassword() {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [msg, setMsg] = useState("");

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

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (checkEmail(value)) {
      setIsValid(true);
      setMsg("사용 가능한 이메일입니다.");
    } else {
      setIsValid(false);
      setMsg("올바른 이메일 형식이 아닙니다.");
    }
  };

  const handleSubmit = () => {
    if (!isValid) return;

    // 🔥 백엔드 연결 부분 (여기 중요)
    fetch("/api/send-temp-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("임시 비밀번호가 발송되었습니다!");
      })
      .catch(() => {
        alert("서버 오류 발생");
      });
  };

  return (
    <div>
      {/* 헤더 */}
      <header className="header">
        <div className="logo">PICKPICK</div>
        <nav>
          <a href="#">+ CREATE</a>
          <a href="#">RANKING</a>
          <a href="#">LOG IN</a>
          <div className="profile"></div>
        </nav>
      </header>

      {/* 메인 */}
      <div className="container">
        <div className="card">
          <h2>비밀번호 찾기</h2>
          <p>
            가입하신 이메일 주소를 입력해 주세요.
            <br />
            임시 비밀번호를 발송해 드립니다.
          </p>

          <input
            type="text"
            placeholder="이메일 주소 입력"
            value={email}
            onChange={handleChange}
          />

          <div className="buttons">
            <button className="back">뒤로 가기</button>
            <button
              className={`submit ${isValid ? "active" : ""}`}
              disabled={!isValid}
              onClick={handleSubmit}
            >
              임시 비밀번호 발송
            </button>
          </div>

          <small className={isValid ? "success" : "error"}>{msg}</small>
        </div>
      </div>
    </div>
  );
}
