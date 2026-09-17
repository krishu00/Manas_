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
  Platform, StatusBar
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native-safe-area-context';
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
const insets = useSafeAreaInsets();
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

    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      {/* <View
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

      </View> */}

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>

          <Text style={styles.backLabel}>
            Blog
          </Text>
        </TouchableOpacity>
      </View>
      {/* ================================================= */}
      {/* BLOG */}
      {/* ================================================= */}

      {/* <ScrollView
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


         
        <View
          style={styles.actions}
        >

         
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

        </View>

      </ScrollView> */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* BLOG TITLE */}
        <Text style={styles.title}>
          {title}
        </Text>

        {/* AUTHOR / DATE */}
        <View style={styles.metaRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>
              {authorName?.charAt(0)?.toUpperCase() || 'M'}
            </Text>
          </View>

          <View style={styles.metaInfo}>
            <Text style={styles.author}>
              {authorName}
            </Text>

            <Text style={styles.date}>
              {formatDate(blog?.createdAt)}
            </Text>
          </View>
        </View>

        {/* BLOG IMAGE */}
        {blog?.image ? (
          <BlogImage
            uri={blog.image}
            style={styles.image}
          />
        ) : null}

        {/* DESCRIPTION */}
        <View style={styles.articleCard}>
          <Text style={styles.description}>
            {description}
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsCard}>

          {/* LIKE */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleLike}
            disabled={likeBusy}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.actionIconContainer,
                isLiked && styles.actionIconContainerActive,
              ]}
            >
              <Text style={styles.actionIcon}>
                {isLiked ? '♥' : '♡'}
              </Text>
            </View>

            <View>
              <Text style={styles.actionText}>
                {likesCount}
              </Text>

              <Text style={styles.actionLabel}>
                Likes
              </Text>
            </View>
          </TouchableOpacity>

          {/* COMMENTS */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openComments}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>
                💬
              </Text>
            </View>

            <View>
              <Text style={styles.actionText}>
                {commentsCount}
              </Text>

              <Text style={styles.actionLabel}>
                Comments
              </Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* BOTTOM SPACE */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ================================================= */}
      {/* COMMENTS BOTTOM SHEET */}
      {/* ================================================= */}

      {/* <Modal
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
 
          <TouchableOpacity
            style={
              styles.backdrop
            }
            activeOpacity={1}
            onPress={
              closeComments
            }
          />


           
          <View
            style={
              styles.commentSheet
            }
          >

           
            <View
              style={
                styles.dragHandle
              }
            />

 
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

      </Modal> */}

     <Modal
  visible={commentsVisible}
  transparent
  animationType="slide"
  onRequestClose={closeComments}
>
  <KeyboardAvoidingView
    style={styles.keyboardContainer}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={0}
  >
    <View style={styles.modalContainer}>

      {/* DARK OVERLAY */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={closeComments}
      />

      {/* COMMENTS SHEET */}
      <View style={styles.commentSheet}>

        {/* HANDLE */}
        <View style={styles.dragHandle} />

        {/* HEADER */}
        <View style={styles.commentHeader}>

          <View style={styles.headerSide} />

          <Text style={styles.commentHeaderTitle}>
            Comments
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeComments}
            activeOpacity={0.7}
          >
            <Text style={styles.closeText}>
              ×
            </Text>
          </TouchableOpacity>

        </View>

        {/* COMMENTS */}
        <View style={styles.commentsArea}>

          {commentsLoading ? (

            <View style={styles.commentsLoading}>

              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />

              <Text style={styles.loadingCommentsText}>
                Loading comments...
              </Text>

            </View>

          ) : (

            <FlatList
              data={comments}

              keyExtractor={(item, index) =>
                item?._id || `comment-${index}`
              }

              renderItem={({ item }) => (
                <CommentItem
                  comment={item}
                  timeAgo={timeAgo(item?.createdAt)}
                  onDelete={
                    item?._id
                      ? () => handleDeleteComment(item._id)
                      : undefined
                  }
                />
              )}

              contentContainerStyle={
                comments.length === 0
                  ? styles.emptyCommentsContent
                  : styles.commentsList
              }

              showsVerticalScrollIndicator={false}

              keyboardShouldPersistTaps="handled"

              keyboardDismissMode="interactive"

              ListEmptyComponent={
                <View style={styles.emptyComments}>

                  <Text style={styles.emptyCommentsIcon}>
                    💬
                  </Text>

                  <Text style={styles.emptyCommentsTitle}>
                    No comments yet
                  </Text>

                  <Text style={styles.emptyCommentsText}>
                    Be the first to comment on this blog.
                  </Text>

                </View>
              }
            />

          )}

        </View>

        {/* INPUT */}
        <View
          style={[
            styles.commentInputWrapper,
            {
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          <CommentInput
            onSubmit={handleAddComment}
            submitting={commentSubmitting}
          />
        </View>

      </View>

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

    </SafeAreaView>
  );
};


// =====================================================
// STYLES
// =====================================================

// const styles =
//   StyleSheet.create({

//     safeArea: {
//       flex: 1,
//       backgroundColor:
//         COLORS.surface,
//     },


//     flex: {
//       flex: 1,
//     },


//     // =================================================
//     // TOP BAR
//     // =================================================

//     topBar: {
//       paddingHorizontal:
//         SPACING.lg,

//       paddingVertical:
//         SPACING.md,

//       borderBottomWidth:
//         1,

//       borderBottomColor:
//         COLORS.border,

//       backgroundColor:
//         COLORS.surface,
//     },


//     backText: {
//       fontSize:
//         FONT.md,

//       fontWeight:
//         '700',

//       color:
//         COLORS.text,
//     },


//     // =================================================
//     // BLOG
//     // =================================================

//     content: {
//       padding:
//         SPACING.lg,

//       paddingBottom:
//         100,
//     },


//     title: {
//       fontSize:
//         FONT.xxl,

//       fontWeight:
//         '800',

//       color:
//         COLORS.text,

//       marginBottom:
//         6,
//     },


//     author: {
//       fontSize:
//         FONT.md,

//       fontWeight:
//         '600',

//       color:
//         COLORS.primaryLight,
//     },


//     date: {
//       fontSize:
//         FONT.sm,

//       color:
//         COLORS.textMuted,

//       marginTop:
//         4,

//       marginBottom:
//         SPACING.lg,
//     },


//     image: {
//       width:
//         '100%',

//       height:
//         220,

//       borderRadius:
//         12,

//       marginBottom:
//         SPACING.lg,
//     },


//     description: {
//       fontSize:
//         FONT.md,

//       lineHeight:
//         23,

//       color:
//         COLORS.text,

//       marginBottom:
//         SPACING.lg,
//     },


//     // =================================================
//     // ACTIONS
//     // =================================================

//     actions: {
//       flexDirection:
//         'row',

//       alignItems:
//         'center',

//       borderTopWidth:
//         1,

//       borderBottomWidth:
//         1,

//       borderColor:
//         COLORS.border,

//       paddingVertical:
//         SPACING.md,

//       justifyContent:
//         'space-around',
//     },


//     actionButton: {
//       flexDirection:
//         'row',

//       alignItems:
//         'center',

//       paddingHorizontal:
//         SPACING.md,

//       paddingVertical:
//         6,
//     },


//     actionIcon: {
//       fontSize:
//         21,

//       marginRight:
//         6,
//     },


//     actionText: {
//       fontSize:
//         FONT.sm,

//       fontWeight:
//         '700',

//       color:
//         COLORS.text,
//     },


//     // =================================================
//     // MODAL
//     // =================================================

//     modalContainer: {
//       flex: 1,

//       justifyContent:
//         'flex-end',
//     },


//     backdrop: {
//       ...StyleSheet.absoluteFillObject,

//       backgroundColor:
//         'rgba(0,0,0,0.55)',
//     },


//     // =================================================
//     // COMMENT SHEET
//     // =================================================

//     commentSheet: {
//       height:
//         '78%',

//       backgroundColor:
//         '#171A1D',

//       borderTopLeftRadius:
//         24,

//       borderTopRightRadius:
//         24,

//       overflow:
//         'hidden',
//     },


//     dragHandle: {
//       width:
//         44,

//       height:
//         4,

//       borderRadius:
//         2,

//       backgroundColor:
//         '#858A8F',

//       alignSelf:
//         'center',

//       marginTop:
//         10,

//       marginBottom:
//         8,
//     },


//     // =================================================
//     // COMMENT HEADER
//     // =================================================

//     commentHeader: {
//       height:
//         52,

//       flexDirection:
//         'row',

//       alignItems:
//         'center',

//       justifyContent:
//         'space-between',

//       paddingHorizontal:
//         16,

//       borderBottomWidth:
//         1,

//       borderBottomColor:
//         '#292D31',
//     },


//     headerSpacer: {
//       width:
//         40,
//     },


//     commentHeaderTitle: {
//       flex: 1,

//       textAlign:
//         'center',

//       fontSize:
//         18,

//       fontWeight:
//         '700',

//       color:
//         '#FFFFFF',
//     },


//     closeButton: {
//       width:
//         40,

//       height:
//         40,

//       borderRadius:
//         20,

//       alignItems:
//         'center',

//       justifyContent:
//         'center',
//     },


//     closeText: {
//       fontSize:
//         20,

//       color:
//         '#FFFFFF',
//     },


//     // =================================================
//     // COMMENTS LIST
//     // =================================================

//     commentsList: {
//       paddingHorizontal:
//         16,

//       paddingTop:
//         12,

//       paddingBottom:
//         15,
//     },


//     emptyCommentsContent: {
//       flexGrow:
//         1,

//       justifyContent:
//         'center',

//       alignItems:
//         'center',

//       paddingHorizontal:
//         20,
//     },


//     emptyComments: {
//       alignItems:
//         'center',
//     },


//     emptyCommentsIcon: {
//       fontSize:
//         38,

//       marginBottom:
//         12,
//     },


//     emptyCommentsTitle: {
//       fontSize:
//         17,

//       fontWeight:
//         '700',

//       color:
//         '#FFFFFF',
//     },


//     emptyCommentsText: {
//       marginTop:
//         6,

//       fontSize:
//         14,

//       color:
//         '#9DA3A8',
//     },


//     // =================================================
//     // LOADING
//     // =================================================

//     commentsLoading: {
//       flex: 1,

//       alignItems:
//         'center',

//       justifyContent:
//         'center',
//     },


//     loadingCommentsText: {
//       marginTop:
//         10,

//       color:
//         '#AEB4B9',

//       fontSize:
//         14,
//     },

//   });

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },

  flex: {
    flex: 1,
  },

  // ==========================================
  // HEADER
  // ==========================================

  topBar: {
    height: 58,
    paddingHorizontal: 18,

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#E7ECEA',

    justifyContent: 'center',
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 30,

    color: '#173A4A',

    marginRight: 5,
    fontWeight: '300',
  },

  backLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#173A4A',
  },

  // ==========================================
  // BLOG
  // ==========================================

  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
  },

  title: {
    fontSize: 32,
    lineHeight: 39,

    fontWeight: '800',

    color: '#111817',

    marginBottom: 16,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 20,
  },

  authorAvatar: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#DDEEE7',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 11,
  },

  authorAvatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00503D',
  },

  metaInfo: {
    justifyContent: 'center',
  },

  author: {
    fontSize: 15,
    fontWeight: '700',

    color: '#00503D',

    marginBottom: 3,
  },

  date: {
    fontSize: 13,
    color: '#7A898E',
  },

  image: {
    width: '100%',
    height: 230,

    borderRadius: 18,

    marginBottom: 20,

    backgroundColor: '#E9EFEC',
  },

  articleCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    paddingHorizontal: 17,
    paddingVertical: 18,

    marginBottom: 18,

    borderWidth: 1,
    borderColor: '#E8ECEA',
  },

  description: {
    fontSize: 16,
    lineHeight: 26,

    color: '#263330',
  },

  // ==========================================
  // ACTIONS
  // ==========================================

  actionsCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    borderWidth: 1,
    borderColor: '#E8ECEA',

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 12,

    marginBottom: 20,
  },

  actionButton: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    minHeight: 48,
  },

  actionIconContainer: {
    width: 40,
    height: 40,

    borderRadius: 20,

    backgroundColor: '#F1F6F4',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  actionIconContainerActive: {
    backgroundColor: '#E2F1EA',
  },

  actionIcon: {
    fontSize: 21,
    color: '#00503D',
  },

  actionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#173A4A',
  },

  actionLabel: {
    fontSize: 11,
    color: '#7A898E',
    marginTop: 1,
  },

  bottomSpacer: {
    height: 30,
  },

  // ==========================================
  // MODAL
  // ==========================================
keyboardContainer: {
  flex: 1,
},
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 25, 28, 0.52)',
  },

  // ==========================================
  // COMMENT SHEET
  // ==========================================

  

commentSheet: {
  width: '100%',
  height: '76%',

  backgroundColor: '#FFFFFF',

  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,

  overflow: 'hidden',
},
  dragHandle: {
    width: 42,
    height: 5,

    borderRadius: 3,

    backgroundColor: '#C8D0CD',

    alignSelf: 'center',

    marginTop: 10,
    marginBottom: 7,
  },

  // ==========================================
  // COMMENT HEADER
  // ==========================================

  commentHeader: {
    height: 60,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 16,

    borderBottomWidth: 1,
    borderBottomColor: '#E9EDEC',
  },

  headerSide: {
    width: 44,
  },

  commentHeaderTitle: {
    flex: 1,

    textAlign: 'center',

    fontSize: 21,
    fontWeight: '800',

    color: '#173A4A',
  },

  closeButton: {
    width: 44,
    height: 44,

    borderRadius: 22,

    backgroundColor: '#F3F6F5',

    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 29,
    lineHeight: 30,

    fontWeight: '300',

    color: '#173A4A',
  },

  // ==========================================
  // COMMENTS AREA
  // ==========================================

  commentsArea: {
    flex: 1,

    backgroundColor: '#FFFFFF',
  },

  commentsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },

  emptyCommentsContent: {
    flexGrow: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 30,
  },

  emptyComments: {
    alignItems: 'center',
  },

  emptyCommentsIcon: {
    fontSize: 38,

    marginBottom: 10,
  },

  emptyCommentsTitle: {
    fontSize: 17,
    fontWeight: '800',

    color: '#173A4A',

    marginBottom: 5,
  },

  emptyCommentsText: {
    fontSize: 13,
    lineHeight: 20,

    textAlign: 'center',

    color: '#7A898E',
  },

  // ==========================================
  // LOADING
  // ==========================================

  commentsLoading: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingCommentsText: {
    marginTop: 10,

    fontSize: 14,

    color: '#7A898E',
  },

  // ==========================================
  // COMMENT INPUT
  // ==========================================

commentInputWrapper: {
  backgroundColor: '#171A1D',

  borderTopWidth: 1,
  borderTopColor: '#E4E9E7',

  paddingTop: 8,
},

});
export default BlogDetailScreen;