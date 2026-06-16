module.exports = {
  dependencies: {
    'react-native-vector-icons': {
      platforms: {
        android: null, // ??? Disables autolinking to stop the buggy fonts.gradle from loading
      },
    },
  },
};
