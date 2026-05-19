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
            <div className="gradeIconWrapper profile-border-bronze">
              <div className="gradeIconPlaceholder"></div>
            </div>
            <span className="gradeName">BRONZE</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 참여 10회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div className="gradeIconWrapper profile-border-silver">
              <div className="gradeIconPlaceholder"></div>
            </div>
            <span className="gradeName">SILVER</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 참여 100회 이상</span>
              <span className="gradeRequirement">게시글 생성 10회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div className="gradeIconWrapper profile-border-gold">
              <div className="gradeIconPlaceholder"></div>
            </div>
            <span className="gradeName">GOLD</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 우승 100회 이상</span>
              <span className="gradeRequirement">게시글 생성 100회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div className="gradeIconWrapper profile-border-platinum">
              <div className="gradeIconPlaceholder"></div>
            </div>
            <span className="gradeName">PLATINUM</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 우승 500회 이상</span>
              <span className="gradeRequirement">게시글 생성 200회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div className="gradeIconWrapper profile-border-diamond">
              <div className="gradeIconPlaceholder"></div>
            </div>
            <span className="gradeName">DIAMOND</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">투표 우승 1000회 이상</span>
              <span className="gradeRequirement">게시글 생성 500회 이상</span>
            </div>
          </div>
          <div className="gradeItem">
            <div className="gradeIconWrapper profile-border-master">
              <div className="gradeIconPlaceholder"></div>
            </div>
            <span className="gradeName">MASTER</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">다이아 등급 달성 후</span>
              <span className="gradeRequirement">랭킹 1,2,3위 등극</span>
              <span className="gradeRequirement">월 3회 이상 (매월 초기화)</span>
            </div>
          </div>
          <div className="gradeItem">
            <div className="gradeIconWrapper profile-border-challenger">
              <div className="gradeIconPlaceholder"></div>
            </div>
            <span className="gradeName">CHALLENGER</span>
            <div className="gradeRequirements">
              <span className="gradeRequirement">한 달간 내 게시물</span>
              <span className="gradeRequirement">랭킹 1위 등극</span>
              <span className="gradeRequirement">월 3회 이상 (매월 초기화)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Grade;
