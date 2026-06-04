import React, { useEffect } from "react";

const SidebarAd = ({ side }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  const style = {
    position: "fixed",
    top: "120px",
    width: "160px",
    height: "600px",
    zIndex: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    [side]: "calc(50% - 590px - 180px)", // Center content (1180px) / 2 + margin
  };

  return (
    <div className={`sidebar-ad sidebar-ad-${side}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "160px", height: "600px" }}
        data-ad-client="ca-pub-6447676826673071"
        data-ad-slot="5218526488"
        data-ad-format="vertical"
        data-full-width-responsive="false"
      ></ins>
    </div>
  );
};

export default SidebarAd;
