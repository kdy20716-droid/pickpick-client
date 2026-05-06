     import instance from "./instance";

const VOTE_LIST_PATH = "/votelist";

// 1. 투표 게시글 목록 조회 API
export const getVote = async (
  keyword = null,
  category = null,
  sort = null,
  user_id = null,
) => {
  let url = "/votelist";
  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  if (category) params.append("category", category);
  if (sort) params.append("sort", sort);
  if (user_id) params.append("user_id", user_id);

  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;

  const response = await instance.get(url);
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

  const response = await instance.post(VOTE_LIST_PATH, formData);
  return response.data;
};

// 3. 투표하기 API
export const submitVote = async (postId, user_id, selected_side) => {
  const response = await instance.post(`/api/votes/${postId}`, {
    user_id,
    selected_side,
  });
  return response.data;
};

// 4. 좋아요 토글 API
export const toggleLike = async (postId, user_id) => {
  const response = await instance.post(`/api/votes/${postId}/like`, {
    user_id,
  });
  return response.data;
};

// 5. 댓글 목록 조회 API
export const getComments = async (postId) => {
  const response = await instance.get(`/api/votes/${postId}/comments`);
  return response.data;
};

// 6. 댓글 추가 API
export const addComment = async (
  postId,
  user_id,
  content,
  parent_id = null,
) => {
  const response = await instance.post(`/api/votes/${postId}/comments`, {
    user_id,
    content,
    parent_id,
  });
  return response.data;
};

// 7. 댓글 삭제 API
export const deleteComment = async (postId, commentId, user_id) => {
  const response = await instance.delete(
    `/api/votes/${postId}/comments/${commentId}`,
    {
      data: { user_id },
    },
  );
  return response.data;
};

// 8. 댓글 좋아요 토글 API
export const toggleCommentLike = async (postId, commentId, user_id) => {
  const response = await instance.post(
    `/api/votes/${postId}/comments/${commentId}/like`,
    {
      user_id,
    },
  );
  return response.data;
};

// 9. 랭킹 데이터 조회 API
export const getRanking = async () => {
  const response = await instance.get(`${VOTE_LIST_PATH}/ranking`);
  return response.data;
};

// 10. 조회수 증가 API
export const incrementView = async (postId) => {
  const response = await instance.post(`${VOTE_LIST_PATH}/${postId}/view`);
  return response.data;
};
