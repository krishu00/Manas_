import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

const DESCRIPTION_LIMIT = 120;

const truncate = (text = '', limit = DESCRIPTION_LIMIT) => {
  if (typeof text !== 'string') {
    return '';
  }

  return text.length > limit
    ? `${text.slice(0, limit).trimEnd()}…`
    : text;
};

const BlogCard = ({
  blog,
  onPress,
  onLikePress,
  onCommentPress,
}) => {
  /*
   * IMPORTANT:
   *
   * BlogCard does NOT decide navigation.
   * BlogCard does NOT use navigationRef.
   *
   * It simply sends the complete blog object
   * back to BlogFeedScreen.
   */

  const handleCardPress = () => {
    if (!blog) {
      console.log('❌ BlogCard: blog object is missing');
      return;
    }

    console.log('📖 BlogCard pressed');
    console.log('📖 BlogCard ID:', blog?._id || blog?.id);

    if (typeof onPress === 'function') {
      onPress(blog);
    }
  };

  const handleLike = event => {
    event?.stopPropagation?.();

    if (typeof onLikePress === 'function') {
      onLikePress(blog);
    }
  };

  const handleComment = event => {
    event?.stopPropagation?.();

    if (typeof onCommentPress === 'function') {
      onCommentPress(blog);
    }
  };

  const authorName =
    blog?.author?.name ||
    blog?.authorName ||
    'Manas User';

  const title =
    typeof blog?.title === 'string' &&
    blog.title.trim()
      ? blog.title.trim()
      : 'Untitled Blog';

  const description =
    typeof blog?.description === 'string'
      ? blog.description.trim()
      : '';

  const likesCount =
    Number(blog?.likesCount ?? blog?.likeCount) || 0;

  const commentsCount =
    Number(blog?.commentsCount ?? blog?.commentCount) || 0;

  const createdAt =
    blog?.createdAt ||
    blog?.createdOn ||
    blog?.created_at;

  const formattedDate = (() => {
    if (!createdAt) {
      return '';
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  })();

  const imageUri =
    typeof blog?.image === 'string' &&
    blog.image.trim()
      ? blog.image.trim()
      : null;

  return (
    <View style={styles.card}>
      {/* ================================================= */}
      {/* BLOG CONTENT */}
      {/* ================================================= */}

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handleCardPress}
      >
        {/* IMAGE */}

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              MANAS
            </Text>
          </View>
        )}

        {/* CONTENT */}

        <View style={styles.body}>
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {title}
          </Text>

          <View style={styles.authorRow}>
            <Text
              style={styles.author}
              numberOfLines={1}
            >
              {authorName}
            </Text>

            {formattedDate ? (
              <>
                <Text style={styles.dot}>
                  •
                </Text>

                <Text style={styles.date}>
                  {formattedDate}
                </Text>
              </>
            ) : null}
          </View>

          {description ? (
            <Text
              style={styles.description}
              numberOfLines={4}
            >
              {truncate(description)}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* ================================================= */}
      {/* ACTIONS */}
      {/* ================================================= */}

      <View style={styles.actions}>
        {/* LIKE */}

        <TouchableOpacity
          style={styles.actionItem}
          activeOpacity={0.7}
          onPress={handleLike}
        >
          <Text style={styles.likeIcon}>
            {blog?.isLikedByMe ? '❤️' : '♡'}
          </Text>

          <Text style={styles.actionText}>
            {likesCount} Likes
          </Text>
        </TouchableOpacity>

        {/* COMMENT */}

        <TouchableOpacity
          style={styles.actionItem}
          activeOpacity={0.7}
          onPress={handleComment}
        >
          <Text style={styles.commentIcon}>
            💬
          </Text>

          <Text style={styles.actionText}>
            {commentsCount} Comments
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BlogCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 3,
  },

  image: {
    width: '100%',
    height: 190,
  },

  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#DCE8E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00503D',
    letterSpacing: 2,
  },

  body: {
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 6,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  author: {
    fontSize: 13,
    fontWeight: '600',
    color: '#81BAA5',
    maxWidth: '60%',
  },

  dot: {
    marginHorizontal: 6,
    color: '#999999',
  },

  date: {
    fontSize: 12,
    color: '#999999',
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',

    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',

    paddingVertical: 12,

    justifyContent: 'space-around',
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  likeIcon: {
    fontSize: 22,
    marginRight: 5,
  },

  commentIcon: {
    fontSize: 17,
    marginRight: 5,
  },

  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00503D',
  },
});