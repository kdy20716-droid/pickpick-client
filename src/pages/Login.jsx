import { useState } from "react";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (form.username === "admin" && form.password === "1234") {
      setMsg("로그인 성공!");
    } else {
      setMsg("아이디 또는 비밀번호 오류");
    }
  };

  return (
    <div className="container">
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

          {/* 비밀번호 찾기 */}
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
          </div>
        </form>

        {/* 메시지 */}
        {msg && <p id="message">{msg}</p>}
      </div>
    </div>
  );
}
