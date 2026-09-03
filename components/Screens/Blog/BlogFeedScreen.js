import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import {
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';

import { navigationRef } from '../../../src/utils/NavigationService';

import AppHeader from '../../common/AppHeader';
import Popup from '../../Popup/Popup';

import {
  getBlogComments,
  likeBlog,
  unlikeBlog,
} from '../../../src/api/blogApi';

import { getCommentAuthorName } from './CommentItem';

import BlogCard from '../../blog/BlogCard';

/* =====================================================
   CONFIG
===================================================== */

const API_BASE_URL =
  'http://192.168.18.225:5050';

/* =====================================================
   GET ALL BLOGS
===================================================== */

const getAllBlogs = async () => {
  try {
    const token =
      await AsyncStorage.getItem('userToken');

    const headers = {
      'Content-Type': 'application/json',
      ...(token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {}),
    };

    const url =
      `${API_BASE_URL}/blog/all`;

    console.log(
      '🌐 Blog API:',
      url,
    );

    const response =
      await axios.get(
        url,
        {
          headers,
          timeout: 15000,
        },
      );

    console.log(
      '✅ Get All Blogs Response:',
      JSON.stringify(
        response.data,
        null,
        2,
      ),
    );

    return response.data;
  } catch (error) {
    console.log(
      '❌ Get All Blogs Error:',
      error?.response?.data ||
      error?.message ||
      error,
    );

    throw error;
  }
};

/* =====================================================
   BLOG FEED SCREEN
===================================================== */

const BlogFeedScreen = ({
  navigation,
  embedded = false,

}) => {
  const route = useRoute();

  /* ===================================================
     BLOG STATE
  =================================================== */

  const [
    blogs,
    setBlogs,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /* ===================================================
     COMMENT STATE
  =================================================== */

  const [
    commentModalVisible,
    setCommentModalVisible,
  ] = useState(false);

  const [
    selectedBlogId,
    setSelectedBlogId,
  ] = useState(null);

  const [
    commentText,
    setCommentText,
  ] = useState('');

  const [
    commentSubmitting,
    setCommentSubmitting,
  ] = useState(false);

  const [
    comments,
    setComments,
  ] = useState([]);

  const [
    commentsLoading,
    setCommentsLoading,
  ] = useState(false);

  /* ===================================================
     POPUP
  =================================================== */

  const [
    popup,
    setPopup,
  ] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showPopup = useCallback(
    (title, message) => {
      console.log(
        '🔔 Popup:',
        title,
        message,
      );

      setPopup({
        visible: true,
        title:
          title || 'Message',
        message:
          message || '',
      });
    },
    [],
  );

  const closePopup = useCallback(() => {
    setPopup({
      visible: false,
      title: '',
      message: '',
    });
  }, []);

  /* ===================================================
     GET BLOG ID
     
     IMPORTANT:
     We keep ID extraction in ONE place.
  =================================================== */

  const getBlogId = useCallback(
    blog => {
      if (!blog) {
        return null;
      }

      return (
        blog?._id ||
        blog?.id ||
        null
      );
    },
    [],
  );

  /* ===================================================
     LOAD COMMENTS
  =================================================== */

  const loadComments = useCallback(
    async blogId => {
      if (!blogId) {
        console.log(
          '❌ loadComments: no blog ID',
        );

        setComments([]);
        return;
      }

      try {
        setCommentsLoading(true);

        console.log(
          '💬 Loading comments for:',
          blogId,
        );

        const response =
          await getBlogComments(
            blogId,
          );

        console.log(
          '💬 Comments response:',
          JSON.stringify(
            response,
            null,
            2,
          ),
        );

        const commentList =
          Array.isArray(
            response?.data,
          )
            ? response.data
            : Array.isArray(response)
              ? response
              : [];

        setComments(
          commentList,
        );
      } catch (error) {
        console.log(
          '❌ Load comments error:',
          error?.response?.data ||
          error?.message ||
          error,
        );

        setComments([]);
      } finally {
        setCommentsLoading(
          false,
        );
      }
    },
    [],
  );

  /* ===================================================
     OPEN COMMENT MODAL
  =================================================== */

  const openCommentModal =
    useCallback(
      blog => {
        const blogId =
          getBlogId(blog);

        console.log(
          '💬 Open comments',
        );

        console.log(
          '💬 Blog:',
          blog,
        );

        console.log(
          '💬 Blog ID:',
          blogId,
        );

        if (!blogId) {
          showPopup(
            'Unable to Comment',
            'This blog does not contain a valid ID.',
          );

          return;
        }

        setSelectedBlogId(
          String(blogId),
        );

        setCommentText('');

        setComments([]);

        setCommentModalVisible(
          true,
        );

        loadComments(
          String(blogId),
        );
      },
      [
        getBlogId,
        loadComments,
        showPopup,
      ],
    );

  /* ===================================================
     CLOSE COMMENT MODAL
  =================================================== */

  const closeCommentModal =
    useCallback(() => {
      if (commentSubmitting) {
        return;
      }

      console.log(
        '❌ Closing comment modal',
      );

      Keyboard.dismiss();

      setCommentModalVisible(
        false,
      );

      setSelectedBlogId(null);

      setCommentText('');

      setComments([]);
    }, [
      commentSubmitting,
    ]);

  /* ===================================================
     OPEN BLOG DETAIL
  =================================================== */

  const handleOpenBlog = useCallback(
    blog => {

      const blogId = blog?._id;

      console.log(
        '================================',
      );

      console.log(
        '📖 OPEN BLOG',
      );

      console.log(
        'Full blog:',
        JSON.stringify(blog, null, 2),
      );

      console.log(
        'Blog ID:',
        blogId,
      );

      console.log(
        'Navigation exists:',
        !!navigation,
      );

      if (!blogId) {

        console.log(
          '❌ Cannot open BlogDetail: blog ID missing',
        );

        showPopup(
          'Unable to Open Blog',
          'Blog information is missing.',
        );

        return;
      }

      navigation.navigate(
        'BlogDetail',
        {
          blogId: String(blogId),
        },
      );

    },
    [
      navigation,
      showPopup,
    ],
  );

  /* ===================================================
     LIKE / UNLIKE
  =================================================== */

  const handleLikePress =
    useCallback(
      async blog => {
        const blogId =
          getBlogId(blog);

        const currentlyLiked =
          Boolean(
            blog?.isLikedByMe ??
            blog?.liked ??
            blog?.isLiked ??
            false,
          );

        console.log(
          '❤️ Like pressed',
        );

        console.log(
          '❤️ Blog ID:',
          blogId,
        );

        console.log(
          '❤️ Current liked:',
          currentlyLiked,
        );

        if (!blogId) {
          showPopup(
            'Unable to Like',
            'This blog does not contain a valid ID.',
          );

          return;
        }

        try {
          const token =
            await AsyncStorage.getItem(
              'userToken',
            );

          if (!token) {
            navigation.navigate(
              'Login',
            );

            return;
          }

          const response =
            currentlyLiked
              ? await unlikeBlog(
                blogId,
              )
              : await likeBlog(
                blogId,
              );

          console.log(
            '❤️ Like API response:',
            JSON.stringify(
              response,
              null,
              2,
            ),
          );

          if (
            response?.success ===
            false
          ) {
            showPopup(
              currentlyLiked
                ? 'Unable to Unlike'
                : 'Unable to Like',
              response?.message ||
              'Unable to update like.',
            );

            return;
          }

          const backendLikesCount =
            response?.likesCount ??
            response?.data
              ?.likesCount ??
            response?.blog
              ?.likesCount;

          const currentCount =
            Number(
              blog?.likesCount ??
              blog?.likeCount,
            ) || 0;

          const finalCount =
            backendLikesCount !==
              undefined &&
              Number(
                backendLikesCount,
              ) >= 0
              ? Number(
                backendLikesCount,
              )
              : currentlyLiked
                ? Math.max(
                  0,
                  currentCount - 1,
                )
                : currentCount + 1;

          setBlogs(
            previousBlogs =>
              previousBlogs.map(
                item => {
                  const itemId =
                    getBlogId(
                      item,
                    );

                  if (
                    String(
                      itemId,
                    ) !==
                    String(
                      blogId,
                    )
                  ) {
                    return item;
                  }

                  return {
                    ...item,
                    likesCount:
                      finalCount,
                    isLikedByMe:
                      !currentlyLiked,
                  };
                },
              ),
          );
        } catch (error) {
          console.log(
            '❌ Like API Error:',
            error?.response
              ?.data ||
            error?.message ||
            error,
          );

          if (
            error?.response
              ?.status === 401
          ) {
            await AsyncStorage.removeItem(
              'userToken',
            );

            showPopup(
              'Login Required',
              'Your session has expired. Please login again.',
            );

            return;
          }

          showPopup(
            currentlyLiked
              ? 'Unable to Unlike'
              : 'Unable to Like',
            error?.response
              ?.data?.message ||
            'Unable to update this blog.',
          );
        }
      },
      [
        getBlogId,
        navigation,
        showPopup,
      ],
    );

  /* ===================================================
     SUBMIT COMMENT
  =================================================== */

  const handleSubmitComment =
    async () => {
      try {
        const token =
          await AsyncStorage.getItem(
            'userToken',
          );

        if (!token) {
          closeCommentModal();

          navigation.navigate(
            'Login',
          );

          return;
        }

        if (!selectedBlogId) {
          showPopup(
            'Unable to Comment',
            'No blog is selected.',
          );

          return;
        }

        const trimmedComment =
          commentText.trim();

        if (!trimmedComment) {
          showPopup(
            'Comment Required',
            'Please enter a comment.',
          );

          return;
        }

        setCommentSubmitting(
          true,
        );

        console.log(
          '💬 Posting comment',
        );

        console.log(
          '💬 Blog ID:',
          selectedBlogId,
        );

        const response =
          await axios.post(
            `${API_BASE_URL}/blog/${selectedBlogId}/comment`,
            {
              content:
                trimmedComment,
            },
            {
              timeout: 15000,

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json',
              },
            },
          );

        console.log(
          '✅ Comment API response:',
          JSON.stringify(
            response.data,
            null,
            2,
          ),
        );

        if (
          response?.data?.success
        ) {
          setCommentText('');

          await loadComments(
            selectedBlogId,
          );

          setBlogs(
            previousBlogs =>
              previousBlogs.map(
                blog => {
                  const blogId =
                    getBlogId(
                      blog,
                    );

                  if (
                    String(
                      blogId,
                    ) !==
                    String(
                      selectedBlogId,
                    )
                  ) {
                    return blog;
                  }

                  return {
                    ...blog,

                    commentsCount:
                      response
                        ?.data
                        ?.commentsCount ??
                      (
                        Number(
                          blog
                            ?.commentsCount ??
                          blog
                            ?.commentCount,
                        ) || 0
                      ) + 1,
                  };
                },
              ),
          );

          showPopup(
            'Comment Added',
            response?.data
              ?.message ||
            'Your comment was added successfully.',
          );

          return;
        }

        showPopup(
          'Unable to Comment',
          response?.data
            ?.message ||
          'Unable to add your comment.',
        );
      } catch (error) {
        console.log(
          '❌ Comment API Error:',
          error?.response
            ?.data ||
          error?.message ||
          error,
        );

        if (
          error?.response
            ?.status === 401
        ) {
          await AsyncStorage.removeItem(
            'userToken',
          );

          closeCommentModal();

          showPopup(
            'Login Required',
            'Your session has expired. Please login again.',
          );

          return;
        }

        showPopup(
          'Unable to Comment',
          error?.response
            ?.data?.message ||
          'Unable to add comment. Please try again.',
        );
      } finally {
        setCommentSubmitting(
          false,
        );
      }
    };

  /* ===================================================
     CREATE BLOG
  =================================================== */

  const handleCreateBlog =
    async () => {
      try {
        const token =
          await AsyncStorage.getItem(
            'userToken',
          );

        if (!token) {
          navigation.navigate(
            'Login',
          );

          return;
        }

        navigation.navigate(
          'CreateBlog',
        );
      } catch (error) {
        console.log(
          '❌ Create Blog auth error:',
          error,
        );

        navigation.navigate(
          'Login',
        );
      }
    };

  /* ===================================================
     FETCH BLOGS
  =================================================== */

  const fetchBlogs =
    useCallback(
      async () => {
        try {
          setError(null);

          console.log(
            '📚 Fetching blogs...',
          );

          const response =
            await getAllBlogs();

          console.log(
            '📚 Raw API response:',
            JSON.stringify(
              response,
              null,
              2,
            ),
          );

          let blogList = [];

          if (
            Array.isArray(
              response?.blogs,
            )
          ) {
            blogList =
              response.blogs;
          } else if (
            Array.isArray(
              response?.data,
            )
          ) {
            blogList =
              response.data;
          } else if (
            Array.isArray(
              response,
            )
          ) {
            blogList =
              response;
          }

          console.log(
            '📚 Blog count:',
            blogList.length,
          );

          /*
           * VERY IMPORTANT DEBUGGING
           */

          blogList.forEach(
            (blog, index) => {
              console.log(
                `📚 BLOG ${index} ID:`,
                blog?._id ||
                blog?.id ||
                'MISSING',
              );

              console.log(
                `📚 BLOG ${index}:`,
                JSON.stringify(
                  blog,
                  null,
                  2,
                ),
              );
            },
          );

          const normalizedBlogs =
            blogList.map(
              blog => ({
                ...blog,

                isLikedByMe:
                  Boolean(
                    blog
                      ?.isLikedByMe ??
                    blog?.isLiked ??
                    blog?.liked ??
                    false,
                  ),
              }),
            );

          setBlogs(
            normalizedBlogs,
          );
        } catch (error) {
          console.log(
            '❌ Blog Feed Error:',
            error?.response
              ?.data ||
            error?.message ||
            error,
          );

          setBlogs([]);

          setError(
            error?.response
              ?.data?.message ||
            'Unable to load blogs. Please try again.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  /* ===================================================
     REFRESH WHEN RETURNING TO SCREEN
  =================================================== */

  useFocusEffect(
    useCallback(
      () => {
        if (
          route?.params
            ?.refreshKey
        ) {
          fetchBlogs();
        }
      },
      [
        fetchBlogs,
        route?.params
          ?.refreshKey,
      ],
    ),
  );

  /* ===================================================
     REFRESH
  =================================================== */

  const handleRefresh =
    () => {
      setRefreshing(true);
      fetchBlogs();
    };

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <View
        style={
          styles.container
        }
      >
        {!embedded && (
          <AppHeader
            isBlogHeader
            backTarget="Dashboard"
          />
        )}

        <View
          style={
            styles.centerContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#00503D"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading blogs...
          </Text>
        </View>
      </View>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error) {
    return (
      <View
        style={
          styles.container
        }
      >
        {!embedded && (
          <AppHeader
            isBlogHeader
            backTarget="Dashboard"
          />
        )}
        <View
          style={
            styles.centerContainer
          }
        >
          <Text
            style={
              styles.errorIcon
            }
          >
            ⚠️
          </Text>

          <Text
            style={
              styles.errorTitle
            }
          >
            Unable to load blogs
          </Text>

          <Text
            style={
              styles.errorMessage
            }
          >
            {error}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={
              fetchBlogs
            }
          >
            <Text
              style={
                styles.retryText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ===================================================
     MAIN SCREEN
  =================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {!embedded && (
        <AppHeader
          isBlogHeader
          backTarget="Dashboard"
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor="#00503D"
          />
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ===========================================
            HEADER
        =========================================== */}

        <Text
          style={
            styles.heading
          }
        >
          Latest Blogs
        </Text>

        <Text
          style={
            styles.subHeading
          }
        >
          Discover what's happening
          in Manas
        </Text>

        {/* ===========================================
            EMPTY
        =========================================== */}

        {blogs.length === 0 ? (
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={
                styles.emptyIcon
              }
            >
              📝
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No blogs yet
            </Text>

            <Text
              style={
                styles.emptyMessage
              }
            >
              There are no published
              blogs available.
            </Text>
          </View>
        ) : (
          /* =========================================
             BLOG LIST
          ========================================= */

          blogs.map(
            (
              blog,
              index,
            ) => (
              <BlogCard
                key={
                  getBlogId(
                    blog,
                  ) ||
                  `blog-${index}`
                }
                blog={blog}
                onPress={
                  handleOpenBlog
                }
                onLikePress={
                  handleLikePress
                }
                onCommentPress={
                  openCommentModal
                }
              />
            ),
          )
        )}
      </ScrollView>

      {/* =============================================
          CREATE BLOG
      ============================================= */}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={
          handleCreateBlog
        }
      >
        <Text
          style={
            styles.fabText
          }
        >
          +
        </Text>
      </TouchableOpacity>

      {/* =============================================
          COMMENT MODAL
      ============================================= */}

      <Modal
        visible={
          commentModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeCommentModal
        }
      >
        {/* OUTSIDE AREA */}

        <Pressable
          style={
            styles.modalContainer
          }
          onPress={
            closeCommentModal
          }
        >
          {/* COMMENT SHEET */}

          <Pressable
            style={
              styles.commentModal
            }
            onPress={event =>
              event.stopPropagation()
            }
          >
            <KeyboardAvoidingView
              behavior={
                Platform.OS ===
                  'ios'
                  ? 'padding'
                  : undefined
              }
              style={
                styles.commentSheetInner
              }
            >
              {/* HEADER */}

              <View
                style={
                  styles.commentHeader
                }
              >
                <Text
                  style={
                    styles.commentTitle
                  }
                >
                  Comments
                </Text>

                <TouchableOpacity
                  onPress={
                    closeCommentModal
                  }
                >
                  <Text
                    style={
                      styles.closeText
                    }
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {/* COMMENTS */}

              {commentsLoading ? (
                <View
                  style={
                    styles.commentsLoadingContainer
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color="#00503D"
                  />

                  <Text
                    style={
                      styles.commentsLoadingText
                    }
                  >
                    Loading comments...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={
                    comments
                  }
                  keyExtractor={(
                    item,
                    index,
                  ) =>
                    item?._id ||
                    `comment-${index}`
                  }
                  style={
                    styles.commentsListContainer
                  }
                  contentContainerStyle={
                    comments.length ===
                      0
                      ? styles.emptyCommentsList
                      : styles.commentsListContent
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <View
                      style={
                        styles.emptyCommentsBox
                      }
                    >
                      <Text
                        style={
                          styles.emptyCommentsIcon
                        }
                      >
                        💬
                      </Text>

                      <Text
                        style={
                          styles.emptyCommentsTitle
                        }
                      >
                        No comments yet
                      </Text>

                      <Text
                        style={
                          styles.emptyCommentsText
                        }
                      >
                        Be the first to
                        comment on this
                        blog.
                      </Text>
                    </View>
                  }
                  renderItem={({
                    item,
                  }) => (
                    <View
                      style={
                        styles.commentBubble
                      }
                    >
                      <Text
                        style={
                          styles.commentAuthor
                        }
                      >
                        {getCommentAuthorName(
                          item,
                        )}
                      </Text>

                      <Text
                        style={
                          styles.commentContent
                        }
                      >
                        {item?.content ||
                          item?.comment ||
                          'No comment text'}
                      </Text>
                    </View>
                  )}
                />
              )}

              {/* INPUT */}

              <View
                style={
                  styles.commentInputWrap
                }
              >
                <TextInput
                  style={
                    styles.commentInput
                  }
                  placeholder="Write your comment..."
                  placeholderTextColor="#999"
                  value={
                    commentText
                  }
                  onChangeText={
                    setCommentText
                  }
                  multiline
                  maxLength={
                    2000
                  }
                  textAlignVertical="top"
                  returnKeyType="default"
                  blurOnSubmit={
                    false
                  }
                />

                <Text
                  style={
                    styles.characterCount
                  }
                >
                  {
                    commentText.length
                  }
                  /2000
                </Text>

                <TouchableOpacity
                  style={[
                    styles.commentSubmitButton,

                    (!commentText.trim() ||
                      commentSubmitting) &&
                    styles.commentSubmitButtonDisabled,
                  ]}
                  onPress={
                    handleSubmitComment
                  }
                  disabled={
                    !commentText.trim() ||
                    commentSubmitting
                  }
                >
                  {commentSubmitting ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={
                        styles.commentSubmitText
                      }
                    >
                      Post Comment
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =============================================
          POPUP
      ============================================= */}

      {popup.visible && (
        <Popup
          title={
            popup.title
          }
          message={
            popup.message
          }
          onClose={
            closePopup
          }
          autoClose
          autoCloseDelay={
            2000
          }
        />
      )}
    </View>
  );
};

export default BlogFeedScreen;

/* =====================================================
   STYLES
===================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#F7F9F8',
    },

    content: {
      padding: 16,
      paddingBottom: 110,
    },

    /* HEADER */

    heading: {
      fontSize: 24,
      fontWeight: '800',
      color: '#00503D',
      marginBottom: 4,
    },

    subHeading: {
      fontSize: 14,
      color: '#7A898E',
      marginBottom: 18,
    },

    /* CENTER */

    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },

    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: '#66777D',
    },

    /* ERROR */

    errorIcon: {
      fontSize: 40,
      marginBottom: 12,
    },

    errorTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#173A4A',
    },

    errorMessage: {
      marginTop: 8,
      textAlign: 'center',
      fontSize: 14,
      color: '#7A898E',
    },

    retryButton: {
      marginTop: 18,
      paddingHorizontal: 24,
      paddingVertical: 11,
      borderRadius: 8,
      backgroundColor: '#00503D',
    },

    retryText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },

    /* EMPTY */

    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },

    emptyIcon: {
      fontSize: 42,
      marginBottom: 12,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#173A4A',
    },

    emptyMessage: {
      marginTop: 8,
      fontSize: 14,
      color: '#7A898E',
      textAlign: 'center',
    },

    /* FAB */

    fab: {
      position: 'absolute',
      right: 20,
      bottom: 25,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#81BAA5',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 5,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },

    fabText: {
      fontSize: 30,
      color: '#FFFFFF',
      fontWeight: '700',
    },

    /* COMMENT MODAL */

    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor:
        'rgba(0,0,0,0.45)',
    },

    commentSheetInner: {
      width: '100%',
      maxHeight: '100%',
    },

    commentModal: {
      backgroundColor:
        '#FFFFFF',

      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,

      padding: 20,

      paddingBottom:
        Platform.OS === 'ios'
          ? 30
          : 20,

      maxHeight: '85%',
    },

    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 15,
    },

    commentTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#173A4A',
    },

    closeText: {
      fontSize: 22,
      color: '#666666',
    },

    commentsLoadingContainer: {
      minHeight: 120,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },

    commentsLoadingText: {
      marginTop: 10,
      color: '#66777D',
      fontSize: 13,
    },

    commentsListContainer: {
      maxHeight: 320,
      marginBottom: 12,
    },

    commentsListContent: {
      paddingBottom: 8,
    },

    emptyCommentsList: {
      minHeight: 120,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 22,
    },

    emptyCommentsBox: {
      alignItems: 'center',
    },

    emptyCommentsIcon: {
      fontSize: 32,
      marginBottom: 8,
    },

    emptyCommentsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#173A4A',
      marginBottom: 4,
    },

    emptyCommentsText: {
      fontSize: 13,
      color: '#6A7A7A',
      textAlign: 'center',
    },

    commentBubble: {
      backgroundColor:
        '#F3F7F6',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
    },

    commentAuthor: {
      color: '#00503D',
      fontWeight: '700',
      fontSize: 12,
      marginBottom: 4,
    },

    commentContent: {
      color: '#1A1A1A',
      fontSize: 14,
      lineHeight: 20,
    },

    commentInputWrap: {
      marginTop: 4,
    },

    commentInput: {
      minHeight: 100,
      maxHeight: 180,

      borderWidth: 1,
      borderColor: '#DDDDDD',

      borderRadius: 10,

      paddingHorizontal: 14,
      paddingVertical: 12,

      fontSize: 16,
      color: '#222222',
    },

    characterCount: {
      textAlign: 'right',
      marginTop: 6,
      color: '#888888',
      fontSize: 12,
    },

    commentSubmitButton: {
      marginTop: 15,

      backgroundColor:
        '#00503D',

      borderRadius: 10,

      paddingVertical: 14,

      alignItems: 'center',
    },

    commentSubmitButtonDisabled: {
      backgroundColor:
        '#B8C8C3',
    },

    commentSubmitText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  });