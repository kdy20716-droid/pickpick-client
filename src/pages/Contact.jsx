import React from "react";
import "./PolicyPage.css";

const Contact = () => {
  return (
    <div className="policy-page">
      <h1>문의하기 (Contact)</h1>
      <p>PICKPICK 서비스를 이용해 주셔서 감사합니다. 서비스 이용 중 궁금한 점이 있거나 건의 사항, 비즈니스 협업 제안이 있으시면 아래 채널을 통해 연락해 주세요.</p>

      <section>
        <h2>고객 지원</h2>
        <p>서비스 이용 장애, 버그 신고, 계정 관련 문의는 고객 지원 팀으로 메일을 보내주시면 1~2영업일 이내에 답변을 드립니다.</p>
        <div className="contact-info">
          <p><strong>Email:</strong> support@pickpick.dev</p>
        </div>
      </section>

      <section>
        <h2>비즈니스 및 제휴 문의</h2>
        <p>광고 게재, 파트너십 제안 등 비즈니스 관련 문의는 아래 메일로 상세 내용을 전달해 주세요.</p>
        <div className="contact-info">
          <p><strong>Email:</strong> business@pickpick.dev</p>
        </div>
      </section>

      <section>
        <h2>FAQ (자주 묻는 질문)</h2>
        <ul>
          <li><strong>비밀번호를 잊어버렸어요:</strong> 로그인 페이지 하단의 '비밀번호 찾기' 기능을 이용해 가입하신 이메일로 임시 비밀번호를 받으실 수 있습니다.</li>
          <li><strong>투표를 삭제하고 싶어요:</strong> '마이페이지 > 내가 만든 투표'에서 본인이 작성한 투표를 관리 및 삭제할 수 있습니다.</li>
          <li><strong>광고가 보이지 않아요:</strong> 현재 서비스 안정화 기간으로 일부 기기에서 광고 노출이 제한될 수 있습니다.</li>
        </ul>
      </section>

      <p style={{ marginTop: "40px" }}>픽픽은 유저 여러분의 소중한 의견을 귀담아듣고 항상 더 나은 서비스를 만들기 위해 노력하겠습니다.</p>
    </div>
  );
};

export default Contact;
