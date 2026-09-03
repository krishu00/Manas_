import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';

import {
  launchImageLibrary,
} from 'react-native-image-picker';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  COLORS,
  SPACING,
  FONT,
} from '../../../src/utils/theme';

import {
  createBlog,
} from '../../../src/api/blogApi';

import Popup from '../../Popup/Popup';


// =====================================================
// SCREEN
// =====================================================

const CreateBlogScreen = ({
  navigation,
}) => {

  // =====================================================
  // FORM STATE
  // =====================================================

  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [checkingAuth, setCheckingAuth] = useState(true);


  // =====================================================
  // POPUP STATE
  // =====================================================

  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
  });


  // =====================================================
  // SHOW POPUP
  // =====================================================

  const showPopup = useCallback(
    (popupTitle, popupMessage) => {
      console.log(
        '🔔 SHOW POPUP:',
        popupTitle,
        popupMessage,
      );

      setPopup({
        visible: true,
        title: popupTitle || 'Message',
        message: popupMessage || '',
      });
    },
    [],
  );


  // =====================================================
  // CLOSE POPUP
  // =====================================================

  const closePopup = useCallback(() => {
    setPopup({
      visible: false,
      title: '',
      message: '',
    });
  }, []);


  // =====================================================
  // SELECT IMAGE
  // =====================================================

  const handleSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
        includeBase64: false,
      },
      response => {

        // User cancelled
        if (response.didCancel) {
          console.log('Image selection cancelled');
          return;
        }

        // Picker error
        if (response.errorCode) {
          console.log(
            '❌ Image Picker Error:',
            response.errorMessage,
          );

          showPopup(
            'Image Error',
            response.errorMessage ||
            'Unable to select image.',
          );

          return;
        }

        // Get selected asset
        const asset = response.assets?.[0];

        if (!asset?.uri) {
          console.log('❌ No image URI returned');

          showPopup(
            'Image Error',
            'Unable to read the selected image.',
          );

          return;
        }

        // Debug
        console.log(
          '========== IMAGE SELECTED =========='
        );

        console.log('URI:', asset.uri);
        console.log('TYPE:', asset.type);
        console.log('FILE NAME:', asset.fileName);
        console.log('FILE SIZE:', asset.fileSize);

        console.log(
          '===================================='
        );

        // Store complete asset
        setSelectedImage(asset);
      },
    );
  };


  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };


  // =====================================================
  // CHECK LOGIN
  // =====================================================

  useEffect(() => {

    const checkAuth = async () => {

      try {

        const token =
          await AsyncStorage.getItem(
            'userToken',
          );

        setIsLoggedIn(!!token);

      } catch (error) {

        console.error(
          'Create Blog auth check error:',
          error,
        );

        setIsLoggedIn(false);

      } finally {

        setCheckingAuth(false);

      }
    };

    checkAuth();

  }, []);


  // =====================================================
  // GO TO LOGIN
  // =====================================================

  const goToLogin = () => {

    navigation.navigate('Login');

  };


  // =====================================================
  // PUBLISH BLOG
  // =====================================================

  const handlePublish = async () => {

    // ===================================================
    // AUTH CHECK
    // ===================================================

    const token =
      await AsyncStorage.getItem(
        'userToken',
      );

    if (!token) {

      showPopup(
        'Login Required',
        'Please login to create a blog.',
      );

      return;
    }


    // ===================================================
    // TITLE VALIDATION
    // ===================================================

    if (!title.trim()) {

      showPopup(
        'Title Required',
        'Please enter a blog title.',
      );

      return;
    }


    // ===================================================
    // DESCRIPTION VALIDATION
    // ===================================================

    if (!description.trim()) {

      showPopup(
        'Description Required',
        'Please write something for your blog.',
      );

      return;
    }


    // ===================================================
    // START LOADING
    // ===================================================

    setSubmitting(true);


    try {

      console.log(
        '========== CREATE BLOG =========='
      );

      console.log(
        'Title:',
        title.trim(),
      );

      console.log(
        'Description length:',
        description.trim().length,
      );

      console.log(
        'Has image:',
        !!selectedImage,
      );

      if (selectedImage) {

        console.log(
          'Image URI:',
          selectedImage.uri,
        );

        console.log(
          'Image type:',
          selectedImage.type,
        );

        console.log(
          'Image name:',
          selectedImage.fileName,
        );

        console.log(
          'Image size:',
          selectedImage.fileSize,
        );

      }

      console.log(
        '================================='
      );


      // =================================================
      // API CALL
      // =================================================

      const response = await createBlog({

        title: title.trim(),

        description: description.trim(),

        // IMPORTANT:
        // Send the complete selected image asset.
        image: selectedImage || null,

      });


      // =================================================
      // SUCCESS
      // =================================================

      console.log(
        '✅ Blog created successfully:',
        response,
      );


      showPopup(
        'Success',
        response?.message ||
        'Your blog has been published successfully.',
      );


      // =================================================
      // CLEAR FORM
      // =================================================

      setTitle('');

      setDescription('');

      setSelectedImage(null);


      // =================================================
      // RETURN TO BLOG FEED
      // =================================================

      setTimeout(() => {

        closePopup();

        navigation.navigate(
          'BlogFeed',
          {
            refreshKey: Date.now(),
          },
        );

      }, 2000);


    } catch (error) {

      console.log(
        '❌ Create Blog Error:',
        error?.response?.data ||
        error?.message ||
        error,
      );


      // =================================================
      // AUTH ERROR
      // =================================================

      if (
        error?.response?.status === 401
      ) {

        showPopup(
          'Login Required',
          'Your session has expired. Please login again.',
        );

        setTimeout(() => {

          closePopup();

          goToLogin();

        }, 2000);

        return;
      }


      // =================================================
      // SERVER / API ERROR
      // =================================================

      showPopup(
        'Could not publish',
        error?.response?.data?.message ||
        'Something went wrong while publishing the blog.',
      );

    } finally {

      setSubmitting(false);

    }
  };


  // =====================================================
  // AUTH CHECK LOADING
  // =====================================================

  if (checkingAuth) {

    return (

      <SafeAreaView
        style={styles.safeArea}
      >

        <View
          style={styles.loadingContainer}
        >

          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

        </View>

      </SafeAreaView>

    );

  }


  // =====================================================
  // SCREEN
  // =====================================================

  return (

    <SafeAreaView
      style={styles.safeArea}
    >

      {/* ================================================= */}
      {/* TOP BAR */}
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
            ← Create Blog
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          onPress={handlePublish}
          disabled={
            submitting ||
            !title.trim() ||
            !description.trim()
          }
        >

          {submitting ? (

            <ActivityIndicator
              size="small"
              color={COLORS.primaryLight}
            />

          ) : (

            <Text
              style={[
                styles.postText,

                (
                  !title.trim() ||
                  !description.trim()
                ) &&
                styles.postTextDisabled,
              ]}
            >
              Post
            </Text>

          )}

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter blog title..."
          placeholderTextColor={
            COLORS.textMuted
          }
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />


        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          placeholder="Write your blog..."
          placeholderTextColor={
            COLORS.textMuted
          }
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          maxLength={10000}
        />


        {/* ================================================= */}
        {/* IMAGE */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Blog Image (optional)
        </Text>


        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={handleSelectImage}
          disabled={submitting}
        >

          <Text
            style={styles.imagePickerText}
          >
            {selectedImage
              ? 'Change Image'
              : 'Select Image'}
          </Text>

        </TouchableOpacity>


        {/* ================================================= */}
        {/* IMAGE PREVIEW */}
        {/* ================================================= */}

        {selectedImage?.uri ? (

          <View
            style={
              styles.imagePreviewContainer
            }
          >

            <Image
              source={{
                uri: selectedImage.uri,
              }}
              style={styles.preview}
              resizeMode="cover"
            />


            <TouchableOpacity
              style={
                styles.removeImageButton
              }
              onPress={
                handleRemoveImage
              }
              disabled={submitting}
            >

              <Text
                style={
                  styles.removeImageText
                }
              >
                Remove Image
              </Text>

            </TouchableOpacity>

          </View>

        ) : null}


        {/* ================================================= */}
        {/* PUBLISH BUTTON */}
        {/* ================================================= */}

        <TouchableOpacity
          style={[
            styles.publishButton,

            (
              !title.trim() ||
              !description.trim() ||
              submitting
            ) &&
            styles.publishButtonDisabled,
          ]}
          onPress={handlePublish}
          disabled={
            !title.trim() ||
            !description.trim() ||
            submitting
          }
        >

          {submitting ? (

            <ActivityIndicator
              color="#ffffff"
            />

          ) : (

            <Text
              style={
                styles.publishButtonText
              }
            >
              Publish Blog
            </Text>

          )}

        </TouchableOpacity>

      </ScrollView>


      {/* ================================================= */}
      {/* POPUP */}
      {/* ================================================= */}

      {popup.visible && (

        <Popup
          title={popup.title}
          message={popup.message}
          onClose={closePopup}
        />

      )}

    </SafeAreaView>

  );

};


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },


  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },


  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },


  backText: {
    fontSize: FONT.md,
    fontWeight: '700',
    color: COLORS.text,
  },


  postText: {
    fontSize: FONT.md,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },


  postTextDisabled: {
    color: COLORS.textMuted,
  },


  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },


  label: {
    fontSize: FONT.sm,
    fontWeight: '700',
    color: COLORS.text,

    marginBottom: SPACING.xs,
    marginTop: SPACING.lg,
  },


  input: {
    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 8,

    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,

    fontSize: FONT.md,
    color: COLORS.text,
  },


  textArea: {
    height: 160,
  },


  imagePickerButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,

    borderRadius: 10,

    paddingVertical: 14,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: SPACING.sm,
  },


  imagePickerText: {
    color: COLORS.primary,
    fontSize: FONT.md,
    fontWeight: '700',
  },


  imagePreviewContainer: {
    marginTop: SPACING.md,
  },


  preview: {
    width: '100%',
    height: 200,

    borderRadius: 10,
  },


  removeImageButton: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },


  removeImageText: {
    color: '#D9534F',
    fontWeight: '700',
  },


  publishButton: {
    marginTop: SPACING.xxl,

    backgroundColor: COLORS.primary,

    borderRadius: 10,

    paddingVertical: SPACING.md,

    alignItems: 'center',
  },


  publishButtonDisabled: {
    backgroundColor: COLORS.border,
  },


  publishButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: FONT.md,
  },

});


export default CreateBlogScreen;