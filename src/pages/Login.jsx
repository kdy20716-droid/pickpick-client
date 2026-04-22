import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/users";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      // 로그인 성공 시 토큰과 유저 정보를 저장
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMsg("로그인 성공!");

      // 약간의 지연 후 메인 페이지로 이동
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      console.error(error);
      setMsg(error.response?.data?.message || "아이디 또는 비밀번호 오류");
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
