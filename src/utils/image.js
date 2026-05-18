export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const baseUrl =
    import.meta.env.VITE_API_URL || "https://dolphin-app-onqn2.ondigitalocean.app";
    // "https://pickpick-server.onrender.com";
  return `${baseUrl}/uploads/${imagePath}`;
};
