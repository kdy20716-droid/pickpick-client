import instance from "./instance";

// 회원가입 API
export const signin = async (form) => {
  await instance.post("/users/signin", form);
};

export const login = async (form) => {
  const response = await instance.post("/users/login", form);
  return response.data;
};
