import axios from "axios";

const isLocalHost = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);

const instance = axios.create({
  // 로컬 개발 환경에서는 실행 중인 Vite 포트와 관계없이 로컬 API 서버를 사용합니다.
  baseURL: isLocalHost
    ? "http://localhost:4000"
    : "https://dolphin-app-onqn2.ondigitalocean.app/",
});

// 인터셉터 (interceptor) : 요청 / 응답시 중간에 가로채는 함수
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // 토큰이 있다면 요청시 헤더에 토큰을 붙여서 보냄
    // Authorization : Bearer 토큰은 JWT 인증의 표준 형식
    config.headers.Authorization = `Bearer ${token}`;
  }
  // 수정된 config를 반환해야 요청시 전송됨
  return config;
});

export default instance;
// 수정10
