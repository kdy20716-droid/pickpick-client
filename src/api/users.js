import instance from "./instance";

// 회원가입 API
export const signin = async (form) => {
  await instance.post("/users/signin", form);
};

export const login = async (form) => {
  const response = await instance.post("/users/login", form);
  return response.data;
};

// 알림 조회 API
export const getNotifications = async (userId) => {
  const response = await instance.get(`/users/${userId}/notifications`);
  return response.data;
};

// 알림 읽음 처리 API
export const markNotificationRead = async (userId, notifId) => {
  const response = await instance.put(`/users/${userId}/notifications/${notifId}/read`);
  return response.data;
};

// 모든 알림 읽음 처리 API
export const markAllNotificationsRead = async (userId) => {
  const response = await instance.put(`/users/${userId}/notifications/read-all`);
  return response.data;
};
