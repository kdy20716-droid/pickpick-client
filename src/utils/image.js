export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl =
    import.meta.env.VITE_API_URL || "https://dolphin-app-onqn2.ondigitalocean.app";
  return `${baseUrl}/uploads/${imagePath}`;
};

/**
 * 투표 후보의 썸네일 URL을 반환합니다.
 * @param {string} imagePath - 이미지 경로 또는 유튜브 비디오 ID
 * @param {string} type - 'image', 'youtube', 'video', 'audio'
 * @returns {string} 썸네일 URL
 */
export const getCandidateThumbnail = (imagePath, type = "image") => {
  if (!imagePath) return null;

  // 1. 유튜브 타입인 경우 썸네일 반환
  if (type === "youtube") {
    // ID만 있는 경우와 전체 URL이 있는 경우 대응
    const videoId = imagePath.includes("v=") 
      ? new URLSearchParams(new URL(imagePath).search).get("v")
      : imagePath;
    return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  }

  // 2. 비디오 타입인 경우 (추후 비디오 썸네일 추출 기능 전까지는 플레이스홀더나 기본 아이콘)
  if (type === "video") {
    return "https://via.placeholder.com/400x300/000000/FFFFFF?text=VIDEO";
  }

  // 3. 오디오 타입
  if (type === "audio") {
    return "https://via.placeholder.com/400x300/f7a1c4/FFFFFF?text=AUDIO";
  }

  // 4. 일반 이미지
  return getImageUrl(imagePath);
};
