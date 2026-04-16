import React from 'react';
import "./Profile.css";

const ProfileSection = () => {
  return (
    <div className="profile-container">
      <div className="breadcrumb">
        마이페이지 &gt; 내 프로필 &gt; 프로필 설정
      </div>

      <div className="profile-card">
        <div className="card-header">
          <div className="button-group">
            <button className="btn-cancel">취소</button>
            <button className="btn-save">저장</button>
          </div>
        </div>

        <div className="card-content">
          {/* 왼쪽: 프로필 사진 영역 */}
          <div className="profile-image-section">
            <div className="image-circle">
              <div className="avatar-placeholder"></div>
            </div>
            <div className="image-buttons">
              <button className="btn-sub">사진 편집</button>
              <button className="btn-sub">기본이미지</button>
            </div>
          </div>

          {/* 오른쪽: 입력 폼 영역 */}
          <div className="profile-form">
            <div className="form-grid">
              {/* 이름 */}
              <div className="form-group full">
                <label>이름</label>
                <input type="text" className="input-field" />
              </div>

              {/* 성별 */}
              <div className="form-group gender-group">
                <label>성별</label>
                <div className="gender-options">
                  <button className="gender-btn">남자</button>
                  <button className="gender-btn active">여자</button>
                  <button className="gender-btn">밝히고 싶지 않음</button>
                </div>
              </div>

              {/* 별명 */}
              <div className="form-group full">
                <label>별명</label>
                <div className="input-with-status">
                  <input type="text" className="input-field" />
                  <span className="status-msg success">
                    <i className="check-icon">✓</i> 사용 가능합니다.
                  </span>
                </div>
              </div>

              {/* 생년월일 */}
              <div className="form-group full">
                <label>생년월일</label>
                <div className="birth-inputs">
                  <input type="text" placeholder="YEAR" className="input-field" />
                  <input type="text" placeholder="MONTH" className="input-field" />
                  <input type="text" placeholder="DAY" className="input-field" />
                </div>
              </div>

              {/* 전화번호 */}
              <div className="form-group full">
                <label>전화번호</label>
                <div className="input-with-status">
                  <input type="text" className="input-field" />
                  <span className="status-msg success">
                    <i className="check-icon">✓</i> 인증이 완료되었습니다.
                  </span>
                </div>
              </div>

              {/* 이메일 */}
              <div className="form-group full">
                <label>이메일</label>
                <div className="email-inputs">
                  <input type="text" className="input-field" />
                  <div className="select-box">선택</div>
                  <input type="text" placeholder="@email.com" className="input-field" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;