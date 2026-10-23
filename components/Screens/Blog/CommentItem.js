import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export const getCommentAuthorName = comment => {
  if (!comment) {
    return 'User';
  }

  const authorName = [
    comment?.guestAuthor?.name,
    comment?.guest?.name,
    comment?.guest_details?.name,
    comment?.user?.name,
    comment?.employee?.employee_details?.name,
    comment?.employee?.name,
    comment?.employee_details?.name,
    comment?.author?.name,
    comment?.author?.guestAuthor?.name,
    comment?.author?.guest?.name,
    comment?.author?.guest_details?.name,
    comment?.author?.employee_details?.name,
    comment?.author?.user?.name,
    comment?.author,
    comment?.authorName,
    comment?.guestName,
    comment?.userName,
    comment?.employeeName,
    comment?.createdBy?.name,
    comment?.name,
  ].find(name => typeof name === 'string' && name.trim());

  if (authorName) {
    return authorName.trim();
  }

  return comment?.authorType === 'guest' ||
    comment?.accountType === 'guest' ||
    comment?.userType === 'guest'
    ? 'Guest User'
    : 'Employee User';
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


        {onDelete ? (
          <View style={styles.footer}>

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

          </View>
        ) : null}

      </View>


    </View>
  );
};


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flexDirection: 'row',

      alignItems: 'flex-start',

      paddingVertical: 13,

      borderBottomWidth: 1,

      borderBottomColor: '#F0F3F2',
    },


    // =================================================
    // AVATAR
    // =================================================

    avatar: {
      width: 42,

      height: 42,

      borderRadius: 21,

      backgroundColor: '#3F4B51',

      alignItems: 'center',

      justifyContent: 'center',

      marginRight: 11,
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
      maxWidth: '75%',

      color: '#173A4A',

      fontSize: 15,

      fontWeight: '800',
    },


    time: {
      marginLeft: 8,

      color: '#7A898E',

      fontSize: 12,

      fontWeight: '500',
    },


    commentText: {
      color: '#263330',

      fontSize: 15,

      lineHeight: 22,

      fontWeight: '500',
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


    deleteText: {
      color: '#D85C5C',

      fontSize: 13,

      fontWeight: '700',

      marginLeft: 18,
    },

  });


export default CommentItem;