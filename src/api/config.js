const LOCAL_API_URL = "http://localhost:4000";
const PRODUCTION_API_URL = "https://dolphin-app-onqn2.ondigitalocean.app";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? LOCAL_API_URL : PRODUCTION_API_URL);
