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
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import BlogImage from '../../common/BlogImage';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

import {
  LoadingState,
  ErrorState,
} from '../../common/StateViews';

import Popup from '../../Popup/Popup';

import {
  getAuthToken,
} from '../../../src/utils/auth';

import {
  getBlogById,
  getBlogComments,
  addBlogComment,
  deleteBlogComment,
  likeBlog,
  unlikeBlog,
} from '../../../src/api/blogApi';

import {
  COLORS,
  SPACING,
  FONT,
} from '../../../src/utils/theme';


// =====================================================
// TIME AGO
// =====================================================

const timeAgo = isoDate => {

  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs =
    Date.now() - date.getTime();

  const mins =
    Math.floor(diffMs / 60000);

  if (mins < 1) {
    return 'just now';
  }

  if (mins < 60) {
    return `${mins}m`;
  }

  const hours =
    Math.floor(mins / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days =
    Math.floor(hours / 24);

  if (days < 30) {
    return `${days}d`;
  }

  const months =
    Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo`;
  }

  const years =
    Math.floor(months / 12);

  return `${years}y`;
};


// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = isoDate => {

  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};


// =====================================================
// BLOG DETAIL SCREEN
// =====================================================

const BlogDetailScreen = ({
  route,
  navigation,
}) => {

  const blogId =
    route?.params?.blogId;

  console.log('📖 BlogDetailScreen');
  console.log('📖 Route params:', route?.params);
  console.log('📖 Blog ID:', blogId);
  const openCommentsInitially =
    route?.params?.openComments === true;


  // ===================================================
  // BLOG STATE
  // ===================================================

  const [blog, setBlog] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  // ===================================================
  // COMMENTS STATE
  // ===================================================

  const [comments, setComments] =
    useState([]);

  const [commentsVisible, setCommentsVisible] =
    useState(openCommentsInitially);

  const [commentsLoading, setCommentsLoading] =
    useState(false);

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);


  // ===================================================
  // LIKE STATE
  // ===================================================

  const [likeBusy, setLikeBusy] =
    useState(false);

  /*
   * This only controls the visual state of the heart.
   *
   * It is NOT used to calculate likesCount.
   *
   * likesCount always comes from the backend.
   */
  const [isLiked, setIsLiked] =
    useState(false);


  // ===================================================
  // POPUP
  // ===================================================

  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
  });


  // ===================================================
  // SHOW POPUP
  // ===================================================

  const showPopup =
    useCallback(
      (title, message) => {

        setPopup({
          visible: true,
          title:
            title ||
            'Message',
          message:
            message ||
            '',
        });

      },
      [],
    );


  // ===================================================
  // CLOSE POPUP
  // ===================================================

  const closePopup =
    useCallback(
      () => {

        setPopup({
          visible: false,
          title: '',
          message: '',
        });

      },
      [],
    );


  // ===================================================
  // AUTH
  // ===================================================

  const checkAuth =
    useCallback(
      async () => {

        try {

          const token =
            await getAuthToken();

          console.log(
            '🔐 Auth token exists:',
            !!token,
          );

          return token;

        } catch (err) {

          console.error(
            '❌ Auth check error:',
            err,
          );

          return null;

        }

      },
      [],
    );


  // ===================================================
  // LOAD BLOG
  // ===================================================

  const loadBlog =
    useCallback(
      async () => {

        if (!blogId) {

          setError(
            'Blog information is missing.',
          );

          return null;

        }

        try {

          console.log(
            '================================',
          );

          console.log(
            '📖 GET BLOG',
          );

          console.log(
            'Blog ID:',
            blogId,
          );


          const response =
            await getBlogById(
              blogId,
            );


          console.log(
            '📖 Blog response:',
            response,
          );


          const blogData =
            response?.data ||
            response?.blog ||
            response;


          if (!blogData) {

            throw new Error(
              'Blog data not found.',
            );

          }


          console.log(
            '📖 Final blog data:',
            JSON.stringify(
              blogData,
              null,
              2,
            ),
          );


          setBlog(
            blogData,
          );


          /*
           * Get the user's current like
           * state from the server.
           *
           * We DO NOT calculate the count here.
           */

          setIsLiked(
            !!blogData?.isLikedByMe,
          );


          return blogData;

        } catch (err) {

          console.error(
            '❌ Blog loading error:',
            err?.response?.data ||
            err?.message ||
            err,
          );


          setError(
            err?.response?.data?.message ||
            err?.message ||
            'Could not load this blog post.',
          );

          return null;

        }

      },
      [blogId],
    );


  // ===================================================
  // LOAD COMMENTS
  // ===================================================

  const loadComments =
    useCallback(
      async () => {

        if (!blogId) {
          return;
        }

        try {

          setCommentsLoading(
            true,
          );


          console.log(
            '💬 Loading comments:',
            blogId,
          );


          const response =
            await getBlogComments(
              blogId,
            );


          console.log(
            '💬 RAW COMMENTS:',
            JSON.stringify(
              response?.data,
              null,
              2,
            ),
          );


          const commentList =
            Array.isArray(
              response?.data,
            )
              ? response.data
              : Array.isArray(
                response,
              )
                ? response
                : [];


          console.log(
            '💬 COMMENTS BEING STORED:',
            JSON.stringify(
              commentList,
              null,
              2,
            ),
          );


          setComments(
            commentList,
          );


        } catch (err) {

          console.error(
            '❌ Comments error:',
            err?.response?.data ||
            err?.message ||
            err,
          );


          setComments([]);


          showPopup(
            'Unable to Load Comments',
            err?.response?.data?.message ||
            'Could not load comments.',
          );


        } finally {

          setCommentsLoading(
            false,
          );

        }

      },
      [
        blogId,
        showPopup,
      ],
    );


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    const initialize =
      async () => {

        setLoading(
          true,
        );

        await Promise.all([
          loadBlog(),
          loadComments(),
        ]);

        setLoading(
          false,
        );

      };


    initialize();

  }, [
    loadBlog,
    loadComments,
  ]);


  // ===================================================
  // OPEN COMMENTS
  // ===================================================

  const openComments =
    async () => {

      console.log(
        '💬 Comment button pressed',
      );


      const token =
        await checkAuth();


      if (!token) {

        navigation.navigate(
          'Login',
        );

        return;

      }


      /*
       * IMPORTANT:
       *
       * We DO NOT navigate anywhere.
       *
       * We simply open the modal
       * on this screen.
       */

      setCommentsVisible(
        true,
      );


      await loadComments();

    };


  // ===================================================
  // CLOSE COMMENTS
  // ===================================================

  const closeComments =
    () => {

      setCommentsVisible(
        false,
      );

    };


  // ===================================================
  // LIKE / UNLIKE
  // ===================================================

  const handleToggleLike =
    async () => {

      if (
        likeBusy ||
        !blogId
      ) {
        return;
      }


      try {

        // ---------------------------------------------
        // AUTH CHECK
        // ---------------------------------------------

        const token =
          await checkAuth();


        if (!token) {

          navigation.navigate(
            'Login',
          );

          return;

        }


        setLikeBusy(
          true,
        );


        /*
         * IMPORTANT
         *
         * If currently false:
         *
         *     POST → LIKE
         *
         * If currently true:
         *
         *     DELETE → UNLIKE
         */

        const currentlyLiked =
          isLiked;


        console.log(
          '❤️ Current like state:',
          currentlyLiked,
        );


        let response;


        // =============================================
        // LIKE
        // =============================================

        if (!currentlyLiked) {

          console.log(
            '❤️ Sending LIKE request',
          );


          response =
            await likeBlog(
              blogId,
            );


        }

        // =============================================
        // UNLIKE
        // =============================================

        else {

          console.log(
            '💔 Sending UNLIKE request',
          );


          response =
            await unlikeBlog(
              blogId,
            );

        }


        console.log(
          '❤️ Like API response:',
          JSON.stringify(
            response,
            null,
            2,
          ),
        );


        /*
         * If backend explicitly says failure,
         * don't change anything.
         */

        if (
          response?.success === false
        ) {

          showPopup(
            currentlyLiked
              ? 'Unable to Unlike'
              : 'Unable to Like',

            response?.message ||
            (
              currentlyLiked
                ? 'Unable to unlike this blog.'
                : 'Unable to like this blog.'
            ),
          );

          return;

        }


        // =============================================
        // UPDATE HEART
        // =============================================

        setIsLiked(
          !currentlyLiked,
        );


        /*
         * VERY IMPORTANT:
         *
         * DO NOT manually do:
         *
         * likesCount + 1
         *
         * or
         *
         * likesCount - 1
         *
         *
         * Instead reload the blog.
         *
         * The backend becomes the single source
         * of truth for likesCount.
         */

        const updatedBlog =
          await loadBlog();


        if (updatedBlog) {

          console.log(
            '❤️ Updated likesCount:',
            updatedBlog?.likesCount,
          );

        }


      } catch (err) {

        console.error(
          '❌ Like/Unlike error:',
          err?.response?.data ||
          err?.message ||
          err,
        );


        /*
         * Reload server state if anything failed.
         */

        await loadBlog();


        showPopup(
          isLiked
            ? 'Unable to Unlike'
            : 'Unable to Like',

          err?.response?.data?.message ||
          err?.message ||
          'Unable to update like.',
        );


      } finally {

        setLikeBusy(
          false,
        );

      }

    };


  // ===================================================
  // ADD COMMENT
  // ===================================================

  const handleAddComment =
    async text => {

      if (
        commentSubmitting
      ) {
        return;
      }


      const cleanText =
        text?.trim();


      if (!cleanText) {

        showPopup(
          'Comment Required',
          'Please enter a comment.',
        );

        return;

      }


      try {

        const token =
          await checkAuth();


        if (!token) {

          navigation.navigate(
            'Login',
          );

          return;

        }


        setCommentSubmitting(
          true,
        );


        console.log(
          '💬 Adding comment:',
          cleanText,
        );


        const response =
          await addBlogComment(
            blogId,
            cleanText,
          );


        console.log(
          '💬 Add comment response:',
          response,
        );


        if (
          response?.success === false
        ) {

          showPopup(
            'Unable to Comment',
            response?.message ||
            'Unable to add comment.',
          );

          return;

        }


        /*
         * Add returned comment immediately.
         */

        if (
          response?.data
        ) {

          setComments(
            previous => [
              response.data,
              ...previous,
            ],
          );

        } else {

          await loadComments();

        }


        /*
         * Reload blog so the comment count
         * also comes from backend.
         */

        await loadBlog();


        console.log(
          '✅ Comment added successfully',
        );


      } catch (err) {

        console.error(
          '❌ Add comment error:',
          err?.response?.data ||
          err?.message ||
          err,
        );


        showPopup(
          'Unable to Comment',
          err?.response?.data?.message ||
          err?.message ||
          'Unable to add comment.',
        );


      } finally {

        setCommentSubmitting(
          false,
        );

      }

    };


  // ===================================================
  // DELETE COMMENT
  // ===================================================

  const handleDeleteComment =
    async commentId => {

      if (!commentId) {
        return;
      }


      try {

        const token =
          await checkAuth();


        if (!token) {

          navigation.navigate(
            'Login',
          );

          return;

        }


        const previousComments =
          [...comments];


        /*
         * Optimistic remove.
         */

        setComments(
          previous =>
            previous.filter(
              comment =>
                comment?._id !==
                commentId,
            ),
        );


        const response =
          await deleteBlogComment(
            blogId,
            commentId,
          );


        console.log(
          '🗑️ Delete comment response:',
          response,
        );


        if (
          response?.success === false
        ) {

          throw new Error(
            response?.message ||
            'Unable to delete comment.',
          );

        }


        /*
         * Reload blog.
         *
         * Backend provides the correct
         * commentsCount.
         */

        await loadBlog();


        console.log(
          '✅ Comment deleted',
        );


      } catch (err) {

        console.error(
          '❌ Delete comment error:',
          err?.response?.data ||
          err?.message ||
          err,
        );


        setComments(
          previousComments,
        );


        showPopup(
          'Unable to Delete',
          err?.response?.data?.message ||
          err?.message ||
          'Unable to delete comment.',
        );

      }

    };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <LoadingState
        message="Loading blog..."
      />
    );

  }


  // ===================================================
  // ERROR
  // ===================================================

  if (
    error ||
    !blog
  ) {

    return (
      <ErrorState
        message={
          error ||
          'Blog not found.'
        }
        onRetry={
          loadBlog
        }
      />
    );

  }


  // ===================================================
  // BLOG DATA
  // ===================================================

  const title =
    blog?.title ||
    'Untitled Blog';


  const description =
    blog?.description ||
    '';


  const authorName =
    blog?.author?.name ||
    blog?.author?.employee_details?.name ||
    blog?.authorName ||
    'Manas User';


  /*
   * IMPORTANT:
   *
   * likesCount comes ONLY from backend.
   */

  const likesCount =
    Number(
      blog?.likesCount,
    ) || 0;


  const commentsCount =
    Number(
      blog?.commentsCount,
    ) || 0;


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <View
      style={styles.safeArea}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View
        style={styles.topBar}
      >

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >

          <Text
            style={styles.backText}
          >
            ← Blog
          </Text>

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* BLOG */}
      {/* ================================================= */}

      <ScrollView
        style={styles.flex}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        <Text
          style={styles.title}
        >
          {title}
        </Text>


        <Text
          style={styles.author}
        >
          {authorName}
        </Text>


        <Text
          style={styles.date}
        >
          {formatDate(
            blog?.createdAt,
          )}
        </Text>


        {blog?.image ? (

          <BlogImage
            uri={
              blog.image
            }
            style={
              styles.image
            }
          />

        ) : null}


        <Text
          style={styles.description}
        >
          {description}
        </Text>


        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <View
          style={styles.actions}
        >

          {/* ================================================= */}
          {/* LIKE */}
          {/* ================================================= */}

          <TouchableOpacity
            style={
              styles.actionButton
            }
            onPress={
              handleToggleLike
            }
            disabled={
              likeBusy
            }
            activeOpacity={0.7}
          >

            <Text
              style={
                styles.actionIcon
              }
            >
              {isLiked
                ? '❤️'
                : '♡'}
            </Text>


            <Text
              style={
                styles.actionText
              }
            >
              {likesCount}
            </Text>

          </TouchableOpacity>


          {/* ================================================= */}
          {/* COMMENTS */}
          {/* ================================================= */}

          <TouchableOpacity
            style={
              styles.actionButton
            }
            onPress={
              openComments
            }
            activeOpacity={0.7}
          >

            <Text
              style={
                styles.actionIcon
              }
            >
              💬
            </Text>


            <Text
              style={
                styles.actionText
              }
            >
              {commentsCount}
            </Text>

          </TouchableOpacity>


          {/* ================================================= */}
          {/* SHARE */}
          {/* ================================================= */}

          {/* <TouchableOpacity
            style={
              styles.actionButton
            }
            onPress={() =>
              showPopup(
                'Share',
                'Share functionality will be available soon.',
              )
            }
            activeOpacity={0.7}
          >

            <Text
              style={
                styles.actionIcon
              }
            >
              ↗
            </Text>


            <Text
              style={
                styles.actionText
              }
            >
              Share
            </Text>

          </TouchableOpacity> */}

        </View>

      </ScrollView>


      {/* ================================================= */}
      {/* COMMENTS BOTTOM SHEET */}
      {/* ================================================= */}

      <Modal
        visible={
          commentsVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeComments
        }
      >

        <KeyboardAvoidingView
          style={
            styles.modalContainer
          }
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
        >

          {/* ================================================= */}
          {/* BACKDROP */}
          {/* ================================================= */}

          <TouchableOpacity
            style={
              styles.backdrop
            }
            activeOpacity={1}
            onPress={
              closeComments
            }
          />


          {/* ================================================= */}
          {/* COMMENT SHEET */}
          {/* ================================================= */}

          <View
            style={
              styles.commentSheet
            }
          >

            {/* ================================================= */}
            {/* DRAG HANDLE */}
            {/* ================================================= */}

            <View
              style={
                styles.dragHandle
              }
            />


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <View
              style={
                styles.commentHeader
              }
            >

              <View
                style={
                  styles.headerSpacer
                }
              />


              <Text
                style={
                  styles.commentHeaderTitle
                }
              >
                Comments
              </Text>


              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={
                  closeComments
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


            {/* ================================================= */}
            {/* COMMENTS */}
            {/* ================================================= */}

            {commentsLoading ? (

              <View
                style={
                  styles.commentsLoading
                }
              >

                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.loadingCommentsText
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

                renderItem={({
                  item,
                }) => (

                  <CommentItem
                    comment={
                      item
                    }

                    timeAgo={
                      timeAgo(
                        item?.createdAt,
                      )
                    }

                    onDelete={
                      item?._id
                        ? () =>
                          handleDeleteComment(
                            item._id,
                          )
                        : undefined
                    }
                  />

                )}

                contentContainerStyle={
                  comments.length === 0
                    ? styles.emptyCommentsContent
                    : styles.commentsList
                }

                showsVerticalScrollIndicator={
                  false
                }

                keyboardShouldPersistTaps="handled"

                ListEmptyComponent={

                  <View
                    style={
                      styles.emptyComments
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
                      comment.
                    </Text>

                  </View>

                }
              />

            )}


            {/* ================================================= */}
            {/* COMMENT INPUT */}
            {/* ================================================= */}

            <CommentInput
              onSubmit={
                handleAddComment
              }
              submitting={
                commentSubmitting
              }
            />

          </View>

        </KeyboardAvoidingView>

      </Modal>


      {/* ================================================= */}
      {/* POPUP */}
      {/* ================================================= */}

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
          autoClose={
            true
          }
          autoCloseDelay={
            5000
          }
        />

      )}

    </View>
  );
};


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor:
        COLORS.surface,
    },


    flex: {
      flex: 1,
    },


    // =================================================
    // TOP BAR
    // =================================================

    topBar: {
      paddingHorizontal:
        SPACING.lg,

      paddingVertical:
        SPACING.md,

      borderBottomWidth:
        1,

      borderBottomColor:
        COLORS.border,

      backgroundColor:
        COLORS.surface,
    },


    backText: {
      fontSize:
        FONT.md,

      fontWeight:
        '700',

      color:
        COLORS.text,
    },


    // =================================================
    // BLOG
    // =================================================

    content: {
      padding:
        SPACING.lg,

      paddingBottom:
        100,
    },


    title: {
      fontSize:
        FONT.xxl,

      fontWeight:
        '800',

      color:
        COLORS.text,

      marginBottom:
        6,
    },


    author: {
      fontSize:
        FONT.md,

      fontWeight:
        '600',

      color:
        COLORS.primaryLight,
    },


    date: {
      fontSize:
        FONT.sm,

      color:
        COLORS.textMuted,

      marginTop:
        4,

      marginBottom:
        SPACING.lg,
    },


    image: {
      width:
        '100%',

      height:
        220,

      borderRadius:
        12,

      marginBottom:
        SPACING.lg,
    },


    description: {
      fontSize:
        FONT.md,

      lineHeight:
        23,

      color:
        COLORS.text,

      marginBottom:
        SPACING.lg,
    },


    // =================================================
    // ACTIONS
    // =================================================

    actions: {
      flexDirection:
        'row',

      alignItems:
        'center',

      borderTopWidth:
        1,

      borderBottomWidth:
        1,

      borderColor:
        COLORS.border,

      paddingVertical:
        SPACING.md,

      justifyContent:
        'space-around',
    },


    actionButton: {
      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        SPACING.md,

      paddingVertical:
        6,
    },


    actionIcon: {
      fontSize:
        21,

      marginRight:
        6,
    },


    actionText: {
      fontSize:
        FONT.sm,

      fontWeight:
        '700',

      color:
        COLORS.text,
    },


    // =================================================
    // MODAL
    // =================================================

    modalContainer: {
      flex: 1,

      justifyContent:
        'flex-end',
    },


    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        'rgba(0,0,0,0.55)',
    },


    // =================================================
    // COMMENT SHEET
    // =================================================

    commentSheet: {
      height:
        '78%',

      backgroundColor:
        '#171A1D',

      borderTopLeftRadius:
        24,

      borderTopRightRadius:
        24,

      overflow:
        'hidden',
    },


    dragHandle: {
      width:
        44,

      height:
        4,

      borderRadius:
        2,

      backgroundColor:
        '#858A8F',

      alignSelf:
        'center',

      marginTop:
        10,

      marginBottom:
        8,
    },


    // =================================================
    // COMMENT HEADER
    // =================================================

    commentHeader: {
      height:
        52,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        16,

      borderBottomWidth:
        1,

      borderBottomColor:
        '#292D31',
    },


    headerSpacer: {
      width:
        40,
    },


    commentHeaderTitle: {
      flex: 1,

      textAlign:
        'center',

      fontSize:
        18,

      fontWeight:
        '700',

      color:
        '#FFFFFF',
    },


    closeButton: {
      width:
        40,

      height:
        40,

      borderRadius:
        20,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    closeText: {
      fontSize:
        20,

      color:
        '#FFFFFF',
    },


    // =================================================
    // COMMENTS LIST
    // =================================================

    commentsList: {
      paddingHorizontal:
        16,

      paddingTop:
        12,

      paddingBottom:
        15,
    },


    emptyCommentsContent: {
      flexGrow:
        1,

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal:
        20,
    },


    emptyComments: {
      alignItems:
        'center',
    },


    emptyCommentsIcon: {
      fontSize:
        38,

      marginBottom:
        12,
    },


    emptyCommentsTitle: {
      fontSize:
        17,

      fontWeight:
        '700',

      color:
        '#FFFFFF',
    },


    emptyCommentsText: {
      marginTop:
        6,

      fontSize:
        14,

      color:
        '#9DA3A8',
    },


    // =================================================
    // LOADING
    // =================================================

    commentsLoading: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    loadingCommentsText: {
      marginTop:
        10,

      color:
        '#AEB4B9',

      fontSize:
        14,
    },

  });


export default BlogDetailScreen;