import "./Signin.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signin } from "../api/users";

export default function Signin() {
  const navigate = useNavigate();
  // ✅ 1️⃣ 입력값 상태 관리
  const [form, setForm] = useState({
    id: "",
    pw: "",
    email: "",
    name: "",
    birth: "",
  });

  // ✅ 2️⃣ 옵션 상태
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");

  // ✅ 3️⃣ 체크박스 상태
  const [checks, setChecks] = useState({
    required: false,
    marketing: false,
  });

  // ✅ 4️⃣ 에러 모달 상태
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ✅ 5️⃣ 이메일 인증 관련 상태
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [verificationInput, setVerificationInput] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [serverCode, setServerCode] = useState(""); // 실제로는 서버에서 처리하지만 현재는 프론트에서 관리

  // 모달 자동 닫기 (3초 후)
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => setShowModal(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 생년월일 숫자만 제한
    if (name === "birth") {
      const onlyNumber = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: onlyNumber });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // 체크박스 변경
  const handleCheck = (e) => {
    const { name, checked } = e.target;
    setChecks({ ...checks, [name]: checked });
  };

  // 이메일 코드 전송
  const handleSendEmailCode = async () => {
    if (!form.email) {
      setErrorMsg("이메일 주소를 먼저 입력해주세요.");
      setShowModal(true);
      return;
    }

    // 간단한 이메일 형식 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrorMsg("올바른 이메일 형식이 아닙니다.");
      setShowModal(true);
      return;
    }

    try {
      // 백엔드 API 호출하여 이메일 전송
      const response = await fetch("http://localhost:4000/users/send-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      if (!response.ok) {
        throw new Error("서버에서 이메일을 발송하지 못했습니다.");
      }

      const data = await response.json();
      
      // 서버에서 전달받은 코드를 프론트엔드 상태로 저장 (프론트에서 검증하기 위함)
      setServerCode(data.code);
      setEmailCodeSent(true);

      alert(`인증 코드가 발송되었습니다`);
    } catch (error) {
      setErrorMsg("이메일 발송 중 오류가 발생했습니다.");
      setShowModal(true);
      console.error(error);
    }
  };

  // 이메일 코드 확인
  const handleVerifyEmailCode = () => {
    if (verificationInput === serverCode && serverCode !== "") {
      setIsEmailVerified(true);
      alert("이메일 인증이 완료되었습니다.");
    } else {
      setErrorMsg("인증 코드가 일치하지 않습니다.");
      setShowModal(true);
    }
  };

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checks.required) {
      setErrorMsg("필수 약관에 동의해주세요.");
      setShowModal(true);
      return;
    }

    if (form.id.length < 5) {
      setErrorMsg("아이디는 5자 이상 입력하세요.");
      setShowModal(true);
      return;
    }

    if (form.pw.length < 8) {
      setErrorMsg("비밀번호는 8자 이상 입력하세요.");
      setShowModal(true);
      return;
    }

    if (!form.name || form.name.length > 5) {
      setErrorMsg("이름은 1자 이상 5자 이하로 입력해주세요.");
      setShowModal(true);
      return;
    }

    if (!form.email) {
      setErrorMsg("이메일 주소를 입력해주세요.");
      setShowModal(true);
      return;
    }

    if (!isEmailVerified) {
      setErrorMsg("이메일 인증을 완료해주세요.");
      setShowModal(true);
      return;
    }

    if (form.birth.length !== 8) {
      setErrorMsg("생년월일은 8자리 숫자입니다.");
      setShowModal(true);
      return;
    }

    try {
      const formData = {
        ...form,
        gender,
        nationality
      };
      await signin(formData);
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.",
      );
    }
  };

  return (
    <div className="container">
      {/* 상단 에러 모달 */}
      {showModal && (
        <div className="error-modal">
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="signup-box">
        <h2>회원 가입</h2>

        {/* 입력 */}
        <div className="input-group">
          <span>👤</span>
          <input
            type="text"
            name="id"
            placeholder="아이디"
            value={form.id}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <span>🔒</span>
          <input
            type="password"
            name="pw"
            placeholder="비밀번호"
            value={form.pw}
            onChange={handleChange}
          />
        </div>

        <div className="input-group-with-btn">
          <div className="input-group">
            <span>✉️</span>
            <input
              type="email"
              name="email"
              placeholder="이메일 주소"
              value={form.email}
              onChange={handleChange}
              disabled={isEmailVerified}
            />
          </div>
          <button
            type="button"
            className="verify-btn"
            onClick={handleSendEmailCode}
            disabled={isEmailVerified}
          >
            {emailCodeSent ? "재전송" : "코드받기"}
          </button>
        </div>

        {emailCodeSent && !isEmailVerified && (
          <div className="input-group-with-btn animate-fade-in">
            <div className="input-group">
              <span>🔢</span>
              <input
                type="text"
                placeholder="인증코드 6자리"
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                maxLength={6}
              />
            </div>
            <button
              type="button"
              className="verify-confirm-btn"
              onClick={handleVerifyEmailCode}
            >
              확인
            </button>
          </div>
        )}

        {isEmailVerified && (
          <div className="verified-badge animate-fade-in">
            ✅ 이메일 인증 완료
          </div>
        )}

        <div className="input-group">
          <span>👤</span>
          <input
            type="text"
            name="name"
            placeholder="이름 (최대 5글자)"
            value={form.name}
            onChange={handleChange}
            maxLength={5}
          />
        </div>

        <div className="input-group">
          <span>📅</span>
          <input
            type="text"
            name="birth"
            placeholder="생년월일 8자리"
            value={form.birth}
            onChange={handleChange}
            maxLength={8}
          />
        </div>

        {/* 성별 */}
        <div className="option-group">
          <div>
            <span>👫</span>
            <button
              type="button"
              className={gender === "남자" ? "active" : ""}
              onClick={() => setGender("남자")}
            >
              남자
            </button>
            <button
              type="button"
              className={gender === "여자" ? "active" : ""}
              onClick={() => setGender("여자")}
            >
              여자
            </button>
          </div>

          {/* 내외국인 */}
          <div>
            <span>🏳️</span>
            <button
              type="button"
              className={nationality === "내국인" ? "active" : ""}
              onClick={() => setNationality("내국인")}
            >
              내국인
            </button>
            <button
              type="button"
              className={nationality === "외국인" ? "active" : ""}
              onClick={() => setNationality("외국인")}
            >
              외국인
            </button>
          </div>
        </div>

        {/* 약관 */}
        <div className="checkbox">
          <label className="custom-check terms-check">
            <input
              type="checkbox"
              name="required"
              checked={checks.required}
              onChange={handleCheck}
            />
            <span className="checkmark"></span>
            <span className="text">필수 개인정보 처리 방침 동의</span>
          </label>
        </div>

        <div className="checkbox">
          <label className="custom-check terms-check">
            <input
              type="checkbox"
              name="marketing"
              checked={checks.marketing}
              onChange={handleCheck}
            />
            <span className="checkmark"></span>
            <span className="text">선택 마케팅 동의</span>
          </label>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          회원 가입
        </button>

        {/* 비밀번호 찾기 연결 */}
        <div
          style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}
        ></div>
      </div>
    </div>
  );
}
