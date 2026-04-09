import "./Signin.css";
import { useState } from "react";

export default function Signin() {
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
    realname: false,
    required: false,
    marketing: false,
  });

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

  // 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!checks.realname) {
      alert("실명 인증은 필수입니다.");
      return;
    }

    if (!checks.required) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    if (form.id.length < 5) {
      alert("아이디는 5자 이상 입력하세요.");
      return;
    }

    if (form.pw.length < 8) {
      alert("비밀번호는 8자 이상 입력하세요.");
      return;
    }

    if (form.birth.length !== 8) {
      alert("생년월일은 8자리 숫자입니다.");
      return;
    }

    console.log("회원가입 데이터:", {
      ...form,
      gender,
      nationality,
      ...checks,
    });
  };

  return (
    <div className="container">
      <div className="signup-box">
        {/* ✅ 상단 체크 (커스텀 + state) */}
        <div className="checkbox top-check">
          <label className="custom-check">
            <input
              type="checkbox"
              name="realname"
              checked={checks.realname}
              onChange={handleCheck}
            />
            <span className="checkmark"></span>
            <span className="text">실명 인증된 아이디로 가입</span>
          </label>
        </div>

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

        <div className="input-group">
          <span>✉️</span>
          <input
            type="email"
            name="email"
            placeholder="[선택] 이메일 주소"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <span>👤</span>
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
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
          <label>
            <input
              type="checkbox"
              name="required"
              checked={checks.required}
              onChange={handleCheck}
            />
            필수 개인정보 처리 방침 동의
          </label>
        </div>

        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              name="marketing"
              checked={checks.marketing}
              onChange={handleCheck}
            />
            선택 마케팅 동의
          </label>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          회원 가입
        </button>
      </div>
    </div>
  );
}
