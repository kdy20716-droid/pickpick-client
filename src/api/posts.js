import instance from "./instance";

// 1. 투표 게시글 목록 조회 API
export const getVote = async (keyword = null) => {
  const response = await instance.get(
    `/recipes${keyword === null ? "" : "?keyword=" + keyword}`,
  );
  return response.data;
};

// 2. 투표 게시글 생성 API
export const addVote = async (
  author_id,
  category,
  title,
  candidate_a_name,
  candidate_a_image,
  candidate_b_name,
  candidate_b_image,
) => {
  // 이미지가 포함된 데이터를 보낼 때는 FormData를 사용합니다.
  const formData = new FormData();
  formData.append("author_id", author_id);
  formData.append("category", category);
  formData.append("title", title);
  formData.append("candidate_a_name", candidate_a_name);
  formData.append("candidate_a_image", candidate_a_image); // 파일 객체
  formData.append("candidate_b_name", candidate_b_name);
  formData.append("candidate_b_image", candidate_b_image); // 파일 객체

  const response = await instance.post("/recipes", formData);
  return response.data;
};
