import api from './api';

// News API calls
export const getNews = async (page = 1, pageSize = 10, search = '', categoryId = null, isPublished = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  if (search) params.append('search', search);
  if (categoryId) params.append('categoryId', categoryId);
  if (isPublished !== null) params.append('isPublished', isPublished.toString());
  
  const response = await api.get(`/news?${params}`);
  return response.data;
};

export const getNewsById = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

export const getNewsBySlug = async (slug) => {
  const response = await api.get(`/news/slug/${slug}`);
  return response.data;
};

export const createNews = async (newsData) => {
  const response = await api.post('/news', newsData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateNews = async (id, newsData) => {
  const response = await api.put(`/news/${id}`, newsData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Add new image-specific functions
export const uploadNewsImages = async (newsId, images, altText = '', caption = '', isFeatured = false) => {
  const formData = new FormData();
  formData.append('newsId', newsId);
  formData.append('altText', altText);
  formData.append('caption', caption);
  formData.append('isFeatured', isFeatured);
  
  images.forEach(image => {
    formData.append('images', image);
  });
  
  const response = await api.post('/newsimages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getNewsImages = async (newsId = null) => {
  const params = newsId ? `?newsId=${newsId}` : '';
  const response = await api.get(`/newsimages${params}`);
  return response.data;
};

export const updateNewsImage = async (id, imageData) => {
  const response = await api.put(`/newsimages/${id}`, imageData);
  return response.data;
};


export const deleteNews = async (id) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};

export const publishNews = async (id) => {
  const response = await api.patch(`/news/${id}/publish`);
  return response.data;
};

export const unpublishNews = async (id) => {
  const response = await api.patch(`/news/${id}/unpublish`);
  return response.data;
};

// Category API calls
export const getCategories = async (page = 1, pageSize = 50) => {
  const response = await api.get(`/newscategory?page=${page}&pageSize=${pageSize}`);
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/newscategory/${id}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/newscategory', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/newscategory/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/newscategory/${id}`);
  return response.data;
};

// Comments API calls
export const getComments = async (newsId) => {
  const response = await api.get(`/news/${newsId}/comments`);
  return response.data;
};

export const createComment = async (commentData) => {
  const response = await api.post('/comments', commentData);
  return response.data;
};

export const updateComment = async (id, commentData) => {
  const response = await api.put(`/comments/${id}`, commentData);
  return response.data;
};

export const deleteComment = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};

// Reactions API calls
export const getReactions = async (newsId) => {
  const response = await api.get(`/news/${newsId}/reactions`);
  return response.data;
};

export const addReaction = async (reactionData) => {
  const response = await api.post('/reactions', reactionData);
  return response.data;
};

export const removeReaction = async (id) => {
  const response = await api.delete(`/reactions/${id}`);
  return response.data;
};

// Images API calls
export const uploadNewsImage = async (newsId, imageData) => {
  const formData = new FormData();
  formData.append('file', imageData.file);
  formData.append('altText', imageData.altText || '');
  formData.append('caption', imageData.caption || '');
  formData.append('isFeatured', imageData.isFeatured || false);
  
  const response = await api.post(`/news/${newsId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteNewsImage = async (imageId) => {
  const response = await api.delete(`/newsimages/${imageId}`);
  return response.data;
};