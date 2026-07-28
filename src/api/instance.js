import axios from "axios";
import { API_BASE_URL } from "./config";

const instance = axios.create({
  baseURL: API_BASE_URL,
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
// 수정12
