import React, {
  useState,
  useRef,
} from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';


const CommentInput = ({
  onSubmit,
  submitting = false,
}) => {

  const [text, setText] =
    useState('');

  const inputRef =
    useRef(null);


  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit =
    async () => {

      const trimmed =
        text.trim();


      if (
        !trimmed ||
        submitting
      ) {
        return;
      }


      await onSubmit(
        trimmed,
      );


      /*
       * Clear the input after the
       * comment has been sent.
       */

      setText('');

    };


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <View
      style={styles.container}
    >

      {/* ================================================= */}
      {/* USER AVATAR */}
      {/* ================================================= */}

      <View
        style={styles.avatar}
      >

        <Text
          style={styles.avatarText}
        >
          M
        </Text>

      </View>


      {/* ================================================= */}
      {/* INPUT */}
      {/* ================================================= */}

      <View
        style={styles.inputContainer}
      >

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={
            setText
          }
          placeholder="Add a comment..."
          placeholderTextColor="#858B91"
          multiline
          maxLength={2000}
          editable={!submitting}
          keyboardType="default"
          returnKeyType="default"
          blurOnSubmit={false}
        />

      </View>


      {/* ================================================= */}
      {/* SEND */}
      {/* ================================================= */}

      <TouchableOpacity
        style={[
          styles.sendButton,

          (
            !text.trim() ||
            submitting
          ) &&
          styles.sendButtonDisabled,
        ]}
        onPress={
          handleSubmit
        }
        disabled={
          !text.trim() ||
          submitting
        }
        activeOpacity={0.7}
      >

        {submitting ? (

          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />

        ) : (

          <Text
            style={
              styles.sendText
            }
          >
            ↑
          </Text>

        )}

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
        'center',

      paddingHorizontal:
        12,

      paddingVertical:
        10,

      borderTopWidth:
        1,

      borderTopColor:
        '#292D31',

      backgroundColor:
        '#171A1D',
    },


    // =================================================
    // AVATAR
    // =================================================

    avatar: {
      width:
        38,

      height:
        38,

      borderRadius:
        19,

      backgroundColor:
        '#4B555C',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        8,
    },


    avatarText: {
      color:
        '#FFFFFF',

      fontSize:
        14,

      fontWeight:
        '700',
    },


    // =================================================
    // INPUT
    // =================================================

    inputContainer: {
      flex: 1,

      minHeight:
        44,

      maxHeight:
        100,

      borderWidth:
        1,

      borderColor:
        '#3A4045',

      borderRadius:
        22,

      backgroundColor:
        '#1B1F22',

      justifyContent:
        'center',

      paddingHorizontal:
        15,
    },


    input: {
      minHeight:
        42,

      maxHeight:
        90,

      color:
        '#FFFFFF',

      fontSize:
        15,

      paddingVertical:
        9,

      paddingHorizontal:
        0,
    },


    // =================================================
    // SEND
    // =================================================

    sendButton: {
      width:
        44,

      height:
        44,

      borderRadius:
        22,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginLeft:
        7,

      backgroundColor:
        '#81BAA5',
    },


    sendButtonDisabled: {
      opacity:
        0.4,
    },


    sendText: {
      color:
        '#FFFFFF',

      fontSize:
        24,

      fontWeight:
        '800',
    },

  });


export default CommentInput;