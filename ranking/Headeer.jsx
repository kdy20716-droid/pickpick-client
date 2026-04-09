import React from "react";
import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div className="logo" style={{ marginRight: "auto" }}>
        PICKPICK
      </div>
      <nav>
        <a href="#">+ CREATE</a>
        <a href="#" className="active">
          RANKING
        </a>
        <a href="#">LOG IN</a>
        <div className="profile-icon"></div>
      </nav>
    </header>
  );
}

export default Header;
