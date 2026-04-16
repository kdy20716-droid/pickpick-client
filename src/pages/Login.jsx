import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showModal, setShowModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (form.username === "admin" && form.password === "1234") {
      alert("로그인 성공!");
    } else {
      setShowModal(true);
    }
  };

  // 모달 자동 닫기 (선택 사항)
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  return (
    <div className="container">
      {/* 상단 모달 */}
      {showModal && (
        <div className="error-modal">
          <p>비밀번호가 틀렸습니다</p>
        </div>
      )}

      <div className="login-box">
        <h1>PICKPICK</h1>

        <form onSubmit={handleLogin}>
          {/* 아이디 */}
          <div className="input-group">
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <label>PickPick 계정</label>
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <label>비밀번호</label>
          </div>

          {/* 자동 로그인 체크박스 */}
          <div className="auto-login">
            <input type="checkbox" id="auto" />
            <label htmlFor="auto">자동 로그인</label>
          </div>

          {/* 로그인 버튼 */}
          <button type="submit">Login</button>

          {/* 비밀번호 찾기 및 회원가입 */}
          <div className="forgot">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("비밀번호 찾기 페이지로 이동");
              }}
            >
              비밀번호를 잊으셨습니까?
            </a>
            <div className="signup-link">
              <span>계정이 없으신가요? </span>
              <Link to="/signin">회원가입</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
