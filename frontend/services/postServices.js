import api from "./api";

export const getPosts = async () => {
  const response = await api.get("/api/posts/");

  return response.data;
};