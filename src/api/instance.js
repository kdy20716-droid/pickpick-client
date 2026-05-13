import axios from "axios";

const instance = axios.create({
  // 배포된 서버 URL이 환경변수에 있으면 사용, 없으면 로컬호스트 사용
  // 테스트 할 떄는 localhost:4000
  //baseURL: "http://localhost:4000",
  baseURL: "https://dolphin-app-onqn2.ondigitalocean.app/",
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
// 수정1