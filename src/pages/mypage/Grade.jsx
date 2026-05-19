import "./Grade.css";

const Grade = () => {
  return (
    <section className="gradeSection">
      <div className="gradeCard">
        <div className="gradeHeader">
          <h3 className="gradeTitle">회원 등급 안내</h3>
        </div>
        <div className="gradeTabs">
          <div className="gradeTab active">전체 등급</div>
        </div>
        <div className="gradeContent">
          <div className="gradeItem">
            <div
              className="gradeIcon"
              style={{ background: "#CD7F3222", color: "#CD7F32" }}
            >
              🥉
            </div>
            <span className="gradeName">BRONZE</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 참여 10회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div
              className="gradeIcon"
              style={{ background: "#C0C0C022", color: "#C0C0C0" }}
            >
              🥈
            </div>
            <span className="gradeName">SILVER</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 참여 100회 이상</span>
              <span className="gradeRequirement">게시글 생성 10회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div
              className="gradeIcon"
              style={{ background: "#FFD70022", color: "#FFD700" }}
            >
              🥇
            </div>
            <span className="gradeName">GOLD</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 우승 100회 이상</span>
              <span className="gradeRequirement">게시글 생성 100회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div
              className="gradeIcon"
              style={{ background: "#E5E4E222", color: "#4ae46b" }}
            >
              💎
            </div>
            <span className="gradeName">PLATINUM</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 우승 500회 이상</span>
              <span className="gradeRequirement">게시글 생성 200회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div
              className="gradeIcon"
              style={{ background: "#8B5CF622", color: "#8B5CF6" }}
            >
              👑
            </div>
            <span className="gradeName">MASTER</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 우승 1000회 이상</span>
              <span className="gradeRequirement">게시글 생성 500회 이상</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Grade;
