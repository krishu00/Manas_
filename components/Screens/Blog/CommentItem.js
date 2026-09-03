import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export const getCommentAuthorName = comment => {
  if (!comment) {
    return 'Manas User';
  }

  return (
    comment?.employee?.employee_details?.name ||
    comment?.employee?.name ||
    comment?.author?.name ||
    comment?.author?.employee_details?.name ||
    comment?.authorName ||
    comment?.employeeName ||
    'Manas User'
  );
};

const CommentItem = ({
  comment,
  timeAgo,
  onDelete,
}) => {

  if (!comment) {
    return null;
  }

  // ===================================================
  // USER NAME
  // ===================================================

  const employeeName = getCommentAuthorName(comment);


  // ===================================================
  // COMMENT
  // ===================================================

  const content =
    typeof comment?.content === 'string'
      ? comment.content.trim()
      : '';


  if (!content) {
    return null;
  }


  // ===================================================
  // AVATAR LETTER
  // ===================================================

  const avatarLetter =
    employeeName
      .charAt(0)
      .toUpperCase();


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <View
      style={styles.container}
    >

      {/* ================================================= */}
      {/* AVATAR */}
      {/* ================================================= */}

      <View
        style={styles.avatar}
      >

        <Text
          style={styles.avatarText}
        >
          {avatarLetter}
        </Text>

      </View>


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <View
        style={styles.content}
      >

        {/* USER + TIME */}

        <View
          style={styles.userRow}
        >

          <Text
            style={styles.userName}
            numberOfLines={1}
          >
            {employeeName}
          </Text>


          {timeAgo ? (

            <Text
              style={styles.time}
            >
              {timeAgo}
            </Text>

          ) : null}

        </View>


        {/* COMMENT TEXT */}

        <Text
          style={styles.commentText}
        >
          {content}
        </Text>


        {/* FOOTER */}

        <View
          style={styles.footer}
        >

          <Text
            style={styles.replyText}
          >
            Reply
          </Text>


          {onDelete ? (

            <TouchableOpacity
              onPress={
                onDelete
              }
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >

              <Text
                style={
                  styles.deleteText
                }
              >
                Delete
              </Text>

            </TouchableOpacity>

          ) : null}

        </View>

      </View>


      {/* ================================================= */}
      {/* HEART */}
      {/* ================================================= */}

      <TouchableOpacity
        style={styles.heartButton}
        activeOpacity={0.7}
      >

        <Text
          style={styles.heart}
        >
          ♡
        </Text>

      </TouchableOpacity>

    </View>
  );
};


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      paddingVertical:
        11,
    },


    // =================================================
    // AVATAR
    // =================================================

    avatar: {
      width:
        40,

      height:
        40,

      borderRadius:
        20,

      backgroundColor:
        '#3C454B',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        10,
    },


    avatarText: {
      color:
        '#FFFFFF',

      fontSize:
        15,

      fontWeight:
        '700',
    },


    // =================================================
    // CONTENT
    // =================================================

    content: {
      flex: 1,

      paddingRight:
        8,
    },


    userRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom:
        3,
    },


    userName: {
      maxWidth:
        '75%',

      color:
        '#F5F5F5',

      fontSize:
        14,

      fontWeight:
        '700',
    },


    time: {
      marginLeft:
        7,

      color:
        '#858B91',

      fontSize:
        12,
    },


    commentText: {
      color:
        '#F1F1F1',

      fontSize:
        15,

      lineHeight:
        21,
    },


    // =================================================
    // FOOTER
    // =================================================

    footer: {
      flexDirection:
        'row',

      alignItems:
        'center',

      marginTop:
        5,
    },


    replyText: {
      color:
        '#9CA2A7',

      fontSize:
        12,

      fontWeight:
        '600',
    },


    deleteText: {
      color:
        '#E57373',

      fontSize:
        12,

      fontWeight:
        '600',

      marginLeft:
        16,
    },


    // =================================================
    // HEART
    // =================================================

    heartButton: {
      width:
        35,

      height:
        40,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    heart: {
      fontSize:
        25,

      color:
        '#AEB4B9',
    },

  });


export default CommentItem;