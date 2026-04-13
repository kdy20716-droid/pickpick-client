import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/users";
import "./LoginPage.css"; // CSS 파일 불러오기

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await login({ email, password });
      if (response.ok) {
        const data = await response.json();
        // 1. 서버에서 받은 사용자 정보를 브라우저의 localStorage에 저장합니다.
        localStorage.setItem("user", JSON.stringify(data.user));
        alert(`${data.user.name}님 환영합니다!`);
        // navigate 대신 location.href를 사용해 새로고침 효과를 주어 상단 메뉴바가 즉시 업데이트되게 합니다.
        window.location.href = "/";
      } else {
        const data = await response.json();
        alert(`로그인 실패: ${data.message}`);
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 입력"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 입력"
          required
        />
        <button className="login-button" type="submit">
          로그인
        </button>
      </form>
      <p style={{ marginTop: "20px" }}>
        계정이 없으신가요? <Link to="/signup">회원가입하기</Link>
      </p>
    </div>
  );
};

export default LoginPage;
