import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/users";
import "./SignupPage.css"; // CSS 파일 불러오기
import { toast } from "sonner";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await signup({ name, email, password });
      if (response.ok) {
        toast.success("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        navigate("/login");
      } else {
        const data = await response.json();
        toast.error(`회원가입 실패: ${data.message}`);
      }
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      toast.error("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="signup-container">
      <h2>회원가입</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 입력"
          required
        />
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
        <button className="signup-button" type="submit">
          회원가입
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
