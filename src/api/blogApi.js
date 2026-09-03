import axios from 'axios';
import { API_URL } from '@env';
import { getAuthToken } from '../utils/auth';

// =====================================================
// CONFIG
// =====================================================

const API_BASE_URL = API_URL;

console.log('🌐 Blog API Base URL:', API_BASE_URL);


// =====================================================
// AUTH HEADER
// =====================================================

// const getAuthHeaders = async () => {
//   const token = await getAuthToken();

//   console.log(
//     '========== BLOG AUTH DEBUG =========='
//   );

//   console.log(
//     'Token exists:',
//     !!token,
//   );

//   console.log(
//     'Token length:',
//     token?.length,
//   );

//   console.log(
//     'Token start:',
//     token?.substring(0, 20),
//   );

//   console.log(
//     'Token end:',
//     token?.substring(
//       Math.max(0, token.length - 20),
//     ),
//   );

//   console.log(
//     '======================================'
//   );
//   if (!token) {
//     const error = new Error(
//       'Authentication required',
//     );

//     error.code = 'AUTH_REQUIRED';

//     throw error;
//   }

//   return {
//     Authorization: `Bearer ${token}`,
//     'Content-Type': 'application/json',
//   };
// };
const getAuthHeaders = async (isMultipart = false) => {
  const token = await getAuthToken();

  if (!token) {
    const error = new Error('Authentication required');
    error.code = 'AUTH_REQUIRED';
    throw error;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Don't set Content-Type for multipart requests —
  // let axios/React Native generate the correct
  // "multipart/form-data; boundary=..." header itself.
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

// =====================================================
// GET ALL BLOGS
// PUBLIC
//
// GET /blog/all
// =====================================================

export const getAllBlogs = async () => {
  try {
    console.log(
      '🌐 GET:',
      `${API_BASE_URL}/blog/all`,
    );

    const response = await axios.get(
      `${API_BASE_URL}/blog/all`,
      {
        timeout: 15000,
      },
    );

    console.log(
      '✅ Get All Blogs Response:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.error(
      '❌ Get All Blogs Error:',
      error?.response?.data || error.message,
    );

    throw error;
  }
};


// =====================================================
// GET SINGLE BLOG
// PUBLIC
//
// GET /blog/:blogId
// =====================================================

export const getBlogById = async blogId => {

  if (!blogId) {
    throw new Error(
      'Blog ID is required',
    );
  }

  try {

    console.log(
      '🌐 GET:',
      `${API_BASE_URL}/blog/${blogId}`,
    );

    const response = await axios.get(
      `${API_BASE_URL}/blog/${blogId}`,
      {
        timeout: 15000,
      },
    );

    console.log(
      '✅ Get Single Blog Response:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.error(
      '❌ Get Single Blog Error:',
      error?.response?.data || error.message,
    );

    throw error;
  }
};


// =====================================================
// CREATE BLOG
// PROTECTED
//
// POST /blog/create
// multipart/form-data
// =====================================================

export const createBlog = async blogData => {

  if (!blogData) {
    throw new Error(
      'Blog data is required',
    );
  }

  // =====================================================
  // GET DATA
  // =====================================================

  const title =
    typeof blogData.title === 'string'
      ? blogData.title.trim()
      : '';

  const description =
    typeof blogData.description === 'string'
      ? blogData.description.trim()
      : '';

  const image =
    blogData.image || null;


  // =====================================================
  // VALIDATION
  // =====================================================

  if (!title) {
    throw new Error(
      'Blog title is required',
    );
  }

  if (!description) {
    throw new Error(
      'Blog description is required',
    );
  }


  try {

    // ===================================================
    // AUTH
    //
    // SAME AS LIKE BLOG
    // ===================================================

    const headers = await getAuthHeaders(true);

    // ===================================================
    // FORM DATA
    // ===================================================

    const formData = new FormData();


    formData.append(
      'title',
      title,
    );


    formData.append(
      'description',
      description,
    );


    // ===================================================
    // IMAGE
    // ===================================================

    if (image?.uri) {

      formData.append(
        'image',
        {
          uri: image.uri,

          type:
            image.type ||
            'image/jpeg',

          name:
            image.fileName ||
            'blog-image.jpg',
        },
      );


      console.log(
        '========== BLOG IMAGE =========='
      );

      console.log(
        'URI:',
        image.uri,
      );

      console.log(
        'TYPE:',
        image.type,
      );

      console.log(
        'NAME:',
        image.fileName,
      );

      console.log(
        'SIZE:',
        image.fileSize,
      );

      console.log(
        '================================='
      );

    } else {

      console.log(
        '🖼️ No image selected',
      );

    }


    // ===================================================
    // REQUEST
    // ===================================================

    console.log(
      '🌐 POST:',
      `${API_BASE_URL}/blog/create`,
    );

    console.log(
      '📦 Sending multipart/form-data',
    );


    const response =
      await axios.post(
        `${API_BASE_URL}/blog/create`,

        formData,

        {
          headers,

          timeout: 30000,
        },
      );


    // ===================================================
    // RESPONSE
    // ===================================================

    console.log(
      '✅ Create Blog Response:',
      response.data,
    );


    return response.data;


  } catch (error) {

    console.error(
      '❌ Create Blog Error:',
      error?.response?.data ||
      error?.message ||
      error,
    );

    throw error;
  }
};

// =====================================================
// LIKE BLOG
// PROTECTED
//
// POST /blog/:blogId/like
// =====================================================

export const likeBlog = async blogId => {

  if (!blogId) {
    throw new Error(
      'Blog ID is required',
    );
  }

  try {

    const headers =
      await getAuthHeaders();

    console.log(
      '🌐 POST:',
      `${API_BASE_URL}/blog/${blogId}/like`,
    );

    const response = await axios.post(
      `${API_BASE_URL}/blog/${blogId}/like`,
      {},
      {
        headers,
        timeout: 15000,
      },
    );

    console.log(
      '✅ Like Blog Response:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.error(
      '❌ Like Blog Error:',
      error?.response?.data || error.message,
    );

    throw error;
  }
};


// =====================================================
// UNLIKE BLOG
// PROTECTED
//
// DELETE /blog/:blogId/like
// =====================================================

export const unlikeBlog = async blogId => {

  if (!blogId) {
    throw new Error(
      'Blog ID is required',
    );
  }

  try {

    const headers =
      await getAuthHeaders();

    console.log(
      '🌐 DELETE:',
      `${API_BASE_URL}/blog/${blogId}/like`,
    );

    const response = await axios.delete(
      `${API_BASE_URL}/blog/${blogId}/like`,
      {
        headers,
        timeout: 15000,
      },
    );

    console.log(
      '✅ Unlike Blog Response:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.error(
      '❌ Unlike Blog Error:',
      error?.response?.data || error.message,
    );

    throw error;
  }
};


// =====================================================
// GET BLOG COMMENTS
// PUBLIC
//
// GET /blog/:blogId/comments
// =====================================================

export const getBlogComments = async blogId => {

  if (!blogId) {
    throw new Error(
      'Blog ID is required',
    );
  }

  try {

    console.log(
      '🌐 GET:',
      `${API_BASE_URL}/blog/${blogId}/comments`,
    );

    const response = await axios.get(
      `${API_BASE_URL}/blog/${blogId}/comments`,
      {
        timeout: 15000,
      },
    );

    console.log(
      '✅ Get Blog Comments Response:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.error(
      '❌ Get Blog Comments Error:',
      error?.response?.data || error.message,
    );

    throw error;
  }
};


// =====================================================
// ADD BLOG COMMENT
// PROTECTED
//
// POST /blog/:blogId/comment
// =====================================================

export const addBlogComment = async (
  blogId,
  content,
) => {

  if (!blogId) {
    throw new Error(
      'Blog ID is required',
    );
  }

  const comment =
    typeof content === 'string'
      ? content.trim()
      : '';


  if (!comment) {
    throw new Error(
      'Comment is required',
    );
  }


  try {

    const headers =
      await getAuthHeaders();

    console.log(
      '🌐 POST:',
      `${API_BASE_URL}/blog/${blogId}/comment`,
    );

    const response = await axios.post(
      `${API_BASE_URL}/blog/${blogId}/comment`,
      {
        content: comment,
      },
      {
        headers,
        timeout: 15000,
      },
    );

    console.log(
      '✅ Add Blog Comment Response:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.error(
      '❌ Add Blog Comment Error:',
      error?.response?.data || error.message,
    );

    throw error;
  }
};


// =====================================================
// DELETE BLOG COMMENT
// PROTECTED
//
// DELETE /blog/:blogId/comment/:commentId
// =====================================================

export const deleteBlogComment = async (
  blogId,
  commentId,
) => {

  if (!blogId) {
    throw new Error(
      'Blog ID is required',
    );
  }

  if (!commentId) {
    throw new Error(
      'Comment ID is required',
    );
  }


  try {

    const headers =
      await getAuthHeaders();

    console.log(
      '🌐 DELETE:',
      `${API_BASE_URL}/blog/${blogId}/comment/${commentId}`,
    );

    const response = await axios.delete(
      `${API_BASE_URL}/blog/${blogId}/comment/${commentId}`,
      {
        headers,
        timeout: 15000,
      },
    );

    console.log(
      '✅ Delete Blog Comment Response:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.error(
      '❌ Delete Blog Comment Error:',
      error?.response?.data || error.message,
    );

    throw error;
  }
};
// =====================================================
// SHARE BLOG
// PUBLIC
// =====================================================

export const shareBlog = async blogId => {

  if (!blogId) {
    throw new Error('Blog ID is required');
  }

  try {

    console.log(
      '🌐 Share Blog API:',
      `${API_BASE_URL}/blog/${blogId}/share`,
    );

    const response =
      await axios.post(
        `${API_BASE_URL}/blog/${blogId}/share`,
        {},
        {
          timeout: 15000,
        },
      );

    console.log(
      '✅ Share Blog Response:',
      response.data,
    );

    return response.data;

  } catch (error) {

    console.error(
      '❌ Share Blog API Error:',
      error?.response?.data ||
      error?.message ||
      error,
    );

    throw error;
  }
};