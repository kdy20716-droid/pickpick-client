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
    return validDomains.includes(parts[1].toLowerCase());
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

  return (
    <div className="page">
      {" "}
      {/* 🔥 핵심 wrapper */}
      <header className="header">
        <div className="logo">PICKPICK</div>
      </header>
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
