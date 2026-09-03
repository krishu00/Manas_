import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import axios from "axios";


// =====================================================
// API
// =====================================================

const API_BASE_URL = "http://localhost:5050";

const getAllBlogs = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/blog/all`,
      {
        timeout: 15000,
      }
    );
console.log("Get All Blogs Response:", response.data);
    return response.data;

  } catch (error) {

    console.log(
      "Get All Blogs Error:",
      error?.response?.data || error.message
    );

    throw error;
  }
};


// =====================================================
// BLOG CARD
// =====================================================

const BlogCard = ({ blog, onPress }) => {

  const description =
    blog?.description || "";

  const shortDescription =
    description.length > 150
      ? `${description.substring(0, 150)}...`
      : description;


  const formattedDate = blog?.createdAt
    ? new Date(
      blog.createdAt
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )
    : "";


  /*
   * Your backend may return author in
   * different populated structures.
   *
   * We safely check the known structure first.
   */

  const authorName =
    blog?.author?.employee_details?.name ||
    blog?.author?.name ||
    "Manas User";


  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(blog)}
      style={styles.blogCard}
    >

      {/* =========================================
          IMAGE
      ========================================= */}

      {blog?.image ? (

        <Image
          source={{
            uri: blog.image,
          }}
          style={styles.blogImage}
          resizeMode="cover"
        />

      ) : (

        <View
          style={styles.imagePlaceholder}
        >

          <Text
            style={styles.placeholderText}
          >
            MANAS
          </Text>

        </View>
      )}


      {/* =========================================
          BLOG CONTENT
      ========================================= */}

      <View
        style={styles.blogContent}
      >

        {/* TITLE */}

        <Text
          style={styles.blogTitle}
          numberOfLines={2}
        >
          {blog?.title || "Untitled Blog"}
        </Text>


        {/* AUTHOR + DATE */}

        <View
          style={styles.metaRow}
        >

          <Text
            style={styles.author}
            numberOfLines={1}
          >
            {authorName}
          </Text>


          {formattedDate ? (

            <>
              <Text
                style={styles.dot}
              >
                •
              </Text>

              <Text
                style={styles.date}
              >
                {formattedDate}
              </Text>
            </>

          ) : null}

        </View>


        {/* DESCRIPTION */}

        <Text
          style={styles.description}
          numberOfLines={3}
        >
          {shortDescription}
        </Text>


        {/* =====================================
            BLOG STATS
        ===================================== */}

        <View
          style={styles.statsRow}
        >

          {/* LIKE */}

          <View
            style={styles.statItem}
          >

            <Text
              style={styles.likeIcon}
            >
              ♡
            </Text>

            <Text
              style={styles.statCount}
            >
              {blog?.likesCount || 0}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Likes
            </Text>

          </View>


          {/* COMMENTS */}

          <View
            style={styles.statItem}
          >

            <Text
              style={styles.commentIcon}
            >
              💬
            </Text>

            <Text
              style={styles.statCount}
            >
              {blog?.commentsCount || 0}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Comments
            </Text>

          </View>


          {/* SHARES */}

          {blog?.sharesCount !== undefined && (

            <View
              style={styles.statItem}
            >

              <Text
                style={styles.shareIcon}
              >
                ↗
              </Text>

              <Text
                style={styles.statCount}
              >
                {blog?.sharesCount || 0}
              </Text>

              <Text
                style={styles.statLabel}
              >
                Shares
              </Text>

            </View>

          )}

        </View>

      </View>

    </TouchableOpacity>
  );
};


// =====================================================
// MAIN FEEDS SCREEN
// =====================================================

const FeedsScreen = ({
  navigation,
}) => {

  const [blogs, setBlogs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);


  // ===================================================
  // FETCH BLOGS
  // ===================================================

  const fetchBlogs = useCallback(
    async () => {

      try {

        setError(null);

        const response =
          await getAllBlogs();


        console.log(
          "BLOG API RESPONSE:",
          response
        );


        if (
          response?.success
        ) {

          setBlogs(
            response?.data || []
          );

        } else {

          setBlogs([]);

          setError(
            response?.message ||
            "Unable to load blogs"
          );
        }


      } catch (error) {

        console.log(
          "FETCH BLOGS ERROR:",
          error?.response?.data ||
          error.message
        );


        setError(
          error?.response?.data?.message ||
          "Unable to load blogs"
        );


      } finally {

        setLoading(false);

      }

    },
    []
  );


  // ===================================================
  // INITIAL API CALL
  // ===================================================

  useEffect(() => {

    fetchBlogs();

  }, [fetchBlogs]);


  // ===================================================
  // PULL TO REFRESH
  // ===================================================

  const handleRefresh =
    async () => {

      setRefreshing(true);

      await fetchBlogs();

      setRefreshing(false);
    };


  // ===================================================
  // LOGIN
  // ===================================================

  const handleLogin =
    () => {

      console.log(
        "Login button pressed"
      );

      /*
       * For now navigate to your
       * existing Login screen.
       *
       * If your route name is different,
       * change "Login" here.
       */

      navigation.navigate(
        "Login"
      );
    };


  // ===================================================
  // BLOG PRESS
  // ===================================================

  const handleBlogPress =
    (blog) => {

      console.log(
        "Selected Blog:",
        blog?._id
      );


      /*
       * BlogDetailScreen will be
       * connected here next.
       *
       * DON'T enable this until
       * BlogDetailScreen exists.
       */

      // navigation.navigate(
      //   "BlogDetail",
      //   {
      //     blogId: blog._id,
      //   }
      // );
    };


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {

    return (
      <View
        style={styles.container}
      >

        <StatusBar
          barStyle="light-content"
          backgroundColor="#0B3448"
        />


        {/* HEADER */}

        <View
          style={styles.header}
        >

          <Text
            style={styles.logo}
          >
            MANAS
          </Text>


          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >

            <Text
              style={styles.loginText}
            >
              Login
            </Text>

          </TouchableOpacity>

        </View>


        {/* LOADING */}

        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator
            size="large"
            color="#0B3448"
          />

          <Text
            style={styles.loadingText}
          >
            Loading blogs...
          </Text>

        </View>

      </View>
    );
  }


  // ===================================================
  // EMPTY / ERROR STATE
  // ===================================================

  const renderEmpty =
    () => {

      if (error) {

        return (
          <View
            style={styles.emptyContainer}
          >

            <Text
              style={styles.emptyTitle}
            >
              Unable to load blogs
            </Text>


            <Text
              style={styles.emptyMessage}
            >
              {error}
            </Text>


            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchBlogs}
            >

              <Text
                style={styles.retryText}
              >
                Try Again
              </Text>

            </TouchableOpacity>

          </View>
        );
      }


      return (
        <View
          style={styles.emptyContainer}
        >

          <Text
            style={styles.emptyIcon}
          >
            📝
          </Text>


          <Text
            style={styles.emptyTitle}
          >
            No blogs yet
          </Text>


          <Text
            style={styles.emptyMessage}
          >
            There are no blogs available
            right now.
          </Text>

        </View>
      );
    };


  // ===================================================
  // BLOG ITEM
  // ===================================================

  const renderBlog =
    ({ item }) => {

      return (
        <BlogCard
          blog={item}
          onPress={handleBlogPress}
        />
      );
    };


  // ===================================================
  // MAIN UI
  // ===================================================

  return (

    <View
      style={styles.container}
    >

      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B3448"
      />


      {/* ==========================================
          HEADER
      ========================================== */}

      <View
        style={styles.header}
      >

        <Text
          style={styles.logo}
        >
          MANAS
        </Text>


        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >

          <Text
            style={styles.loginText}
          >
            Login
          </Text>

        </TouchableOpacity>

      </View>


      {/* ==========================================
          FEED TITLE
      ========================================== */}

      <View
        style={styles.feedHeader}
      >

        <Text
          style={styles.feedTitle}
        >
          Latest Blogs
        </Text>


        <Text
          style={styles.feedSubtitle}
        >
          Discover what's happening
        </Text>

      </View>


      {/* ==========================================
          BLOG LIST
      ========================================== */}

      <FlatList
        data={blogs}

        keyExtractor={(item) =>
          item._id
        }

        renderItem={renderBlog}

        ListEmptyComponent={
          renderEmpty
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={[
          styles.listContent,

          blogs.length === 0 &&
          styles.emptyList,
        ]}


        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }

            tintColor="#0B3448"
          />
        }
      />

    </View>
  );
};


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7F7",
  },


  // ==========================================
  // HEADER
  // ==========================================

  header: {
    height: 60,

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    backgroundColor: "#0B3448",
  },


  logo: {
    fontSize: 20,

    fontWeight: "700",

    color: "#FFFFFF",

    letterSpacing: 1,
  },


  loginButton: {
    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 8,

    backgroundColor: "#FFFFFF",
  },


  loginText: {
    fontSize: 14,

    fontWeight: "600",

    color: "#0B3448",
  },


  // ==========================================
  // FEED HEADER
  // ==========================================

  feedHeader: {
    paddingHorizontal: 18,

    paddingTop: 20,

    paddingBottom: 12,
  },


  feedTitle: {
    fontSize: 25,

    fontWeight: "700",

    color: "#173A4A",
  },


  feedSubtitle: {
    marginTop: 4,

    fontSize: 13,

    color: "#7A898E",
  },


  // ==========================================
  // LIST
  // ==========================================

  listContent: {
    paddingHorizontal: 18,

    paddingBottom: 30,
  },


  emptyList: {
    flexGrow: 1,
  },


  // ==========================================
  // BLOG CARD
  // ==========================================

  blogCard: {
    marginBottom: 16,

    borderRadius: 14,

    overflow: "hidden",

    backgroundColor: "#FFFFFF",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 6,

    elevation: 3,
  },


  blogImage: {
    width: "100%",

    height: 190,
  },


  imagePlaceholder: {
    width: "100%",

    height: 190,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#DCE8E5",
  },


  placeholderText: {
    fontSize: 24,

    fontWeight: "700",

    color: "#0B3448",

    letterSpacing: 2,
  },


  blogContent: {
    padding: 16,
  },


  blogTitle: {
    fontSize: 19,

    lineHeight: 25,

    fontWeight: "700",

    color: "#173A4A",
  },


  metaRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 8,
  },


  author: {
    maxWidth: "60%",

    fontSize: 13,

    fontWeight: "600",

    color: "#526970",
  },


  dot: {
    marginHorizontal: 6,

    color: "#9AA7AA",
  },


  date: {
    fontSize: 12,

    color: "#8A999D",
  },


  description: {
    marginTop: 12,

    fontSize: 14,

    lineHeight: 21,

    color: "#687A80",
  },


  // ==========================================
  // STATS
  // ==========================================

  statsRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 16,

    gap: 24,
  },


  statItem: {
    flexDirection: "row",

    alignItems: "center",
  },


  likeIcon: {
    fontSize: 22,

    marginRight: 5,

    color: "#526970",
  },


  commentIcon: {
    fontSize: 16,

    marginRight: 5,
  },


  shareIcon: {
    fontSize: 19,

    marginRight: 5,

    color: "#526970",
  },


  statCount: {
    fontSize: 13,

    fontWeight: "700",

    color: "#526970",
  },


  statLabel: {
    marginLeft: 3,

    fontSize: 12,

    color: "#8A999D",
  },


  // ==========================================
  // LOADING
  // ==========================================

  loadingContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",
  },


  loadingText: {
    marginTop: 10,

    fontSize: 14,

    color: "#66777D",
  },


  // ==========================================
  // EMPTY
  // ==========================================

  emptyContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 30,
  },


  emptyIcon: {
    fontSize: 42,

    marginBottom: 14,
  },


  emptyTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#173A4A",
  },


  emptyMessage: {
    marginTop: 8,

    textAlign: "center",

    fontSize: 14,

    lineHeight: 21,

    color: "#7A898E",
  },


  retryButton: {
    marginTop: 18,

    paddingHorizontal: 24,

    paddingVertical: 11,

    borderRadius: 8,

    backgroundColor: "#0B3448",
  },


  retryText: {
    color: "#FFFFFF",

    fontSize: 14,

    fontWeight: "600",
  },

});

export default FeedsScreen;