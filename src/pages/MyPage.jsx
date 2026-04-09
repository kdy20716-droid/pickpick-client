import { Link } from "react-router-dom";
import "./MyPage.css";

const MyPage = () => {
  return (
    <>
      {" "}
      <nav class="sidebar">
        <div class="nav-links">
          <Link to="/">HOME</Link>
          <Link to="/ranking">RANKING</Link>
          <Link to="/vote">VOTE</Link>
          <Link to="/create">CREATE</Link>
          <a href="#">SETTING</a>
          <Link to="/mypage" class="active">
            MY PAGE
          </Link>
        </div>
        <div class="sidebar-user">
          <div class="user-thumb"></div>
          <span>
            홍길동 <small>〉</small>
          </span>
        </div>
      </nav>
      <main class="main-content">
        <section class="content-body">
          <div class="left-panel">
            <p class="breadcrumb">마이페이지 〉 내 프로필</p>

            <div class="profile-header">
              <div class="card profile-img-card">
                <div class="circle-big"></div>
                <div class="cam-icon">📷</div>
              </div>
              <div class="card nickname-card">
                <div class="lv-badge">
                  LV.99 <span class="q-mark">?</span>{" "}
                  <span class="play-btn">▶</span>
                </div>
                <h2 class="nickname">홍길동 님</h2>
                <span class="gear-icon">⚙</span>
              </div>
            </div>

            <div class="card menu-list">
              <div class="menu-item">SETTING</div>
              <div class="menu-item">MY VOTE</div>
              <div class="menu-item">HISTORY</div>
              <div class="menu-item">LIKE</div>
              <div class="menu-item">MY POLL</div>
              <div class="menu-item lang-row">
                LANGUAGES
                <div class="lang-sel">
                  <span class="sel-on">한국어</span>
                  <span class="sel-off">English</span>
                </div>
              </div>
              <div class="menu-item">CONTACT</div>
            </div>
          </div>

          <div class="right-panel">
            <div class="card notif-card">
              <h3 class="panel-title">NOTIFICATION</h3>

              <div class="msg-pink">HEY PLZ VOTE !</div>
              <div class="msg-reply">
                <span class="m-icon">M</span> ↳ REPLY
              </div>

              <div class="msg-gray">YOU GOT 987 LIKES !</div>
              <div class="msg-gray">MARK POST NEW POLL</div>

              <div class="trending-box">
                <p class="trending-title">TRENDING NOW</p>

                <div class="rank-row">
                  <span>TOP 1</span>
                  <div class="vs-flex">
                    <div class="char-box"></div>
                    <span class="vs-txt">VS</span>
                    <div class="char-box"></div>
                  </div>
                </div>
                <div class="rank-row">
                  <span>TOP 2</span>
                  <div class="vs-flex">
                    <div class="char-box"></div>
                    <span class="vs-txt">VS</span>
                    <div class="char-box"></div>
                  </div>
                </div>
                <div class="rank-row">
                  <span>TOP 3</span>
                  <div class="vs-flex">
                    <div class="char-box"></div>
                    <span class="vs-txt">VS</span>
                    <div class="char-box"></div>
                  </div>
                </div>
              </div>

              <div class="bottom-check">✔ 확인했어요</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
export default MyPage;
