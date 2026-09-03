import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT } from '../../src/utils/theme';

/**
 * Used by BlogCard and BlogDetailScreen. If `uri` is missing, or the image
 * fails to load, shows a clean placeholder instead of a broken-image icon
 * or blank space.
 */
const BlogImage = ({ uri, style }) => {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>MANAS</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      onError={() => setFailed(true)}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: COLORS.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONT.lg,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#ffffff',
  },
});

export default BlogImage;
